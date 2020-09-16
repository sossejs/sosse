import { VNode } from "preact";

export const jsx = function (vnode: VNode) {
  const render = require("preact-render-to-string");
  return render(vnode);
};
