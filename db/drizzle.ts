import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import * as relations from "./relation";

const sql = neon(process.env.DATABASE_URL!); 
export const db = drizzle(sql, {schema : { ...schema, ...relations}});

export { schema }; 
export default db;
