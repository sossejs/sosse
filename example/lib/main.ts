import express from "express";
import { homeRoute } from "./routes/home";
import "./injects";
import { preload } from "sosse/preact";
import { useCtx } from "sosse";

export default async () => {
  await preload();

  const app = express();
  await homeRoute(app);

  const ctx = useCtx();

  // 404 route
  app.use((req, res) => res.status(404).send(ctx.html({ notFound: true })));

  const port = 8080;
  const server = ctx.createServer(app);

  return () => {
    server.listen(port);

    console.log(`Started http://localhost:${port}`);
    return () =>
      new Promise((res, rej) => server.close((e) => (e ? rej(e) : res())));
  };
};
