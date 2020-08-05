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

  const pkgDeps = Object.keys(pkg.dependencies || {});
  const externals = [
    pkg.name,
    "events",
    "chokidar",
    "express",
    "ws",
    "otion",
    "microbundle",
    "clear-module",
    "preact",
    "preact-render-to-string",
    "react",
    ...pkgDeps,
  ];
  args.push("--external", externals.join(","));

  return args;
};

exports.proxyTypes = async (moduleName) => {
  const { writeFile, pkgDir, resolve, exists, readFile } = exports;

  const distPath = moduleName ? pkgDir(moduleName, "dist") : pkgDir("dist");
  const libDtsPath = moduleName
    ? resolve(distPath, moduleName, "lib")
    : resolve(distPath, "lib");
  const mainDtsPath = resolve(libDtsPath, "main.d.ts");

  if (!(await exists(mainDtsPath))) {
    return;
  }

  const mainContent = await readFile(mainDtsPath, { encoding: "utf8" });
  const exportNamed = mainContent.match(/export (?!default)/) != null;
  const exportDefault = mainContent.match(/export default/) != null;

  const mainPath = moduleName ? `./${moduleName}/lib/main` : "./lib/main";
  let proxySrc = "";
  if (exportNamed) {
    proxySrc += `export * from "${mainPath}";\n`;
  }

  if (exportDefault) {
    proxySrc += `import DefaultProxy from "${mainPath}";
export default DefaultProxy;\n`;
  }

  const proxyPath = resolve(distPath, "main.d.ts");
  await writeFile(proxyPath, proxySrc);
};
