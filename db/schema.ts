import {
  pgTable, serial, integer, varchar, text, timestamp, boolean, date,
  uniqueIndex
} from "drizzle-orm/pg-core";

export const nguoi_dung = pgTable(
  "nguoi_dung",
  {
    ma_nguoi_dung: serial("ma_nguoi_dung").primaryKey(),
    ten_dang_nhap: varchar("ten_dang_nhap", { length: 100 }).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    mat_khau_hash: text("mat_khau_hash").notNull(),
    ngay_tao: timestamp("ngay_tao", { withTimezone: false }).defaultNow(),
    ngay_cap_nhat: timestamp("ngay_cap_nhat", { withTimezone: false }).defaultNow(),
    chuoi: integer("chuoi_ngay").default(0).notNull(),
    lan_cuoi_hoc: date("lan_cuoi_hoc"),
    clerk_id: varchar("clerk_id", { length: 255 }),
  },
  (t) => ({
    uqUserName: uniqueIndex("uq_nguoi_dung_ten_dang_nhap").on(t.ten_dang_nhap),
    uqUserEmail: uniqueIndex("uq_nguoi_dung_email").on(t.email),
  })
);

export const admin = pgTable(
  "admin",
  {
    ma_admin: serial("ma_admin").primaryKey(),
    ten_dang_nhap: varchar("ten_dang_nhap", { length: 100 }).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    mat_khau_hash: text("mat_khau_hash").notNull(),
    ngay_tao: timestamp("ngay_tao", { withTimezone: false }).defaultNow(),
    ngay_cap_nhat: timestamp("ngay_cap_nhat", { withTimezone: false }).defaultNow(),
  },
  (t) => ({
    uqAdminUserName: uniqueIndex("uq_admin_ten_dang_nhap").on(t.ten_dang_nhap),
    uqAdminEmail: uniqueIndex("uq_admin_email").on(t.email),
  })
);


export const quan_ly_nguoi_dung = pgTable("quan_ly_nguoi_dung", {
  ma_quan_ly: serial("ma_quan_ly").primaryKey(),
  ma_admin: integer("ma_admin").references(() => admin.ma_admin, { onDelete: "cascade" }),
  ma_nguoi_dung: integer("ma_nguoi_dung").references(() => nguoi_dung.ma_nguoi_dung, { onDelete: "cascade" }),
  hanh_dong: varchar("hanh_dong", { length: 100 }), 
  thoi_gian: timestamp("thoi_gian", { withTimezone: false }).defaultNow(),
});

export const ngon_ngu = pgTable("ngon_ngu", {
  ma_ngon_ngu: serial("ma_ngon_ngu").primaryKey(),
  ten_ngon_ngu: varchar("ten_ngon_ngu", { length: 100 }).notNull(),
  mo_ta: text("mo_ta"),
});


export const unit = pgTable("unit", {
  ma_don_vi: serial("ma_unit").primaryKey(),
  ma_ngon_ngu: integer("ma_ngon_ngu")
    .references(() => ngon_ngu.ma_ngon_ngu, { onDelete: "cascade" }),
  ten_don_vi: varchar("ten_unit", { length: 100 }).notNull(),
  mo_ta: text("mo_ta"),
});

export const bai_hoc = pgTable("bai_hoc", {
  ma_bai_hoc: serial("ma_bai_hoc").primaryKey(),
  ma_don_vi: integer("ma_unit")
    .references(() => unit.ma_don_vi, { onDelete: "cascade" }),
  ten_bai_hoc: varchar("ten_bai_hoc", { length: 100 }).notNull(),
  mo_ta: text("mo_ta"),
});


export const tu_vung = pgTable("tu_vung", {
  ma_tu: serial("ma_tu").primaryKey(),
  ma_bai_hoc: integer("ma_bai_hoc")
    .references(() => bai_hoc.ma_bai_hoc, { onDelete: "cascade" }),
  tu: varchar("tu", { length: 100 }).notNull(),
  phien_am: varchar("phien_am", { length: 100 }),
  nghia: varchar("nghia", { length: 255 }),
  lien_ket_am_thanh: text("lien_ket_am_thanh"),
  vi_du: text("vi_du"),
});


