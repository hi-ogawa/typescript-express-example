import { describe, it } from "mocha";
import assert, { equal, deepEqual } from "assert";
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
    equal(user.timestamps.createdAt, user.timestamps.updatedAt);

    user.username = "qwer";
    await sleep(10);
    await user.save();
    assert(user.timestamps.createdAt < user.timestamps.updatedAt);
  });

  describe("register", () => {
    it("success", async () => {
      const user = await User.register({ username: "asdf", password: "jkl;" });
      equal(user!.hasId(), true);
      equal(user!.passwordHash.substr(0, 7), "$2b$10$");
    });

    it("error", async () => {
      const user = await User.register({ username: "asdf" });
      equal(user, undefined);
    });
  });

  it("login", async () => {
    const user = await User.register({ username: "asdf", password: "jkl;" });
    deepEqual(await User.login({ username: "asdf", password: "jkl;" }), user);
    equal(await User.login({ username: "asdf", password: "uiop" }), undefined);
  });

  it("verifyPassword", async () => {
    const user = await User.register({ username: "asdf", password: "jkl;" });
    assert(user instanceof User);
    equal(await user!.verifyPassword("jkl;"), true);
    equal(await user!.verifyPassword("uiop"), false);
  });
});
