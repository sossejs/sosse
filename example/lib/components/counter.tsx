import { h } from "preact";
import { useState } from "preact/hooks";
import { css } from "otion";

export const Counter = function () {
  const [count, setCount] = useState(0);

  return (
    <button
      class={css({
        backgroundColor: "#034",
        borderWidth: 0,
        width: "10rem",
        textAlign: "center",
        color: "#cde",
        fontSize: "1.2rem",
        padding: "1rem",
        ":hover": {
          backgroundColor: "#145",
        },
      })}
      onClick={() => setCount(count + 1)}
    >
      Count: {count}
    </button>
  );
};
