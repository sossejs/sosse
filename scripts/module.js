#!/usr/bin/env node

const {
  args,
  exists,
  pkgDir,
  mkDir,
  writeJson,
  resolve,
  upperFirst,
  writeFile,
  scriptsDir,
  chmod,
} = require("./lib");

const updatePkg = async function (moduleName, pkg) {
  pkg.files.push(
    `${moduleName}/package.json`,
    `${moduleName}/lib`,
    `${moduleName}/dist`
  );

  pkg.jest.collectCoverageFrom.push(`${moduleName}/lib/**/*.{ts,tsx,js,jsx}`);

  await writeJson(pkgDir("package.json"), pkg, {
    spaces: "  ",
  });
};

const updateTsconfig = async function (moduleName, pkg) {
  const tsConfig = require("../tsconfig");
  const pathAlias = `${pkg.name}/${moduleName}`;

  if (tsConfig.compilerOptions.paths[pathAlias]) {
    return;
  }

  tsConfig.compilerOptions.paths[pathAlias] = [`../${moduleName}/lib/main.ts`];
  const tsConfigPath = resolve(pkgDir("tsconfig.json"));
  await writeJson(tsConfigPath, tsConfig, {
    spaces: "  ",
  });
};

const createModulePkg = async function (moduleDir, moduleName, pkg) {
  const modulePkg = resolve(moduleDir, "package.json");
  await writeJson(
    modulePkg,
    {
      name: `${pkg.name}-${moduleName}`,
      amdName: `${pkg.name}${upperFirst(moduleName)}`,
      source: "lib/main.ts",
      main: "dist/main.js",
      module: "dist/main.m.js",
      "umd:main": "dist/main.umd.js",
      esmodule: "dist/main.modern.js",
      types: "dist/main.d.ts",
    },
    {
      spaces: "  ",
    }
  );
};

const createModuleLib = async function (moduleDir) {
  const moduleLibDir = resolve(moduleDir, "lib");
  await mkDir(moduleLibDir);
  await writeFile(
    resolve(moduleLibDir, "main.ts"),
    'export const hello = "world";' + "\n"
  );
};

const createBuildScript = async function (moduleName) {
  const buildScript = `#!/usr/bin/env node

const { spawn, args, buildArgs, rmDir, pkgDir } = require("./lib");

(async () => {
  await rmDir(pkgDir("${moduleName}", "dist"), { recursive: true });
  spawn("npx", ["microbundle", "--cwd", "${moduleName}", "--raw", ...buildArgs(), ...args]);
})();
`;

  const scriptPath = scriptsDir(`build-${moduleName}.js`);
  await writeFile(scriptPath, buildScript);
  await chmod(scriptPath, "755");
};

(async () => {
  try {
    const moduleName = (args[0] && args[0].trim()) || undefined;

    if (!moduleName) {
      console.error("Module name missing in arguments.");
      return;
    }

    const moduleDir = pkgDir(moduleName);

    if (await exists(moduleDir)) {
      console.error(`"${moduleDir}" already exists.`);
      return;
    }

    await mkDir(moduleDir);

    const pkg = require("./../package");

    await updatePkg(moduleName, pkg);
    await updateTsconfig(moduleName, pkg);
    await createModulePkg(moduleDir, moduleName, pkg);
    await createModuleLib(moduleDir);
    await createBuildScript(moduleName);
  } catch (err) {
    console.error(err);
  }
})();
