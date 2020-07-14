import { render, h } from "preact";
import { Counter } from "../components/counter";
import { hydrate, setup } from "otion";
import { htmlData } from "sosse/uni";

setup({});
hydrate();

render(<Counter />, document.querySelector("#counter"));

console.info("Visitor count", htmlData().count);
