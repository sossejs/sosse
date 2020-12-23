import { VNode } from "preact";
import render from "preact-render-to-string";

export const jsx = function (vnode: VNode) {
  return render(vnode);
};

export const html = function ({
  title,
  head = "",
  vhead,
  bodyAttrs = {},
  body,
}: {
  title: string;
  vhead?: VNode;
  head?: string;
  bodyAttrs?: Record<string, string | number>;
  body?: string;
}) {
  let bodyAttrsString = "";
  for (const [key, value] of Object.entries(bodyAttrs)) {
    bodyAttrsString += ` ${key}="${value}"`;
  }

  if (vhead) {
    head += jsx(vhead);
  }

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${title ? `<title>${title}</title>` : ""}
    ${head}
  </head>
  <body${bodyAttrsString}>
    ${body}
  </body>
</html>`;
};
