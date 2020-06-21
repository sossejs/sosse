import { Ctx } from "./ctx";
import { spawn, ChildProcess, SpawnOptions } from "child_process";
import fs from "fs-extra";
import path from "path";
import debounce from "lodash/debounce";
import chokidar from "chokidar";
import stripAnsi from "strip-ansi";
import cuid from "cuid";

export const clientPlugin = function ({
  src = "client",
  dist = "public/sosse",
  publicDir = "/sosse",
  format = "umd",
  watch = process.env.NODE_ENV !== "production",
  microbundleOptions = {},
}: {
  src?: string;
  dist?: string;
  publicDir?: string;
  format?: string;
  watch?: boolean;
  microbundleOptions?: Record<string, any>;
} = {}) {
  return async ({ ctx }: { ctx: Ctx }) => {
    const pluginCtx = {
      throttleRestart: false,
    };

    const absSrc = path.resolve(ctx.base, src);
    const absDist = path.resolve(ctx.base, dist);

    if (!(await fs.pathExists(absSrc))) {
      return;
    }

    await fs.mkdirp(absDist);
    await fs.emptyDir(absDist);

    let watchers: Record<string, any> = {};

    const microbundle = require("microbundle");

    const startBundlers = async function () {
      let runningBuilds = 0;
      const nextWatchers: Record<string, any> = {};
      const srcEntries = await fs.readdir(absSrc);

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
        const absFileDist = path.resolve(absDist, distFileName);

        const microbundleDefaults = {
          target: "web",
          cwd: ".",
          sourcemap: true,
        };

        const microbundleConfig = {
          ...microbundleDefaults,
          entries: [absFile],
          output: absFileDist,
          watch,
          format,
          "no-pkg-main": true,
          define: "process.env.NODE_ENV=production",
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

        const newWatchers = await microbundle(microbundleConfig);
        const publicFile = `${publicDir}/${distFileName}`;
        ctx.assets[fileBase] = {
          url: publicFile,
          html: `<script src="${publicFile}"></script>`,
        };

        if (watch) {
          nextWatchers[file] = newWatchers[0];
        }
      }

      if (watch) {
        for (const watcher of Object.values(watchers)) {
          watcher.close();
        }
        watchers = nextWatchers;
      }
    };

    await startBundlers();

    if (watch) {
      chokidar.watch(absSrc).on("all", startBundlers);
    }

    return pluginCtx;
  };
};
