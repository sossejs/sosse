#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir, proxyTypes } = require("./lib");

(async () => {
  await rmDir(pkgDir("iso", "dist"), { recursive: true });
  spawn("npx", [
    "microbundle",
    "--cwd",
    "iso",
    "--alias",
    "react=preact/compat",
    "--jsx",
    "React.createElement",
    "--raw",
    ...buildArgs(),
    ...args,
  ]);
  await proxyTypes("iso");
})();
