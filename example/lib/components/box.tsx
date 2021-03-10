import { ColorContext } from "../context";
import { css } from "sosse/iso";
import { h } from "preact";
import { useContext } from "preact/compat";

export const Box = function () {
  const color = useContext(ColorContext);

  return (
    <div
      class={css({
        backgroundColor: color,
        width: "100px",
        height: "100px",
        display: "inline-block",
        margin: "0 20px 20px 0",
      })}
    >
      Color: {color}
    </div>
  );
};
