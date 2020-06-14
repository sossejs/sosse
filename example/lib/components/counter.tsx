import { h } from "preact";
import { useState } from "preact/hooks";

export const Counter = function () {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
};
