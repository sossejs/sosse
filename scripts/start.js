#!/usr/bin/env node

const { spawn } = require("./lib");

// For dev: compile the cli first with NODE_ENV=development ./scripts/build-cli.js
spawn("node", ["cli/dist/main.js", "start", "--cwd", "example"]);
