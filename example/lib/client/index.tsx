import { render, h } from "preact";
import { Counter } from "../components/counter";
import { hydrate, setup } from "otion";

setup({});
hydrate();

render(<Counter />, document.querySelector("#app"));
