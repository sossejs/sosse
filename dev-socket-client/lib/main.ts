import Sockette from "sockette";

const reload = function () {
  location.reload(true);
};

let errorEl;
const showErrors = function (errors: string[]) {
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

  errors.forEach(function (error) {
    const errorMsgEl = document.createElement("pre");
    errorMsgEl.style.margin = "30px";
    errorMsgEl.textContent = error;
    errorEl.appendChild(errorMsgEl);
  });
};

export const init = function () {
  let connected = false;

  new Sockette("ws://" + location.host + "/sosse-dev", {
    onopen() {
      if (connected) {
        reload();
        return;
      }

      console.info("Connected to Sosse Dev Server");
      connected = true;
    },
    onmessage(msg) {
      const data = JSON.parse(msg.data);

      if (data.type === "error") {
        showErrors(data.errors);
      }

      if (data.type === "reload") {
        reload();
      }
    },
  });
};
