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
  microbundleOptions = [],
}: {
  src?: string;
  dist?: string;
  publicDir?: string;
  format?: string;
  watch?: boolean;
  microbundleOptions?: string[];
} = {}) {
  return async ({ ctx }: { ctx: Ctx }) => {
    const absSrc = path.resolve(ctx.base, src);
    const absDist = path.resolve(ctx.base, dist);

    if (!(await fs.pathExists(absSrc))) {
      return;
    }

    await fs.mkdirp(absDist);
    await fs.emptyDir(absDist);

    let bundlerProcesses: Record<string, ChildProcess> = {};

    const emitReload = debounce(function () {
      ctx.events.emit("reload");
    }, 500);

    const startBundlers = async function () {
      const nextBundlerProcesses: Record<string, ChildProcess> = {};
      const srcEntries = await fs.readdir(absSrc);
      for (const file of srcEntries) {
        if (bundlerProcesses[file]) {
          nextBundlerProcesses[file] = bundlerProcesses[file];
          delete bundlerProcesses[file];
          continue;
        }

        const fileExt = path.extname(file);
        const fileBase = path.basename(file, fileExt);
        const absFile = path.resolve(absSrc, file);
        const distFileName = fileBase + (!watch ? `.${cuid()}` : "") + ".js";
        const absFileDist = path.resolve(absDist, distFileName);

        let spawnOptions: SpawnOptions = {};
        if (!watch) {
          spawnOptions.stdio = "inherit";
        }

        // TODO: If someday possible microbundle should be called through a JS api
        const bundlerProcess = spawn(
          "npx",
          [
            "microbundle",
            ...(watch ? ["watch"] : []),
            "--no-pkg-main",
            "--define",
            "process.env.NODE_ENV=production",
            "-i",
            absFile,
            "-o",
            absFileDist,
            "-f",
            format,
            ...microbundleOptions,
          ],
          spawnOptions
        );

        const publicFile = `${publicDir}/${distFileName}`;
        ctx.assets[fileBase] = {
          url: publicFile,
          html: `<script src="${publicFile}"></script>`,
        };

        if (watch) {
          nextBundlerProcesses[file] = bundlerProcess;
          bundlerProcess.stdout.setEncoding("utf8");
          bundlerProcess.stderr.setEncoding("utf8");
          bundlerProcess.stdout.on("data", function (data: string) {
            if (data.indexOf("Wrote") === -1) {
              return;
            }

            console.info("Bundler info", data);

            emitReload();
          });
          bundlerProcess.stderr.on("data", function (data: string) {
            if (!data) {
              return;
            }

            const errorMessage = stripAnsi(data);
            if (errorMessage.startsWith("(babel plugin)")) {
              return;
            }

            console.error("Bundler error", data);
            ctx.errors.push(errorMessage);
            ctx.events.emit("error");
          });
        }
      }

      for (const bundlerProcess of Object.values(bundlerProcesses)) {
        bundlerProcess.kill();
      }

      bundlerProcesses = nextBundlerProcesses;
    };

    await startBundlers();

    if (watch) {
      chokidar.watch(absSrc).on("all", startBundlers);
    }
  };
};
