import { describe, it } from "mocha";
import { strictEqual, deepStrictEqual } from "assert";
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
        strictEqual(res.statusCode, 404);
        deepStrictEqual(res.body, {
          status: "error",
          message: "Not found /no-such-endpoint",
        });
      });
  });

  it("/home", async () => {
    await supertest(app)
      .get("/home")
      .then((res) => {
        strictEqual(res.statusCode, 200);
        deepStrictEqual(res.body, {
          status: "success",
          message: "Hello World.",
        });
      });
  });

  describe("/users/register", () => {
    it("success", async () => {
      await supertest(app)
        .post("/users/register")
        .send({ username: "asdf", password: "12345678" })
        .then(async (res) => {
          strictEqual(res.statusCode, 200);
          deepStrictEqual(res.body.data.username, "asdf");
          strictEqual(await User.count(), 1);
        });
    });

    it("error", async () => {
      await supertest(app)
        .post("/users/register")
        .send({ username: "asdf" })
        .then(async (res) => {
          strictEqual(res.statusCode, 422);
          deepStrictEqual(res.body, {
            status: "error",
            data: [
              {
                property: "passwordHash",
                constraints: {
                  isNotEmpty: "password should not be empty",
                },
              },
            ],
          });
        });
    });
  });

  describe("/users/login", () => {
    beforeEach(async () => {
      await User.register({ username: "asdf", password: "12345678" });
    });

    it("success", async () => {
      await supertest(app)
        .post("/users/login")
        .send({ username: "asdf", password: "12345678" })
        .then(async (res) => {
          strictEqual(res.statusCode, 200);
          deepStrictEqual(res.body.data.username, "asdf");
        });
    });

    it("error", async () => {
      await supertest(app)
        .post("/users/login")
        .send({ username: "asdf", password: "87654321" })
        .then(async (res) => {
          strictEqual(res.statusCode, 401);
        });
    });
  });

  describe("/users/new-token", () => {
    it("success", async () => {
      const result = await User.register({
        username: "asdf",
        password: "12345678",
      });
      const token = (result.data as User).generateToken();
      await supertest(app)
        .post("/users/new-token")
        .set("authorization", `Bearer ${token}`)
        .then(async (res) => {
          strictEqual(res.statusCode, 200);
          strictEqual(res.body.username, "asdf");
        });
    });

    it("error", async () => {
      await supertest(app)
        .post("/users/new-token")
        .then(async (res) => {
          strictEqual(res.statusCode, 401);
        });
    });
  });
});
