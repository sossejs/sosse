#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir } = require("./lib");

(async () => {
  await rmDir(pkgDir("dist"), { recursive: true });
  spawn("npx", ["microbundle", "--target", "node", ...buildArgs(), ...args]);
})();
