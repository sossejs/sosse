import React from "react";
import { useState } from "preact/hooks";
import { css } from "sosse/uni";

export const Counter = function ({ startCount = 0 }) {
  const [count, setCount] = useState(startCount);

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
        marginBottom: "1rem",
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
