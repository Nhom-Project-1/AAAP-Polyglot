import { relations } from "drizzle-orm";
import { unit, bai_hoc, tu_vung, ngon_ngu } from "./schema";

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
