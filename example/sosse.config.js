const { resolve } = require("../scripts/lib");

const entryOptions = {
  //jsx: "React.createElement",
  alias: {
    "sosse/iso": resolve(__dirname, "..", "iso"),
  },
};

module.exports = {
  libDir: "lib",
  bundleServer: {
    entryOptions,
  },
  bundleClient: {
    entryOptions,
  },
};
