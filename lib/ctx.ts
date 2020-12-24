import { EventEmitter } from "events";
import { isDev } from "./env";
import {
  Server,
  RequestListener,
  createServer as _createServer,
  ServerOptions,
} from "http";
import url from "url";
import { readFileSync } from "fs-extra";
import path, { resolve } from "path";
import serveStatic from "serve-static";
import { html, jssx } from "./html";
import { VNode } from "preact";

let currentCtx: Ctx;

export type ServeClientOptions = {
  enable?: boolean;
};

export type OtionOptions = {
  enable?: boolean;
};

export type Asset = {
  js?: {
    path?: string;
    url?: string;
    props?: Record<string, any>;
  };
  css?: {
    path?: string;
    url?: string;
    props?: Record<string, any>;
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

export const unsetCtx = function () {
  currentCtx = undefined;
};

export class Ctx {
  _distDir: string;
  _serveClient: ServeClientOptions;
  _otion: OtionOptions;
  _throttleRestart: Record<string, boolean> = {};
  _errors: string[] = [];
  _willRestart: boolean = false;
  _events: EventEmitter = new EventEmitter();
  _assets: Record<string, Asset> = {};
  _injectHtml: {
    head: Record<string, string>;
    footer: Record<string, string>;
  } = { head: {}, footer: {} };

  constructor({
    distDir = "",
    serveClient = { enable: false },
    otion = { enable: false },
  }: {
    distDir?: string;
    serveClient?: ServeClientOptions;
    otion?: OtionOptions;
  } = {}) {
    this._distDir = distDir;
    this._serveClient = serveClient;
    this._otion = otion;
  }

  useAsset(name: string): Asset {
    const asset = this._assets[name];

    if (!asset) {
      if (isDev) {
        throw new Error(`Could not find asset "${name}"`);
      }

      return {};
    }

    return asset;
  }

  async render(
    bodyFn: () => string | VNode,
    tplOptions?: Omit<Parameters<typeof html>[0], "body">
  ) {
    let otion: { setup; server };
    if (this._otion.enable) {
      otion = {
        setup: require("otion").setup,
        server: require("otion/server"),
      };
    }

    let injector;

    if (this._otion.enable) {
      injector = otion.server.VirtualInjector();
      otion.setup({
        // TODO: Maybe add support for otion nonce
        injector,
      });
    }

    let body = bodyFn();
    if (typeof body !== "string") {
      body = (await jssx(body)).html;
    }

    const assets = {
      head: "",
      body: body as string,
    };

    for (const injectHtml of Object.values(this._injectHtml.head)) {
      assets.head += injectHtml;
    }

    for (const injectHtml of Object.values(this._injectHtml.footer)) {
      assets.body += injectHtml;
    }

    if (this._otion.enable) {
      const styleTag = otion.server.getStyleTag(
        otion.server.filterOutUnusedRules(injector, assets.body)
      );
      assets.head += styleTag;
    }

    if (tplOptions) {
      const preparedTplOptions = {
        head: "",
        body: assets.body,
        ...tplOptions,
      };

      preparedTplOptions.head += assets.head;

      return html(preparedTplOptions);
    }

    return assets;
  }

  withSosse(listener?: RequestListener): RequestListener {
    const devSocketCode = {
      js: "",
      map: "",
    };
    const devSocketUrl = "/sosse-dev/main.umd.js";
    if (isDev) {
      const socketJsPath = resolve(
        __dirname,
        "..",
        "dev-socket-client",
        "dist"
      );
      devSocketCode.js = readFileSync(resolve(socketJsPath, "main.umd.js"), {
        encoding: "utf-8",
      });
      devSocketCode.map = readFileSync(
        resolve(socketJsPath, "main.umd.js.map"),
        {
          encoding: "utf-8",
        }
      );

      this._injectHtml.head.sosseDev = `
  <script src="${devSocketUrl}"></script>
  <script>
  window.sosseDevSocketClient.init();
  </script>`;
    }

    let serve;
    if (this._serveClient.enable) {
      serve = serveStatic(resolve(this._distDir, "client"));
    }

    return (req, res) => {
      if (isDev) {
        if (req.url === devSocketUrl) {
          return res
            .writeHead(200, { "Content-Type": "application/javascript" })
            .end(devSocketCode.js);
        }
        if (req.url === devSocketUrl + ".map") {
          return res
            .writeHead(200, { "Content-Type": "application/json" })
            .end(devSocketCode.map);
        }
      }

      if (this._serveClient.enable && req.url.startsWith("/sosse-client")) {
        let url = req.url;
        req.url = req.url.substring("/sosse-client".length);
        return serve(req, res, function () {
          req.url = url;
          if (listener) {
            return listener(req, res);
          }
        });
      }

      if (!listener) {
        return;
      }

      listener(req, res);
    };
  }

  createServer<T = ServerOptions | RequestListener>(
    options?: T,
    listener?: RequestListener
  ): Server {
    let server: Server;

    const hasOptions = options && typeof options !== "function";
    listener = listener || (!hasOptions ? (options as any) : null);
    const wrappedListener = this.withSosse(listener);

    if (hasOptions) {
      server = _createServer(options, wrappedListener);
    } else {
      server = _createServer(wrappedListener);
    }

    this.devSocket({ server });

    return server;
  }

  devSocket({
    server,
    enable = isDev,
  }: {
    server: Server;
    enable?: boolean;
    wait?: number;
  }) {
    if (!enable) {
      return;
    }

    const WebSocket = require("ws");
    const wss = new WebSocket.Server({
      noServer: true,
    });

    let self = this;

    server.on("upgrade", function (request, socket, head) {
      const pathname = url.parse(request.url).pathname;

      if (pathname === "/sosse-dev") {
        wss.handleUpgrade(request, socket, head, function (ws) {
          wss.emit("connection", ws, request);
          if (self._errors.length) {
            sendError(ws);
          }
        });
      } else {
        socket.destroy();
      }
    });

    const restartListener = function () {
      // TODO: Currently this just deletes all errors, we should separate between (server/client)-bundler/node
      self._errors = [];
      wss.close();
      self._events.removeListener("restart", restartListener);
      self._events.removeListener("sosseError", errorListener);
      self._events.removeListener("reload", reloadListener);
      self = null;
    };

    const reloadListener = function () {
      for (const client of wss.clients) {
        client.send(JSON.stringify({ type: "reload" }));
      }
      // TODO: Currently this just deletes all errors, we should separate between (server/client)-bundler/node
      self._errors = [];
    };

    const sendError = function (client) {
      client.send(
        JSON.stringify({
          type: "error",
          errors: self._errors,
        })
      );
    };

    const errorListener = function () {
      for (const client of wss.clients) {
        sendError(client);
      }
    };

    const startedListener = function () {
      self._events.removeListener("started", startedListener);
      self._events.on("reload", reloadListener);
      self._events.on("restart", restartListener);
      self._events.on("sosseError", errorListener);
    };

    self._events.on("started", startedListener);
  }
}
