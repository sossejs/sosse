export { hsr } from "./hsr";
export { devSocket } from "./devSocket";
export { html, notFoundHtml, HtmlOptions } from "./html";
export { setCtx, useCtx, unsetCtx } from "./ctx";

export const clientPlugin = function ({
  src,
  staticDir,
}: {
  src: string;
  staticDir: string;
}) {
  return () => {};
};
