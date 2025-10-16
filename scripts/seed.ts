import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!); 
const db = drizzle(sql, { schema });

async function main() {
    try{
        console.log("Seeding database...");

        await db.insert(schema.unit).values([
            {
                ten_don_vi: "Unit 1",
                ma_ngon_ngu: 1,
                mo_ta: "Learn the basics of English",
            }
        ]);

        await db.insert(schema.bai_hoc).values([
            {
                ten_bai_hoc: "Nouns",
                ma_don_vi: 1,
                mo_ta: "Danh từ",
            },
             {
                ten_bai_hoc: "Verbs",
                ma_don_vi: 1,
                mo_ta: "Động từ",
            }
        ]);

    }catch(error){
        console.error("Error seeding database:", error);
    }
    
};

main();

