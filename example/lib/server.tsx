import http from "http";
import express from "express";
import { notFoundHtml, devSocket, useCtx } from "sosse";
import { homeRoute } from "./routes/home";
import "./injects";
import { preload } from "sosse/preact";

export default async () => {
  await preload();

  const ctx = useCtx();

  const app = express();
  app.use(express.static(ctx.publicDir));
  await homeRoute(app);

  // 404 route
  app.use((req, res) => res.status(404).send(notFoundHtml()));

  const port = 8080;
  const server = http.createServer(app);

  await devSocket({ server });

  return () => {
    server.listen(port);

    console.log(`Started http://localhost:${port}`);
    return () =>
      new Promise((res, rej) => server.close((e) => (e ? rej(e) : res())));
  };
};
