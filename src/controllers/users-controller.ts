import { ApplicationController } from "./application-controller";
import { User } from "../models/user";

export class UsersController extends ApplicationController {
  async register() {
    const user = await User.register(this.req.body);
    if (!user) {
      return this.res.status(400).end();
    }
    this.res.json(user.toResponse());
  }

  async login() {
    const user = await User.login(this.req.body);
    if (!user) {
      return this.res.status(400).end();
    }
    this.res.json(user.toResponse());
  }

  async newToken() {
    if (!(await this.authenticateUser())) {
      return;
    }
    // TODO
  }
}
