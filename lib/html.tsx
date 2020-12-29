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
  htmlProps = {},
  bodyProps = {},
  head = null,
  children,
}) {
  return (
    <Fragment>
      <html {...htmlProps}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {title && <title>{title}</title>}
          {head}
        </head>
        <body {...bodyProps}>{children}</body>
      </html>
    </Fragment>
  );
};
