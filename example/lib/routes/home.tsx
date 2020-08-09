import { useHtml, jsx, useAsset } from "sosse";
import React, { Fragment } from "react";
import { Express } from "express";
import { htmlData, css } from "sosse/uni";
import {
  SsrInjectCounter,
  SuspenseInjectCounter,
  LazyInjectCounter,
  Box,
  HydrateColorContext,
} from "../injects";
import { ColorContext } from "../context";

export const homeRoute = async function (app: Express) {
  globalThis.count = globalThis.count || 1;

  const html = useHtml();
  const indexAsset = useAsset("index");

  // Home route
  app.get("/", (req, res) => {
    htmlData({ count: globalThis.count });

    res.send(
      html(() => ({
        title: "Hello world",
        head: jsx(
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
            <script {...indexAsset.props} defer={true} />
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
        body: jsx(
          <ColorContext.Provider value="#A09BD7">
            <HydrateColorContext />
            <div id="app">
              <h1>hello visitor {globalThis.count++}</h1>

              <Box />
              <Box />

              <SsrInjectCounter startCount={4} />
              <SuspenseInjectCounter startCount={7} />
              <div class={css({ marginTop: "100rem" })} />
              <LazyInjectCounter startCount={9} />
              <Box />
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
      }))
    );
  });
};
