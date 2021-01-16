const resolvePlugin = require("@rollup/plugin-node-resolve").default;
const commonjsPlugin = require("@rollup/plugin-commonjs");
const babelPlugin = require("@rollup/plugin-babel").default;
const aliasPlugin = require("@rollup/plugin-alias");
const { resolve } = require("path");
const postcssPlugin = require("rollup-plugin-postcss");
const terserPlugin = require("rollup-plugin-terser").terser;
const importVarsPlugin = require("@rollup/plugin-dynamic-import-vars").default;
const jsonPlugin = require("@rollup/plugin-json");
const yamlPlugin = require("@rollup/plugin-yaml");
const replacePlugin = require("@rollup/plugin-replace");
const urlPlugin = require("@rollup/plugin-url");
const svgrPlugin = require("@svgr/rollup").default;
const minimatch = require("minimatch");

const memoExternal = (external) => {
  const results = [];
  return (name) => results[name] ?? (results[name] = external(name));
};

module.exports = ({
  cwd,
  bundledDependencies,
  isServer = false,
  input,
  output,
  cssExtract,
  isDev = true,
  react = false,
  define = {},
  alias = {},
}) => {
  const urlIncludes = [
    "**/*.svg",
    "**/*.png",
    "**/*.jp(e)?g",
    "**/*.gif",
    "**/*.webp",
  ];
  const matchers = urlIncludes.map(
    (pattern) => new minimatch.Minimatch(pattern)
  );
  const checkUrlIncludes = (file) => {
    for (const matcher of matchers) {
      if (matcher.match(file)) {
        return true;
      }
    }
  };
  const extensions = [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"];
  alias = {
    react: react ? "react" : "preact/compat",
    ...alias,
  };
  const aliasIds = Object.keys(alias);

  return {
    input,
    output,
    preserveEntrySignatures: "exports-only",
    onwarn(warning, warn) {
      if (isServer && warning.code === "UNUSED_EXTERNAL_IMPORT") return;

      warn(warning);
    },
    external: isServer
      ? memoExternal((moduleName) => {
          // Aliases only work if they are not marked as external
          if (aliasIds.indexOf(moduleName) >= 0) {
            return false;
          }

          for (const name of bundledDependencies) {
            if (moduleName.startsWith(name)) {
              return false;
            }

            if (moduleName.indexOf(`node_modules/${name}`) >= 0) {
              return false;
            }
          }

          if (checkUrlIncludes(moduleName)) {
            return false;
          }

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
        })
      : null,
    plugins: [
      aliasPlugin({
        entries: alias,
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
            distDir: output.dir,
          },
        },
        plugins: [
          !isDev &&
            require("cssnano")({
              preset: "default",
            }),
        ],
      }),
      urlPlugin({
        publicPath: "/",
        include: urlIncludes,
        destDir: resolve(cwd, "dist", "assets"),
      }),
      svgrPlugin({
        icon: true,
        ref: true,
        namedExport: "Icon",
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
