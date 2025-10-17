import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql as dsql } from "drizzle-orm"; 
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!); 
const db = drizzle(sql, { schema });

async function main() {
    try{

        console.log("Seeding database...");

        await db.delete(schema.unit);

        await db.execute(
            dsql `TRUNCATE TABLE "unit" RESTART IDENTITY CASCADE`
        );
        const language = await db.select().from(schema.ngon_ngu);

        for (const i of language){
            const units = await db.insert(schema.unit).values([
                {
                    ten_don_vi: "Unit 1",
                    ma_ngon_ngu: i.ma_ngon_ngu,
                    mo_ta: `Bắt đầu với ${i.ten_ngon_ngu} cơ bản`,
                },
                {
                    ten_don_vi: "Unit 2",
                    ma_ngon_ngu: i.ma_ngon_ngu,
                    mo_ta: `Ngữ pháp cơ bản trong ${i.ten_ngon_ngu}`,
                }
            ])
            .returning({
                id: schema.unit.ma_don_vi,
                name: schema.unit.ten_don_vi,
            }) as { id: number; name: string }[];;

        };
        

    }catch(error){
        console.error("Error seeding database:", error);
    }
    
};

main();

