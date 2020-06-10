import { Server } from "http";
import WebSocket from "ws";
import url from "url";
import stripAnsi from "strip-ansi";

import { useCtx } from "./ctx";

const clientJs = `const socket = new WebSocket('ws://' + location.host + '/sosse-dev');
socket.onopen = () => {
  console.info('Connected to Sosse Dev Server');
};
socket.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  console.log(data);

  let errorMsgEl;

  if (data.type === 'error') {
    if (!errorMsgEl) {
      errorMsgEl = document.createElement('pre');
      errorMsgEl.style.margin = '30px';

      const errorEl = document.createElement('div');
      errorEl.appendChild(errorMsgEl);

      errorEl.style.zIndex = 10000;
      errorEl.style.backgroundColor = '#000D';
      errorEl.style.color = '#FFF';
      errorEl.style.fontSize = '1.5rem';
      errorEl.style.minWidth = '100%';
      errorEl.style.minHeight = '100%';
      errorEl.style.top = 0;
      errorEl.style.left = 0;
      errorEl.style.margin = 0;
      errorEl.style.padding = 0;
      errorEl.style.position = 'absolute';
      document.body.appendChild(errorEl)
      
    }

    errorMsgEl.textContent = data.error;
  }

  if (data.type === 'reload') {
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
  }
};`;

export const devSocket = function ({
  server,
  enable = process.env.NODE_ENV !== "production",
}: {
  server: Server;
  enable?: boolean;
}) {
  if (!enable) {
    return;
  }

  const ctx = useCtx();

  ctx.assets.sosseDev = {
    html: `<script>
${clientJs}
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
      });
    } else {
      socket.destroy();
    }
  });

  const restartListener = function () {
    for (const client of wss.clients) {
      client.send(JSON.stringify({ type: "reload" }));
    }
    wss.close();
    ctx.events.removeListener("restart", restartListener);
    ctx.events.removeListener("error", errorListener);
  };

  const errorListener = function () {
    for (const client of wss.clients) {
      client.send(
        JSON.stringify({
          type: "error",
          error: stripAnsi(ctx.mainError.message),
        })
      );
    }
  };

  ctx.events.on("restart", restartListener);
  ctx.events.on("error", errorListener);
};
