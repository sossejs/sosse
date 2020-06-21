import { Ctx } from "./ctx";

const defaultTpl = function ({ title, head, bodyAttrs, body }) {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${title ? `<title>${title}</title>` : ""}
    ${head}
  </head>
  <body ${bodyAttrs}>
    ${body}
  </body>
</html>`;
};

export type HtmlOptions = {
  head?: string;
  title?: string;
  body?: string;
  bodyAttrs?: string;
  ctx?: Ctx;
  tpl?: typeof defaultTpl;
};

export const html = function ({
  head = "",
  title = "",
  body = "",
  bodyAttrs = "",
  ctx,
  tpl = defaultTpl,
}: HtmlOptions) {
  if (ctx) {
    for (const injectHtml of Object.values(ctx.injectHtml.head)) {
      head += injectHtml;
    }

    for (const injectHtml of Object.values(ctx.injectHtml.footer)) {
      body += injectHtml;
    }
  }

  return tpl({
    head,
    title,
    body,
    bodyAttrs,
  });
};

export const notFoundHtml = function ({
  head = "",
  title = "Page not found",
  body = "<h1>Page not found</h1>",
  bodyAttrs = "",
  ctx,
}: {
  head?: string;
  title?: string;
  body?: string;
  bodyAttrs?: string;
  ctx?: Ctx;
} = {}) {
  return html({ head, title, body, bodyAttrs, ctx });
};
