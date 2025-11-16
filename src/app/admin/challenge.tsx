"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Trash, Plus, Search, X } from "lucide-react"
import toast from "react-hot-toast"

interface LuaChon {
  ma_lua_chon: string
  ma_thu_thach: string
  noi_dung: string
  dung: boolean
}

interface Challenge {
  ma_thu_thach: string
  ma_bai_hoc: string
  cau_hoi: string
  loai_thu_thach: string
  lua_chon?: LuaChon[]
  isLoadingChoices?: boolean
}

export default function AdminChallenge() {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [challengeToDelete, setChallengeToDelete] = useState<Challenge | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [data, setData] = useState<Challenge[]>([])
  const [errors, setErrors] = useState({ ma_bai_hoc: "", cau_hoi: "", loai_thu_thach: "" })
  const [loading, setLoading] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [choiceModalType, setChoiceModalType] = useState<"add" | "edit" | "delete" | null>(null)
  const [editingChoice, setEditingChoice] = useState<LuaChon | null>(null)
  const [parentChallengeId, setParentChallengeId] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [formState, setFormState] = useState<Challenge>({
    ma_thu_thach: "",
    ma_bai_hoc: "",
    cau_hoi: "",
    loai_thu_thach: "",
    lua_chon: [],
  })

  const pageSize = 10

  // FETCH DANH SÁCH THỬ THÁCH
  const fetchChallenges = async () => {
    setLoading(true)
    try {
      const url = new URL("/api/admin/challenges", location.origin)
      if (searchTerm.trim()) url.searchParams.set("q", searchTerm)
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Không thể lấy danh sách thử thách")
      const json = await res.json()

      const challengesWithoutChoices = (json.data || []).map((c: any) => ({
        ...c,
        ma_bai_hoc: String(c.ma_bai_hoc),
        lua_chon: undefined,
        isLoadingChoices: false
      }))
      setData(challengesWithoutChoices)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchChallenges(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (refetchTrigger > 0) fetchChallenges();
  }, [refetchTrigger]);

  const highlightText = (text: string) => {
    if (!searchTerm) return text
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <span key={i} className="bg-pink-200">{part}</span> : part
    )
  }

  const filteredData = data
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
    setIsDirty(true)
  }

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numericValue = value.replace(/\D/g, "")
    setFormState(prev => ({ ...prev, [name]: numericValue }))
    setIsDirty(true)
  }

  // XÓA LỰA CHỌN (chung cho cả bảng và modal)
  const deleteChoice = async (challengeId: string, choiceId: string | number) => {
    const res = await fetch(
      `/api/admin/challenges/${choiceId}/challengeOption`, // ← choiceId làm params.id
      { method: "DELETE" }
    )
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message ?? "Xóa thất bại")
    }

    // Cập nhật UI
    setData(prev =>
      prev.map(c =>
        c.ma_thu_thach === challengeId
          ? {
              ...c,
              lua_chon: c.lua_chon?.filter(lc => lc.ma_lua_chon !== String(choiceId)) ?? [],
            }
          : c
      )
    )
    toast.success("Xóa lựa chọn thành công!")
  }

  // CRUD THỬ THÁCH
  // CRUD THỬ THÁCH
