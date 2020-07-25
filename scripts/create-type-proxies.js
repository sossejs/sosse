#!/usr/bin/env node

const { writeFile, pkgDir, resolve, exists } = require("./lib");

const createProxy = async ({
  moduleName,
  exportDefault = false,
  exportNamed = true,
} = {}) => {
  const distPath = moduleName ? pkgDir(moduleName, "dist") : pkgDir("dist");
  const mainDtsPath = resolve(distPath, "lib", "main.d.ts");

  if (!(await exists(mainDtsPath))) {
    return;
  }

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
  await createProxy({ moduleName: "react" });
  await createProxy({ moduleName: "preact" });
})();
