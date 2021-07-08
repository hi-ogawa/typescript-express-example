import { User } from "../models/user";
import { BaseController } from "./base-controller";

export abstract class ApplicationController extends BaseController {
  async currentUser(): Promise<User | undefined> {
    // TODO
    return undefined;
  }

  async authenticateUser(): Promise<boolean> {
    if (!this.currentUser()) {
      this.res.status(401).end();
      return false;
    }
    return true;
  }
}
