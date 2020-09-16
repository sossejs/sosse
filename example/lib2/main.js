import { useCtx, jsx } from "sosse";
import { css } from "sosse/uni";
import { h } from "preact";

export default () => {
  const sosse = useCtx();
  const server = sosse.createServer((req, res) => {
    if (req.url !== "/") return res.writeHead(500).end();

    globalThis.counter++;

    res.end(
      sosse.html(() => ({
        data: { count: globalThis.counter },
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
