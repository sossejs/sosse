import debounce from "lodash/debounce";
import path from "path";
import { createCtx, setCtx, unsetCtx, Ctx } from "./ctx";
import stripAnsi from "strip-ansi";
import { Server } from "http";
import { isDev } from "./env";

export const hsr = async function ({
  cwd = process.cwd(),
  watch = ["."],
  exclude = [],
  wait = 500,
  main,
  ctx = createCtx(),
  restart = isDev,
}: {
  cwd?: string;
  watch?: string[];
  publicDir?: string;
  exclude?: string[];
  wait?: number;
  main: () => () => Server | Function | void;
  ctx?: Ctx;
  restart?: boolean;
}) {
  exclude.push("node_modules");

  if (!restart) {
    setCtx(ctx);
    const listen = await main();
    unsetCtx();

    await listen();
    return;
  }

  const clearModule = (await import("clear-module")).default;

  const absWatch = watch.map((dir) => path.resolve(cwd, dir));
  const absExclude = exclude.map((dir) => path.resolve(cwd, dir));

  let stopMain;
  let restarting = false;
  let pendingRestart = false;

  const restartMain = debounce(async () => {
    if (restarting) {
      pendingRestart = true;
      return;
    }

    restarting = true;

    await new Promise(function (resolve) {
      const intervalId = setInterval(function () {
        for (const value of Object.values(ctx.throttleRestart)) {
          if (!value) {
            continue;
          }

          return;
        }

        clearInterval(intervalId);
        resolve();
      }, 300);
    });

    pendingRestart = false;

    let listen;
    clearModule.all();

    const { setCtx, unsetCtx } = require("sosse");

    setCtx(ctx);

    try {
      listen = await main();
    } catch (err) {
      ctx.errors.push(stripAnsi(err.stack || err.message));
      console.error(err);
      ctx.events.emit("sosseError");
    }

    unsetCtx();

    if (listen) {
      if (stopMain) {
        ctx.events.emit("restart");
        const oldStopMain = stopMain;
        stopMain = undefined;
        if (typeof oldStopMain === "function") {
          await oldStopMain();
        } else {
          // If the consumer returns their server instance we close it for them
          await new Promise((res, rej) =>
            oldStopMain.close((e) => (e ? rej(e) : res()))
          );
        }
      } else {
        // TODO: Currently this just deletes all errors, we should separate between (server/client)-bundler/node
        ctx.errors = [];
      }
      stopMain = await listen();
      ctx.events.emit("started");
    }

    restarting = false;
    ctx.willRestart = false;

    if (pendingRestart) {
      ctx.willRestart = true;
      pendingRestart = false;
      restartMain();
    }
  }, wait);

  ctx.events.on("triggerRestart", function () {
    ctx.willRestart = true;
    restartMain();
  });

  if (absWatch.length) {
    const chokidar = require("chokidar");
    const watcher = chokidar.watch(absWatch, {
      ignored: absExclude,
    });
    watcher.on("all", function () {
      ctx.willRestart = true;
      restartMain();
    });
  }
};
