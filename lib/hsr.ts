import clearModule from "clear-module";
import chokidar from "chokidar";
import debounce from "lodash/debounce";
import path from "path";
import { createCtx, setCtx, unsetCtx } from "./ctx";
import stripAnsi from "strip-ansi";

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
  plugins?: Function[];
  restart?: boolean;
}) {
  const ctx = createCtx({ base });

  for (const plugin of plugins) {
    await plugin({ ctx });
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
    if (pendingRestart) {
      pendingRestart = false;
      restartMain();
    }
  }, wait);
  const watcher = chokidar.watch(absWatch, {
    ignored: absExclude,
  });
  watcher.on("all", restartMain);
};
