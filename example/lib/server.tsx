import http from "http";
import express from "express";
import { html, notFoundHtml, devSocket, useCtx } from "sosse";
import { h } from "preact";
import render from "preact-render-to-string";

globalThis.count = globalThis.count || 1;

export default () => {
  const ctx = useCtx();

  const app = express();

  // Home route
  app.get("/", (req, res) =>
    res.send(
      html({
        body: render(<h1>hey visitor {globalThis.count++}</h1>),
        ctx,
      })
    )
  );

  // 404 route
  app.use((req, res) => res.status(404).send(notFoundHtml()));

  const port = 8080;
  const server = http.createServer(app);

  devSocket({ server });

  return () => {
    server.listen(port);

    console.log(`Started http://localhost:${port}`);
    return () =>
      new Promise((res, rej) => server.close((e) => (e ? rej(e) : res())));
  };
};
