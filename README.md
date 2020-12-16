# [🥣 Sosse](https://github.com/sossejs/sosse)

Composable toolkit for (p)react full-stack node web servers:

- 🔥 Hot server restart
- 🔄 Live reload
- 🖨 Output server errors in browser
- ⚛️ Interactive (p)react components
- 🌊 CSS server side rendering with [Otion](https://github.com/kripod/otion)
- 📦 Bundling client assets with [Microbundle](https://github.com/developit/microbundle)

## 🤓 [Getting started](https://github.com/sossejs/sosse/blob/master/docs/getting_started.md)

[![](assets/badge.license.svg)](https://opensource.org/licenses/MIT)
[![](assets/badge.npm.svg)](https://www.npmjs.com/package/sosse)
[![](assets/badge.style.svg)](https://prettier.io/)

---

## TLDR

- At its core Sosse is a wrapper around node's native http server which can be replaced one-to-one
- This wrapper is used as a base to incrementally integrate Devtooling like "Live reload" and server features like "Server side rendering"

## Architecture

- Routing:
  - [Express](https://github.com/expressjs/expressjs.com), [Fastify](https://github.com/fastify/fastify) and others can be used as server routing solution
    - Sosse does not predetermine a specific routing solution, nor does it require one
  - Client side routing is strictly not supported
- Rendering HTML:
  - (P)react is used as the view layer
  - Static components are directly rendered on the server
  - Dynamic components are rendered on the client
    - Static parts from dynamic components can be prerendered on the server
- Rendering CSS:
  - The recommended CSS in JS solution is [Otion](https://github.com/kripod/otion)
  - CSS files and modules can be imported and are processed with [PostCSS](https://github.com/postcss/postcss)
- JS Bundling / Transpilation:
  - Done for the client & server
  - Convention over configuration
  - Sosse handles the bundling (with microbundle)
  - Stay a way from Sosse if you have very specific requirements about how to bundle your JS

## Main use case

Small - middle sized, but quickly growing and changing web projects with a strong focus on a composable UI, are the main target for Sosse.

Setting up a component driven web site has generally a high abstraction cost. As an example I want to mention [Next.js](https://github.com/vercel/next.js), a really powerful full-stack react framework. This power comes at a price: In the best case you only have to implement a couple things like routes and redirects and the "Next.js"-way, and in the worst case it will hit you in the business logic and you have to accept unexpected trade-offs.

Sosse tries to avoid typical framework-like trade-offs by limitting its feature-set, architectural style and defining clear boundaries.
