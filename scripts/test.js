#!/usr/bin/env node

const { spawn, args } = require("./lib");

spawn("npx", ["jest", "spec", "--notify", ...args]);
