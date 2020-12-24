import { useCtx } from "sosse";
import { Express } from "express";
import { css, ErrorBoundary } from "sosse/iso";
import {
  SsrInjectCounter,
  SuspenseInjectCounter,
  LazyInjectCounter,
  Box,
  HydrateColorContext,
} from "../injects";
import { ColorContext } from "../context";
import { h, Fragment } from "preact";

export const homeRoute = async function (app: Express) {
  globalThis.count = globalThis.count || 1;

  const ctx = useCtx();
  const indexAsset = ctx.useAsset("index");

  // Home route
  app.get("/", async (req, res) => {
    res.send(
      await ctx.render(
        () => (
          <ColorContext.Provider value="#A09BD7">
            <HydrateColorContext />
            <div id="app">
              <h1>hello visitor {globalThis.count++}</h1>
              <ErrorBoundary>
                <Box />
                <Box />
                <SsrInjectCounter startCount={4} />
                <SuspenseInjectCounter startCount={7} />
                <div class={css({ marginTop: "100rem" })} />
                <LazyInjectCounter startCount={9} />
                <Box />
              </ErrorBoundary>

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
          </ColorContext.Provider>
        ),
        {
          title: "Hello world",
          vhead: (
            <>
              <link href="https://unpkg.com/sanitize.css" rel="stylesheet" />
              <link
                href="https://unpkg.com/sanitize.css/forms.css"
                rel="stylesheet"
              />
              <link
                href="https://unpkg.com/sanitize.css/typography.css"
                rel="stylesheet"
              />
              <link {...indexAsset.css.props} />
              <script {...indexAsset.js.props} defer={true} />
            </>
          ),
        }
      )
    );
  });
};
