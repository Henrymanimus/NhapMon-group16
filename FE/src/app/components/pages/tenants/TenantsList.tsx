import { Link, useLocation, useNavigate } from "react-router";
import { Plus, Search, Filter, Users, Eye, Edit, Trash2, Phone, Home as HomeIcon, X, Crown, AlertCircle, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch, ApiResponseError } from "../../../../lib/api";

type TenantRoleApi = "DAI_DIEN" | "O_CUNG" | null;
type TenantStatusApi = "DANG_O" | "DA_ROI";

interface TenantListDto {
  maNguoiThue: string;
  hoTen: string;
  soDienThoai: string;
  cccd: string;
  email: string | null;
  ngaySinh: string | null;
  diaChi: string | null;
  ghiChu: string | null;
  currentRoom: {
    maNhaTro: string;
    tenNhaTro: string | null;
  } | null;
  vaiTroHienTai: TenantRoleApi;
  trangThaiHienTai: TenantStatusApi;
  ngayThamGiaGanNhat: string | null;
  soHopDong: number;
}

interface Tenant {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  currentRoom: string | null;
  currentRoomId: string | null;
  role: "Đại diện" | "Ở cùng" | null;
  joinDate: string | null;
  joinDateRaw: Date | null;
  status: "Đang ở" | "Đã rời";
  avatarColor: string;
  contractCount: number;
}

function toRoleLabel(role: TenantRoleApi): Tenant["role"] {
  if (role === "DAI_DIEN") {
    return "Đại diện";
  }
  if (role === "O_CUNG") {
    return "Ở cùng";
  }
  return null;
}

function toStatusLabel(status: TenantStatusApi): Tenant["status"] {
  return status === "DANG_O" ? "Đang ở" : "Đã rời";
}

function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString("vi-VN");
}

