// For development convenience with "npm run console"
export { createConnection, getConnection } from "typeorm";
export * from "./models";

import { createConnection } from "typeorm";

export async function init() {
  await createConnection();
}
