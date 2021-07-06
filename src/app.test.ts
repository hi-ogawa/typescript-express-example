import { describe, it } from "mocha";
import { equal, deepEqual } from "assert";
import supertest from "supertest";
import app from "./app";

describe("app", () => {
  it("404", async () => {
    await supertest(app)
      .get("/no-such-endpoint")
      .expect((res) => {
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
      .expect((res) => {
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
        .send({ username: "johndoe", password: "asdfjkl;" })
        .expect((res) => {
          equal(res.statusCode, 200);
        });
    });

    it("error", async () => {
      await supertest(app)
        .post("/users/register")
        .send({ username: "johndoe" })
        .expect((res) => {
          equal(res.statusCode, 400);
        });
    });
  });
});
