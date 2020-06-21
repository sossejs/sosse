import clearModule from "clear-module";
import chokidar from "chokidar";
import debounce from "lodash/debounce";
import path from "path";
import { createCtx, setCtx, unsetCtx } from "./ctx";
import stripAnsi from "strip-ansi";

type PluginCtx = { throttleRestart?: boolean };

export const hsr = async function ({
  base,
  watch = ["."],
  exclude = ["client", "public", "node_modules"],
  wait = 500,
  main,
  plugins,
  restart = process.env.NODE_ENV !== "production",
}: {
  base: string;
  watch?: string[];
  exclude?: string[];
  wait?: number;
  main: () => () => Function | void;
  plugins?: ((opts) => void | Promise<PluginCtx | void>)[];
  restart?: boolean;
}) {
  const ctx = createCtx({ base });
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
      ctx.events.emit("error");
      console.error(err);
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
  const watcher = chokidar.watch(absWatch, {
    ignored: absExclude,
  });
  watcher.on("all", function () {
    ctx.willRestart = true;
    restartMain();
  });
};
