import { describe, it } from "mocha";
import assert, { strictEqual, deepStrictEqual } from "assert";
import { Connection, createConnection } from "typeorm";
import { User } from "./user";
import { sleep } from "../utils";
import { validate, ValidationError } from "class-validator";

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
    user.passwordHash = "12345678";
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
      const result = await User.register({
        username: "asdf",
        password: "12345678",
      });
      const user = result.data as User;
      strictEqual(user.hasId(), true);
      strictEqual(user.passwordHash.substr(0, 7), "$2b$10$");
    });

    it("error", async () => {
      const result = await User.register({ username: "asdf" });
      strictEqual(result.ok, false);
    });
  });

  it("verifyPassword", async () => {
    const result = await User.register({
      username: "asdf",
      password: "12345678",
    });
    const user = result.data as User;
    strictEqual(await user.verifyPassword("12345678"), true);
    strictEqual(await user.verifyPassword("uiop"), false);
  });

  describe("generateToken", () => {
    it("works", async () => {
      const result = await User.register({
        username: "asdf",
        password: "12345678",
      });
      const user = result.data as User;
      const token = user.generateToken();
      strictEqual(token.split(".").length, 3);
    });
  });

  describe("findByToken", () => {
    it("success", async () => {
      const result = await User.register({
        username: "asdf",
        password: "12345678",
      });
      const user = result.data as User;
      const token = user.generateToken();
      const maybeUser = await User.findByToken(token);
      assert(maybeUser instanceof User);
      strictEqual(maybeUser.id, user.id);
    });

    it("error", async () => {
      const result = await User.findByToken("xyz.123.hello");
      strictEqual(result, undefined);
    });
  });

  describe("validate", () => {
    async function example(
      username: string,
      password?: string
    ): Promise<ValidationError[]> {
      const user = new User();
      user.username = username;
      await user.setPassword(password);
      return await validate(user);
    }

    it("success", async () => {
      const errors = await example("qwertyui", "12345678");
      deepStrictEqual(errors, []);
    });

    it("error (no password)", async () => {
      const errors = await example("qwertyui");
      deepStrictEqual(errors[0].constraints, {
        isNotEmpty: "password should not be empty",
      });
    });

    it("error (short password)", async () => {
      const errors = await example("qwertyui", "1234");
      deepStrictEqual(errors[0].constraints, {
        isLength: "password must be longer than or equal to 8 characters",
      });
    });

    it("error (invalid username)", async () => {
      const errors = await example("qwer()_+", "12345678");
      strictEqual(errors[0].property, "username");
      assert(errors[0].constraints!.hasOwnProperty("matches"));
    });

    it("error (duplicate username)", async () => {
      await User.register({ username: "qwertyui", password: "12345678" });
      const errors = await example("qwertyui", "87654321");
      deepStrictEqual(errors[0].constraints, {
        isUnique: "username 'qwertyui' is already taken",
      });
    });

    it("error (bad username and password)", async () => {
      const errors = await example("qwer()_+", "1234");
      strictEqual(errors[0].property, "username");
      strictEqual(errors[1].property, "password");
    });
  });
});
