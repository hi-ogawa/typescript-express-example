import { Request, Response } from "express";

export abstract class BaseController {
  constructor(protected req: Request, protected res: Response) {}
}
