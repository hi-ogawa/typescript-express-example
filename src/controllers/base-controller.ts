import { Request, Response } from "express";
import { Action } from "./utils";

export abstract class BaseController {
  constructor(protected req: Request, protected res: Response) {}

  protected async chain(...actions: Action[]): Promise<void> {
    for (const action of actions) {
      if (this.res.writableEnded) {
        return;
      }
      await action();
    }
  }
}
