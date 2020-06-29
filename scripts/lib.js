const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const pkg = require("../package.json");

exports.upperFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
exports.exists = fs.exists;
exports.resolve = path.resolve;
exports.extname = path.extname;
exports.basename = path.basename;
exports.readDir = fs.readdir;
exports.mkDir = fs.mkdir;
exports.writeFile = fs.writeFile;
exports.readFile = fs.readFile;
exports.writeJson = fs.writeJson;
exports.rmDir = fs.rmdir;
exports.copy = fs.copy;
exports.chmod = fs.chmod;
exports.pkgDir = (...suffix) => exports.resolve(__dirname, "..", ...suffix);
exports.scriptsDir = (...suffix) => exports.pkgDir("scripts", ...suffix);
exports.assetsDir = (...suffix) => exports.pkgDir("assets", ...suffix);
exports.args = process.argv.slice(2);
exports.spawn = (
  command,
  args,
  options = { stdio: "inherit", encoding: "utf8" }
) => {
  return spawnSync(command, args, options);
};
exports.spawnScript = (script, args = [], options) => {
  return exports.spawn(
    "node",
    [exports.scriptsDir(`${script}.js`), ...args],
    options
  );
};
exports.spawnScripts = async (prefix, args = [], options) => {
  const files = await exports.readDir(this.scriptsDir());
  for (const file of files) {
    if (!file.startsWith(prefix + "-")) {
      continue;
    }

    const fileExtension = exports.extname(file);
    const script = exports.basename(file, fileExtension);
    exports.spawnScript(script, args, options);
  }
};
exports.buildArgs = () => {
  const args = [];

  const externals = [
    pkg.name,
    "events",
    "chokidar",
    "ws",
    "otion",
    "microbundle",
    "clear-module",
  ];
  args.push("--external", externals.join(","));

  return args;
};
