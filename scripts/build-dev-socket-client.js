#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir } = require("./lib");

(async () => {
  await rmDir(pkgDir("dev-socket-client", "dist"), { recursive: true });
  spawn("npx", [
    "microbundle",
    "--cwd",
    "dev-socket-client",
    "--raw",
    ...buildArgs(),
    ...args,
  ]);
})();
