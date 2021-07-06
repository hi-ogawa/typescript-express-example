import process from "process";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";

import { routes } from "./routes";
import { notFoundHandler } from "./handlers";

const app = express();
export default app;

// Middlewares
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// Routes
app.use(routes);

// Not found handler
app.use(notFoundHandler);
