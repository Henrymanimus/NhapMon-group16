import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Calendar, Edit, Eye, FileText, Loader2, Plus, Search, XCircle, ArrowUp, ArrowDown } from "lucide-react";
import { apiFetch, ApiResponseError } from "../../../../lib/api";

type ContractStatusApi = "DANG_HIEU_LUC" | "DA_KET_THUC" | "DA_HUY";

interface ContractListItemDto {
  maHopDong: string;
  maNhaTro: string;
  tenNhaTro: string;
  maNguoiDaiDien: string;
  tenNguoiDaiDien: string;
  soDienThoaiNguoiDaiDien: string;
  ngayBatDau: string;
  ngayKetThuc: string | null;
  tienThue: number;
  tienCoc: number;
  trangThai: ContractStatusApi;
  daKy: boolean;
  ngayKy: string | null;
  soNguoiThue: number;
  soHoaDon: number;
  soHoaDonChuaThanhToan: number;
  ngayTao: string | null;
}

function toDateOnly(value: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.slice(0, 10);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return value;
  }
  return d.toLocaleDateString("vi-VN");
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function computedStatusLabel(status: ContractStatusApi, endDate: string | null): string {
  if (status !== "DANG_HIEU_LUC") {
    if (status === "DA_KET_THUC") {
      return "Đã kết thúc";
    }
    return "Đã hủy";
  }

  if (endDate) {
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0 && diffDays <= 30) {
      return "Sắp hết hạn";
    }
  }

  return "Đang hiệu lực";
}

function statusChipClass(label: string): string {
  if (label === "Đang hiệu lực") {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (label === "Sắp hết hạn") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }
  if (label === "Đã kết thúc") {
    return "bg-gray-50 text-gray-600 border-gray-200";
  }
  return "bg-red-50 text-red-700 border-red-200";
}

