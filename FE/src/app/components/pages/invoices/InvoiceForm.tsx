import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Save, Zap, Droplets, Home, FileText,
  Info, Calculator, CheckCircle, Users, Crown
} from "lucide-react";
import { apiFetch } from "../../../../lib/api";

interface ContractOption {
  maHopDong: string;
  maNhaTro: string;
  tenNhaTro: string;
  maNguoiDaiDien: string;
  hoTen: string;
  soDienThoai: string;
  tienThue: number;
  ngayBatDau: string | null;
  ngayKetThuc: string | null;
  trangThai: string;
  soNguoiThue: number;
}

function parseISODate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function getAvailableDueDates(createdDate: string): string[] {
  const base = parseISODate(createdDate);
  if (!base) return [];
  return Array.from({ length: 5 }, (_, i) => toISODate(addDays(base, i)));
}

function getInitials(name: string) {
  const p = name.trim().split(" ");
  return p[p.length - 1][0].toUpperCase();
}

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function inputCls(err?: string) {
  return `w-full px-3.5 py-2.5 border ${err ? "border-red-400 bg-red-50" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors`;
}

// Edit mode pre-filled data (empty defaults)
const emptyEdit = {
  contractId: "",
  month: "",
  createdDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  rent: "",
  elecOld: "", elecNew: "", elecPrice: "3500",
  waterOld: "", waterNew: "", waterPrice: "15000",
  notes: "",
};

