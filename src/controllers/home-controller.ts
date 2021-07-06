import { ApplicationController } from "./application-controller";

export class HomeController extends ApplicationController {
  async index() {
    this.res.json({ status: "success", message: "Hello World." });
  }
}
