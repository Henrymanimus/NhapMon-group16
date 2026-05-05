import { Link, useParams, useNavigate } from "react-router";
import {
  ArrowLeft, Edit, Receipt, Home, Calendar, DollarSign,
  Zap, Droplets, CheckCircle, X, Info, Crown, Users,
  Phone, FileText, AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "../../../../lib/api";

interface InvoiceDetail {
  maHoaDon: string;
  maHopDong: string;
  thang: number;
  nam: number;
  ngayLap: string | null;
  hanThanhToan: string | null;
  ghiChu: string | null;
  trangThai: "DA_THANH_TOAN" | "CHUA_THANH_TOAN" | "QUA_HAN";
  trangThaiGoc: "DA_THANH_TOAN" | "CHUA_THANH_TOAN";
  tienThue: number;
  chiSoDienCu: number;
  chiSoDienMoi: number;
  tienDien: number;
  chiSoNuocCu: number;
  chiSoNuocMoi: number;
  tienNuoc: number;
  tongTien: number;
  hopDong: {
    maHopDong: string;
    maNhaTro: string;
    tenNhaTro: string;
    ngayBatDau: string | null;
    ngayKetThuc: string | null;
  };
  nguoiDaiDien: {
    maNguoiThue: string;
    hoTen: string;
    soDienThoai: string;
  };
  soNguoiTrongHopDong: number;
}

function fmtDate(s: string | null): string {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

function getInitials(name: string) {
  const p = name.trim().split(" ");
  return p[p.length - 1][0].toUpperCase();
}

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + " VNĐ";
}

const statusConfig = {
  "DA_THANH_TOAN":   { badge: "bg-green-100 text-green-700 border-green-200",  dot: "bg-green-500",  label: "Đã thanh toán" },
  "CHUA_THANH_TOAN": { badge: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500", label: "Chưa thanh toán" },
  "QUA_HAN":         { badge: "bg-red-100 text-red-600 border-red-200",          dot: "bg-red-500",    label: "Quá hạn" },
};

function PaymentModal({
  invoice, onConfirm, onCancel, paying,
}: { invoice: InvoiceDetail; onConfirm: () => void; onCancel: () => void; paying?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">Xác nhận thanh toán</h3>
            <p className="text-sm text-gray-500">Mã: <span className="font-semibold">{invoice.maHoaDon}</span></p>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-xl">
            <div><p className="text-xs text-gray-500">Hợp đồng</p><p className="font-semibold">{invoice.maHopDong}</p></div>
            <div><p className="text-xs text-gray-500">Phòng</p><p className="font-semibold">{invoice.hopDong.tenNhaTro}</p></div>
            <div><p className="text-xs text-gray-500">Người đại diện</p><p className="font-semibold">{invoice.nguoiDaiDien.hoTen}</p></div>
            <div><p className="text-xs text-gray-500">Tháng</p><p className="font-semibold">{invoice.thang}/{invoice.nam}</p></div>
            <div><p className="text-xs text-gray-500">Hạn thanh toán</p><p className="font-semibold">{fmtDate(invoice.hanThanhToan)}</p></div>
            <div>
              <p className="text-xs text-gray-500">Tổng tiền</p>
              <p className="font-bold text-green-700 text-lg">{invoice.tongTien.toLocaleString("vi-VN")}đ</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">Sau khi xác nhận thanh toán, hóa đơn sẽ không được chỉnh sửa số tiền.</p>
          </div>
        </div>
        <div className="p-6 pt-0 flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">Hủy</button>
          <button onClick={onConfirm} disabled={paying}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-60">
            <CheckCircle className="w-4 h-4" />{paying ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<InvoiceDetail>(`/invoices/${id}`)
      .then((data) => setInvoice(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải...</div>;
  if (notFound || !invoice)
    return (
      <div className="text-center py-20">
        <p className="text-gray-700 font-medium">Không tìm thấy hóa đơn</p>
        <button onClick={() => navigate("/invoices")} className="mt-3 text-blue-600 hover:underline text-sm">← Quay lại danh sách</button>
      </div>
    );

  const sc = statusConfig[invoice.trangThai];
  const isUnpaid = invoice.trangThai !== "DA_THANH_TOAN";
  const isOverdue = invoice.trangThai === "QUA_HAN";

  const elecUsed = invoice.chiSoDienMoi - invoice.chiSoDienCu;
  const waterUsed = invoice.chiSoNuocMoi - invoice.chiSoNuocCu;
  const elecUnitPrice = elecUsed > 0 ? Math.round(invoice.tienDien / elecUsed) : 0;
  const waterUnitPrice = waterUsed > 0 ? Math.round(invoice.tienNuoc / waterUsed) : 0;

  const contractPeriod = invoice.hopDong.ngayBatDau
    ? `${fmtDate(invoice.hopDong.ngayBatDau)} – ${invoice.hopDong.ngayKetThuc ? fmtDate(invoice.hopDong.ngayKetThuc) : "..."}`
    : "—";

  const handleConfirmPayment = async () => {
    setPaying(true);
    try {
      const updated = await apiFetch<InvoiceDetail>(`/invoices/${id}/pay`, { method: "POST" });
      setInvoice(updated);
      setShowPayModal(false);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {showPayModal && (
        <PaymentModal invoice={invoice} onConfirm={handleConfirmPayment} onCancel={() => setShowPayModal(false)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/invoices" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">Hóa đơn {invoice.maHoaDon}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">Chi tiết hóa đơn tháng {invoice.thang}/{invoice.nam}</p>
          </div>
        </div>
        {isUnpaid && (
          <div className="flex gap-2">
            <button onClick={() => setShowPayModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
              <CheckCircle className="w-4 h-4" />Xác nhận thanh toán
            </button>
              <Link to={`/invoices/${invoice.maHoaDon}/edit`}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Edit className="w-4 h-4" />Chỉnh sửa
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* BLOCK 1: Thông tin hóa đơn */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Receipt className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Thông tin hóa đơn</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {[
                { label: "Mã hóa đơn", value: <span className="font-mono font-bold text-blue-700">{invoice.maHoaDon}</span> },
                { label: "Mã hợp đồng", value: <Link to={`/contracts/${invoice.maHopDong}`} className="font-mono font-bold text-blue-600 hover:underline">{invoice.maHopDong}</Link> },
                { label: "Tháng/Năm", value: <span className="font-semibold">{invoice.thang}/{invoice.nam}</span> },
                { label: "Ngày lập", value: fmtDate(invoice.ngayLap) },
                { label: "Hạn thanh toán", value: <span className={isOverdue ? "text-red-600 font-semibold" : ""}>{fmtDate(invoice.hanThanhToan)}</span> },
                { label: "Trạng thái", value: (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                    </span>
                  )
                },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                  <div className="font-medium text-gray-900">{item.value}</div>
                </div>
              ))}
              {invoice.ghiChu && (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-xs text-gray-500 mb-0.5">Ghi chú</p>
                  <p className="text-gray-700">{invoice.ghiChu}</p>
                </div>
              )}
            </div>
          </div>

          {/* BLOCK 2: Thông tin hợp đồng */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Thông tin hợp đồng</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Mã hợp đồng</p>
                <Link to={`/contracts/${invoice.maHopDong}`} className="font-mono font-semibold text-blue-600 hover:underline">
                  {invoice.maHopDong}
                </Link>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phòng</p>
                <Link to={`/rooms/${invoice.hopDong.maNhaTro}`} className="font-mono font-semibold text-blue-600 hover:underline">
                  {invoice.hopDong.maNhaTro}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{invoice.hopDong.tenNhaTro}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Người đại diện</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {getInitials(invoice.nguoiDaiDien.hoTen)}
                  </div>
                  <span className="font-medium text-gray-900">{invoice.nguoiDaiDien.hoTen}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Số người HĐ</p>
                <span className="font-medium">{invoice.soNguoiTrongHopDong} người</span>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 mb-0.5">Thời hạn hợp đồng</p>
                <span className="font-medium">{contractPeriod}</span>
              </div>
            </div>
          </div>

          {/* BLOCK 3: Chi tiết thanh toán */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Chi tiết thanh toán</h2>
            </div>
            <div className="space-y-3">

              {/* Tiền thuê */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Home className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Tiền thuê nhà</p>
                    <p className="text-xs text-gray-400">Theo hợp đồng</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">{fmt(invoice.tienThue)}</span>
              </div>

              {/* Tiền điện */}
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-yellow-200 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-yellow-700" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Tiền điện</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{fmt(invoice.tienDien)}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 ml-12 text-xs">
                  <div className="bg-white rounded-lg p-2 border border-yellow-100">
                    <p className="text-gray-500">Chỉ số cũ</p>
                    <p className="font-bold text-gray-800">{invoice.chiSoDienCu} kWh</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-yellow-100">
                    <p className="text-gray-500">Chỉ số mới</p>
                    <p className="font-bold text-gray-800">{invoice.chiSoDienMoi} kWh</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-yellow-100">
                    <p className="text-gray-500">Sử dụng</p>
                    <p className="font-bold text-yellow-700">{elecUsed} kWh</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-yellow-100">
                    <p className="text-gray-500">Đơn giá *</p>
                    <p className="font-bold text-gray-800">{elecUnitPrice.toLocaleString("vi-VN")}đ/kWh</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 ml-12 italic">* Đơn giá dùng để tính tại thời điểm lập hóa đơn</p>
              </div>

              {/* Tiền nước */}
              <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-cyan-200 rounded-lg flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-cyan-700" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Tiền nước</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{fmt(invoice.tienNuoc)}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 ml-12 text-xs">
                  <div className="bg-white rounded-lg p-2 border border-cyan-100">
                    <p className="text-gray-500">Chỉ số cũ</p>
                    <p className="font-bold text-gray-800">{invoice.chiSoNuocCu} m³</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-cyan-100">
                    <p className="text-gray-500">Chỉ số mới</p>
                    <p className="font-bold text-gray-800">{invoice.chiSoNuocMoi} m³</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-cyan-100">
                    <p className="text-gray-500">Sử dụng</p>
                    <p className="font-bold text-cyan-700">{waterUsed} m³</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-cyan-100">
                    <p className="text-gray-500">Đơn giá *</p>
                    <p className="font-bold text-gray-800">{waterUnitPrice.toLocaleString("vi-VN")}đ/m³</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 ml-12 italic">* Đơn giá dùng để tính tại thời điểm lập hóa đơn</p>
              </div>

              {/* Tổng cộng */}
              <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                <span className="text-base font-bold text-gray-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-blue-600">{fmt(invoice.tongTien)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">

          {/* BLOCK 4: Tổng thanh toán nổi bật */}
          <div className={`rounded-xl shadow-lg p-6 text-white ${isOverdue ? "bg-gradient-to-br from-red-500 to-red-600" : invoice.trangThai === "DA_THANH_TOAN" ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-blue-500 to-blue-600"}`}>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5" />
              <h2 className="text-sm font-bold">Tổng thanh toán</h2>
            </div>
            <div className="text-4xl font-bold mb-1">
              {(invoice.tongTien / 1000000).toFixed(2)}M
            </div>
            <p className="text-white/80 text-xs mb-4">{invoice.tongTien.toLocaleString("vi-VN")} VNĐ</p>
            <div className="space-y-2 text-sm border-t border-white/30 pt-4">
              <div className="flex justify-between">
                <span className="text-white/80">Hạn thanh toán</span>
                <span className="font-semibold">{fmtDate(invoice.hanThanhToan)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Trạng thái</span>
                <span className="font-semibold">{sc.label}</span>
              </div>
            </div>
            {isOverdue && (
              <div className="mt-4 flex items-center gap-2 p-2 bg-red-700/40 rounded-lg">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs font-medium">Hóa đơn đã quá hạn thanh toán</p>
              </div>
            )}
          </div>

          {/* BLOCK 5: Người đại diện */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">Người đại diện</h2>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                {getInitials(invoice.nguoiDaiDien.hoTen)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{invoice.nguoiDaiDien.hoTen}</p>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                  <Crown className="w-3 h-3" />Đại diện
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{invoice.nguoiDaiDien.soDienThoai}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span>Hợp đồng này có <span className="font-semibold text-gray-700">{invoice.soNguoiTrongHopDong} người</span> đang ở.</span>
              </div>
            </div>
          </div>

          {/* BLOCK 6: Thao tác nhanh */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Thao tác nhanh</h2>
            <div className="space-y-2">
              {isUnpaid && (
                <button onClick={() => setShowPayModal(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />Xác nhận thanh toán
                </button>
              )}
              {isUnpaid && (
                <Link to={`/invoices/${invoice.maHoaDon}/edit`}
                  className="w-full flex items-center gap-3 px-3 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                  <Edit className="w-4 h-4" />Chỉnh sửa hóa đơn
                </Link>
              )}
              <Link to={`/contracts/${invoice.maHopDong}`}
                className="w-full flex items-center gap-3 px-3 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                <FileText className="w-4 h-4 text-gray-400" />Xem hợp đồng
              </Link>
              <Link to={`/rooms/${invoice.hopDong.maNhaTro}`}
                className="w-full flex items-center gap-3 px-3 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                <Home className="w-4 h-4 text-gray-400" />Xem phòng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
