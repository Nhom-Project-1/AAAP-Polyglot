import { inArray, sql } from "drizzle-orm";
import { db } from "../db/drizzle";
import { tien_do } from "../db/schema";

async function cleanupDuplicates() {
  console.log("🔍 Tìm kiếm duplicate progress records...");

  // Find all duplicates
  const duplicates = await db.execute(sql`
    SELECT ma_nguoi_dung, ma_bai_hoc, array_agg(ma_tien_do ORDER BY ma_tien_do DESC) as ids
    FROM tien_do
    GROUP BY ma_nguoi_dung, ma_bai_hoc
    HAVING COUNT(*) > 1
  `);

  if (duplicates.rows.length === 0) {
    console.log("✅ Không tìm thấy duplicate records!");
    return;
  }

  console.log(`⚠️  Tìm thấy ${duplicates.rows.length} duplicate groups`);

  let totalDeleted = 0;

  for (const row of duplicates.rows) {
    const ids = row.ids as number[];
    const [keepId, ...deleteIds] = ids; // Keep the latest (highest ID), delete others

    console.log(`  User ${row.ma_nguoi_dung}, Lesson ${row.ma_bai_hoc}: Keeping ${keepId}, deleting ${deleteIds.join(', ')}`);

    if (deleteIds.length > 0) {
      await db.delete(tien_do).where(inArray(tien_do.ma_tien_do, deleteIds));
      totalDeleted += deleteIds.length;
    }
  }

  console.log(`✅ Đã xóa ${totalDeleted} duplicate records!`);
  console.log("✅ Bây giờ có thể chạy 'pnpm db:push' để apply unique constraint");
}

cleanupDuplicates()
  .then(() => {
    console.log("✅ Cleanup hoàn tất!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  });
