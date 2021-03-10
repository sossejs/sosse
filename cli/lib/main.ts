#!/usr/bin/env node

require("@lufrai/source-map-support").install();
import sade from "sade";
import { resolve } from "path";
const { pathExists } = require("fs-extra");

if (process.env.SOSSE_DEV) {
  require("module-alias/register");
}

const { sosse } = require("sosse");

const prog = sade("sosse");

const pkg = require(resolve(__dirname, "../../package.json"));
prog.version(pkg.version);
prog.describe(pkg.description);

prog.option("--cwd", "Run sosse under an other directory", process.cwd());

const getConfig = async function ({ cwd, isDev }) {
  cwd = resolve(cwd);

  let config = {};
  const sosseConfigPath = resolve(cwd, "sosse.config.js");
  if (await pathExists(sosseConfigPath)) {
    const loadConfig = require(sosseConfigPath);
    config = loadConfig;
    if (typeof loadConfig === "function") {
      config = await loadConfig();
    }
  }

  return {
    isDev,
    cwd,
    ...config,
  };
};

prog
  .command("start")
  .describe("Start the server")
  .option("-p, --production", "Same as process.env.NODE_ENV=production")
  .action(async function (opts) {
    const isDev = !opts.production && process.env.NODE_ENV !== "production";

    if (!isDev && !process.env.NODE_ENV) {
      process.env.NODE_ENV = "production";
    }

    const config = await getConfig({ cwd: opts.cwd, isDev });
    sosse(config);
  });

prog
  .command("bundle")
  .describe("Bundle server and client")
  .action(async function (opts) {
    const config = await getConfig({ isDev: false, cwd: opts.cwd });
    sosse({
      ...config,
      productionBuild: true,
    });
  });

prog.parse(process.argv);
