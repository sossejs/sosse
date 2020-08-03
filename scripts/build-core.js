#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir } = require("./lib");

(async () => {
  await rmDir(pkgDir("dist"), { recursive: true });
  spawn("npx", [
    "microbundle",
    "--format",
    "cjs",
    "--target",
    "node",
    ...buildArgs(),
    ...args,
  ]);
})();
