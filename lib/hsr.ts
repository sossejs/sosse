import clearModule from "clear-module";
import chokidar from "chokidar";
import debounce from "lodash/debounce";
import path from "path";
import { EventEmitter } from "events";

import { createCtx, setCtx, unsetCtx } from "./ctx";

export const hsr = async function ({
  base,
  watch = ["."],
  wait = 500,
  main,
  plugins,
  enable = process.env.NODE_ENV !== "production",
}: {
  base: string;
  watch?: string[];
  wait?: number;
  main: () => () => Function | void;
  plugins?: Function[];
  enable?: boolean;
}) {
  const ctx = createCtx({ base });

  if (!enable) {
    setCtx(ctx);
    const listen = await main();
    unsetCtx();

    await listen();
    return;
  }

  let absWatch = watch.map((dir) => path.resolve(base, dir));

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

    ctx.mainError = undefined;
    setCtx(ctx);

    try {
      listen = await main();
    } catch (err) {
      ctx.mainError = err;
      console.error(err);
    }

    unsetCtx();
    if (ctx.mainError) {
      ctx.events.emit("error");
    }

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
  const watcher = chokidar.watch(absWatch);
  watcher.on("all", restartMain);
};
