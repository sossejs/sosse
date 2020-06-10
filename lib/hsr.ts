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
  // TODO: add something to handle restarts while a restart already is happening
  const restartMain = debounce(async () => {
    let listen;
    clearModule.all();

    const { setCtx, unsetCtx } = require("sosse");

    ctx.mainError = undefined;
    const prevEvents = ctx.events;
    ctx.events = new EventEmitter();
    setCtx(ctx);

    try {
      listen = await main();
    } catch (err) {
      ctx.mainError = err;
      console.error(err);
    }

    unsetCtx();
    if (ctx.mainError) {
      prevEvents.emit("error");
      ctx.events = prevEvents;
    }

    if (listen) {
      if (stopMain) {
        prevEvents.emit("restart");
        const oldStopMain = stopMain;
        stopMain = undefined;
        await oldStopMain();
      }
      stopMain = await listen();
    }
  }, wait);
  const watcher = chokidar.watch(absWatch);
  watcher.on("all", restartMain);
};
