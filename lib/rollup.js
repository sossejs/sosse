const resolvePlugin = require("@rollup/plugin-node-resolve").default;
const commonjsPlugin = require("@rollup/plugin-commonjs");
const babelPlugin = require("@rollup/plugin-babel").default;
const aliasPlugin = require("@rollup/plugin-alias");
const path = require("path");
const postcssPlugin = require("rollup-plugin-postcss");
const terserPlugin = require("rollup-plugin-terser").terser;
const importVarsPlugin = require("@rollup/plugin-dynamic-import-vars").default;
const jsonPlugin = require("@rollup/plugin-json");
const yamlPlugin = require("@rollup/plugin-yaml");
const replacePlugin = require("@rollup/plugin-replace");

module.exports = ({
  isServer = false,
  input,
  output,
  cssExtract,
  isDev = true,
  react = false,
  define = {},
  alias = {},
}) => {
  const extensions = [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"];

  return {
    input,
    output,
    preserveEntrySignatures: "exports-only",
    external: isServer
      ? (moduleName) => {
          if (moduleName.indexOf("style-inject") >= 0) {
            return true;
          }

          if (moduleName.indexOf("node_modules") >= 0) {
            return true;
          }

          if (!moduleName.startsWith(".") && !moduleName.startsWith("/")) {
            return true;
          }

          return false;
        }
      : null,
    plugins: [
      aliasPlugin({
        entries: {
          react: react ? "react" : "preact/compat",
          ...alias,
        },
      }),
      replacePlugin(define),
      resolvePlugin({
        extensions,
      }),
      postcssPlugin({
        extract: cssExtract,
        config: {
          ctx: {
            isDev,
          },
        },
        plugins: [
          !isDev &&
            require("cssnano")({
              preset: "default",
            }),
        ],
      }),
      jsonPlugin(),
      yamlPlugin(),
      babelPlugin({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        extensions: extensions,
        presets: [
          "@babel/preset-typescript",
          [
            "@babel/preset-react",
            {
              runtime: "automatic",
              importSource: react ? "react" : "preact",
            },
          ],
          [
            "@babel/env",
            {
              useBuiltIns: "usage",
              corejs: 3,
              shippedProposals: true,
              targets: {
                ...(isServer ? { node: true } : {}),
              },
            },
          ],
        ],
      }),
      importVarsPlugin(),
      commonjsPlugin(),
      !isDev && !isServer && terserPlugin(),
    ],
  };
};
