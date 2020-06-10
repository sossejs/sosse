#!/usr/bin/env node

/**
 * Checks for modules which are not pure javascript
 *
 * Afterwards use "npm ls" to find the parent dependencies
 * As example fsevents has a binding.gyp
 * "npm ls fsevents" will show, that at the root it was required by nodemon
 * └─┬ nodemon@1.17.4
 *   └─┬ chokidar@2.0.3
 *     └── fsevents@1.2.4
 *
 * Pure bash alternative of purify.js is "find node_modules/ | grep binding.gyp || echo pure"
 */

const path = require("path");
const { pkgDir } = require("./lib");
const fs = require("fs");

const nodeModulesDir = pkgDir("node_modules");
const unfilteredModuleDirs = fs.readdirSync(nodeModulesDir);
const moduleBindings = unfilteredModuleDirs.map((moduleDir) =>
  path.resolve(nodeModulesDir, moduleDir, "binding.gyp")
);
const existingBindings = moduleBindings.filter((file) => fs.existsSync(file));
const modules = existingBindings.map((file) => {
  let module = {
    requiredBy: [],
  };

  module.dir = path.dirname(file);
  module.name = path.basename(module.dir);

  const pkgFile = path.resolve(module.dir, "package.json");
  const pkg = require(pkgFile);

  if (pkg._requiredBy) {
    module.requiredBy = pkg._requiredBy;
  }

  return module;
});

modules.forEach((module) => {
  console.log(module.name, module);
});
