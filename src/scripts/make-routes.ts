import * as process from "process";
import * as fs from "fs/promises";

/*

[INPUT]

get   /home   HomeController  index

[OUTPUT]

routes.get("/home", (req: Request, res: Response) => {
  new controllers.HomeController(req, res).index();
});

*/

type Entry = [string, string, string, string];

async function main(infile: string, outfile: string) {
  // Parse entries
  const input = await fs.readFile(infile);
  const lines = input.toString().split("\n");
  const entries: Entry[] = [];
  for (let [i, line] of lines.entries()) {
    line = line.trim();
    if (line.startsWith("#") || line.length == 0) {
      continue;
    }
    const tokens = line.split(/\s+/);
    if (tokens.length !== 4) {
      console.log(`Invalid line at ${infile}:${i + 1}\n    ${line}`);
      return;
    }
    entries.push(tokens as Entry);
  }

  // Emit routes
  let output = `\
import { Router, Request, Response } from "express";
import * as controllers from "./controllers";

export const routes = Router();`;
  output += "\n\n";
  for (const [method, path, controller, action] of entries) {
    output += `\
routes.${method}("${path}", (req: Request, res: Response) => {
  new controllers.${controller}(req, res).${action}();
});`;
    output += "\n\n";
  }
  await fs.writeFile(outfile, output);
}

async function mainCli() {
  if (process.argv.length != 4) {
    console.log("Usage: ts-node make-routes.ts <infile> <outfile>");
    process.exit(1);
    return;
  }
  await main(process.argv[2], process.argv[3]);
}

if (require.main === module) {
  mainCli();
}
