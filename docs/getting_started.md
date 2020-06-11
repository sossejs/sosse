# Getting started

## Basic usage

main.js:
```js
import { hsr } from "sosse";

hsr({
  // Used as a prefix to resolve other configuration paths
  base: __dirname,
  // Will be called on file changes
  main: () => require("./server").default()
})
```

server.js:
```js
export default () {
  // Called before previous server is stopped
  console.log("preparation")

  return () => {
    // Called if the preparation was successfully executed and then only after the previous server is shutdown
    console.log("start")

    return () => {
      // Called after the next preparation was successfully executed
      console.log("stop")
    }
  }
}
```

## Watch custom directories

```js
hsr({
  base: __dirname,
  // Custom watch paths, relative to base (default: ["."])
  watch: ["routes", "views"]
})
```

## Basic Express server example

```js
import express from "express";

globalThis.count = globalThis.count || 1;

export default () => {
  const app = express();
  app.get("/", (req, res) =>
    res.send(`<h1>hey visitor ${globalThis.count++}</h1>`)); 

  return () => {
    const port = 8080;
    const server = app.listen(port);

    console.log(`Started http://localhost:${port}`);

    return () =>
      new Promise((res, rej) => server.close((e) => (e ? rej(e) : res())));
  };
};
```

## Complete Express server example

```js
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
```