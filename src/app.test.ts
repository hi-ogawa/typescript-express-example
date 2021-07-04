import { describe, it } from "mocha";
import { equal, deepEqual } from "assert";
import supertest from "supertest";
import app from "./app";

describe("app", () => {
  it("handle 404", async () => {
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
});
