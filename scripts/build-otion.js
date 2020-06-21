#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir } = require("./lib");

(async () => {
  await rmDir(pkgDir("otion", "dist"), { recursive: true });
  spawn("npx", [
    "microbundle",
    "--cwd",
    "otion",
    "--raw",
    ...buildArgs(),
    ...args,
  ]);
})();
