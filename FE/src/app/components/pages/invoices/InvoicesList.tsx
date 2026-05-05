import { Link } from "react-router";
import {
  Plus, Search, Filter, Receipt, Eye, Edit, Calendar,
  DollarSign, CheckCircle, AlertCircle, X, Info
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../../../lib/api";

type TrangThai = "DA_THANH_TOAN" | "CHUA_THANH_TOAN" | "QUA_HAN";

interface Invoice {
  maHoaDon: string;
  maHopDong: string;
  thang: number;
  nam: number;
  maNhaTro: string;
  tenNhaTro: string;
  nguoiDaiDien: string;
  soDienThoai: string;
  soNguoiTrongHopDong: number;
  tongTien: number;
  hanThanhToan: string | null;
  trangThai: TrangThai;
  ngayLap: string | null;
}

interface Stats {
  total: number;
  paid: number;
  unpaid: number;
  overdue: number;
  totalAmount: number;
}

const statusConfig: Record<TrangThai, { bg: string; dot: string; label: string }> = {
  "DA_THANH_TOAN":   { bg: "bg-green-50 text-green-700 border-green-200",   dot: "bg-green-500",  label: "Đã thanh toán" },
  "CHUA_THANH_TOAN": { bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", label: "Chưa thanh toán" },
  "QUA_HAN":         { bg: "bg-red-50 text-red-600 border-red-200",          dot: "bg-red-500",    label: "Quá hạn" },
};

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
  return n.toLocaleString("vi-VN") + "đ";
}

function PaymentModal({
  invoice, onConfirm, onCancel, paying,
}: { invoice: Invoice; onConfirm: () => void; onCancel: () => void; paying?: boolean }) {
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
            <p className="text-sm text-gray-500">Mã hóa đơn: <span className="font-semibold text-gray-800">{invoice.maHoaDon}</span></p>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-xl">
            <div><p className="text-gray-500 text-xs">Hợp đồng</p><p className="font-semibold">{invoice.maHopDong}</p></div>
            <div><p className="text-gray-500 text-xs">Phòng</p><p className="font-semibold">{invoice.tenNhaTro}</p></div>
            <div><p className="text-gray-500 text-xs">Người đại diện</p><p className="font-semibold">{invoice.nguoiDaiDien}</p></div>
            <div><p className="text-gray-500 text-xs">Tháng</p><p className="font-semibold">{invoice.thang}/{invoice.nam}</p></div>
            <div><p className="text-gray-500 text-xs">Hạn thanh toán</p><p className="font-semibold">{fmtDate(invoice.hanThanhToan)}</p></div>
            <div>
              <p className="text-gray-500 text-xs">Tổng tiền</p>
              <p className="font-bold text-green-700 text-base">{fmt(invoice.tongTien)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">Sau khi xác nhận thanh toán, hóa đơn sẽ không được chỉnh sửa số tiền.</p>
          </div>
        </div>
        <div className="p-6 pt-0 flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Hủy
          </button>
          <button onClick={onConfirm} disabled={paying}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-60">
            <CheckCircle className="w-4 h-4" />{paying ? "Đang xử lý..." : "Xác nhận thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function InvoicesList() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, paid: 0, unpaid: 0, overdue: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paying, setPaying] = useState(false);

  const loadData = useCallback(async (keyword?: string, thangNam?: string, trangThai?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (thangNam && thangNam !== "all") {
        const [y, m] = thangNam.split("-");
        params.set("thang", m);
        params.set("nam", y);
      }
      if (trangThai && trangThai !== "all") params.set("trangThai", trangThai);
      const qs = params.toString();
      const result = await apiFetch<{ items: Invoice[]; stats: Stats }>(`/invoices${qs ? `?${qs}` : ""}`);
      setItems(result.items);
      setStats(result.stats);
    } catch {
      // keep empty on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const uniqueMonths = Array.from(
    new Set(items.map((i) => `${i.nam}-${String(i.thang).padStart(2, "0")}`))
  ).sort().reverse();

  const totalPages = Math.ceil(items.length / pageSize);
  const paginated = items.slice((page - 1) * pageSize, page * pageSize);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchTerm(v);
    setPage(1);
    loadData(v, monthFilter !== "all" ? monthFilter : undefined, statusFilter !== "all" ? statusFilter : undefined);
  };

  const handleMonthChange = (v: string) => {
    setMonthFilter(v);
    setPage(1);
    loadData(searchTerm, v !== "all" ? v : undefined, statusFilter !== "all" ? statusFilter : undefined);
  };

  const handleStatusChange = (v: string) => {
    setStatusFilter(v);
    setPage(1);
    loadData(searchTerm, monthFilter !== "all" ? monthFilter : undefined, v !== "all" ? v : undefined);
  };

  const handleConfirmPayment = async () => {
    if (!payingInvoice) return;
    setPaying(true);
    try {
      await apiFetch(`/invoices/${payingInvoice.maHoaDon}/pay`, { method: "POST" });
      setPayingInvoice(null);
      loadData(searchTerm, monthFilter !== "all" ? monthFilter : undefined, statusFilter !== "all" ? statusFilter : undefined);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {payingInvoice && (
        <PaymentModal
          invoice={payingInvoice}
          onConfirm={handleConfirmPayment}
          onCancel={() => setPayingInvoice(null)}
          paying={paying}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hóa đơn</h1>
          <p className="text-gray-500 mt-1">Danh sách hóa đơn thu tiền nhà</p>
        </div>
        <Link to="/invoices/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
          <Plus className="w-4 h-4" />Lập hóa đơn mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Tổng hóa đơn",    value: stats.total,                                    color: "text-gray-900",   bg: "bg-blue-50",   icon: Receipt,     iconColor: "text-blue-500" },
          { label: "Đã thanh toán",   value: stats.paid,                                     color: "text-green-700",  bg: "bg-green-50",  icon: CheckCircle, iconColor: "text-green-500" },
          { label: "Chưa thanh toán", value: stats.unpaid,                                   color: "text-orange-700", bg: "bg-orange-50", icon: Receipt,     iconColor: "text-orange-500" },
          { label: "Quá hạn",         value: stats.overdue,                                  color: "text-red-600",    bg: "bg-red-50",    icon: AlertCircle, iconColor: "text-red-500" },
          { label: "Tổng tiền",       value: `${(stats.totalAmount / 1000000).toFixed(1)}M`, color: "text-blue-700",   bg: "bg-indigo-50", icon: DollarSign,  iconColor: "text-indigo-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm mã HĐơn, mã HĐồng, phòng, đại diện..."
              value={searchTerm} onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={monthFilter} onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm">
              <option value="all">Tất cả tháng</option>
              {uniqueMonths.map((m) => {
                const [y, mo] = m.split("-");
                return <option key={m} value={m}>{mo}/{y}</option>;
              })}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm">
              <option value="all">Tất cả trạng thái</option>
              <option value="DA_THANH_TOAN">Đã thanh toán</option>
              <option value="CHUA_THANH_TOAN">Chưa thanh toán</option>
              <option value="QUA_HAN">Quá hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="text-center py-10 text-gray-500 text-sm">Đang tải...</div>
        )}
        {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã HĐơn</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tháng</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hợp đồng</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người đại diện</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phòng</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số tiền</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hạn TT</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((inv) => {
                const sc = statusConfig[inv.trangThai];
                const isUnpaid = inv.trangThai !== "DA_THANH_TOAN";
                return (
                  <tr key={inv.maHoaDon} className="hover:bg-gray-50 transition-colors">
                    {/* Mã HĐơn */}
                    <td className="py-3 px-4">
                      <Link to={`/invoices/${inv.maHoaDon}`}
                        className="font-mono font-semibold text-blue-600 hover:underline text-sm">
                        {inv.maHoaDon}
                      </Link>
                    </td>

                    {/* Tháng */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {inv.thang}/{inv.nam}
                      </div>
                    </td>

                    {/* Hợp đồng */}
                    <td className="py-3 px-4">
                      <Link to={`/contracts/${inv.maHopDong}`}
                        className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors">
                        {inv.maHopDong}
                      </Link>
                    </td>

                    {/* Người đại diện */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {getInitials(inv.nguoiDaiDien)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{inv.nguoiDaiDien}</p>
                          <p className="text-xs text-gray-400">{inv.soNguoiTrongHopDong} người</p>
                        </div>
                      </div>
                    </td>

                    {/* Phòng */}
                    <td className="py-3 px-4">
                      <Link to={`/rooms/${inv.maNhaTro}`}
                        className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100 transition-colors">
                        {inv.tenNhaTro}
                      </Link>
                    </td>

                    {/* Số tiền */}
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-bold text-gray-900">{fmt(inv.tongTien)}</span>
                    </td>

                    {/* Hạn TT */}
                    <td className="py-3 px-4">
                      <span className={`text-sm ${inv.trangThai === "QUA_HAN" ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                        {fmtDate(inv.hanThanhToan)}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link to={`/invoices/${inv.maHoaDon}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {isUnpaid && (
                          <>
                            <Link to={`/invoices/${inv.maHoaDon}/edit`}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Chỉnh sửa">
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setPayingInvoice(inv)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Xác nhận thanh toán">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium">Không tìm thấy hóa đơn nào</p>
            <p className="text-gray-500 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <Link to="/invoices/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Plus className="w-4 h-4" />Lập hóa đơn đầu tiên
            </Link>
          </div>
        )}

        {/* Pagination */}
        {!loading && items.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Hiển thị <span className="font-medium text-gray-700">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, items.length)}</span> / {items.length} hóa đơn
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${p === page ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
