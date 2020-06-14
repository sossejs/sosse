import { html, useCtx } from "sosse";
import { h, Fragment } from "preact";
import render from "preact-render-to-string";
import { Express } from "express";

const ctx = useCtx();

export const homeRoute = function (app: Express) {
  globalThis.count = globalThis.count || 1;

  // Home route
  app.get("/", (req, res) =>
    res.send(
      html({
        head: render(
          <Fragment>
            <link href="https://unpkg.com/sanitize.css" rel="stylesheet" />
            <link
              href="https://unpkg.com/sanitize.css/forms.css"
              rel="stylesheet"
            />
            <link
              href="https://unpkg.com/sanitize.css/typography.css"
              rel="stylesheet"
            />
          </Fragment>
        ),
        body:
          render(
            <Fragment>
              <h1>hello visitor {globalThis.count++}</h1>
              <div id="app" />
            </Fragment>
          ) + ctx.assets.index.html,
        ctx,
      })
    )
  );
};
