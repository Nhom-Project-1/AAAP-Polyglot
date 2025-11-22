import { relations } from "drizzle-orm";
import { unit, bai_hoc, tu_vung, ngon_ngu, thu_thach, lua_chon_thu_thach } from "./schema";

export const unitRelations = relations(unit, ({ one, many }) => ({
  ngonNgu: one(ngon_ngu, {
    fields: [unit.ma_ngon_ngu],
    references: [ngon_ngu.ma_ngon_ngu],
  }),
  baiHoc: many(bai_hoc),
}));

export const baiHocRelations = relations(bai_hoc, ({ one, many }) => ({
  unit: one(unit, {
    fields: [bai_hoc.ma_don_vi],
    references: [unit.ma_don_vi],
  }),
  tuVung: many(tu_vung),
}));

export const tuVungRelations = relations(tu_vung, ({ one }) => ({
  baiHoc: one(bai_hoc, {
    fields: [tu_vung.ma_bai_hoc],
    references: [bai_hoc.ma_bai_hoc],
  }),
}));

export const thuThachRelations = relations(thu_thach, ({ many, one }) => ({
  lua_chon_thu_thach: many(lua_chon_thu_thach),
  bai_hoc: one(bai_hoc, {
    fields: [thu_thach.ma_bai_hoc],
    references: [bai_hoc.ma_bai_hoc],
  }),
}));

export const luaChonThuThachRelations = relations(lua_chon_thu_thach, ({ one }) => ({
  thu_thach: one(thu_thach, {
    fields: [lua_chon_thu_thach.ma_thu_thach],
    references: [thu_thach.ma_thu_thach],
  }),
}));
