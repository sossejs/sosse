import { VNode } from "preact";
import render from "preact-render-to-string";

export const jsx = function (vnode: VNode) {
  return render(vnode);
};
