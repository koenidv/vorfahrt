import { MilesClient } from "abfahrt";

import env from "./env";

async function main() {
  console.log("miles account email:", env.milesAccountEmail);

  console.log("MilesClient instance:", new MilesClient());
}
main();
