import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import bcrypt from "bcryptjs";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("Seeding database...");

    await db.delete(schema.admin);

    const hashedPassword = await bcrypt.hash("123456", 10);

    await db.insert(schema.admin).values({
      ten_dang_nhap: "admin",
      email: "admin@gmail.com",
      mat_khau_hash: hashedPassword,
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

main();
