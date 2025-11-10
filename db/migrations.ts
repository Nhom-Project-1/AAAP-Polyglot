import { sql } from "drizzle-orm";
import db from "./drizzle"; 

async function fixSequence() {
  console.log("Đang kiểm tra và reset sequence...");

  await db.execute(
    sql`CREATE SEQUENCE IF NOT EXISTS lua_chon_thu_thach_ma_lua_chon_seq;`
  );

  await db.execute(
    sql`ALTER TABLE lua_chon_thu_thach
        ALTER COLUMN ma_lua_chon
        SET DEFAULT nextval('lua_chon_thu_thach_ma_lua_chon_seq');`
  );

  await db.execute(
    sql`SELECT setval(
        'lua_chon_thu_thach_ma_lua_chon_seq',
        COALESCE((SELECT MAX(ma_lua_chon) FROM lua_chon_thu_thach), 1)
      );`
  );

  console.log(" Sequence lua_chon_thu_thach đã được đồng bộ!");
}

fixSequence()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Lỗi khi reset sequence:", err);
    process.exit(1);
  });
