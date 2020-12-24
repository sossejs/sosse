#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir } = require("./lib");

(async () => {
  await rmDir(pkgDir("iso", "dist"), { recursive: true });
  spawn("npx", [
    "microbundle",
    "--cwd",
    "iso",
    "--raw",
    ...buildArgs(),
    ...args,
  ]);
})();
