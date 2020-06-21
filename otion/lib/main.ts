import { setup } from "otion";
import {
  filterOutUnusedRules,
  getStyleTag,
  VirtualInjector,
} from "otion/server";

export const otion = function (func: Function, otionOptions = {}) {
  const injector = VirtualInjector();

  setup({ ...otionOptions, injector });

  let htmlOptions = func();

  htmlOptions.head += getStyleTag(
    filterOutUnusedRules(injector, htmlOptions.body)
  );

  return htmlOptions;
};
