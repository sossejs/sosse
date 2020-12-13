#!/usr/bin/env node

const { spawn, argvOperands } = require("./lib");

// For dev: compile the cli first with NODE_ENV=development ./scripts/build-cli.js
spawn("node", [
  ...argvOperands,
  "cli/dist/main.js",
  "start",
  "--cwd",
  "example",
]);
