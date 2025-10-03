import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import pool from "../../../db";

const db = drizzle(pool);

export async function POST() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS nguoi_dung_ngon_ngu (
      id SERIAL PRIMARY KEY,
      ma_nguoi_dung INT NOT NULL,
      ma_ngon_ngu   INT NOT NULL,
      UNIQUE (ma_nguoi_dung, ma_ngon_ngu)
    );

    -- FK tới nguoi_dung
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_ndnn_user'
          AND table_name = 'nguoi_dung_ngon_ngu'
      ) THEN
        ALTER TABLE nguoi_dung_ngon_ngu
          ADD CONSTRAINT fk_ndnn_user
          FOREIGN KEY (ma_nguoi_dung)
          REFERENCES nguoi_dung(ma_nguoi_dung)
          ON DELETE CASCADE;
      END IF;
    END $$;

    -- FK tới ngon_ngu
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_ndnn_lang'
          AND table_name = 'nguoi_dung_ngon_ngu'
      ) THEN
        ALTER TABLE nguoi_dung_ngon_ngu
          ADD CONSTRAINT fk_ndnn_lang
          FOREIGN KEY (ma_ngon_ngu)
          REFERENCES ngon_ngu(ma_ngon_ngu)
          ON DELETE CASCADE;
      END IF;
    END $$;
  `);

  await db.execute(`
    INSERT INTO ngon_ngu (ten_ngon_ngu, mo_ta)
    SELECT v.ten, v.mt
    FROM (VALUES
      ('Tiếng Anh',   'English (en)'),
      ('Tiếng Trung', 'Chinese (zh)'),
      ('Tiếng Pháp',  'French (fr)'),
      ('Tiếng Ả Rập', 'Arabic (ar)')
    ) AS v(ten, mt)
    WHERE NOT EXISTS (
      SELECT 1 FROM ngon_ngu n WHERE n.ten_ngon_ngu = v.ten
    );
  `);

  return NextResponse.json({
    ok: true,
    message: "Đã tạo bảng nối N–N và seed 4 ngôn ngữ.",
  });
}