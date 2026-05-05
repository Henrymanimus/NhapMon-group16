import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Edit, MapPin, DollarSign, Maximize, FileText,
  TrendingUp, Phone, Crown, Users, Home, Receipt, ChevronRight,
  Calendar, Wrench, Trash2, X, AlertCircle, Loader2
} from "lucide-react";
import { apiFetch, ApiResponseError } from "../../../../lib/api";

// ── API DTO types ──────────────────────────────────────────────────────────────
interface RoomItemDto {
  maNhaTro: string;
  tenNhaTro: string;
  diaChi: string;
  dienTich: number;
  giaThue: number;
  tienCoc: number;
  moTa: string | null;
  tienNghi: string | null;
  trangThai: "TRONG" | "DANG_THUE" | "BAO_TRI";
}

interface OccupantDto {
  maNguoiThue: string;
  hoTen: string;
  soDienThoai: string | null;
  vaiTro: "Đại diện" | "Ở cùng";
}

interface ContractHistoryDto {
  maHopDong: string;
  nguoiDaiDien: string;
  soNguoi: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: "Đang hiệu lực" | "Đã kết thúc" | "Hủy";
}

interface RoomDetailDto {
  item: RoomItemDto;
  nguoiDangO: OccupantDto[];
  lichSuHopDong: ContractHistoryDto[];
  doanhThu: {
    tongTatCa: number;
    tong12Thang: number;
    theoThang: { thang: number; nam: number; tongTien: number }[];
  };
}

const AVATAR_COLORS = [
  "bg-blue-500", "bg-green-500", "bg-pink-500", "bg-purple-500",
  "bg-orange-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500",
];

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN") + " VNĐ";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const TRANG_THAI_MAP: Record<RoomItemDto["trangThai"], "Trống" | "Đang thuê" | "Bảo trì"> = {
  TRONG: "Trống",
  DANG_THUE: "Đang thuê",
  BAO_TRI: "Bảo trì",
};