export const thu_thach = pgTable("thu_thach", {
  ma_thu_thach: serial("ma_thu_thach").primaryKey(),
  ma_bai_hoc: integer("ma_bai_hoc")
    .references(() => bai_hoc.ma_bai_hoc, { onDelete: "cascade" }),
  cau_hoi: text("cau_hoi").notNull(),
  loai_thu_thach: varchar("loai_thu_thach", { length: 50 }).notNull(), 
});

export const lua_chon_thu_thach = pgTable("lua_chon_thu_thach", {
  ma_lua_chon: serial("ma_lua_chon").primaryKey(),
  ma_thu_thach: integer("ma_thu_thach")
    .references(() => thu_thach.ma_thu_thach, { onDelete: "cascade" }),
  noi_dung: text("noi_dung").notNull(),
  dung: boolean("dung").default(false).notNull(),
});

export const tien_do = pgTable("tien_do", {
  ma_tien_do: serial("ma_tien_do").primaryKey(),
  ma_nguoi_dung: integer("ma_nguoi_dung")
    .references(() => nguoi_dung.ma_nguoi_dung, { onDelete: "cascade" }),
  ma_bai_hoc: integer("ma_bai_hoc")
    .references(() => bai_hoc.ma_bai_hoc, { onDelete: "cascade" }),
  diem_kinh_nghiem: integer("diem_kinh_nghiem").default(0).notNull(),
  so_tim_con_lai: integer("so_tim_con_lai").default(5).notNull(),
  trang_thai: varchar("trang_thai", { length: 50 }),
});

export const muc_tieu = pgTable("muc_tieu", {
  ma_muc_tieu: serial("ma_muc_tieu").primaryKey(),
  ma_nguoi_dung: integer("ma_nguoi_dung")
    .references(() => nguoi_dung.ma_nguoi_dung, { onDelete: "cascade" }),
  ten_muc_tieu: varchar("ten_muc_tieu", { length: 100 }).notNull(),
  diem_can_dat: integer("diem_can_dat").notNull(),
  trang_thai: varchar("trang_thai", { length: 50 }),
});

export const bang_xep_hang = pgTable("bang_xep_hang", {
  ma_bxh: serial("ma_bxh").primaryKey(),
  ma_nguoi_dung: integer("ma_nguoi_dung")
    .references(() => nguoi_dung.ma_nguoi_dung, { onDelete: "cascade" }),
  tong_diem_xp: integer("tong_diem_xp").default(0).notNull(),
});

export const nguoi_dung_ngon_ngu = pgTable(
  "nguoi_dung_ngon_ngu",
  {
    id: serial("id").primaryKey(),
    ma_nguoi_dung: integer("ma_nguoi_dung")
      .notNull()
      .references(() => nguoi_dung.ma_nguoi_dung, { onDelete: "cascade" }),
    ma_ngon_ngu: integer("ma_ngon_ngu")
      .notNull()
      .references(() => ngon_ngu.ma_ngon_ngu, { onDelete: "cascade" }),
    is_active: boolean("is_active").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: false }).defaultNow(),
  },
  (t) => ({
    uqUserLang: uniqueIndex("uq_user_lang").on(t.ma_nguoi_dung, t.ma_ngon_ngu),
  })
);

export const cau_tra_loi_nguoi_dung = pgTable("cau_tra_loi_nguoi_dung", {
  id: serial("id").primaryKey(),
  ma_nguoi_dung: integer("ma_nguoi_dung")
    .references(() => nguoi_dung.ma_nguoi_dung, { onDelete: "cascade" }),
  ma_bai_hoc: integer("ma_bai_hoc")
    .references(() => bai_hoc.ma_bai_hoc, { onDelete: "cascade" }),
  ma_thu_thach: integer("ma_thu_thach")
    .references(() => thu_thach.ma_thu_thach, { onDelete: "cascade" }),
  ma_lua_chon: integer("ma_lua_chon")
    .references(() => lua_chon_thu_thach.ma_lua_chon, { onDelete: "cascade" }),
  dung: boolean("dung").notNull().default(false),
  lan_lam: integer("lan_lam").default(1).notNull(),
  thoi_gian: timestamp("thoi_gian").defaultNow(),
});
