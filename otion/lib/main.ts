import { setup } from "otion";
import {
  filterOutUnusedRules,
  getStyleTag,
  VirtualInjector,
} from "otion/server";

export const otion = function (func: Function, otionOptions = {}) {
  const injector = VirtualInjector();

  setup({ ...otionOptions, injector });

  let html = func();
  const styleTag = getStyleTag(filterOutUnusedRules(injector, html));
  html = html.replace("</head>", styleTag + "</head>");

  return html;
};
