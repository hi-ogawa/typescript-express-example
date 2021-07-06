import makeKnex from "knex";

// @ts-ignore
import knexfile from "../knexfile";

export const knex = makeKnex(knexfile);
