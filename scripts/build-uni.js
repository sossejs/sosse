#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir } = require("./lib");

(async () => {
  await rmDir(pkgDir("uni", "dist"), { recursive: true });
  spawn("npx", [
    "microbundle",
    "--cwd",
    "uni",
    "--raw",
    ...buildArgs(),
    ...args,
  ]);
})();
