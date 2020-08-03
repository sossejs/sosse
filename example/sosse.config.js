const { resolve } = require("../scripts/lib");

const entryOptions = {
  //jsx: "React.createElement",
  alias: {
    "sosse/uni2": resolve(__dirname, "..", "uni"),
  },
  external: {
    express: true,
  },
};

module.exports = {
  libDir: "lib2",
  bundleServer: {
    entryOptions,
  },
  bundleClient: {
    entryOptions,
  },
};
