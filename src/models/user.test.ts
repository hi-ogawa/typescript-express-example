import { describe, it } from "mocha";
import assert, { strictEqual, deepStrictEqual } from "assert";
import { Connection, createConnection } from "typeorm";
import { User } from "./user";
import { sleep } from "../utils";

describe("User", () => {
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

  it("basics", async () => {
    const now = new Date();
    const user = new User();
    user.username = "asdf";
    user.passwordHash = "jkl;";
    await user.save();
    assert(user.timestamps.createdAt instanceof Date);
    assert(user.timestamps.createdAt >= now);
    strictEqual(user.timestamps.createdAt, user.timestamps.updatedAt);

    user.username = "qwer";
    await sleep(10);
    await user.save();
    assert(user.timestamps.createdAt < user.timestamps.updatedAt);
  });

  describe("register", () => {
    it("success", async () => {
      const user = await User.register({ username: "asdf", password: "jkl;" });
      strictEqual(user!.hasId(), true);
      strictEqual(user!.passwordHash.substr(0, 7), "$2b$10$");
    });

    it("error", async () => {
      const user = await User.register({ username: "asdf" });
      strictEqual(user, undefined);
    });
  });

  it("login", async () => {
    const user = await User.register({ username: "asdf", password: "jkl;" });
    deepStrictEqual(
      await User.login({ username: "asdf", password: "jkl;" }),
      user
    );
    strictEqual(
      await User.login({ username: "asdf", password: "uiop" }),
      undefined
    );
  });

  it("verifyPassword", async () => {
    const user = await User.register({ username: "asdf", password: "jkl;" });
    assert(user instanceof User);
    strictEqual(await user!.verifyPassword("jkl;"), true);
    strictEqual(await user!.verifyPassword("uiop"), false);
  });

  describe("generateToken", () => {
    it("works", async () => {
      const user = await User.register({ username: "asdf", password: "jkl;" });
      const token = user!.generateToken();
      strictEqual(token.split(".").length, 3);
    });
  });

  describe("findByToken", () => {
    let user: User | undefined;
    beforeEach(async () => {
      user = await User.register({ username: "asdf", password: "jkl;" });
    });

    it("success", async () => {
      const token = user!.generateToken();
      const result = await User.findByToken(token);
      assert(result instanceof User);
      strictEqual(result.id, user!.id);
    });

    it("error", async () => {
      const result = await User.findByToken("xyz.123.hello");
      strictEqual(result, undefined);
    });
  });
});
