import express from "express";
import { useHtml, createServer } from "sosse";
import { homeRoute } from "./routes/home";
import "./injects";
import { preload } from "sosse/preact";

export default async () => {
  await preload();

  const app = express();
  await homeRoute(app);

  const html = useHtml();

  // 404 route
  app.use((req, res) => res.status(404).send(html({ notFound: true })));

  const port = 8080;
  const server = createServer(app);

  return () => {
    server.listen(port);

    console.log(`Started http://localhost:${port}`);
    return () =>
      new Promise((res, rej) => server.close((e) => (e ? rej(e) : res())));
  };
};
