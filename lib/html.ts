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
  <body${bodyAttrs}>
    ${body}
  </body>
</html>`;
};

const createHtmlOptions = function (overrides: HtmlOptions = {}): HtmlOptions {
  return {
    head: "",
    title: "",
    body: "",
    bodyAttrs: {},
    tpl: defaultTpl,
    ...overrides,
  };
};

export type HtmlOptions = {
  head?: string;
  title?: string;
  body?: string;
  bodyAttrs?: Record<string, string>;
  ctx?: Ctx;
  tpl?: typeof defaultTpl;
};

export const html = function (options: HtmlOptions = {}) {
  let { head, title, body, bodyAttrs, tpl, ctx } = createHtmlOptions(options);

  if (ctx) {
    for (const injectHtml of Object.values(ctx.injectHtml.head)) {
      head += injectHtml;
    }

    for (const injectHtml of Object.values(ctx.injectHtml.footer)) {
      body += injectHtml;
    }
  }

  let bodyAttrsString = "";
  for (const [key, value] of Object.entries(bodyAttrs)) {
    bodyAttrsString += ` ${key}="${value}"`;
  }

  return tpl({
    head,
    title,
    body,
    bodyAttrs: bodyAttrsString,
  });
};

export const notFoundHtml = function (options: HtmlOptions = {}) {
  return html(
    createHtmlOptions({
      title: "Page not found",
      body: "<h1>Page not found</h1>",
      ...options,
    })
  );
};
