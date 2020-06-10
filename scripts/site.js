#!/usr/bin/env node

const { spawn, copy, pkgDir } = require("./lib");

(async () => {
  spawn("npx", ["mallery"]);
  await copy(pkgDir("assets"), pkgDir("site/assets"));

  console.log(
    "Manual docs action: Commit and run: `node ./scripts/site-subtree.js`"
  );
})();
