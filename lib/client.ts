import { Ctx } from "./ctx";
import {
  mkdirp,
  emptyDir,
  pathExists,
  readdir,
  writeJson,
  readJson,
} from "fs-extra";
import path from "path";
import stripAnsi from "strip-ansi";
import cuid from "cuid";

export const clientPlugin = function ({
  src = "client",
  dist = "sosse",
  format = "modern",
  preactAlias = true,
  watch = process.env.NODE_ENV !== "production",
  exitAfterBuild = process.env.SOSSE_CLIENT_BUILD === "1",
  microbundleOptions = {},
}: {
  src?: string;
  dist?: string;
  publicDir?: string;
  format?: "umd" | "modern";
  preactAlias?: boolean;
  watch?: boolean;
  exitAfterBuild?: boolean;
  microbundleOptions?: Record<string, any>;
} = {}) {
  watch = watch && !exitAfterBuild;

  return async ({ ctx }: { ctx: Ctx }) => {
    const pluginCtx = {
      throttleRestart: false,
    };

    const absSrc = path.resolve(ctx.base, src);
    const absDist = path.resolve(ctx.publicDir, dist);

    if (!(await pathExists(absSrc))) {
      return;
    }

    await mkdirp(absDist);
    if (watch || exitAfterBuild) {
      await emptyDir(absDist);
    }

    let watchers: Record<string, any> = {};

    const microbundle = require("microbundle");

    const startBundlers = async function () {
      const assetsJsonPath = path.resolve(absDist, "clientAssets.json");
      if (!watch && (await pathExists(assetsJsonPath))) {
        const clientAssets = await readJson(assetsJsonPath);
        for (const [fileBase, asset] of Object.entries(clientAssets)) {
          ctx.assets[fileBase] = asset;
        }
        return;
      }

      let runningBuilds = 0;
      const nextWatchers: Record<string, any> = {};
      const srcEntries = await readdir(absSrc);
      const clientAssets = {};

      for (const file of srcEntries) {
        if (watchers[file]) {
          nextWatchers[file] = watchers[file];
          delete watchers[file];
          continue;
        }

        const fileExt = path.extname(file);
        const fileBase = path.basename(file, fileExt);
        const absFile = path.resolve(absSrc, file);
        const distFileName = fileBase + (!watch ? `.${cuid()}` : "") + ".js";
        const absFileDist = path.resolve(absDist, fileBase, distFileName);

        const microbundleDefaults = {
          "pkg-main": true,
          target: "web",
          cwd: ".",
          sourcemap: true,
        };

        const bundleNodeEnv = process.env.NODE_ENV || "development";

        const microbundleConfig = {
          ...microbundleDefaults,
          entries: [absFile],
          output: absFileDist,
          watch,
          format,
          "pkg-main": false,
          external: "none",
          define: `process.env.NODE_ENV=${bundleNodeEnv}`,
          ...microbundleOptions,
          onStart(e) {
            runningBuilds++;
            pluginCtx.throttleRestart = true;
          },
          onBuild() {
            runningBuilds--;
            if (runningBuilds > 0) {
              return;
            }

            pluginCtx.throttleRestart = false;
            if (!ctx.willRestart) {
              ctx.events.emit("reload");
            }
          },
          onError(e) {
            runningBuilds--;
            ctx.errors.push(stripAnsi(e.error.stack));
            ctx.events.emit("error");
          },
        };

        if (preactAlias) {
          microbundleConfig["jsx"] = "React.createElement";
          microbundleConfig["alias"] = microbundleConfig["alias"] || "";
          microbundleConfig["alias"] +=
            (microbundleConfig["alias"] && ",") + "react=preact/compat";
        }

        const bundleResult = await microbundle(microbundleConfig);
        if (bundleResult.output) {
          console.log(bundleResult.output);
        }
        const newWatchers = bundleResult.watchers;

        const publicFile = `/${dist}/${fileBase}/${distFileName}`;
        const scriptTypeAttr = format == "modern" ? 'type="module"' : "";
        ctx.assets[fileBase] = {
          url: publicFile,
          html: `<script ${scriptTypeAttr} src="${publicFile}"></script>`,
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

    if (exitAfterBuild) {
      process.exit();
    }

    if (watch) {
      const chokidar = require("chokidar");
      chokidar.watch(absSrc).on("all", startBundlers);
    }

    return pluginCtx;
  };
};
