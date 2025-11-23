import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import * as relations from "./relation";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}
if (process.env.DATABASE_URL === "<YOUR_NEON_DATABASE_URL_HERE>") {
  throw new Error("DATABASE_URL is set to a placeholder. Please set the DATABASE_URL environment variable in your GitHub Secrets.");
}
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema: { ...schema, ...relations } });

export { schema };
export default db;