const handleSave = async (challenge: Challenge, isEdit: boolean) => {
  const newErrors = { ma_bai_hoc: "", cau_hoi: "", loai_thu_thach: "" };

  if (!String(challenge.ma_bai_hoc).trim()) newErrors.ma_bai_hoc = "Mã bài học không được để trống";
  if (!String(challenge.cau_hoi).trim()) newErrors.cau_hoi = "Câu hỏi không được để trống";
  if (!String(challenge.loai_thu_thach).trim()) newErrors.loai_thu_thach = "Loại thử thách không được để trống";

  if (Object.values(newErrors).some(e => e)) {
    setErrors(newErrors);
    return;
  }

  try {
    if (isEdit) {
  // Cập nhật thử thách
  await fetch(`/api/admin/challenges`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ma_thu_thach: challenge.ma_thu_thach,
      ma_bai_hoc: Number(challenge.ma_bai_hoc),
      cau_hoi: challenge.cau_hoi,
      loai_thu_thach: challenge.loai_thu_thach,
    }),
  });

  // Cập nhật lựa chọn
  await Promise.all(
    (challenge.lua_chon || []).map((lc) => {
      const maLuaChonStr = String(lc.ma_lua_chon);
      if (maLuaChonStr.startsWith("new_")) {
        return fetch(`/api/admin/challenges/${challenge.ma_thu_thach}/challengeOption`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: [{ noi_dung: lc.noi_dung, dung: lc.dung }] }),
        });
      } else {
        return fetch(`/api/admin/challenges/${challenge.ma_thu_thach}/challengeOption`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: [lc] }),
        });
      }
    })
  );

  setData((prev) =>
    prev.map((c) =>
      c.ma_thu_thach === challenge.ma_thu_thach
        ? {
            ...c,
            cau_hoi: challenge.cau_hoi,
            loai_thu_thach: challenge.loai_thu_thach,
          }
        : c
    )
  );

  toast.success("Sửa thử thách thành công");

  if (expandedRow === challenge.ma_thu_thach) {
    await fetchAndDisplayChoices(expandedRow);
  } else {
    setRefetchTrigger((prev) => prev + 1);
  }
} else {
      // THÊM MỚI THỬ THÁCH (phần bị thiếu)
      const createRes = await fetch(`/api/admin/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ma_bai_hoc: Number(challenge.ma_bai_hoc), // Đảm bảo là số
          cau_hoi: challenge.cau_hoi,
          loai_thu_thach: challenge.loai_thu_thach,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.message || "Không thể tạo thử thách");
      }

      const createJson = await createRes.json();
      const newChallengeId = createJson.id;

      if (!newChallengeId) {
        throw new Error("Không nhận được ID thử thách mới");
      }

      // Thêm lựa chọn nếu có
      if (challenge.lua_chon && challenge.lua_chon.length > 0) {
        const choiceRes = await fetch(`/api/admin/challenges/${newChallengeId}/challengeOption`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: challenge.lua_chon.map((lc) => ({
              noi_dung: lc.noi_dung,
              dung: lc.dung,
            })),
          }),
        });

        if (!choiceRes.ok) {
          const err = await choiceRes.json().catch(() => ({}));
          throw new Error(err.message || "Không thể thêm lựa chọn");
        }
      }

      toast.success("Thêm thử thách thành công");

      // Trigger reload danh sách ngay lập tức
      setRefetchTrigger((prev) => prev + 1);
    }

    // Reset modal (chung cho add/edit)
    setModalType(null);
    setEditingChallenge(null);
    setErrors({ ma_bai_hoc: "", cau_hoi: "", loai_thu_thach: "" });
    setIsDirty(false);
    setFormState({ ma_thu_thach: "", ma_bai_hoc: "", cau_hoi: "", loai_thu_thach: "", lua_chon: [] });
  } catch (err: any) {
    toast.error(err.message || "Có lỗi xảy ra");
  }
};

  const handleDelete = async (challenge: Challenge) => {
    try {
      await fetch(`/api/admin/challenges?id=${challenge.ma_thu_thach}`, { method: "DELETE" })
      toast.success("Xóa thử thách thành công")
      fetchChallenges()
      setModalType(null)
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa thử thách")
    }
  }

  const handleEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    setFormState({
      ...challenge,
      ma_bai_hoc: String(challenge.ma_bai_hoc),
      lua_chon: challenge.lua_chon || []
    })
    setModalType("edit")
    setIsDirty(false)
  }

  const fetchAndDisplayChoices = async (challengeId: string) => {
    const challengeIndex = data.findIndex(c => c.ma_thu_thach === challengeId)
    if (challengeIndex === -1) return

    setData(prev => {
      const newData = [...prev]
      newData[challengeIndex] = { ...newData[challengeIndex], isLoadingChoices: true }
      return newData
    })

    try {
      const res = await fetch(`/api/admin/challenges/${challengeId}/challengeOption`)
      if (!res.ok) throw new Error("Không thể tải các lựa chọn")
      const json = await res.json()
      const choices = (json.lua_chon || []).map((c: any) => ({
        ...c,
        ma_lua_chon: String(c.ma_lua_chon)
      }))

      setData(prev => {
        const newData = [...prev]
        newData[challengeIndex] = { ...newData[challengeIndex], lua_chon: choices, isLoadingChoices: false }
        return newData
      })
    } catch (err: any) {
      toast.error(err.message)
      setData(prev => {
        const newData = [...prev]
        newData[challengeIndex] = { ...newData[challengeIndex], isLoadingChoices: false }
        return newData
      })
    }
  }

  const handleToggleRow = (challengeId: string) => {
    const isCurrentlyExpanded = expandedRow === challengeId
    setExpandedRow(isCurrentlyExpanded ? null : challengeId)
    if (!isCurrentlyExpanded && !data.find(c => c.ma_thu_thach === challengeId)?.lua_chon) {
      fetchAndDisplayChoices(challengeId)
    }
  }

  // CRUD LỰA CHỌN
  const handleChoiceSave = async (choice: LuaChon) => {
    if (!parentChallengeId) return
    try {
      const maLuaChonStr = String(choice.ma_lua_chon)

      if (maLuaChonStr.startsWith("LC_new_")) {
        await fetch(`/api/admin/challenges/${parentChallengeId}/challengeOption`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: [{ noi_dung: choice.noi_dung, dung: choice.dung }] })
        })
      } else {
        await fetch(`/api/admin/challenges/${parentChallengeId}/challengeOption`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: [choice] })
        })
      }

      toast.success(choiceModalType === 'edit' ? "Sửa lựa chọn thành công!" : "Thêm lựa chọn thành công!")
      setChoiceModalType(null)
      setExpandedRow(parentChallengeId)
      await fetchAndDisplayChoices(parentChallengeId)
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra")
    }
  }

  const handleChoiceDelete = async (choice: LuaChon) => {
    const challengeId = expandedRow || parentChallengeId
    if (!challengeId) return

    try {
      await deleteChoice(challengeId, choice.ma_lua_chon)
      setChoiceModalType(null)
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa")
    }
  }

  return (
    <div>
      {/* header + search + thêm */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-semibold text-pink-500">Danh sách thử thách</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo câu hỏi"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="border px-8 py-2 rounded-md w-64"
            />
          </div>
          <button
            onClick={() => {
              setEditingChallenge(null)
              setModalType("add")
              setErrors({ ma_bai_hoc: "", cau_hoi: "", loai_thu_thach: "" })
              setIsDirty(false)
              setFormState({
                ma_thu_thach: "",
                ma_bai_hoc: "",
                cau_hoi: "",
                loai_thu_thach: "",
                lua_chon: []
              })
            }}
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm thử thách
          </button>
        </div>
      </div>

      {/* bảng thử thách */}
      <div className="overflow-x-auto bg-white rounded-md shadow-md">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-pink-50 text-slate-700">
            <tr>
              <th className="px-4 py-2 text-left">Mã thử thách</th>
              <th className="px-4 py-2 text-left">Mã bài học</th>
              <th className="px-4 py-2 text-left">Câu hỏi</th>
              <th className="px-4 py-2 text-left">Loại thử thách</th>
              <th className="px-4 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4 text-slate-500">Đang tải...</td></tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-slate-500">Không có kết quả</td>
              </tr>
            ) : (
              currentData.map(challenge => {
                const isExpanded = expandedRow === challenge.ma_thu_thach
                return (
                  <React.Fragment key={challenge.ma_thu_thach}>
                    <tr
                      className="hover:bg-pink-50 cursor-pointer"                    
                      onClick={() => handleToggleRow(challenge.ma_thu_thach)}
                    >
                      <td className="px-4 py-2">{challenge.ma_thu_thach}</td>
                      <td className="px-4 py-2">{challenge.ma_bai_hoc}</td>
                      <td className="px-4 py-2">{highlightText(challenge.cau_hoi)}</td>
                      <td className="px-4 py-2">{challenge.loai_thu_thach}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(challenge); }} className="p-1 rounded-md bg-yellow-100 hover:bg-yellow-200 cursor-pointer">
                          <Pencil className="w-4 h-4 text-yellow-600" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setChallengeToDelete(challenge); setModalType("delete"); }} className="p-1 rounded-md bg-red-100 hover:bg-red-200 cursor-pointer">
                          <Trash className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>

                    {/* mở rộng hiển thị lựa chọn */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="p-4 bg-pink-50/60">
                            <h4 className="font-semibold text-slate-600 mb-2 ml-1">Các lựa chọn:</h4>
                            {challenge.isLoadingChoices ? (
                              <div className="text-center py-3 text-gray-500 italic">Đang tải các lựa chọn...</div>
                            ) : (
                              <table className="w-full text-sm bg-white rounded-lg shadow-md border border-pink-100">
                                <thead className="bg-pink-100 text-slate-600">
                                  <tr>
                                    <th className="px-3 py-1 text-left">Mã lựa chọn</th>
                                    <th className="px-3 py-1 text-left">Nội dung</th>
                                    <th className="px-3 py-1 text-left">Đúng/Sai</th>
                                    <th className="px-3 py-1 text-left">Hành động</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {challenge.lua_chon && challenge.lua_chon.length > 0 ? challenge.lua_chon.map((lc, index) => (
                                    <tr key={lc.ma_lua_chon} className={`border-b border-pink-100 last:border-b-0 ${index % 2 !== 0 ? 'bg-pink-50/50' : 'bg-white'}`}>
                                      <td className="px-3 py-2">{lc.ma_lua_chon}</td>
                                      <td className="px-3 py-2">{lc.noi_dung}</td>
                                      <td className="px-3 py-2">{lc.dung ? <span className="text-green-600 font-semibold">Đúng</span> : <span className="text-red-600">Sai</span>}</td>
                                      <td className="px-3 py-2 flex gap-2">
                                        <button onClick={() => { setEditingChoice(lc); setParentChallengeId(challenge.ma_thu_thach); setChoiceModalType('edit'); }} className="p-1 rounded-md bg-yellow-100 hover:bg-yellow-200 cursor-pointer">
                                          <Pencil className="w-3 h-3 text-yellow-600" />
                                        </button>
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingChoice(lc);
                                            setParentChallengeId(challenge.ma_thu_thach);
                                            setChoiceModalType('delete');
                                          }} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                          <Trash size={14} />
                                        </button>
                                      </td>
                                    </tr>
                                  )) : (
                                    <tr>
                                      <td colSpan={4} className="text-center py-3 text-gray-500 italic">Chưa có lựa chọn nào.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            )}
                            <div className="mt-3">
                              <button
                                onClick={() => { setParentChallengeId(challenge.ma_thu_thach); setEditingChoice(null); setChoiceModalType('add'); }}
                                className="flex items-center gap-1 text-sm text-pink-600 hover:underline"
                              >
                                <Plus size={14} /> Thêm lựa chọn
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex justify-center items-center gap-2 mt-4 py-2">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage===1} className={`px-1 transition-colors ${currentPage===1?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&lt;&lt;</button>
        <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1} className={`px-1 transition-colors ${currentPage===1?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&lt;</button>

        {(() => {
          const pagesToShow = 5
          let start = Math.max(1, currentPage - 2)
          let end = Math.min(totalPages, start + pagesToShow - 1)
          if (end - start < pagesToShow - 1) start = Math.max(1, end - pagesToShow + 1)
          return Array.from({ length: end - start + 1 }, (_, i) => start + i)
        })().map(page => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-md transition-colors border ${page===currentPage?'bg-pink-500 text-white border-pink-500 cursor-default':'bg-white text-pink-500 border-pink-300 hover:bg-pink-100 cursor-pointer'}`}>
            {page}
          </button>
        ))}

        <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className={`px-1 transition-colors ${currentPage===totalPages?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&gt;</button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage===totalPages} className={`px-1 transition-colors ${currentPage===totalPages?'text-pink-500 cursor-default':'text-pink-500 hover:text-pink-700 cursor-pointer'}`}>&gt;&gt;</button>
      </div>

      {/* modal thử thách */}
      <AnimatePresence>
        {modalType && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-md p-6 w-[600px] shadow-lg max-h-[90vh] overflow-y-auto">
              
              {(modalType === "add" || modalType === "edit") && (
                <>
                  <h3 className="text-lg font-semibold mb-4">{modalType === "edit" ? "Sửa thử thách" : "Thêm thử thách"}</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Mã bài học</label>
                      <input
                        name="ma_bai_hoc"
                        type="text"
                        inputMode="numeric"
                        value={formState.ma_bai_hoc}
                        onChange={handleNumericChange}
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          const paste = e.clipboardData.getData("text");
                          const clean = paste.replace(/\D/g, ""); // Chỉ giữ số
                          if (clean !== paste) {
                            e.preventDefault();
                            // Tự động dán chỉ số
                            const input = e.currentTarget;
                            const start = input.selectionStart || 0;
                            const end = input.selectionEnd || 0;
                            const newValue = formState.ma_bai_hoc.slice(0, start) + clean + formState.ma_bai_hoc.slice(end);
                            setFormState(prev => ({ ...prev, ma_bai_hoc: newValue }));
                            setIsDirty(true);
                            // Focus lại
                            setTimeout(() => {
                              input.focus();
                              input.setSelectionRange(start + clean.length, start + clean.length);
                            }, 0);
                          }
                          }}
                          className="border px-3 py-2 rounded-md w-full"
                        />                 
                          {errors.ma_bai_hoc && <span className="text-red-500 text-sm mt-1">{errors.ma_bai_hoc}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Câu hỏi</label>
                      <input name="cau_hoi" type="text" value={formState.cau_hoi} onChange={handleFormChange} className="border px-3 py-2 rounded-md w-full" />
                      {errors.cau_hoi && <span className="text-red-500 text-sm mt-1">{errors.cau_hoi}</span>}
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">Loại thử thách</label>
                      <input name="loai_thu_thach" type="text" value={formState.loai_thu_thach} onChange={handleFormChange} className="border px-3 py-2 rounded-md w-full" />
                      {errors.loai_thu_thach && <span className="text-red-500 text-sm mt-1">{errors.loai_thu_thach}</span>}
                    </div>

                    {/* quản lý lựa chọn */}
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-md font-semibold mb-2 text-gray-800">Các lựa chọn</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 -mr-2">
                        {(formState.lua_chon || []).map((choice, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                            <input
                              type="text"
                              placeholder="Nội dung lựa chọn"
                              value={choice.noi_dung}
                              onChange={(e) => {
                                const newChoices = [...(formState.lua_chon || [])]
                                newChoices[index] = { ...newChoices[index], noi_dung: e.target.value }
                                setFormState(prev => ({ ...prev, lua_chon: newChoices }))
                                setIsDirty(true)
                              }}
                              className="border px-2 py-1 rounded-md w-full text-sm"
                            />
                            <div className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={choice.dung}
                                onChange={(e) => {
                                  const newChoices = [...(formState.lua_chon || [])]
                                  newChoices[index] = { ...newChoices[index], dung: e.target.checked }
                                  setFormState(prev => ({ ...prev, lua_chon: newChoices }))
                                  setIsDirty(true)
                                }}
                                className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-400 cursor-pointer"
                              />
                              <label className="text-sm">Đúng</label>
                            </div>
                            <button onClick={() => {
                                const newChoices = (formState.lua_chon || []).filter((_, i) => i !== index)
                                setFormState(prev => ({ ...prev, lua_chon: newChoices }))
                                setIsDirty(true)
                              }} className="p-1 text-red-500 hover:text-red-700">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => {
                        const newChoice: LuaChon = { ma_lua_chon: `new_${Date.now()}`, ma_thu_thach: formState.ma_thu_thach || 'new', noi_dung: '', dung: false }
                        setFormState(prev => ({ ...prev, lua_chon: [...(prev.lua_chon || []), newChoice] }))
                        setIsDirty(true)
                      }} className="mt-2 text-sm text-pink-600 hover:underline cursor-pointer">+ Thêm lựa chọn</button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                      onClick={() => { if (isDirty) handleSave(formState, modalType === "edit") }}
                      className={`px-4 py-2 rounded-md text-white transition-colors ${isDirty?'bg-pink-500 hover:bg-pink-600 cursor-pointer':'bg-gray-300 cursor-default'}`}
                    >
                      Lưu
                    </button>
                  </div>
                </>
              )}

              {modalType === "delete" && challengeToDelete && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa</h3>
                  <p className="mb-4">Bạn có chắc muốn xóa thử thách <strong>{challengeToDelete.cau_hoi}</strong> không?</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                    <button
                        onClick={() => handleDelete(challengeToDelete)}
                      className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* modal choice */}
      <AnimatePresence>
        {choiceModalType && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-md p-6 w-96 shadow-lg">
              {(choiceModalType === 'add' || choiceModalType === 'edit') && (
                <>
                  <h3 className="text-lg font-semibold mb-4">{choiceModalType === 'edit' ? 'Sửa lựa chọn' : 'Thêm lựa chọn'}</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const noi_dung = formData.get('noi_dung') as string
                    const dung = (formData.get('dung') as string) === 'on'
                    if (!noi_dung.trim()) { toast.error("Nội dung không được để trống"); return }
                    handleChoiceSave({
                      ma_lua_chon: editingChoice?.ma_lua_chon || `LC_new_${Date.now()}`,
                      ma_thu_thach: parentChallengeId || '',
                      noi_dung,
                      dung,
                    })
                  }}>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col">
                        <label htmlFor="choice_content" className="mb-1 text-sm font-medium text-gray-700">Nội dung</label>
                        <input name="noi_dung" id="choice_content" defaultValue={editingChoice?.noi_dung || ''} className="border px-3 py-2 rounded-md w-full"/>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" name="dung" defaultChecked={editingChoice?.dung || false} id="choice_correct" className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-400 cursor-pointer"/>
                        <label htmlFor="choice_correct" className="text-sm">Đúng</label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setChoiceModalType(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer">Hủy</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600 cursor-pointer">Lưu</button>
                      </div>
                    </div>
                  </form>
                </>
              )}

              {/* MODAL XÓA LỰA CHỌN - ĐẸP NHƯ MẪU */}
              {choiceModalType === 'delete' && editingChoice && (
                <>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">Xác nhận xóa lựa chọn</h3>
                  <p className="mb-4">
                    Bạn có chắc muốn xóa lựa chọn <strong>{editingChoice.noi_dung}</strong> không?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setChoiceModalType(null)}
                      className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await deleteChoice(parentChallengeId!, editingChoice.ma_lua_chon)
                          setChoiceModalType(null)
                        } catch {}
                      }}
                      className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}