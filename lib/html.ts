import { useCtx } from "./ctx";
import { htmlData } from "sosse/uni";
import { VNode } from "preact";

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
    title: "Powered by Sosse",
    body: "",
    bodyAttrs: {},
    tpl: defaultTpl,
    ...overrides,
  };
};

export type HtmlOptions = {
  notFound?: boolean;
  head?: string;
  title?: string;
  body?: string;
  bodyAttrs?: Record<string, string>;
  tpl?: typeof defaultTpl;
};

type HtmlOptionsFunc = () => HtmlOptions;

export const useHtml = function () {
  const ctx = useCtx();

  let otion: { setup; server };
  if (ctx.otion.enable) {
    otion = {
      setup: require("otion").setup,
      server: require("otion/server"),
    };
  }

  return function (options: HtmlOptionsFunc | HtmlOptions = {}) {
    let injector;

    if (ctx.otion.enable) {
      injector = otion.server.VirtualInjector();
      otion.setup({
        // TODO: Maybe add support for otion nonce
        injector,
      });
    }

    if (typeof options === "function") {
      options = options();
    }

    let { head, title, body, bodyAttrs, tpl, notFound } = createHtmlOptions(
      options
    );

    if (notFound) {
      title = "Page not found";
      body = "<h1>Page not found</h1>";
    }

    const data = htmlData();
    htmlData(null);
    if (data != null) {
      head += `<script class="sosse-html-data" type="application/json">${JSON.stringify(
        data
      )}</script>`;
    }

    for (const injectHtml of Object.values(ctx.injectHtml.head)) {
      head += injectHtml;
    }

    for (const injectHtml of Object.values(ctx.injectHtml.footer)) {
      body += injectHtml;
    }

    let bodyAttrsString = "";
    for (const [key, value] of Object.entries(bodyAttrs)) {
      bodyAttrsString += ` ${key}="${value}"`;
    }

    let htmlResult = tpl({
      head,
      title,
      body,
      bodyAttrs: bodyAttrsString,
    });

    if (ctx.otion.enable) {
      const styleTag = otion.server.getStyleTag(
        otion.server.filterOutUnusedRules(injector, htmlResult)
      );
      htmlResult = htmlResult.replace("</head>", styleTag + "</head>");
    }

    return htmlResult;
  };
};

export const jsx = function (vnode: VNode) {
  const render = require("preact-render-to-string");
  return render(vnode);
};
