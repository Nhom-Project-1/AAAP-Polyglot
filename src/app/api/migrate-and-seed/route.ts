import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import pool from "../../../db";

const db = drizzle(pool);

export async function POST() {
  await db.execute(`
    BEGIN;

    CREATE TABLE IF NOT EXISTS nguoi_dung_ngon_ngu (
      id SERIAL PRIMARY KEY,
      ma_nguoi_dung INT NOT NULL,
      ma_ngon_ngu   INT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT FALSE,
      UNIQUE (ma_nguoi_dung, ma_ngon_ngu)
    );

    -- FK tới nguoi_dung (check bằng pg_constraint)
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE c.conname = 'fk_ndnn_user'
          AND t.relname = 'nguoi_dung_ngon_ngu'
      ) THEN
        ALTER TABLE nguoi_dung_ngon_ngu
          ADD CONSTRAINT fk_ndnn_user
          FOREIGN KEY (ma_nguoi_dung)
          REFERENCES nguoi_dung(ma_nguoi_dung)
          ON DELETE CASCADE;
      END IF;
    END $$;

    -- FK tới ngon_ngu (check bằng pg_constraint)
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE c.conname = 'fk_ndnn_lang'
          AND t.relname = 'nguoi_dung_ngon_ngu'
      ) THEN
        ALTER TABLE nguoi_dung_ngon_ngu
          ADD CONSTRAINT fk_ndnn_lang
          FOREIGN KEY (ma_ngon_ngu)
          REFERENCES ngon_ngu(ma_ngon_ngu)
          ON DELETE CASCADE;
      END IF;
    END $$;

    COMMIT;
  `);

  await db.execute(`
    WITH ranked AS (
      SELECT id, ma_nguoi_dung,
             ROW_NUMBER() OVER (PARTITION BY ma_nguoi_dung ORDER BY id DESC) AS rn
      FROM nguoi_dung_ngon_ngu
      WHERE is_active = TRUE
    )
    UPDATE nguoi_dung_ngon_ngu u
    SET is_active = FALSE
    FROM ranked r
    WHERE u.id = r.id AND r.rn > 1;
  `);

  await db.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_active_language_per_user
    ON public.nguoi_dung_ngon_ngu(ma_nguoi_dung)
    WHERE is_active = TRUE;
  `);

  await db.execute(`
    INSERT INTO ngon_ngu (ten_ngon_ngu, mo_ta)
    SELECT v.ten, v.mt
    FROM (VALUES
      ('Tiếng Anh',   'English (en)'),
      ('Tiếng Trung', 'Chinese (zh)'),
      ('Tiếng Pháp',  'French (fr)'),
      ('Tiếng Ả Rập', 'Arabic (ar)')
    ) AS v(ten, mt)-
    WHERE NOT EXISTS (
      SELECT 1 FROM ngon_ngu n WHERE n.ten_ngon_ngu = v.ten
    );
  `);

  return NextResponse.json({
    ok: true,
    message: "Đã tạo bảng N–N, đảm bảo unique active per user, và seed 4 ngôn ngữ.",
  });
}
