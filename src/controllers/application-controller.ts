import { User } from "../models/user";
import { BaseController } from "./base-controller";
import { Memoize } from "../utils";

export abstract class ApplicationController extends BaseController {
  @Memoize()
  async currentUser(): Promise<User | undefined> {
    const authorization = this.req.header("authorization");
    if (!authorization) {
      return;
    }
    const bearer = authorization.match(/Bearer (.*)/);
    if (!bearer) {
      return;
    }
    const token = bearer[1];
    return User.findByToken(token);
  }

  async authenticateUser(): Promise<void> {
    if (!(await this.currentUser())) {
      this.res.status(401).end();
    }
  }
}
