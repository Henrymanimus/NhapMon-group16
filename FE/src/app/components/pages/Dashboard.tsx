import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Home,
  Users,
  FileText,
  Receipt,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Building2,
  ArrowUpRight,
  ChevronRight,
  Zap,
  CalendarClock,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiFetch, ApiResponseError } from "../../../lib/api";

type RoomStatus = "TRONG" | "DANG_THUE" | "BAO_TRI";
type ContractStatus = "DANG_HIEU_LUC" | "DA_KET_THUC" | "DA_HUY";
type InvoiceStatus = "DA_THANH_TOAN" | "CHUA_THANH_TOAN" | "QUA_HAN";

interface RoomDto {
  maNhaTro: string;
  tenNhaTro: string;
  diaChi: string;
  trangThai: RoomStatus;
}

interface TenantDto {
  maNguoiThue: string;
  hoTen: string;
  trangThaiHienTai: "DANG_O" | "DA_ROI";
}

interface ContractDto {
  maHopDong: string;
  maNhaTro: string;
  tenNhaTro: string;
  tenNguoiDaiDien: string;
  ngayKetThuc: string | null;
  trangThai: ContractStatus;
}

interface InvoiceDto {
  maHoaDon: string;
  maHopDong: string;
  thang: number;
  nam: number;
  tenNhaTro: string;
  nguoiDaiDien: string;
  tongTien: number;
  hanThanhToan: string | null;
  trangThai: InvoiceStatus;
}

interface InvoiceStats {
  total: number;
  paid: number;
  unpaid: number;
  overdue: number;
  totalAmount: number;
}

interface DashboardData {
  rooms: RoomDto[];
  tenants: TenantDto[];
  contracts: ContractDto[];
  invoices: InvoiceDto[];
  invoiceStats: InvoiceStats;
}

interface RevenuePoint {
  month: string;
  revenue: number;
  target: number;
}

const quickActions = [
  { label: "Lập hóa đơn", sub: "Thu tiền tháng", icon: Receipt, href: "/invoices/new", bg: "bg-blue-600" },
  { label: "Tạo hợp đồng", sub: "Phòng mới", icon: FileText, href: "/contracts/new", bg: "bg-violet-600" },
  { label: "Thêm người thuê", sub: "Vào hệ thống", icon: Users, href: "/tenants/new", bg: "bg-emerald-600" },
  { label: "Thêm phòng", sub: "Mở rộng", icon: Home, href: "/rooms/new", bg: "bg-orange-500" },
];

function getInitials(name: string) {
  const p = name.trim().split(" ");
  return p[p.length - 1][0]?.toUpperCase() ?? "?";
}

const avatarColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
];

function avatarColor(name: string) {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

function toDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string | null): string {
  const date = toDate(value);
  if (!date) return "--/--/----";
  return date.toLocaleDateString("vi-VN");
}

function formatMoneyM(value: number): string {
  return `${(value / 1000000).toFixed(1)}M`;
}

function formatMoney(value: number): string {
  return `${value.toLocaleString("vi-VN")} VNĐ`;
}

function normalizeMonthLabel(month: number, year: number): string {
  const shortYear = String(year).slice(2);
  return `T${month}/${shortYear}`;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getLastMonths(count: number): Array<{ year: number; month: number; key: string; label: string }> {
  const now = new Date();
  return Array.from({ length: count }).map((_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - idx), 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return {
      year,
      month,
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: normalizeMonthLabel(month, year),
    };
  });
}

function parseZoneName(address: string): string {
  const text = address.toLowerCase();
  const zoneMatch = text.match(/khu\s*([a-z0-9]+)/i);
  if (zoneMatch?.[1]) {
    return `Khu ${zoneMatch[1].toUpperCase()}`;
  }
  const wardMatch = text.match(/phuong\s*([a-z0-9]+)/i);
  if (wardMatch?.[1]) {
    return `Phuong ${wardMatch[1].toUpperCase()}`;
  }
  return "Khac";
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-white">{payload[0]?.value?.toFixed?.(1) ?? payload[0]?.value}M VNĐ</p>
    </div>
  );
}

