#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir, proxyTypes } = require("./lib");

(async () => {
  await rmDir(pkgDir("fastify", "dist"), { recursive: true });
  spawn("npx", [
    "microbundle",
    "--cwd",
    "fastify",
    "--raw",
    ...buildArgs(),
    ...args,
  ]);
  await proxyTypes("fastify");
})();
