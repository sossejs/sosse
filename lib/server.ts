import {
  Server,
  RequestListener,
  createServer as _createServer,
  ServerOptions,
} from "http";
import url from "url";
import { useCtx } from "./ctx";
import { readFileSync } from "fs-extra";
import path, { resolve } from "path";
import { isDev } from "./env";
import serveStatic from "serve-static";

export const withSosse = function (
  listener?: RequestListener
): RequestListener {
  const ctx = useCtx();

  const devSocketCode = {
    js: "",
    map: "",
  };
  const devSocketUrl = "/sosse-dev/main.umd.js";
  if (isDev) {
    const socketJsPath = resolve(__dirname, "..", "dev-socket-client", "dist");
    devSocketCode.js = readFileSync(resolve(socketJsPath, "main.umd.js"), {
      encoding: "utf-8",
    });
    devSocketCode.map = readFileSync(resolve(socketJsPath, "main.umd.js.map"), {
      encoding: "utf-8",
    });

    ctx.injectHtml.head.sosseDev = `
  <script src="${devSocketUrl}"></script>
  <script>
  window.sosseDevSocketClient.init();
  </script>`;
  }

  let serve;
  if (ctx.serveClient.enable) {
    serve = serveStatic(resolve(ctx.distDir, "client"));
  }

  return function (req, res) {
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

    if (ctx.serveClient.enable && req.url.startsWith("/sosse-client")) {
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
};

export function createServer<T = ServerOptions | RequestListener>(
  options?: T,
  listener?: RequestListener
): Server {
  let server: Server;

  const hasOptions = options && typeof options !== "function";
  listener = listener || (!hasOptions ? (options as any) : null);
  const wrappedListener = withSosse(listener);

  if (hasOptions) {
    server = _createServer(options, wrappedListener);
  } else {
    server = _createServer(wrappedListener);
  }

  devSocket({ server });

  return server;
}

export const devSocket = function ({
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
  const ctx = useCtx();

  const wss = new WebSocket.Server({
    noServer: true,
  });

  server.on("upgrade", function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;

    if (pathname === "/sosse-dev") {
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit("connection", ws, request);
        if (ctx.errors.length) {
          sendError(ws);
        }
      });
    } else {
      socket.destroy();
    }
  });

  const restartListener = function () {
    // TODO: Currently this just deletes all errors, we should separate between (server/client)-bundler/node
    ctx.errors = [];
    wss.close();
    ctx.events.removeListener("restart", restartListener);
    ctx.events.removeListener("error", errorListener);
    ctx.events.removeListener("reload", reloadListener);
  };

  const reloadListener = function () {
    for (const client of wss.clients) {
      client.send(JSON.stringify({ type: "reload" }));
    }
    // TODO: Currently this just deletes all errors, we should separate between (server/client)-bundler/node
    ctx.errors = [];
  };

  const sendError = function (client) {
    client.send(
      JSON.stringify({
        type: "error",
        errors: ctx.errors,
      })
    );
  };

  const errorListener = function () {
    for (const client of wss.clients) {
      sendError(client);
    }
  };

  const startedListener = function () {
    ctx.events.removeListener("started", startedListener);
    ctx.events.on("reload", reloadListener);
    ctx.events.on("restart", restartListener);
    ctx.events.on("sosseError", errorListener);
  };

  ctx.events.on("started", startedListener);
};
