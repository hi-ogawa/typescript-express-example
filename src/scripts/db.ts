import * as process from "process";
import commander from "commander";
import makeKnex from "knex";
import { Client } from "pg";

// @ts-ignore
import knexfile from "../../knexfile";

const ROOT_DB = "postgres"; // cf. POSTGRES_DB in docker-compose.yml

async function main() {
  commander.command("create").action(async () => {
    const knex = makeKnex(knexfile);
    const { connection } = knex.client.config;
    const client = new Client({ ...connection, database: ROOT_DB });
    await client.connect();
    await client.query(`CREATE DATABASE ${connection.database}`);
    await client.end();
  });

  commander.command("drop").action(async () => {
    const knex = makeKnex(knexfile);
    const { connection } = knex.client.config;
    const client = new Client({ ...connection, database: ROOT_DB });
    await client.connect();
    await client.query(`DROP DATABASE ${connection.database}`);
    await client.end();
  });

  commander.command("connect").action(async () => {
    const knex = makeKnex(knexfile);
    await knex.raw("SELECT 1 + 2");
    await knex.client.destroy();
  });

  commander.parse(process.argv);
}

if (require.main === module) {
  main();
}
