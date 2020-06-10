import { EventEmitter } from "events";

let currentCtx: Ctx;

export type Ctx = {
  base: string;
  mainError?: Error;
  events: EventEmitter;
  assets: Record<string, { html?: string; url?: string }>;
  injectHtml: {
    footer: Record<string, string>;
  };
};

export const setCtx = function (ctx: Ctx) {
  currentCtx = ctx;
};

export const useCtx = function (): Ctx {
  if (!currentCtx) {
    throw new Error("Tried to use ctx outside of hsr main");
  }

  return currentCtx;
};

export const createCtx = function ({ base }): Ctx {
  return {
    base,
    events: new EventEmitter(),
    assets: {},
    injectHtml: { footer: {} },
  };
};

export const unsetCtx = function () {
  currentCtx = undefined;
};