export function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [contractId, setContractId] = useState("");
  const [form, setForm] = useState({
    month: "",
    createdDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    rent: "",
    elecOld: "", elecNew: "", elecPrice: "3500",
    waterOld: "", waterNew: "", waterPrice: "15000",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const availableDueDates = getAvailableDueDates(form.createdDate);
  const minDueDate = availableDueDates[0] ?? "";
  const maxDueDate = availableDueDates[availableDueDates.length - 1] ?? "";

  // Load contract options
  useEffect(() => {
    apiFetch<{ items: ContractOption[] }>("/invoices/contract-options")
      .then((r) => setContracts(r.items))
      .catch(() => {});
  }, []);

  // For edit mode: load existing invoice
  useEffect(() => {
    if (!isEdit || !id) return;
    apiFetch<{
      maHoaDon: string; maHopDong: string; thang: number; nam: number;
      ngayLap: string | null; hanThanhToan: string | null; ghiChu: string | null;
      tienThue: number; chiSoDienCu: number; chiSoDienMoi: number; tienDien: number;
      chiSoNuocCu: number; chiSoNuocMoi: number; tienNuoc: number;
    }>(`/invoices/${id}`).then((inv) => {
      setContractId(inv.maHopDong);
      const elecUsed = inv.chiSoDienMoi - inv.chiSoDienCu;
      const waterUsed = inv.chiSoNuocMoi - inv.chiSoNuocCu;
      setForm({
        month: `${inv.nam}-${String(inv.thang).padStart(2, "0")}`,
        createdDate: inv.ngayLap ?? "",
        dueDate: inv.hanThanhToan ?? "",
        rent: String(inv.tienThue),
        elecOld: String(inv.chiSoDienCu),
        elecNew: String(inv.chiSoDienMoi),
        elecPrice: elecUsed > 0 ? String(Math.round(inv.tienDien / elecUsed)) : "3500",
        waterOld: String(inv.chiSoNuocCu),
        waterNew: String(inv.chiSoNuocMoi),
        waterPrice: waterUsed > 0 ? String(Math.round(inv.tienNuoc / waterUsed)) : "15000",
        notes: inv.ghiChu ?? "",
      });
    }).catch(() => {});
  }, [isEdit, id]);

  const selectedContract = contracts.find((c) => c.maHopDong === contractId) ?? null;

  // Auto-fill rent when contract is selected
  const handleSelectContract = (cid: string) => {
    setContractId(cid);
    const c = contracts.find((x) => x.maHopDong === cid);
    if (c) setForm((prev) => ({ ...prev, rent: String(c.tienThue) }));
    if (errors.contractId) setErrors((prev) => ({ ...prev, contractId: "" }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "createdDate") {
      setForm((prev) => {
        const next = { ...prev, createdDate: value };
        const allowedDates = getAvailableDueDates(value);
        if (next.dueDate && !allowedDates.includes(next.dueDate)) {
          next.dueDate = "";
        }
        return next;
      });
      if (errors.createdDate || errors.dueDate) {
        setErrors((prev) => ({ ...prev, createdDate: "", dueDate: "" }));
      }
      return;
    }

    if (name === "dueDate") {
      if (availableDueDates.length > 0 && !availableDueDates.includes(value)) {
        setErrors((prev) => ({
          ...prev,
          dueDate: "Hạn thanh toán chỉ được chọn trong 5 ngày từ ngày lập hóa đơn",
        }));
        return;
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Derived calculations ──
  const elecUsed = Math.max(0, Number(form.elecNew) - Number(form.elecOld));
  const elecCost = elecUsed * (Number(form.elecPrice) || 0);
  const waterUsed = Math.max(0, Number(form.waterNew) - Number(form.waterOld));
  const waterCost = waterUsed * (Number(form.waterPrice) || 0);
  const rent = Number(form.rent) || 0;
  const total = rent + elecCost + waterCost;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!contractId) e.contractId = "Vui lòng chọn hợp đồng";
    if (!form.month) e.month = "Vui lòng chọn tháng";
    if (!form.dueDate) e.dueDate = "Vui lòng chọn hạn thanh toán";
    if (!form.rent) e.rent = "Vui lòng nhập tiền thuê";
    else if (isNaN(Number(form.rent)) || Number(form.rent) < 0) e.rent = "Tiền thuê phải là số không âm";
    if (form.elecOld && form.elecNew && Number(form.elecNew) < Number(form.elecOld))
      e.elecNew = "Chỉ số mới phải ≥ chỉ số cũ";
    if (form.waterOld && form.waterNew && Number(form.waterNew) < Number(form.waterOld))
      e.waterNew = "Chỉ số mới phải ≥ chỉ số cũ";
    if (form.elecPrice && (isNaN(Number(form.elecPrice)) || Number(form.elecPrice) < 0))
      e.elecPrice = "Đơn giá không hợp lệ";
    if (form.waterPrice && (isNaN(Number(form.waterPrice)) || Number(form.waterPrice) < 0))
      e.waterPrice = "Đơn giá không hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const [year, month] = form.month.split("-");
      const body = {
        maHopDong: contractId,
        thang: Number(month),
        nam: Number(year),
        ngayLap: form.createdDate || null,
        hanThanhToan: form.dueDate || null,
        tienThue: Number(form.rent),
        chiSoDienCu: Number(form.elecOld) || 0,
        chiSoDienMoi: Number(form.elecNew) || 0,
        tienDien: elecCost,
        chiSoNuocCu: Number(form.waterOld) || 0,
        chiSoNuocMoi: Number(form.waterNew) || 0,
        tienNuoc: waterCost,
        ghiChu: form.notes || null,
      };
      if (isEdit) {
        await apiFetch(`/invoices/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch("/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      navigate("/invoices");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi lưu hóa đơn";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const summaryItems = [
    { label: "Tiền thuê", value: rent, color: "text-gray-900" },
    { label: "Tiền điện", value: elecCost, color: "text-yellow-700" },
    { label: "Tiền nước", value: waterCost, color: "text-cyan-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/invoices" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Chỉnh sửa hóa đơn" : "Lập hóa đơn mới"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? "Cập nhật thông tin hóa đơn" : "Điền thông tin để lập hóa đơn tháng"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── MAIN FORM ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* BLOCK 1: Thông tin cơ bản */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">1</span>
                Thông tin cơ bản
              </h2>

              {/* Contract selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hợp đồng <span className="text-red-500">*</span>
                </label>
                <select
                  value={contractId}
                  onChange={(e) => handleSelectContract(e.target.value)}
                  disabled={isEdit}
                  className={`w-full px-3.5 py-2.5 border ${errors.contractId ? "border-red-400 bg-red-50" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">-- Chọn hợp đồng đang hiệu lực --</option>
                  {contracts.map((c) => (
                    <option key={c.maHopDong} value={c.maHopDong}>
                      {c.maHopDong} | Phòng {c.tenNhaTro} | Đại diện: {c.hoTen} | {c.soNguoiThue} người
                    </option>
                  ))}
                </select>
                {errors.contractId && <p className="mt-1 text-xs text-red-500">{errors.contractId}</p>}
                {isEdit && (
                  <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />Không thể đổi hợp đồng khi chỉnh sửa
                  </p>
                )}
              </div>

              {/* Contract preview */}
              {selectedContract && (
                <div className="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Hợp đồng</p>
                      <p className="font-mono font-bold text-blue-700">{selectedContract.maHopDong}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phòng</p>
                      <p className="font-mono font-semibold text-blue-700">{selectedContract.maNhaTro}</p>
                      <p className="text-xs text-gray-500">{selectedContract.tenNhaTro}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Người đại diện</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {getInitials(selectedContract.hoTen)}
                        </div>
                        <span className="font-medium text-gray-900 text-xs">{selectedContract.hoTen}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Số người thuê</p>
                      <p className="font-semibold">{selectedContract.soNguoiThue} người</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tiền thuê HĐ</p>
                      <p className="font-semibold text-green-700">{fmt(selectedContract.tienThue)}/tháng</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Trạng thái HĐ</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                        {selectedContract.trangThai}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tháng hóa đơn <span className="text-red-500">*</span>
                  </label>
                  <input type="month" name="month" value={form.month} onChange={handleChange}
                    className={inputCls(errors.month)} />
                  {errors.month && <p className="mt-1 text-xs text-red-500">{errors.month}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày lập</label>
                  <input type="date" name="createdDate" value={form.createdDate} onChange={handleChange}
                    className={inputCls()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Hạn thanh toán <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    min={minDueDate || undefined}
                    max={maxDueDate || undefined}
                    className={inputCls(errors.dueDate)} />
                  {errors.dueDate && <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>}
                  {availableDueDates.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1.5">5 ngày có thể chọn:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableDueDates.map((date) => {
                          const isSelected = form.dueDate === date;
                          return (
                            <button
                              key={date}
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({ ...prev, dueDate: date }));
                                setErrors((prev) => ({ ...prev, dueDate: "" }));
                              }}
                              className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                                isSelected
                                  ? "bg-green-600 border-green-600 text-white"
                                  : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {date}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BLOCK 2: Tiền thuê */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">2</span>
                Tiền thuê nhà
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tiền thuê (VNĐ/tháng) <span className="text-red-500">*</span>
                </label>
                <input type="text" name="rent" value={form.rent} onChange={handleChange}
                  className={inputCls(errors.rent)} placeholder="VD: 4500000" />
                {errors.rent && <p className="mt-1 text-xs text-red-500">{errors.rent}</p>}
                {form.rent && !errors.rent && (
                  <p className="mt-1 text-xs text-green-600 font-medium">→ {Number(form.rent).toLocaleString("vi-VN")} VNĐ</p>
                )}
                <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />Tiền thuê được lấy mặc định từ hợp đồng.
                </p>
              </div>
            </div>

            {/* BLOCK 3: Tiền điện */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-500 text-white rounded text-xs flex items-center justify-center font-bold">3</span>
                <Zap className="w-4 h-4 text-yellow-600" />
                Tiền điện
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Chỉ số cũ (kWh)</label>
                  <input type="number" name="elecOld" value={form.elecOld} onChange={handleChange}
                    className={inputCls()} placeholder="VD: 120" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Chỉ số mới (kWh)</label>
                  <input type="number" name="elecNew" value={form.elecNew} onChange={handleChange}
                    className={inputCls(errors.elecNew)} placeholder="VD: 145" min="0" />
                  {errors.elecNew && <p className="mt-1 text-xs text-red-500">{errors.elecNew}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Đơn giá (VNĐ/kWh)</label>
                  <input type="number" name="elecPrice" value={form.elecPrice} onChange={handleChange}
                    className={inputCls(errors.elecPrice)} min="0" />
                  {errors.elecPrice && <p className="mt-1 text-xs text-red-500">{errors.elecPrice}</p>}
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100 flex flex-col justify-center">
                  <p className="text-xs text-gray-500 mb-0.5">Sử dụng</p>
                  <p className="text-lg font-bold text-yellow-700">{elecUsed} kWh</p>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">{fmt(elecCost)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3 flex-shrink-0" />
                Đơn giá điện chỉ dùng để tính tiền trên giao diện, hệ thống lưu kết quả tiền điện.
              </p>
            </div>

            {/* BLOCK 4: Tiền nước */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-6 h-6 bg-cyan-500 text-white rounded text-xs flex items-center justify-center font-bold">4</span>
                <Droplets className="w-4 h-4 text-cyan-600" />
                Tiền nước
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Chỉ số cũ (m³)</label>
                  <input type="number" name="waterOld" value={form.waterOld} onChange={handleChange}
                    className={inputCls()} placeholder="VD: 45" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Chỉ số mới (m³)</label>
                  <input type="number" name="waterNew" value={form.waterNew} onChange={handleChange}
                    className={inputCls(errors.waterNew)} placeholder="VD: 52" min="0" />
                  {errors.waterNew && <p className="mt-1 text-xs text-red-500">{errors.waterNew}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Đơn giá (VNĐ/m³)</label>
                  <input type="number" name="waterPrice" value={form.waterPrice} onChange={handleChange}
                    className={inputCls(errors.waterPrice)} min="0" />
                  {errors.waterPrice && <p className="mt-1 text-xs text-red-500">{errors.waterPrice}</p>}
                </div>
                <div className="bg-cyan-50 rounded-xl p-3 border border-cyan-100 flex flex-col justify-center">
                  <p className="text-xs text-gray-500 mb-0.5">Sử dụng</p>
                  <p className="text-lg font-bold text-cyan-700">{waterUsed} m³</p>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">{fmt(waterCost)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3 flex-shrink-0" />
                Đơn giá nước chỉ dùng để tính tiền trên giao diện, hệ thống lưu kết quả tiền nước.
              </p>
            </div>

            {/* BLOCK 5: Ghi chú */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">5</span>
                Ghi chú
              </h2>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Ghi chú về hóa đơn, yêu cầu thanh toán..." />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
              <Link to="/invoices"
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Hủy bỏ
              </Link>
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-60">
                <Save className="w-4 h-4" />
                {submitting ? "Đang lưu..." : isEdit ? "Cập nhật hóa đơn" : "Lưu hóa đơn"}
              </button>
              </div>
            </div>
          </div>

          {/* ── SUMMARY SIDEBAR ── */}
          <div className="space-y-5 lg:sticky lg:top-6 self-start">
            {/* Summary card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5" />
                <h2 className="text-sm font-bold">Tổng tiền</h2>
              </div>

              <div className="text-4xl font-bold mb-1">
                {(total / 1000000).toFixed(2)}M
              </div>
              <p className="text-blue-200 text-xs mb-5">{total.toLocaleString("vi-VN")} VNĐ</p>

              <div className="space-y-2.5 text-sm">
                {summaryItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between pb-2 border-b border-blue-500">
                    <span className="text-blue-200">{item.label}</span>
                    <span className="font-semibold text-white">{fmt(item.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-white">Tổng cộng</span>
                  <span className="font-bold text-white text-base">{fmt(total)}</span>
                </div>
              </div>

              {form.dueDate && (
                <div className="mt-4 pt-4 border-t border-blue-500 text-xs">
                  <p className="text-blue-200">Hạn thanh toán</p>
                  <p className="font-semibold text-white">{form.dueDate}</p>
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Kiểm tra trước khi lưu</h3>
              <div className="space-y-2">
                {[
                  { label: "Đã chọn hợp đồng", ok: !!contractId },
                  { label: "Đã chọn tháng", ok: !!form.month },
                  { label: "Đã nhập hạn TT", ok: !!form.dueDate },
                  { label: "Tiền thuê hợp lệ", ok: !!(form.rent && Number(form.rent) >= 0) },
                  { label: "Chỉ số điện hợp lệ", ok: !form.elecNew || !form.elecOld || Number(form.elecNew) >= Number(form.elecOld) },
                  { label: "Chỉ số nước hợp lệ", ok: !form.waterNew || !form.waterOld || Number(form.waterNew) >= Number(form.waterOld) },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? "bg-green-500" : "bg-gray-200"}`}>
                      {item.ok && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={item.ok ? "text-gray-700" : "text-gray-400"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
