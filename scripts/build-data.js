#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir } = require("./lib");

(async () => {
  await rmDir(pkgDir("data", "dist"), { recursive: true });
  spawn("npx", [
    "microbundle",
    "--cwd",
    "data",
    "--raw",
    ...buildArgs(),
    ...args,
  ]);
})();
