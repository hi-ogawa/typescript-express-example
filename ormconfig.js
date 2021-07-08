const models = require("./build/models");
const NODE_ENV = process.env.NODE_ENV || "development";

module.exports = [
  {
    name: "default",
    type: "postgres",
    url: `postgres://postgres:pgpass@0.0.0.0:5432/${NODE_ENV}`,
    entities: Object.values(models),
    migrations: ["build/migrations/*.js"],
    cli: {
      migrationsDir: "src/migrations",
    },
  },
  // Only for "CREATE/DROP DATABASE" e.g.
  //   npx typeorm query -c root "CREATE DATABASE development"
  {
    name: "root",
    type: "postgres",
    url: "postgres://postgres:pgpass@0.0.0.0:5432/postgres",
    entities: [],
  },
];
