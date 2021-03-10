#!/usr/bin/env node

const { spawnScript } = require("./lib");

spawnScript("reformat");
spawnScript("build");
spawnScript("coverage");

console.log("Manual action: `npx standard-version -a -r major|minor|patch`");
