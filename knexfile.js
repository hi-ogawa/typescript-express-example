module.exports = {
  client: "pg",
  connection: "postgres://postgres:pgpass@0.0.0.0:5432/dev",
  migrations: {
    directory: "build/migrations",
  },
};