export function Dashboard() {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    rooms: [],
    tenants: [],
    contracts: [],
    invoices: [],
    invoiceStats: { total: 0, paid: 0, unpaid: 0, overdue: 0, totalAmount: 0 },
  });

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [roomsRes, tenantsRes, contractsRes, invoicesRes] = await Promise.all([
          apiFetch<{ items: RoomDto[] }>("/rooms"),
          apiFetch<{ items: TenantDto[] }>("/tenants"),
          apiFetch<{ items: ContractDto[] }>("/contracts"),
          apiFetch<{ items: InvoiceDto[]; stats: InvoiceStats }>("/invoices"),
        ]);

        if (cancelled) {
          return;
        }

        setData({
          rooms: roomsRes.items,
          tenants: tenantsRes.items,
          contracts: contractsRes.items,
          invoices: invoicesRes.items,
          invoiceStats: invoicesRes.stats,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiResponseError ? err.message : "Không thể tải dữ liệu tổng quan");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const roomMetrics = useMemo(() => {
    const total = data.rooms.length;
    const occupied = data.rooms.filter((r) => r.trangThai === "DANG_THUE").length;
    const vacant = data.rooms.filter((r) => r.trangThai === "TRONG").length;
    const maintenance = data.rooms.filter((r) => r.trangThai === "BAO_TRI").length;
    const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;

    const roomStatusData = [
      { name: "Đang thuê", value: occupied, color: "#10b981" },
      { name: "Còn trống", value: vacant, color: "#f97316" },
      { name: "Bảo trì", value: maintenance, color: "#94a3b8" },
    ];

    return { total, occupied, vacant, maintenance, occupancyRate, roomStatusData };
  }, [data.rooms]);

  const tenantMetrics = useMemo(() => {
    const total = data.tenants.length;
    const active = data.tenants.filter((t) => t.trangThaiHienTai === "DANG_O").length;
    return { total, active };
  }, [data.tenants]);

  const contractMetrics = useMemo(() => {
    const now = new Date();
    const total = data.contracts.length;
    const active = data.contracts.filter((c) => c.trangThai === "DANG_HIEU_LUC").length;
    const expiring30 = data.contracts.filter((c) => {
      if (c.trangThai !== "DANG_HIEU_LUC" || !c.ngayKetThuc) return false;
      const endDate = toDate(c.ngayKetThuc);
      if (!endDate) return false;
      const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 10;
    }).length;

    const expiringContracts = data.contracts
      .filter((c) => c.trangThai === "DANG_HIEU_LUC" && !!c.ngayKetThuc)
      .map((c) => {
        const endDate = toDate(c.ngayKetThuc);
        const daysLeft = endDate
          ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : Number.MAX_SAFE_INTEGER;
        return {
          id: c.maHopDong,
          representative: c.tenNguoiDaiDien,
          room: c.tenNhaTro,
          endDate: formatDate(c.ngayKetThuc),
          daysLeft,
        };
      })
      .filter((c) => c.daysLeft >= 0 && c.daysLeft <= 120)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);

    return { total, active, expiring30, expiringContracts };
  }, [data.contracts]);

  const invoiceMetrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const currentMonthInvoices = data.invoices.filter(
      (inv) => inv.thang === currentMonth && inv.nam === currentYear
    );

    const currentMonthStats = {
      total: currentMonthInvoices.length,
      paid: currentMonthInvoices.filter((inv) => inv.trangThai === "DA_THANH_TOAN").length,
      overdue: currentMonthInvoices.filter((inv) => inv.trangThai === "QUA_HAN").length,
    };

    const unpaidInvoices = data.invoices
      .filter((inv) => inv.trangThai !== "DA_THANH_TOAN")
      .map((inv) => ({
        id: inv.maHoaDon,
        representative: inv.nguoiDaiDien,
        room: inv.tenNhaTro,
        contractId: inv.maHopDong,
        amount: inv.tongTien,
        dueDate: formatDate(inv.hanThanhToan),
        overdue: inv.trangThai === "QUA_HAN",
      }))
      .sort((a, b) => {
        if (a.overdue !== b.overdue) {
          return a.overdue ? -1 : 1;
        }
        return b.amount - a.amount;
      })
      .slice(0, 4);

    return {
      unpaidInvoices,
      overdueCount: data.invoiceStats.overdue,
      stats: data.invoiceStats,
      currentMonthStats,
    };
  }, [data.invoices, data.invoiceStats]);

  const revenueMetrics = useMemo(() => {
    const months = getLastMonths(7);
    const monthRevenueMap = new Map<string, number>();

    for (const invoice of data.invoices) {
      if (invoice.trangThai !== "DA_THANH_TOAN") {
        continue;
      }
      const key = `${invoice.nam}-${String(invoice.thang).padStart(2, "0")}`;
      monthRevenueMap.set(key, (monthRevenueMap.get(key) ?? 0) + invoice.tongTien);
    }

    const revenueData: RevenuePoint[] = months.map((m) => {
      const amount = monthRevenueMap.get(m.key) ?? 0;
      return {
        month: m.label,
        revenue: amount / 1000000,
        target: 0,
      };
    });

    const avgRevenue = revenueData.length > 0
      ? revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.length
      : 0;

    for (const point of revenueData) {
      point.target = Number(avgRevenue.toFixed(1));
      point.revenue = Number(point.revenue.toFixed(1));
    }

    const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map((x) => x.revenue)) : 0;
    const maxPoint = revenueData.find((x) => x.revenue === maxRevenue) ?? null;

    const current = revenueData[revenueData.length - 1]?.revenue ?? 0;
    const previous = revenueData[revenueData.length - 2]?.revenue ?? 0;
    const changePct = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return {
      revenueData,
      avgRevenue,
      maxRevenue,
      maxMonth: maxPoint?.month ?? "--",
      sumRevenue: revenueData.reduce((sum, item) => sum + item.revenue, 0),
      current,
      previous,
      changePct,
      target: Number(avgRevenue.toFixed(1)),
    };
  }, [data.invoices]);

  const zoneMetrics = useMemo(() => {
    const zoneMap = new Map<string, { occupied: number; total: number }>();

    for (const room of data.rooms) {
      const zoneName = parseZoneName(room.diaChi ?? "");
      const current = zoneMap.get(zoneName) ?? { occupied: 0, total: 0 };
      current.total += 1;
      if (room.trangThai === "DANG_THUE") {
        current.occupied += 1;
      }
      zoneMap.set(zoneName, current);
    }

    const list = Array.from(zoneMap.entries())
      .map(([name, value]) => ({ name, occupied: value.occupied, total: value.total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    if (list.length === 0) {
      return [{ name: "Khac", occupied: 0, total: 0 }];
    }

    return list;
  }, [data.rooms]);

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date());
  }, []);

  const currentMonthLabel = useMemo(() => {
    const now = new Date();
    return `T${now.getMonth() + 1}`;
  }, []);

  const occupancyPercent = Math.round(roomMetrics.occupancyRate);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-gray-500 text-sm">{todayLabel}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span className="font-semibold text-sm">Thao tác nhanh</span>
          </button>

          {showQuickActions && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-gray-200 shadow-2xl p-3 z-50 animate-in slide-in-from-top-2">
              <div className="space-y-1.5">
                {quickActions.map((a) => {
                  const Icon = a.icon;
                  return (
                    <Link
                      key={a.href}
                      to={a.href}
                      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
                    >
                      <div className={`${a.bg} w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 leading-tight">{a.label}</p>
                        <p className="text-xs text-gray-400 leading-tight">{a.sub}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Thông tin phòng</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng số phòng</span>
              <span className="text-lg font-bold text-gray-900">{roomMetrics.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Đang cho thuê</span>
              <span className="text-lg font-bold text-emerald-600">{roomMetrics.occupied}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Còn trống</span>
              <span className="text-lg font-bold text-orange-600">{roomMetrics.vacant}</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Tỷ lệ lấp đầy</span>
                <span className="font-bold text-blue-600">{occupancyPercent}%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden" style={{ height: 8, overflow: 'hidden' }}>
                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ height: '100%', width: `${occupancyPercent}%`, background: 'linear-gradient(to right, #3b82f6, #10b981)' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-bold text-gray-900">Hợp đồng</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng hợp đồng</span>
              <span className="text-lg font-bold text-gray-900">{contractMetrics.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Hiệu lực</span>
              <span className="text-lg font-bold text-emerald-600">{contractMetrics.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sắp hết hạn</span>
              <span className="text-lg font-bold text-orange-600">{contractMetrics.expiring30}</span>
            </div>
            <Link to="/contracts" className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium pt-3 border-t border-gray-100">
              Xem chi tiết<ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900">Hóa đơn</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng hóa đơn {currentMonthLabel}</span>
              <span className="text-lg font-bold text-gray-900">{invoiceMetrics.currentMonthStats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Đã thanh toán</span>
              <span className="text-lg font-bold text-emerald-600">{invoiceMetrics.currentMonthStats.paid}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tới hạn thanh toán</span>
              <span className="text-lg font-bold text-red-600">{invoiceMetrics.currentMonthStats.overdue}</span>
            </div>
            <Link to="/invoices" className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium pt-3 border-t border-gray-100">
              Xem chi tiết<ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-white">Doanh thu tháng này</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-bold leading-none">{formatMoneyM(revenueMetrics.current * 1000000)}</p>
              <p className="text-blue-200 text-xs mt-1">{formatMoney(Math.round(revenueMetrics.current * 1000000))}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>{revenueMetrics.changePct >= 0 ? "+" : ""}{revenueMetrics.changePct.toFixed(1)}% so với tháng trước</span>
            </div>
            <div className="pt-3 border-t border-white/20">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-blue-200">Mục tiêu</span>
                <span className="font-bold">{revenueMetrics.target.toFixed(1)}M</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/70 rounded-full"
                  style={{ width: `${Math.min(100, revenueMetrics.target > 0 ? (revenueMetrics.current / revenueMetrics.target) * 100 : 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Doanh thu theo tháng</h2>
              <p className="text-xs text-gray-400 mt-0.5">7 tháng gần nhất • đơn vị: triệu VNĐ</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
              <TrendingUp className="w-3 h-3" />Tháng tốt nhất: {revenueMetrics.maxMonth}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={revenueMetrics.revenueData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#gradRev)"
                dot={{ fill: "#2563eb", r: 4, strokeWidth: 2.5, stroke: "#fff" }}
                activeDot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-row items-center">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400">TB / tháng</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{revenueMetrics.avgRevenue.toFixed(1)}M</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400">Cao nhất</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{revenueMetrics.maxRevenue.toFixed(1)}M</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400">Tổng 7T</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{revenueMetrics.sumRevenue.toFixed(1)}M</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900">Tình trạng phòng</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tổng {roomMetrics.total} phòng</p>
          </div>

          <div className="relative flex-shrink-0">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={roomMetrics.roomStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={68}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {roomMetrics.roomStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-2xl font-bold text-gray-900 leading-none">{occupancyPercent}%</span>
              <span className="text-xs text-gray-400 mt-0.5">lấp đầy</span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {roomMetrics.roomStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600 flex-1">{item.name}</span>
                <span className="text-xs font-bold text-gray-800">{item.value}</span>
                <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: item.color,
                      width: `${roomMetrics.total > 0 ? (item.value / roomMetrics.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Theo khu</p>
            <div className="space-y-2.5">
              {zoneMetrics.map((k) => (
                <div key={k.name} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-14 truncate" title={k.name}>{k.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${k.total > 0 ? (k.occupied / k.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-10 text-right">{k.occupied}/{k.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Hóa đơn chưa thanh toán</h2>
                <p className="text-xs text-gray-400">{invoiceMetrics.overdueCount} quá hạn</p>
              </div>
            </div>
            <Link to="/invoices" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">
              Xem tất cả<ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {invoiceMetrics.unpaidInvoices.length === 0 && (
              <div className="px-5 py-6 text-sm text-gray-500">Không có hóa đơn chưa thanh toán.</div>
            )}
            {invoiceMetrics.unpaidInvoices.map((inv) => (
              <Link key={inv.id} to={`/invoices/${inv.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group">
                <div className={`w-8 h-8 rounded-full ${avatarColor(inv.representative)} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {getInitials(inv.representative)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-gray-900 truncate">{inv.representative}</span>
                    {inv.overdue && (
                      <span className="flex-shrink-0 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">Quá hạn</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    <span className="font-mono">{inv.room}</span> · {inv.id} · hạn {inv.dueDate}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${inv.overdue ? "text-red-600" : "text-gray-900"}`}>{formatMoneyM(inv.amount)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                <CalendarClock className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Hợp đồng sắp hết hạn</h2>
                <p className="text-xs text-gray-400">Trong 120 ngày tới</p>
              </div>
            </div>
            <Link to="/contracts" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-medium">
              Xem tất cả<ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {contractMetrics.expiringContracts.length === 0 && (
              <div className="px-5 py-6 text-sm text-gray-500">Không có hợp đồng sắp hết hạn.</div>
            )}
            {contractMetrics.expiringContracts.map((c) => {
              const urgency = c.daysLeft <= 30 ? "red" : c.daysLeft <= 60 ? "orange" : "gray";
              const urgencyClasses = {
                red: { badge: "bg-red-100 text-red-600", bar: "bg-red-500", pct: Math.max(5, (1 - c.daysLeft / 120) * 100) },
                orange: { badge: "bg-orange-100 text-orange-600", bar: "bg-orange-400", pct: Math.max(5, (1 - c.daysLeft / 120) * 100) },
                gray: { badge: "bg-gray-100 text-gray-500", bar: "bg-gray-300", pct: Math.max(5, (1 - c.daysLeft / 120) * 100) },
              }[urgency];

              return (
                <Link key={c.id} to={`/contracts/${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full ${avatarColor(c.representative)} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                    {getInitials(c.representative)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900 truncate">{c.representative}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden" style={{ height: 6, overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                        <div
                          className={`h-full rounded-full ${urgencyClasses.bar} transition-all`}
                          style={{
                            height: '100%',
                            width: `${urgencyClasses.pct}%`,
                            backgroundColor: urgency === 'red' ? '#ef4444' : urgency === 'orange' ? '#fb923c' : '#d1d5db',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${urgencyClasses.badge}`}>{c.daysLeft}d</span>
                    <p className="text-xs text-gray-400 mt-0.5">{c.room}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 animate-pulse" />
          Đang đồng bộ dữ liệu Dashboard...
        </div>
      )}

      {!loading && (
        <div className="text-xs text-gray-400 text-right">
          Đồng bộ dữ liệu: phòng {roomMetrics.total} • người thuê {tenantMetrics.total} • hợp đồng {contractMetrics.total} • hóa đơn {invoiceMetrics.stats.total}
        </div>
      )}
    </div>
  );
}
