import { hsr, clientPlugin } from "sosse";

hsr({
  base: __dirname,
  main: () => require("./server").default(),
  plugins: [clientPlugin()],
});
