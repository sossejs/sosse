import { html, useCtx } from "sosse";
import { h, Fragment } from "preact";
import render from "preact-render-to-string";
import { Express } from "express";
import { otion } from "sosse/otion";
import { css } from "otion";

const ctx = useCtx();

export const homeRoute = function (app: Express) {
  globalThis.count = globalThis.count || 1;

  // Home route
  app.get("/", (req, res) =>
    res.send(
      otion(() => {
        return html({
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
          bodyAttrs: {
            class: css({
              selectors: {
                "& > #app": {
                  width: "40rem",
                  margin: "auto",
                },
              },
            }),
          },
          body:
            render(
              <div id="app">
                <h1>hello visitor {globalThis.count++}</h1>
                <div id="counter" />
                <footer
                  class={css({
                    backgroundColor: "#034",
                    marginTop: "1rem",
                    padding: "3rem",
                    color: "#fff",
                  })}
                >
                  Spiced up with Sosse
                </footer>
              </div>
            ) + ctx.assets.index.html,
          ctx,
        });
      })
    )
  );
};
