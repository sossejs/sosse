#!/usr/bin/env node

const { spawn } = require("./lib");

// https://gist.github.com/tduarte/eac064b4778711b116bb827f8c9bef7b

spawn("git", ["checkout", "master"]);
spawn("git", ["subtree", "split", "--prefix", "site", "-b", "gh-pages"]);
spawn("git", ["push", "-f", "origin", "gh-pages:gh-pages"]);
spawn("git", ["branch", "-D", "gh-pages"]);
