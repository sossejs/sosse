#!/usr/bin/env node

import sade from "sade";
import { resolve } from "path";
const { pathExists } = require("fs-extra");

if (process.env.NODE_ENV === "development") {
  require("module-alias/register");
}

const { sosse } = require("sosse");

const prog = sade("sosse");

const pkg = require(resolve(__dirname, "../../package.json"));
prog.version(pkg.version);
prog.describe(pkg.description);

prog.option("--cwd", "Run sosse under an other directory", process.cwd());

const getConfig = async function ({ cwd }) {
  cwd = resolve(cwd);

  let config = {};
  const sosseConfigPath = resolve(cwd, "sosse.config.js");
  if (await pathExists(sosseConfigPath)) {
    const loadConfig = require(sosseConfigPath);
    config = loadConfig;
    if (typeof loadConfig === "function") {
      config = await loadConfig();
    }
  }

  return {
    cwd,
    ...config,
  };
};

prog
  .command("start")
  .describe("Start the server")
  .action(async function (opts) {
    const config = await getConfig({ cwd: opts.cwd });
    sosse(config);
  });

prog
  .command("bundle")
  .describe("Bundle server and client")
  .action(async function (opts) {
    const config = await getConfig({ cwd: opts.cwd });
    sosse({
      ...config,
      exitAfterBundle: true,
    });
  });

prog.parse(process.argv);
