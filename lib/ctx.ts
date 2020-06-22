import { EventEmitter } from "events";
import { resolve } from "path";

let currentCtx: Ctx;

export type Ctx = {
  base: string;
  publicDir: string;
  errors: string[];
  willRestart: boolean;
  events: EventEmitter;
  assets: Record<string, { html?: string; url?: string }>;
  injectHtml: {
    head: Record<string, string>;
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

export const createCtx = function ({ base, publicDir }): Ctx {
  publicDir = resolve(base, publicDir);

  return {
    base,
    publicDir,
    errors: [],
    willRestart: false,
    events: new EventEmitter(),
    assets: {},
    injectHtml: { head: {}, footer: {} },
  };
};

export const unsetCtx = function () {
  currentCtx = undefined;
};
