import { Server } from "http";
import WebSocket from "ws";
import url from "url";
import { useCtx } from "./ctx";

const clientJs = (wait) => `(function() {
const debounce = function(func, wait) {
  let timeoutId;
  return function() {
    if (timeoutId != null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(func, wait);
  }
}

const reload = debounce(function() {
  let tries = 0;
  let maxTries = 15;
  const reconnect = async function() {
    let res;
    try {
      const res = await fetch('/sosse-dev')
      if (res.status === 404) {
        location.reload(true);
      }
    }
    catch(err) {
      console.dir(err);
    }
    tries++;
    if (tries === maxTries) {
      console.error('Failed to reconnect to Nexo Dev Server')
      return;
    }
    setTimeout(function() {
      reconnect()
    }, 1000)
  }
  reconnect()
}, ${wait})

let errorEl;
const socket = new WebSocket('ws://' + location.host + '/sosse-dev');
socket.onopen = () => {
  console.info('Connected to Sosse Dev Server');
};
socket.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if (data.type === 'error') {
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.style.zIndex = 10000;
      errorEl.style.backgroundColor = '#000D';
      errorEl.style.color = '#FFF';
      errorEl.style.fontSize = '1.2rem';
      errorEl.style.minWidth = '100%';
      errorEl.style.minHeight = '100%';
      errorEl.style.top = 0;
      errorEl.style.left = 0;
      errorEl.style.margin = 0;
      errorEl.style.padding = 0;
      errorEl.style.position = 'absolute';
      document.body.appendChild(errorEl)
    }

    errorEl.textContent = '';

    data.errors.forEach(function(v) {
      const errorMsgEl = document.createElement('pre');
      errorMsgEl.style.margin = '30px';
      errorMsgEl.textContent = v;
      errorEl.appendChild(errorMsgEl);
    });
  }

  if (data.type === 'reload') {
    reload();
  }
};
})()`;

export const devSocket = function ({
  server,
  enable = process.env.NODE_ENV !== "production",
  wait = 3000,
}: {
  server: Server;
  enable?: boolean;
  wait?: number;
}) {
  if (!enable) {
    return;
  }

  const ctx = useCtx();

  ctx.assets.sosseDev = {
    html: `<script>
${clientJs(wait)}
</script>`,
  };
  ctx.injectHtml.footer.sosseDev = ctx.assets.sosseDev.html;

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
    for (const client of wss.clients) {
      client.send(JSON.stringify({ type: "reload" }));
    }
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
