#!/usr/bin/env node

const { spawn } = require("./lib");

spawn("node", ["cli/dist/main.js", "--cwd", "example"]);
