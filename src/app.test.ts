import { describe, it } from "mocha";
import { equal, deepEqual } from "assert";
import supertest from "supertest";
import { Connection, createConnection } from "typeorm";
import app from "./app";
import { User } from "./models/user";

describe("app", () => {
  let connection: Connection;

  before(async () => {
    connection = await createConnection();
  });

  after(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  it("404", async () => {
    await supertest(app)
      .get("/no-such-endpoint")
      .then((res) => {
        equal(res.statusCode, 404);
        deepEqual(res.body, {
          status: "error",
          message: "Not found /no-such-endpoint",
        });
      });
  });

  it("/home", async () => {
    await supertest(app)
      .get("/home")
      .then((res) => {
        equal(res.statusCode, 200);
        deepEqual(res.body, {
          status: "success",
          message: "Hello World.",
        });
      });
  });

  describe("/users/register", () => {
    it("success", async () => {
      await supertest(app)
        .post("/users/register")
        .send({ username: "asdf", password: "jkl;" })
        .then(async (res) => {
          equal(res.statusCode, 200);
          deepEqual(res.body, { username: "asdf" });
          equal(await User.count(), 1);
        });
    });

    it("error (no password)", async () => {
      await supertest(app)
        .post("/users/register")
        .send({ username: "asdf" })
        .then(async (res) => {
          equal(res.statusCode, 400);
          equal(await User.count(), 0);
        });
    });

    it("error (duplicate usernames)", async () => {
      await User.register({ username: "asdf", password: "jkl;" });
      await supertest(app)
        .post("/users/register")
        .send({ username: "asdf", password: "uiop" })
        .then(async (res) => {
          equal(res.statusCode, 400);
        });
    });
  });

  describe("/users/login", () => {
    beforeEach(async () => {
      await User.register({ username: "asdf", password: "jkl;" });
    });

    it("success", async () => {
      await supertest(app)
        .post("/users/login")
        .send({ username: "asdf", password: "jkl;" })
        .then(async (res) => {
          equal(res.statusCode, 200);
          deepEqual(res.body, { username: "asdf" });
        });
    });

    it("error", async () => {
      await supertest(app)
        .post("/users/login")
        .send({ username: "asdf", password: "uiop" })
        .then(async (res) => {
          equal(res.statusCode, 400);
        });
    });
  });
});
