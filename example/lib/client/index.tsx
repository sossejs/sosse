import { hydrate, setup } from "otion";
import * as injects from "../injects";
import { inject } from "sosse/preact";
import { htmlData } from "sosse/uni";

setup({});
hydrate();
inject();

let idx = 0;
const colors = [
  injects.HydrateColorContext.value(),
  "#FFBACD",
  "#D0FEFE",
  "#FFD8B1",
];
setInterval(function () {
  injects.HydrateColorContext.value(colors[idx]);
  idx < colors.length - 1 ? idx++ : (idx = 0);
}, 1000);

console.info("Visitor count", htmlData().count);