function toTenant(dto: TenantListDto): Tenant {
  const rawDate = dto.ngayThamGiaGanNhat ? new Date(dto.ngayThamGiaGanNhat) : null;
  return {
    id: dto.maNguoiThue,
    name: dto.hoTen,
    phone: dto.soDienThoai,
    idCard: dto.cccd,
    currentRoom: dto.currentRoom?.maNhaTro ?? null,
    currentRoomId: dto.currentRoom?.maNhaTro ?? null,
    role: toRoleLabel(dto.vaiTroHienTai),
    joinDate: formatDate(dto.ngayThamGiaGanNhat),
    joinDateRaw: rawDate && !Number.isNaN(rawDate.getTime()) ? rawDate : null,
    status: toStatusLabel(dto.trangThaiHienTai),
    avatarColor: "bg-blue-500",
    contractCount: dto.soHopDong,
  };
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

function DeleteModal({
  tenant,
  onConfirm,
  onCancel,
  deleting,
}: {
  tenant: Tenant;
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
          <div className={`w-12 h-12 rounded-full ${tenant.avatarColor} text-white flex items-center justify-center text-lg font-bold`}>
            {getInitials(tenant.name)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Xóa người thuê</h3>
            <p className="text-sm text-gray-500">{tenant.name}</p>
          </div>
        </div>
        <p className="text-gray-700 mb-4">Bạn có chắc muốn xóa người thuê này?</p>
        <p className="text-xs text-gray-500 mb-5">
          Lưu ý: hệ thống sẽ từ chối xóa nếu người thuê đã từng tham gia hợp đồng.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TenantsList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [tenantList, setTenantList] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [sortJoinDate, setSortJoinDate] = useState<"asc" | "desc" | null>(null);
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiFetch<{ items: TenantListDto[] }>("/tenants")
      .then((data) => {
        if (cancelled) {
          return;
        }
        setTenantList(data.items.map(toTenant));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiResponseError
              ? err.message
              : "Không thể tải danh sách người thuê. Vui lòng thử lại."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const incoming = (location.state as { successMessage?: string } | null)?.successMessage;
    if (!incoming) {
      return;
    }
    setSuccessMessage(incoming);
    navigate(location.pathname + location.search, { replace: true, state: null });
  }, [location.pathname, location.search, location.state, navigate]);

  const filtered = tenantList.filter((t) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      t.name.toLowerCase().includes(s) ||
      t.phone.includes(s) ||
      t.idCard.includes(s) ||
      (t.currentRoom?.toLowerCase().includes(s) ?? false);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchRole = roleFilter === "all" || t.role === roleFilter || (roleFilter === "none" && t.role === null);
    return matchSearch && matchStatus && matchRole;
  });

  const sorted = sortJoinDate
    ? [...filtered].sort((a, b) => {
        const ta = a.joinDateRaw?.getTime() ?? 0;
        const tb = b.joinDateRaw?.getTime() ?? 0;
        return sortJoinDate === "asc" ? ta - tb : tb - ta;
      })
    : filtered;

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const stats = {
    total: tenantList.length,
    active: tenantList.filter((t) => t.status === "Đang ở").length,
    left: tenantList.filter((t) => t.status === "Đã rời").length,
    representatives: tenantList.filter((t) => t.role === "Đại diện").length,
  };

  const handleDelete = async () => {
    if (!deletingTenant || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);
      setSuccessMessage(null);

      await apiFetch<void>(`/tenants/${encodeURIComponent(deletingTenant.id)}`, {
        method: "DELETE",
      });

      const data = await apiFetch<{ items: TenantListDto[] }>("/tenants");
      setTenantList(data.items.map(toTenant));
      setDeletingTenant(null);
      setSuccessMessage(`Đã xóa người thuê ${deletingTenant.name} thành công`);
    } catch (err) {
      setDeleteError(
        err instanceof ApiResponseError
          ? err.message
          : "Không thể xóa người thuê. Vui lòng thử lại."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {deletingTenant && (
        <DeleteModal
          tenant={deletingTenant}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTenant(null)}
          deleting={deleting}
        />
      )}

      {successMessage && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <span>{successMessage}</span>
        </div>
      )}

      {deleteError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người thuê</h1>
          <p className="text-gray-500 mt-1">Danh sách tất cả người thuê nhà trọ</p>
        </div>
        <Link
          to="/tenants/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm người thuê
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Đang tải danh sách người thuê...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">Tổng người thuê</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">Đang ở</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">Đã rời</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats.left}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500">Người đại diện</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.representatives}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm theo tên, SĐT, CCCD, phòng"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Đang ở">Đang ở</option>
                  <option value="Đã rời">Đã rời</option>
                </select>
              </div>

              <div className="relative">
                <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="Đại diện">Đại diện</option>
                  <option value="Ở cùng">Ở cùng</option>
                  <option value="none">Chưa có vai trò</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Người thuê</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Liên hệ</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Phòng hiện tại</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Vai trò</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Trạng thái</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">
                      <button
                        onClick={() => setSortJoinDate((prev) => prev === "asc" ? "desc" : prev === "desc" ? null : "asc")}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        Ngày tham gia
                        {sortJoinDate === "asc" && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                        {sortJoinDate === "desc" && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                        {sortJoinDate === null && <ArrowUp className="w-3.5 h-3.5 text-gray-300" />}
                      </button>
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tenant) => (
                    <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${tenant.avatarColor} text-white flex items-center justify-center font-semibold`}>
                            {getInitials(tenant.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{tenant.name}</p>
                            <p className="text-xs text-gray-500">Mã: {tenant.id}</p>
                            <p className="text-xs text-gray-500">CCCD: {tenant.idCard}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="inline-flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {tenant.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {tenant.currentRoom ? (
                          <Link to={`/rooms/${tenant.currentRoomId}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium">
                            <HomeIcon className="w-3.5 h-3.5" />
                            {tenant.currentRoom}
                          </Link>
                        ) : (
                          <span className="text-gray-500">Chưa có</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {tenant.role === "Đại diện" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                            <Crown className="w-3.5 h-3.5" /> Đại diện
                          </span>
                        )}
                        {tenant.role === "Ở cùng" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 font-medium">
                            <Users className="w-3.5 h-3.5" /> Ở cùng
                          </span>
                        )}
                        {tenant.role === null && <span className="text-gray-500">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${tenant.status === "Đang ở" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {tenant.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {tenant.joinDate ?? <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link to={`/tenants/${tenant.id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link to={`/tenants/${tenant.id}/edit`} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600" title="Chỉnh sửa">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeletingTenant(tenant)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                        Không có dữ liệu người thuê phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Trang {page}/{totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
