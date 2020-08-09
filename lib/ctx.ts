import { EventEmitter } from "events";
import { isDev } from "./env";

let currentCtx: Ctx;

export type ServeClientOptions = {
  enable?: boolean;
};

export type OtionOptions = {
  enable?: boolean;
};

export type Asset = {
  path?: string;
  url?: string;
  props?: Record<string, any>;
};

export type Ctx = {
  distDir: string;
  serveClient: ServeClientOptions;
  otion: OtionOptions;
  throttleRestart: Record<string, boolean>;
  errors: string[];
  willRestart: boolean;
  events: EventEmitter;
  assets: Record<string, Asset>;
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

export const createCtx = function ({
  distDir = "",
  serveClient = { enable: false },
  otion = { enable: false },
}: {
  distDir?: string;
  serveClient?: ServeClientOptions;
  otion?: OtionOptions;
} = {}): Ctx {
  return {
    distDir,
    serveClient,
    otion,
    throttleRestart: {},
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

export const useAsset = function (name: string): Asset {
  const ctx = useCtx();

  const asset = ctx.assets[name];

  if (!asset) {
    if (isDev) {
      throw new Error(`Could not find asset "${name}"`);
    }

    return {};
  }

  return asset;
};
