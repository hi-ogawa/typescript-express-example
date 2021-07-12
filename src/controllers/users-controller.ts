import { ApplicationController } from "./application-controller";
import { User } from "../models/user";

export class UsersController extends ApplicationController {
  async register() {
    const { username, password } = this.req.body;
    const user = await User.createWithPassword({ username, password });
    this.chain(
      async () => this.validate(user),
      async () => {
        await user.save();
        this.render(user.toResponse());
      }
    );
  }

  async login() {
    const { username, password } = this.req.body;
    const user = await User.findOne({ username });
    if (user && password && (await user.verifyPassword(password))) {
      this.render(user.toResponse());
      return;
    }
    this.renderError(401);
  }

  async newToken() {
    await this.chain(
      async () => this.authenticateUser(),
      async () => this.res.json((await this.currentUser())!.toResponse()).end()
    );
  }
}
