import { h, VNode, Fragment } from "preact";
import prerender from "preact-iso/prerender";
import render from "preact-render-to-string";

export const jssx = function (vnode: VNode) {
  return prerender(vnode);
};

export const jsx = function (vnode: VNode) {
  return render(vnode);
};

export const Html = function ({
  title = "",
  description = "",
  lang = "",
  className = "",
  viewport = "width=device-width, initial-scale=1",
  htmlProps = {},
  bodyProps = {},
  head = null,
  children,
}) {
  return (
    <Fragment>
      <html
        className={className || undefined}
        lang={lang || undefined}
        {...htmlProps}
      >
        <head>
          <meta charSet="utf-8" />
          {viewport && <meta name="viewport" content={viewport} />}
          {description && <meta name="description" content={description} />}
          {title && <title>{title}</title>}
          {head}
        </head>
        <body {...bodyProps}>{children}</body>
      </html>
    </Fragment>
  );
};
