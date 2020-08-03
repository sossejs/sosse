#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir } = require("./lib");

(async () => {
  await rmDir(pkgDir("cli", "dist"), { recursive: true });
  spawn("npx", [
    "microbundle",
    "--format",
    "cjs",
    "--target",
    "node",
    "--cwd",
    "cli",
    "--raw",
    ...buildArgs(),
    ...args,
  ]);
})();
