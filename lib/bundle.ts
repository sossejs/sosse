import {
  pathExists,
  mkdirp,
  emptyDir,
  readdir,
  readJson,
  writeJson,
} from "fs-extra";
import { dirname, extname, basename, resolve } from "path";
import { isDev } from "./env";
import cuid from "cuid";
import stripAnsi from "strip-ansi";
import { Ctx } from "./ctx";

// Currently microbundle sets the defaults only in the cli api but expects them internally also from js consumers
const microbundleDefaults = {
  "pkg-main": true,
  target: "web",
  cwd: ".",
  sourcemap: true,
};

export type BundleEntryOptions = {
  alias?: Record<string, string>;
  external?: Record<string, boolean>;
  globals?: Record<string, string>;
  define?: Record<string, string>;
  // TODO: implement globals option
  jsx?: string;
  react?: boolean;
};

export type EntryOptions = ({
  name,
}: {
  name: string;
}) => BundleEntryOptions | undefined;

const optionsRecordToString = function (options) {
  const resultParts = [];

  for (const [key, value] of Object.entries(options)) {
    if (value == null) {
      continue;
    }
    resultParts.push(`${key}=${value}`);
  }

  return resultParts.join(",");
};

const boolOptionsRecordToString = function (options) {
  const resultParts = [];

  for (const [key, value] of Object.entries(options)) {
    if (!value) {
      continue;
    }

    resultParts.push(key);
  }

  return resultParts.join(",");
};

let runningBuilds = 0;
let rebuiltServer = false;
export const bundle = async function ({
  src,
  dist,
  watch = false,
  server = false,
  entryOptions = {},
  ctx = undefined,
  cwd,
}: {
  src: string;
  dist: string;
  watch?: boolean;
  server?: boolean;
  ctx?: Ctx;
  cwd: string;
  entryOptions?: BundleEntryOptions;
}) {
  const distDir = dirname(dist);

  await emptyDir(distDir);

  let {
    define = {},
    react,
    jsx = "h",
    alias = {},
    external = {},
    globals = {},
  } = entryOptions;

  define = {
    "process.env.NODE_ENV": process.env.NODE_ENV || "development",
    ...define,
  };

  const pkgPath = resolve(cwd, "package.json");
  const pkgExternals: Record<string, boolean> = {};
  if (await pathExists(pkgPath)) {
    const pkg = require(pkgPath);
    const pkgDependencies = Object.keys(pkg.dependencies || {});
    for (const name of pkgDependencies) {
      pkgExternals[name] = true;
    }
  }

  external = {
    ...pkgExternals,
    sosse: server,
    otion: server,
    preact: server,
    microbundle: true,
    ...external,
  };

  if (react) {
    jsx = "React.createElement";
  } else {
    alias["react"] = "preact/compat";
  }

  let onStart, onBuild, onError;
  if (ctx && watch) {
    onStart = function () {
      runningBuilds++;
      ctx.throttleRestart["sosseBundle"] = true;
    };

    onBuild = function () {
      runningBuilds--;

      if (server) rebuiltServer = true;

      if (runningBuilds > 0) {
        return;
      }

      ctx.throttleRestart["sosseBundle"] = false;
      if (!ctx.willRestart) {
        const eventName = rebuiltServer ? "triggerRestart" : "reload";
        rebuiltServer = false;
        ctx.events.emit(eventName);
      }
    };

    onError = function (e) {
      runningBuilds--;
      ctx.errors.push(stripAnsi(e.error.stack));
      ctx.events.emit("sosseError");
    };
  }

  const microbundleConfig = {
    ...microbundleDefaults,
    entries: [src],
    output: dist,
    watch,
    compress: server ? false : isDev,
    format: server ? "cjs" : "modern",
    "pkg-main": false,
    jsx,
    define: optionsRecordToString(define),
    target: server ? "node" : "web",
    onStart,
    onBuild,
    onError,
  };

  if (cwd) {
    microbundleConfig.cwd = cwd;
  }

  const aliasString = optionsRecordToString(alias);
  if (aliasString.length) microbundleConfig["alias"] = aliasString;

  const globalsString = optionsRecordToString(globals);
  if (globalsString.length) microbundleConfig["globals"] = globalsString;

  const externalString = boolOptionsRecordToString(external);
  if (externalString.length) microbundleConfig["external"] = externalString;

  if (!server) {
    microbundleConfig["external"] = "none";
  }

  const microbundle = (await import("microbundle")).default;
  const bundleResult = await microbundle(microbundleConfig);
  if (bundleResult.output) {
    console.log(bundleResult.output);
  }

  return bundleResult;
};

export const bundleClients = async function ({
  src,
  dist,
  ctx,
  cwd,
  watch = false,
  entryOptions = () => ({}),
}: {
  ctx: Ctx;
  cwd?: string;
  src: string;
  dist: string;
  watch?: boolean;
  entryOptions?: EntryOptions;
}) {
  let watchers: Record<string, any> = {};

  const startBundlers = async function () {
    const assetsJsonPath = resolve(dist, "clientAssets.json");

    const assetsExist = !watch && (await pathExists(assetsJsonPath));
    if (assetsExist) {
      const clientAssets = await readJson(assetsJsonPath);
      for (const [fileBase, asset] of Object.entries(clientAssets)) {
        ctx.assets[fileBase] = asset;
      }
      return;
    }

    const nextWatchers: Record<string, any> = {};
    const srcEntries = await readdir(src);
    const clientAssets = {};

    for (const file of srcEntries) {
      if (watchers[file]) {
        nextWatchers[file] = watchers[file];
        delete watchers[file];
        continue;
      }

      const fileExt = extname(file);
      const fileBase = basename(file, fileExt);
      const absFile = resolve(src, file);
      const uniqueFileBase = fileBase + (!watch ? `.${cuid()}` : "");
      const distJsFileName = uniqueFileBase + ".js";
      const distCssFileName = uniqueFileBase + ".css";
      const absJsFileDist = resolve(dist, fileBase, distJsFileName);
      const absCssFileDist = resolve(dist, fileBase, distCssFileName);

      let aEntryOptions: BundleEntryOptions = {};
      if (entryOptions) {
        aEntryOptions =
          typeof entryOptions === "function"
            ? entryOptions({ name: fileBase })
            : entryOptions;
      }

      const bundleResult = await bundle({
        cwd,
        ctx,
        src: absFile,
        dist: absJsFileDist,
        watch,
        entryOptions: aEntryOptions,
      });

      const newWatchers = bundleResult.watchers;

      const publicJsFile = `/sosse-client/${fileBase}/${distJsFileName}`;
      const publicCssFile = `/sosse-client/${fileBase}/${distCssFileName}`;
      ctx.assets[fileBase] = {
        js: {
          url: publicJsFile,
          path: absJsFileDist,
          props: {
            type: "module",
            src: publicJsFile,
          },
        },
        css: {
          url: publicCssFile,
          path: absCssFileDist,
          props: {
            rel: "stylesheet",
            type: "text/css",
            href: publicCssFile,
          },
        },
      };
      clientAssets[fileBase] = ctx.assets[fileBase];

      if (watch) {
        nextWatchers[file] = Object.values(newWatchers)[0];
      }
    }

    if (watch) {
      for (const watcher of Object.values(watchers)) {
        watcher.close();
      }
      watchers = nextWatchers;
    } else {
      await writeJson(assetsJsonPath, clientAssets);
    }
  };

  await startBundlers();

  if (watch) {
    const chokidar = require("chokidar");
    chokidar.watch(src).on("all", startBundlers);
  }
};
