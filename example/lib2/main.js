import { useCtx } from "sosse";
import { css } from "sosse/iso";
import config from "./config.json";

export default async () => {
  const sosse = useCtx();

  const route = await import(`./routes/route${config.route}.js`);

  const server = sosse.createServer(async (req, res) => {
    if (req.url !== "/") return res.writeHead(500).end();

    globalThis.counter++;

    const body = await sosse.render(
      () => (
        <>
          <h1 class={css({ color: "orange" })}>Hello world {route.label}</h1>
          <script {...sosse.useAsset("index").js.props} />
        </>
      ),
      {
        title: "Huhu",
        vhead: <style {...sosse.useAsset("server").css.props} />,
      }
    );

    res.end(body);
  });

  return () => {
    const port = 8080;
    server.listen(port);
    console.log(`Started http://localhost:${port}`);

    return server;
  };
};
