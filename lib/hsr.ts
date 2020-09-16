import debounce from "lodash/debounce";
import path from "path";
import { Ctx, setCtx, unsetCtx } from "./ctx";
import stripAnsi from "strip-ansi";
import { Server } from "http";
import { isDev } from "./env";

export const hsr = async function ({
  cwd = process.cwd(),
  watch = ["."],
  exclude = [],
  wait = 500,
  main,
  ctx = new Ctx(),
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
        for (const value of Object.values(ctx._throttleRestart)) {
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
      ctx._errors.push(stripAnsi(err.stack || err.message));
      console.error(err);
      ctx._events.emit("sosseError");
    }

    unsetCtx();

    if (listen) {
      if (stopMain) {
        ctx._events.emit("restart");
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
        ctx._errors = [];
      }
      stopMain = await listen();
      ctx._events.emit("started");
    }

    restarting = false;
    ctx._willRestart = false;

    if (pendingRestart) {
      ctx._willRestart = true;
      pendingRestart = false;
      restartMain();
    }
  }, wait);

  ctx._events.on("triggerRestart", function () {
    ctx._willRestart = true;
    restartMain();
  });

  if (absWatch.length) {
    const chokidar = require("chokidar");
    const watcher = chokidar.watch(absWatch, {
      ignored: absExclude,
    });
    watcher.on("all", function () {
      ctx._willRestart = true;
      restartMain();
    });
  }
};
