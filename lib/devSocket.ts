import { Server } from "http";
import url from "url";
import { Ctx, useCtx } from "./ctx";
import { copy, emptyDir } from "fs-extra";
import path from "path";

const integrateClientJs = async function (ctx: Ctx) {
  const publicFolder = "sosseDevSocketClient";

  if (!globalThis.sosseDevClientCopied) {
    const clientJsPath = path.resolve(
      __dirname,
      "..",
      "dev-socket-client",
      "dist"
    );

    const publicPath = path.resolve(ctx.publicDir, publicFolder);
    await emptyDir(publicPath);
    await copy(
      path.resolve(clientJsPath, "main.umd.js"),
      path.resolve(publicPath, "main.umd.js")
    );
    await copy(
      path.resolve(clientJsPath, "main.umd.js.map"),
      path.resolve(publicPath, "main.umd.js.map")
    );
    globalThis.sosseDevClientCopied = true;
  }

  const publicUrl = `/${publicFolder}/main.umd.js`;

  ctx.assets.sosseDev = {
    url: publicUrl,
    html: `
<script src="${publicUrl}"></script>
<script>
window.sosseDevSocketClient.init();
</script>`,
  };
  ctx.injectHtml.head.sosseDev = ctx.assets.sosseDev.html;
};

export const devSocket = async function ({
  server,
  enable = process.env.NODE_ENV !== "production",
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

  await integrateClientJs(ctx);

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
    ctx.events.on("error", errorListener);
  };

  ctx.events.on("started", startedListener);
};
