#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir } = require("./lib");

(async () => {
  await rmDir(pkgDir("example", "dist"), { recursive: true });
  spawn("npx", [
    "microbundle",
    "--cwd",
    "example",
    "--raw",
    ...buildArgs(),
    ...args,
  ]);
})();
