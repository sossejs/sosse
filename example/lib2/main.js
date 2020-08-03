import { createServer, useHtml, jsx } from "sosse";
import { css, htmlData } from "sosse/uni";
import { h } from "preact";

export default () => {
  const html = useHtml();
  const server = createServer((req, res) => {
    if (req.url !== "/") return res.writeHead(500).end();

    globalThis.counter++;
    htmlData({ count: globalThis.counter });

    res.end(
      html(() => ({
        body: jsx(<h1 class={css({ color: "orange" })}>Hello world</h1>),
      }))
    );
  });

  return () => {
    const port = 8080;
    server.listen(port);
    console.log(`Started http://localhost:${port}`);

    return server;
  };
};
