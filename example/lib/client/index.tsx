import { hydrate, setup } from "otion";
import "../injects";
import { inject } from "sosse/preact";
import { htmlData } from "sosse/uni";

setup({});
hydrate();
inject({ logInjects: true });

console.info("Visitor count", htmlData().count);
