import "../injects";
import { inject } from "sosse/iso";
import { colorRef } from "../context";
import "../index.css";

inject();

let idx = 0;
const colors = [colorRef.value, "#FFBACD", "#D0FEFE", "#FFD8B1"];

setInterval(function () {
  colorRef.update(colors[idx]);
  idx < colors.length - 1 ? idx++ : (idx = 0);
}, 1000);
