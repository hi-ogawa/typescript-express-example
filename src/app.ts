import process from "process";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Middlewares
app.use(bodyParser.json());

app.use(cors({ origin: "*" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// TODO: More routes

// Not found handler
app.use((req: Request, res: Response) => {
  res
    .status(404)
    .json({ status: "error", message: `Not found ${req.originalUrl}` });
});

export default app;
