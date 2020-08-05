#!/usr/bin/env node

const { writeFile, pkgDir, resolve, exists, readFile } = require("./lib");

const createProxy = async (moduleName) => {
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

(async () => {
  await createProxy();
  await createProxy("react");
  await createProxy("preact");
})();
