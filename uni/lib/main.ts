import { css as _css, setup, hydrate } from "otion";
import type { ScopedCSSRules } from "otion/src/cssTypes";

export const isNode =
  typeof process !== "undefined" &&
  typeof process.versions.node !== "undefined";

let currentData;
if (!isNode) {
  const els = document.getElementsByClassName("sosse-html-data");
  if (els.length > 0) {
    currentData = JSON.parse(els[0].innerHTML);
  }
}

export const htmlData = function (newData?) {
  if (newData !== undefined) {
    currentData = newData;
  }

  return currentData;
};

let setupDone = false;
export const setupCss = function () {
  setupDone = true;
  setup({});
  hydrate();
};

export const css = function (rules: ScopedCSSRules) {
  if (!isNode && !setupDone) setupCss();
  return _css(rules);
};
