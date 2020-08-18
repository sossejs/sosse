import "../injects";
import { inject } from "sosse/preact";
import { htmlData } from "sosse/uni";
import { colorRef } from "../context";
import "../index.css";

inject();

let idx = 0;
const colors = [colorRef.value, "#FFBACD", "#D0FEFE", "#FFD8B1"];

setInterval(function () {
  colorRef.update(colors[idx]);
  idx < colors.length - 1 ? idx++ : (idx = 0);
}, 1000);

console.info("Visitor count", htmlData().count);
