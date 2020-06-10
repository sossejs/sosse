#!/usr/bin/env node

const { spawn } = require("./lib");

spawn("npx", [
  "ts-node",
  "-r",
  "tsconfig-paths/register",
  "example/lib/main.ts",
]);
