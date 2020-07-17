import debounce from "lodash/debounce";
import path from "path";
import { createCtx, setCtx, unsetCtx } from "./ctx";
import stripAnsi from "strip-ansi";

type PluginCtx = { throttleRestart?: boolean };

export const hsr = async function ({
  base,
  watch = ["."],
  publicDir = "public",
  exclude = ["client", "node_modules"],
  wait = 500,
  main,
  plugins,
  restart = process.env.NODE_ENV !== "production",
}: {
  base: string;
  watch?: string[];
  publicDir?: string;
  exclude?: string[];
  wait?: number;
  main: () => () => Function | void;
  plugins?: ((opts) => void | Promise<PluginCtx | void>)[];
  restart?: boolean;
}) {
  exclude.push(publicDir);

  const ctx = createCtx({ base, publicDir });
  const pluginsCtx: PluginCtx[] = [];
  for (const plugin of plugins) {
    const pluginCtx = await plugin({ ctx });
    if (!pluginCtx) {
      continue;
    }

    pluginsCtx.push(pluginCtx);
  }

  if (!restart) {
    setCtx(ctx);
    const listen = await main();
    unsetCtx();

    await listen();
    return;
  }

  const clearModule = (await import("clear-module")).default;

  const absWatch = watch.map((dir) => path.resolve(base, dir));
  const absExclude = exclude.map((dir) => path.resolve(base, dir));

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
        for (const pluginCtx of pluginsCtx) {
          if (!pluginCtx.throttleRestart) {
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
      ctx.errors.push(stripAnsi(err.message));
      console.error(err);
      ctx.events.emit("error");
    }

    unsetCtx();

    if (listen) {
      if (stopMain) {
        ctx.events.emit("restart");
        const oldStopMain = stopMain;
        stopMain = undefined;
        await oldStopMain();
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

  const chokidar = require("chokidar");

  const watcher = chokidar.watch(absWatch, {
    ignored: absExclude,
  });
  watcher.on("all", function () {
    ctx.willRestart = true;
    restartMain();
  });
};
