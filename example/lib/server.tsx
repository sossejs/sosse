import http from "http";
import express from "express";
import { notFoundHtml, devSocket } from "sosse";
import { homeRoute } from "./routes/home";

export default () => {
  const app = express();

  app.use(express.static(__dirname + "/public"));

  homeRoute(app);

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
