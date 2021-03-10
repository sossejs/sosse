import { css as _css, setup, hydrate } from "otion";
import type { ScopedCSSRules } from "otion/src/cssTypes";
import { isNode } from "./isNode";

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

export * from "./preact";
