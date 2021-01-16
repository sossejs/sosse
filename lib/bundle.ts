import {
  pathExists,
  mkdirp,
  emptyDir,
  readdir,
  readJson,
  writeJson,
} from "fs-extra";
import { dirname, extname, basename, resolve, relative, join } from "path";
import cuid from "cuid";
import stripAnsi from "strip-ansi";
import { Ctx } from "./ctx";
import rollup from "rollup";

const rollupConfigFactory = require("sosse/lib/rollup");

declare global {
  var SOSSE: {
    libDir: string;
    isNode: boolean;
  };
}

export type BundleEntryOptions = {
  alias?: Record<string, string>;
  define?: Record<string, string>;
  react?: boolean;
};

export type EntryOptions = ({
  name,
}: {
  name: string;
}) => BundleEntryOptions | undefined;

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

  let { define = {}, alias = {}, react } = entryOptions;

  if (!server) {
    define = {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
      ...define,
    };
  }

  define["SOSSE.libDir"] = JSON.stringify(ctx._libDir);
  define["SOSSE.isNode"] = JSON.stringify(server);

  const pkgPath = resolve(cwd, "package.json");
  const bundledDependencies: Record<string, boolean> = {};
  if (await pathExists(pkgPath)) {
    const pkg = require(pkgPath);
    const pkgDependencies = Object.keys(pkg.devDependencies || {});
    for (const name of pkgDependencies) {
      bundledDependencies[name] = true;
    }
  }

  const loggingLabel = `${server ? "server" : "client"} "${relative(
    cwd,
    src
  )}"`;

  let cssExtract: boolean | string = true;
  if (server) {
    // TODO: This doesnt work because of (https://github.com/rollup/rollup/issues/3669)
    /*
    ctx._assets["server"] = {
      css: createCssAsset({
        dist: resolve(ctx._distDir, "client"),
        jsDist: dist
        // file: join("client", "server", "server.css"),
      }),
    };

    cssExtract = relative(distDir, ctx._assets['server'].css.path);
    */

    cssExtract = false;

    // TODO: We can only enable this, if there is a check if some server css even exist
    // ctx._injectHtml.head['serverCss'] = `<link rel="stylesheet" type="text/css" href="${ctx._assets['server'].css.url}" />`
  }

  const rollupConfig = rollupConfigFactory({
    cwd,
    bundledDependencies,
    react,
    isServer: server,
    isDev: ctx._isDev,
    input: src,
    alias,
    define,
    cssExtract,
    output: {
      exports: server ? "named" : "auto",
      entryFileNames: relative(distDir, dist),
      dir: distDir,
      format: server ? "cjs" : "es",
      sourcemap: true,
    },
  });

  if (watch) {
    const onStart = function () {
      runningBuilds++;
      ctx._throttleRestart["sosseBundle"] = true;
    };

    const onBuild = function () {
      console.log(`Built ${loggingLabel}`);
      runningBuilds--;

      if (server) rebuiltServer = true;

      if (runningBuilds > 0) {
        return;
      }

      ctx._throttleRestart["sosseBundle"] = false;
      if (!ctx._willRestart) {
        const eventName = rebuiltServer ? "triggerRestart" : "reload";
        rebuiltServer = false;
        ctx._events.emit(eventName);
      }
    };

    const onError = function (error) {
      console.log(`Error while building ${loggingLabel}`);
      console.error(error);
      runningBuilds--;
      ctx._errors.push(stripAnsi(error.stack));
      ctx._events.emit("sosseError");
    };

    const watcher = rollup.watch(rollupConfig);
    watcher.on("event", (event) => {
      if (event.code === "BUNDLE_START") {
        onStart();
      }
      if (event.code === "BUNDLE_END") {
        onBuild();
        event.result.close();
      }
      if (event.code === "ERROR") {
        onError(event.error);
      }
    });

    return {
      watchers: {
        [src]: watcher,
      },
    };
  }

  let buildOk = true;

  try {
    const bundle = await rollup.rollup(rollupConfig);
    await bundle.write(rollupConfig.output);
    await bundle.close();
  } catch (err) {
    buildOk = false;
    console.log(`Error while building ${loggingLabel}`);
    console.error(err);
  }

  if (buildOk) {
    console.log(`Built ${loggingLabel}`);
  }

  return {};
};

const createCssAsset = function ({ fileBase, uniqueFileBase, dist }) {
  const distCssFileName = uniqueFileBase + ".css";
  const absCssFileDist = resolve(dist, fileBase, distCssFileName);
  const publicCssFile = `/sosse-client/${fileBase}/${distCssFileName}`;

  return {
    url: publicCssFile,
    path: absCssFileDist,
    props: {
      rel: "stylesheet",
      type: "text/css",
      href: publicCssFile,
    },
  };
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
        ctx._assets[fileBase] = asset;
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
      if (!fileExt) {
        continue;
      }

      const uniqueFileBase = fileBase + (!watch ? `.${cuid()}` : "");
      const distJsFileName = uniqueFileBase + ".js";
      const absJsFileDist = resolve(dist, fileBase, distJsFileName);

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

      ctx._assets[fileBase] = {
        js: {
          url: publicJsFile,
          path: absJsFileDist,
          props: {
            type: "module",
            src: publicJsFile,
          },
        },
        css: createCssAsset({
          fileBase,
          uniqueFileBase,
          dist,
        }),
      };
      clientAssets[fileBase] = ctx._assets[fileBase];

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
