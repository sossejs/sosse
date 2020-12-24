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
  cwd,
  cssExtract,
  isDev = true,
  react = false,
  define = {},
  alias = {},
}) => {
  return {
    input,
    output,
    external: isServer
      ? (moduleName) => {
          if (moduleName.indexOf("style-inject") > -1) {
            return false;
          }

          if (moduleName.startsWith("./")) {
            moduleName = path.resolve(cwd, moduleName);
          }

          const result =
            !moduleName.startsWith(cwd) &&
            moduleName.indexOf(path.join(cwd, "node_modules")) === -1;

          return result;
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
      resolvePlugin(),
      postcssPlugin({
        extract: cssExtract,
      }),
      jsonPlugin(),
      yamlPlugin(),
      babelPlugin({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"],
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
      isDev && !isServer && terserPlugin(),
    ],
  };
};
