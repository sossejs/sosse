import express from "express";
import { homeRoute } from "./routes/home";
import "./injects.tsx";
import { useCtx } from "sosse";
import { h } from "preact";

export default async () => {
  const app = express();
  await homeRoute(app);

  const ctx = useCtx();

  // 404 route
  app.use(async (req, res) =>
    res
      .status(404)
      .send(await ctx.render(() => <h1>Not found</h1>, { title: "Not found" }))
  );

  const port = 8080;
  const server = ctx.createServer(app);

  return () => {
    server.listen(port);

    console.log(`Started http://localhost:${port}`);
    return () =>
      new Promise((res, rej) => server.close((e) => (e ? rej(e) : res(null))));
  };
};
