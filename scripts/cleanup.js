#!/usr/bin/env node

const { pkgDir, rmDir } = require("./lib");

(async () => {
  await rmDir(pkgDir("node_modules", ".cache"), { recursive: true });
  await rmDir(pkgDir("coverage"), { recursive: true });
})();
