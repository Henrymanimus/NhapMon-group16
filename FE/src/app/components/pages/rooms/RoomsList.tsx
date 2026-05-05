import { Link, useLocation, useNavigate } from "react-router";
import { Plus, Search, Filter, Home, MapPin, Eye, Edit, Trash2, X, Users, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch, ApiResponseError } from "../../../../lib/api";

interface Occupant {
  id: string;
  name: string;
  role: "Đại diện" | "Ở cùng";
  avatarColor: string;
}

interface Room {
  id: string;
  code: string;
  name: string;
  address: string;
  area: string;
  price: string;
  status: "Trống" | "Đang thuê" | "Bảo trì";
  representative: Occupant | null;
  soNguoiDangO: number;
}

interface RoomDto {
  maNhaTro: string;
  tenNhaTro: string;
  diaChi: string;
  dienTich: number;
  giaThue: number;
  tienCoc: number;
  moTa: string | null;
  tienNghi: string | null;
  trangThai: "TRONG" | "DANG_THUE" | "BAO_TRI";
  maChuTro: string;
  nguoiDaiDien: {
    maNguoiThue: string;
    hoTen: string;
    soDienThoai: string | null;
  } | null;
  soNguoiDangO: number;
}

const TRANG_THAI_MAP: Record<RoomDto["trangThai"], Room["status"]> = {
  TRONG: "Trống",
  DANG_THUE: "Đang thuê",
  BAO_TRI: "Bảo trì",
};

function formatPrice(giaThue: number): string {
  return giaThue.toLocaleString("vi-VN") + "đ/tháng";
}