function TerminateModal({
  contract,
  submitting,
  onConfirm,
  onCancel,
}: {
  contract: ContractListItemDto;
  submitting: boolean;
  onConfirm: (ngayKetThuc: string) => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [endDate, setEndDate] = useState(today);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Kết thúc hợp đồng {contract.maHopDong}</h3>
        <p className="text-sm text-gray-600">
          Phòng: <span className="font-medium">{contract.maNhaTro} - {contract.tenNhaTro}</span>
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc thực tế</label>
          <input
            type="date"
            value={endDate}
            min={contract.ngayBatDau.slice(0, 10)}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="button"
            onClick={() => setEndDate(today)}
            className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full hover:bg-indigo-700"
          >
            <Calendar className="w-3 h-3" />
            Hôm nay: {new Date(today).toLocaleDateString("vi-VN")}
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(endDate)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
            disabled={submitting}
          >
            {submitting ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ContractsList() {
  const [items, setItems] = useState<ContractListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [terminating, setTerminating] = useState<ContractListItemDto | null>(null);
  const [submittingTerminate, setSubmittingTerminate] = useState(false);
  const [sortCreatedAt, setSortCreatedAt] = useState<"asc" | "desc" | null>(null);

  const STATUS_ORDER: Record<string, number> = {
    "Sắp hết hạn": 0,
    "Đang hiệu lực": 1,
    "Đã kết thúc": 2,
    "Đã hủy": 3,
  };

  const displayItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const la = computedStatusLabel(a.trangThai, a.ngayKetThuc);
      const lb = computedStatusLabel(b.trangThai, b.ngayKetThuc);
      const statusDiff = (STATUS_ORDER[la] ?? 99) - (STATUS_ORDER[lb] ?? 99);
      if (statusDiff !== 0) return statusDiff;
      if (sortCreatedAt) {
        const ta = a.ngayTao ? new Date(a.ngayTao).getTime() : 0;
        const tb = b.ngayTao ? new Date(b.ngayTao).getTime() : 0;
        return sortCreatedAt === "asc" ? ta - tb : tb - ta;
      }
      return 0;
    });
    return sorted;
  }, [items, sortCreatedAt]);

  const loadData = async (searchTerm?: string, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const keyword = (searchTerm ?? search).trim();
      if (keyword) {
        params.append("keyword", keyword);
      }
      const filterStatus = status ?? statusFilter;
      if (filterStatus !== "all") {
        const statusMap: Record<string, string> = {
          "Đang hiệu lực": "DANG_HIEU_LUC",
          "Đã kết thúc": "DA_KET_THUC",
          "Đã hủy": "DA_HUY",
        };
        if (statusMap[filterStatus]) {
          params.append("status", statusMap[filterStatus]);
        }
      }
      const url = `/contracts${params.size > 0 ? "?" + params.toString() : ""}`;
      const data = await apiFetch<{ items: ContractListItemDto[] }>(url);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof ApiResponseError ? err.message : "Không thể tải danh sách hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    void loadData(value, statusFilter);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    void loadData(search, value);
  };

  const stats = useMemo(() => {
    const statusLabels = items.map((item) => computedStatusLabel(item.trangThai, item.ngayKetThuc));
    return {
      total: items.length,
      active: statusLabels.filter((s) => s === "Đang hiệu lực").length,
      expiring: statusLabels.filter((s) => s === "Sắp hết hạn").length,
      ended: statusLabels.filter((s) => s === "Đã kết thúc").length,
      canceled: statusLabels.filter((s) => s === "Đã hủy").length,
    };
  }, [items]);

  const handleTerminate = async (ngayKetThuc: string) => {
    if (!terminating) {
      return;
    }

    try {
      setSubmittingTerminate(true);
      await apiFetch(`/contracts/${encodeURIComponent(terminating.maHopDong)}/terminate`, {
        method: "POST",
        body: JSON.stringify({ ngayKetThuc }),
      });
      setTerminating(null);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiResponseError ? err.message : "Không thể kết thúc hợp đồng");
    } finally {
      setSubmittingTerminate(false);
    }
  };

  return (
    <div className="space-y-6">
      {terminating && (
        <TerminateModal
          contract={terminating}
          onCancel={() => setTerminating(null)}
          onConfirm={handleTerminate}
          submitting={submittingTerminate}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hợp đồng</h1>
          <p className="text-gray-500 mt-1">Danh sách tất cả các hợp đồng</p>
        </div>
        <Link to="/contracts/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
          <Plus className="w-4 h-4" />
          Tạo hợp đồng
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-sm text-gray-500">Tổng HĐ</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-sm text-gray-500">Đang hiệu lực</p><p className="text-2xl font-bold text-green-700">{stats.active}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-sm text-gray-500">Sắp hết hạn</p><p className="text-2xl font-bold text-orange-700">{stats.expiring}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-sm text-gray-500">Đã kết thúc</p><p className="text-2xl font-bold text-gray-700">{stats.ended}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-sm text-gray-500">Đã hủy</p><p className="text-2xl font-bold text-red-700">{stats.canceled}</p></div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Tìm theo mã hợp đồng, phòng, người đại diện"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Đang hiệu lực">Đang hiệu lực</option>
          <option value="Sắp hết hạn">Sắp hết hạn</option>
          <option value="Đã kết thúc">Đã kết thúc</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Đang tải danh sách hợp đồng...
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Mã HĐ</th>
                <th className="px-4 py-3">Phòng</th>
                <th className="px-4 py-3">Người đại diện</th>
                <th className="px-4 py-3">Thời hạn</th>
                <th className="px-4 py-3 text-right">Tiền thuê</th>
                <th className="px-4 py-3 text-right">Tiền cọc</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3">
                  <button
                    onClick={() => setSortCreatedAt((prev) => prev === "asc" ? "desc" : prev === "desc" ? null : "asc")}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    Ngày tạo
                    {sortCreatedAt === "asc" && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                    {sortCreatedAt === "desc" && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                    {sortCreatedAt === null && <ArrowUp className="w-3.5 h-3.5 text-gray-300" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {displayItems.map((item) => {
                const label = computedStatusLabel(item.trangThai, item.ngayKetThuc);
                const canEdit = !item.daKy && item.trangThai !== "DA_KET_THUC";
                return (
                  <tr key={item.maHopDong} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-blue-700">{item.maHopDong}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{item.maNhaTro}</p>
                      <p className="text-xs text-gray-500">{item.tenNhaTro}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.tenNguoiDaiDien}</p>
                      <p className="text-xs text-gray-500">{item.soDienThoaiNguoiDaiDien}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p>{formatDate(toDateOnly(item.ngayBatDau))}</p>
                          <p className="text-xs text-gray-500">{formatDate(toDateOnly(item.ngayKetThuc))}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.tienThue)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.tienCoc)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2.5 py-1 border rounded-full text-xs font-medium ${statusChipClass(label)}`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.ngayTao ? formatDate(toDateOnly(item.ngayTao)) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <Link to={`/contracts/${encodeURIComponent(item.maHopDong)}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {canEdit && (
                          <Link to={`/contracts/${encodeURIComponent(item.maHopDong)}/edit`} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg" title="Chỉnh sửa">
                            <Edit className="w-4 h-4" />
                          </Link>
                        )}
                        {item.trangThai === "DANG_HIEU_LUC" && (
                          <button
                            type="button"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Kết thúc hợp đồng"
                            onClick={() => setTerminating(item)}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-6 h-6 text-gray-300" />
                      Không có hợp đồng phù hợp bộ lọc
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
