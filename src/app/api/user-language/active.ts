import { eq } from 'drizzle-orm';
import db, { schema } from '../../../../db/drizzle';

export async function setActiveLanguage(
  maNguoiDung: number,
  maNgonNgu: number,
) {
  await db
    .update(schema.nguoi_dung_ngon_ngu)
    .set({ is_active: false })
    .where(eq(schema.nguoi_dung_ngon_ngu.ma_nguoi_dung, maNguoiDung));

  let attempts = 0;
  while (attempts < 2) {
    try {
      await db
        .insert(schema.nguoi_dung_ngon_ngu)
        .values({
          ma_nguoi_dung: maNguoiDung,
          ma_ngon_ngu: maNgonNgu,
          is_active: true,
        })
        .onConflictDoUpdate({
          target: [
            schema.nguoi_dung_ngon_ngu.ma_nguoi_dung,
            schema.nguoi_dung_ngon_ngu.ma_ngon_ngu,
          ],
          set: { is_active: true },
        });
      break;
    } catch (e) {
      attempts++;
      if (attempts >= 2) throw e;
    }
  }
}