function toRoom(dto: RoomDto): Room {
  return {
    id: dto.maNhaTro,
    code: dto.maNhaTro,
    name: dto.tenNhaTro,
    address: dto.diaChi,
    area: `${dto.dienTich}m²`,
    price: formatPrice(dto.giaThue),
    status: TRANG_THAI_MAP[dto.trangThai],
    representative: dto.nguoiDaiDien
      ? {
          id: dto.nguoiDaiDien.maNguoiThue,
          name: dto.nguoiDaiDien.hoTen,
          role: "Đại diện",
          avatarColor: "bg-blue-500",
        }
      : null,
    soNguoiDangO: dto.soNguoiDangO,
  };
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  "Đang thuê": { bg: "bg-green-50 text-green-700 border-green-200", text: "text-green-700", dot: "bg-green-500" },
  "Trống":     { bg: "bg-gray-50 text-gray-600 border-gray-200",   text: "text-gray-600",  dot: "bg-gray-400" },
  "Bảo trì":  { bg: "bg-orange-50 text-orange-700 border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
};

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

function DeleteModal({
  room,
  onConfirm,
  onCancel,
  deleting,
}: {
  room: Room;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg">
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
          Bạn có chắc muốn xóa <span className="font-semibold">{room.name}</span> ({room.code})?
          {room.soNguoiDangO > 0 && (
            <span className="block mt-2 text-orange-600 text-sm">
              ⚠️ Phòng đang có {room.soNguoiDangO} người thuê. Cần kết thúc hợp đồng trước khi xóa.
            </span>
          )}
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={room.soNguoiDangO > 0 || deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoomsList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch<{ items: RoomDto[] }>("/rooms")
      .then((data) => {
        if (!cancelled) {
          setRoomList(data.items.map(toRoom));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiResponseError
              ? err.message
              : "Không thể tải danh sách phòng. Vui lòng thử lại."
          );
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!deleteSuccess) {
      return;
    }
    const timer = setTimeout(() => setDeleteSuccess(null), 3000);
    return () => clearTimeout(timer);
  }, [deleteSuccess]);

  useEffect(() => {
    const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;
    if (!successMessage) {
      return;
    }

    setDeleteSuccess(successMessage);
    navigate(location.pathname + location.search, { replace: true, state: null });
  }, [location.pathname, location.search, location.state, navigate]);

  const filtered = roomList.filter((room) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      room.code.toLowerCase().includes(s) ||
      room.name.toLowerCase().includes(s) ||
      room.address.toLowerCase().includes(s) ||
      (room.representative?.name.toLowerCase().includes(s) ?? false);
    const matchStatus = statusFilter === "all" || room.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = {
    total: roomList.length,
    occupied: roomList.filter((r) => r.status === "Đang thuê").length,
    vacant: roomList.filter((r) => r.status === "Trống").length,
    maintenance: roomList.filter((r) => r.status === "Bảo trì").length,
    totalOccupants: roomList.reduce((acc, r) => acc + r.soNguoiDangO, 0),
  };

  const handleDelete = async () => {
    if (!deletingRoom || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);
      setDeleteSuccess(null);
      await apiFetch<void>(`/rooms/${encodeURIComponent(deletingRoom.id)}`, { method: "DELETE" });

      const data = await apiFetch<{ items: RoomDto[] }>("/rooms");
      setRoomList(data.items.map(toRoom));
      setDeleteSuccess(`Đã xóa phòng ${deletingRoom.code} thành công`);
      setDeletingRoom(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiResponseError
          ? err.message
          : "Không thể xóa phòng. Vui lòng thử lại."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {deletingRoom && (
        <DeleteModal room={deletingRoom} onConfirm={handleDelete} onCancel={() => setDeletingRoom(null)} deleting={deleting} />
      )}

      {deleteSuccess && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <span>{deleteSuccess}</span>
        </div>
      )}

      {deleteError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý nhà trọ</h1>
          <p className="text-gray-500 mt-1">Danh sách tất cả các phòng trọ</p>
        </div>
        <Link
          to="/rooms/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm phòng
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (<>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng phòng", value: stats.total, color: "text-gray-900", icon: Home, iconColor: "text-blue-500", bg: "bg-blue-50" },
          { label: "Đang thuê", value: stats.occupied, color: "text-green-700", icon: Home, iconColor: "text-green-500", bg: "bg-green-50" },
          { label: "Còn trống", value: stats.vacant, color: "text-gray-600", icon: Home, iconColor: "text-gray-400", bg: "bg-gray-50" },
          { label: "Bảo trì", value: stats.maintenance, color: "text-orange-700", icon: Home, iconColor: "text-orange-500", bg: "bg-orange-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã phòng, tên, địa chỉ, người đại diện..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang thuê">Đang thuê</option>
              <option value="Trống">Trống</option>
              <option value="Bảo trì">Bảo trì</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Users className="w-4 h-4" />
        <span>Tổng số người đang ở: <span className="font-semibold text-gray-700">{stats.totalOccupants} người</span> trong <span className="font-semibold text-gray-700">{stats.occupied} phòng</span></span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã phòng</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên phòng</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">DT / Giá</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người đại diện</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người đang ở</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((room) => {
                const sc = statusConfig[room.status];
                return (
                  <tr
                    key={room.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/rooms/${encodeURIComponent(room.id)}`)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-sm">
                        {room.code}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{room.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{room.address}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-500">{room.area}</p>
                      <p className="text-sm font-semibold text-gray-900">{room.price}</p>
                    </td>
                    <td className="py-3 px-4">
                      {room.representative ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${room.representative.avatarColor} text-white flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
                            {getInitials(room.representative.name)}
                          </div>
                          <span className="text-sm text-gray-900">{room.representative.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {room.soNguoiDangO === 0 ? (
                        <span className="text-gray-400 text-sm italic">Phòng trống</span>
                      ) : (
                        <span className="text-sm text-gray-700 font-medium">{room.soNguoiDangO} người</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {room.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/rooms/${encodeURIComponent(room.id)}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/rooms/${encodeURIComponent(room.id)}/edit`}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeletingRoom(room)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium">Không tìm thấy phòng nào</p>
            <p className="text-gray-500 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Hiển thị <span className="font-medium text-gray-700">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)}</span> / {filtered.length} phòng
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    p === page ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
      </>)}
    </div>
  );
}