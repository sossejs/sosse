const reload = function () {
  let tries = 0;
  let maxTries = 15;
  const reconnect = async function () {
    let res;
    try {
      const res = await fetch("/sosse-dev");
      location.reload(true);
    } catch (err) {
      console.dir(err);
    }
    tries++;
    if (tries === maxTries) {
      console.error("Failed to reconnect to Nexo Dev Server");
      return;
    }
    setTimeout(function () {
      reconnect();
    }, 1000);
  };
  reconnect();
};

let errorEl;
const socket = new WebSocket("ws://" + location.host + "/sosse-dev");
socket.onopen = () => {
  console.info("Connected to Sosse Dev Server");
};
socket.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if (data.type === "error") {
    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.style.zIndex = 10000;
      errorEl.style.backgroundColor = "#000D";
      errorEl.style.color = "#FFF";
      errorEl.style.fontSize = "1.2rem";
      errorEl.style.minWidth = "100%";
      errorEl.style.minHeight = "100%";
      errorEl.style.top = 0;
      errorEl.style.left = 0;
      errorEl.style.margin = 0;
      errorEl.style.padding = 0;
      errorEl.style.position = "absolute";
      document.body.appendChild(errorEl);
    }

    errorEl.textContent = "";

    data.errors.forEach(function (v) {
      const errorMsgEl = document.createElement("pre");
      errorMsgEl.style.margin = "30px";
      errorMsgEl.textContent = v;
      errorEl.appendChild(errorMsgEl);
    });
  }

  if (data.type === "reload") {
    reload();
  }
};