const statusConfig = {
  "Đang thuê": { bg: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700", dot: "bg-green-500", label: "Đang thuê" },
  "Trống":     { bg: "bg-gray-50 border-gray-200",   badge: "bg-gray-100 text-gray-600",   dot: "bg-gray-400",  label: "Trống" },
  "Bảo trì":  { bg: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500", label: "Bảo trì" },
};

const contractStatusConfig = {
  "Đang hiệu lực": "bg-green-100 text-green-700",
  "Đã kết thúc":   "bg-gray-100 text-gray-600",
  "Hủy":           "bg-red-100 text-red-700",
};

export function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<RoomDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const roomId = id ? decodeURIComponent(id) : "";

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    apiFetch<RoomDetailDto>(`/rooms/${encodeURIComponent(roomId)}`)
      .then((res) => {
        if (!cancelled) { setData(res); setLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) {
          setFetchError(
            err instanceof ApiResponseError ? err.message : "Không thể tải thông tin phòng."
          );
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [roomId]);

  const handleDelete = async () => {
    if (deleting || !data) return;
    try {
      setDeleting(true);
      setDeleteError(null);
      await apiFetch<void>(`/rooms/${encodeURIComponent(roomId)}`, { method: "DELETE" });
      setShowDeleteModal(false);
      setDeleteSuccess(`Đã xóa phòng ${data.item.maNhaTro} thành công`);
      setTimeout(() => {
        navigate("/rooms", { state: { successMessage: `Đã xóa phòng ${data.item.maNhaTro} thành công` } });
      }, 2000);
    } catch (err) {
      setDeleteError(
        err instanceof ApiResponseError ? err.message : "Không thể xóa phòng. Vui lòng thử lại."
      );
      setDeleting(false);
    }
  };

  // ── Loading / Error states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Đang tải thông tin phòng...</span>
      </div>
    );
  }

  if (fetchError || !data) {
    return (
      <div className="space-y-4">
        <Link to="/rooms" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{fetchError ?? "Không tìm thấy phòng."}</span>
        </div>
      </div>
    );
  }

  const { item, nguoiDangO, lichSuHopDong, doanhThu } = data;
  const status = TRANG_THAI_MAP[item.trangThai];
  const sc = statusConfig[status];
  const amenities = item.tienNghi ? item.tienNghi.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const representative = nguoiDangO.find((o) => o.vaiTro === "Đại diện") ?? null;
  const coTenants = nguoiDangO.filter((o) => o.vaiTro === "Ở cùng");
  const activeContract = lichSuHopDong.find((c) => c.trangThai === "Đang hiệu lực") ?? null;

  return (
    <div className="space-y-6">
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !deleting && setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <button
              onClick={() => !deleting && setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg"
              disabled={deleting}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Xóa nhà trọ</h3>
                <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Bạn có chắc muốn xóa <span className="font-semibold">{item.tenNhaTro}</span> ({item.maNhaTro})?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {deleteSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <span className="text-lg">✓</span>
          <div>
            <p className="font-semibold">{deleteSuccess}</p>
            <p className="text-sm text-green-600">Đang chuyển về danh sách phòng...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link to="/rooms" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{item.tenNhaTro}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">Mã phòng: <span className="font-mono font-semibold text-blue-700">{item.maNhaTro}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Xóa phòng
          </button>
          <Link
            to={`/rooms/${encodeURIComponent(roomId)}/edit`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Chỉnh sửa
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── BLOCK 1: Thông tin chung ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Thông tin chung</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Địa chỉ</p>
                  <p className="text-sm font-medium text-gray-900">{item.diaChi}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Maximize className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Diện tích</p>
                  <p className="text-sm font-medium text-gray-900">{item.dienTich}m²</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Giá thuê</p>
                  <p className="text-sm font-semibold text-gray-900">{item.giaThue.toLocaleString("vi-VN")} VNĐ<span className="font-normal text-gray-500">/tháng</span></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Tiền cọc</p>
                  <p className="text-sm font-medium text-gray-900">{formatVND(item.tienCoc)}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1.5">Mô tả</p>
              <p className="text-sm text-gray-700">{item.moTa || <span className="italic text-gray-400">Chưa có mô tả</span>}</p>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Tiện nghi</p>
              {amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span key={amenity} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">Chưa cập nhật</p>
              )}
            </div>
          </div>

          {/* ── BLOCK 3: Lịch sử hợp đồng ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Lịch sử hợp đồng</h2>
              </div>
              <span className="text-xs text-gray-500">{lichSuHopDong.length} hợp đồng</span>
            </div>
            <div className="space-y-3">
              {lichSuHopDong.length === 0 && (
                <p className="text-sm italic text-gray-400 text-center py-4">Chưa có hợp đồng nào</p>
              )}
              {lichSuHopDong.map((contract) => (
                <div key={contract.maHopDong} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{contract.maHopDong}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${contractStatusConfig[contract.trangThai]}`}>
                          {contract.trangThai}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Đại diện: <span className="text-gray-700">{contract.nguoiDaiDien}</span>
                        <span className="mx-1.5">·</span>
                        {contract.soNguoi} người
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {formatDate(contract.ngayBatDau)} – {formatDate(contract.ngayKetThuc)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/contracts/${contract.maHopDong}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Chi tiết <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* ── BLOCK 4b: Hóa đơn ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Hóa đơn</h2>
              </div>
              <Link to="/invoices" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả →
              </Link>
            </div>
            <p className="text-sm text-gray-400 italic text-center py-4">Xem danh sách hóa đơn trong module Hóa đơn</p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* ── BLOCK 2: Trạng thái hiện tại ── */}
          <div className={`bg-white rounded-xl shadow-sm border-2 ${sc.bg} p-6`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Trạng thái hiện tại</h2>
            </div>

            {status === "Trống" && (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Home className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Phòng đang trống</p>
                <p className="text-gray-400 text-sm mt-1">Chưa có người thuê</p>
                <Link
                  to="/contracts/new"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Tạo hợp đồng
                </Link>
              </div>
            )}

            {status === "Bảo trì" && (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wrench className="w-7 h-7 text-orange-500" />
                </div>
                <p className="text-orange-700 font-medium">Đang bảo trì</p>
                <p className="text-gray-400 text-sm mt-1">Phòng tạm thời không cho thuê</p>
              </div>
            )}

            {status === "Đang thuê" && (
              <div className="space-y-4">
                {/* Hợp đồng hiện tại */}
                {activeContract && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Hợp đồng</span>
                      <Link to={`/contracts/${activeContract.maHopDong}`} className="font-semibold text-blue-600 hover:text-blue-700">
                        {activeContract.maHopDong}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Thời hạn</span>
                      <span className="text-gray-700 text-right text-xs">
                        {formatDate(activeContract.ngayBatDau)} – {formatDate(activeContract.ngayKetThuc)}
                      </span>
                    </div>
                  </>
                )}

                <div className="border-t border-gray-100 pt-4">
                  {/* Người đại diện */}
                  {representative && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Crown className="w-3.5 h-3.5 text-yellow-500" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Người đại diện</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <div className={`w-10 h-10 rounded-full ${avatarColor(0)} text-white flex items-center justify-center font-bold flex-shrink-0`}>
                          {getInitials(representative.hoTen)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{representative.hoTen}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{representative.soDienThoai ?? "—"}</span>
                          </div>
                        </div>
                        <span className="ml-auto flex-shrink-0 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          Đại diện
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Người ở cùng */}
                  {coTenants.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Người ở cùng ({coTenants.length})</p>
                      </div>
                      <div className="space-y-2">
                        {coTenants.map((o, idx) => (
                          <div key={o.maNguoiThue} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className={`w-8 h-8 rounded-full ${avatarColor(idx + 1)} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                              {getInitials(o.hoTen)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{o.hoTen}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="w-3 h-3" />
                                <span>{o.soDienThoai ?? "—"}</span>
                              </div>
                            </div>
                            <span className="flex-shrink-0 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                              Ở cùng
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {coTenants.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">Không có người ở cùng</p>
                  )}
                </div>

                {/* Summary */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tổng số người</span>
                  <span className="font-semibold text-gray-900">{nguoiDangO.length} người</span>
                </div>
              </div>
            )}
          </div>

          {/* ── BLOCK 4a: Doanh thu ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Doanh thu</h2>
            </div>
            <div className="text-center mb-4 pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Tổng doanh thu (12 tháng gần nhất)</p>
              <p className="text-2xl font-bold text-green-600">{formatVND(doanhThu.tong12Thang)}</p>
            </div>
            {doanhThu.theoThang.length > 0 ? (
              <div className="space-y-2.5">
                {doanhThu.theoThang.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">T{entry.thang}/{entry.nam}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: "100%" }} />
                      </div>
                      <span className="font-medium text-gray-900 text-right w-28">{entry.tongTien.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-gray-400 text-center py-4">Chưa có dữ liệu doanh thu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
