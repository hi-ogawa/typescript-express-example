import { validate } from "class-validator";
import { User } from "../models/user";
import { BaseController } from "./base-controller";
import { serializeValidationErrors } from "./utils";
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

  async validate(object: object): Promise<void> {
    const errors = await validate(object);
    if (errors.length > 0) {
      this.renderError(422, serializeValidationErrors(errors));
    }
  }

  render(data?: any) {
    this.res.json({
      status: "success",
      data,
    });
  }

  renderError(code: number, data?: any) {
    this.res.status(code).json({
      status: "error",
      data,
    });
  }
}
