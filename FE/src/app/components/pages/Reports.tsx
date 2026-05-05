import {
  DollarSign,
  AlertCircle,
  TrendingUp,
  FileText,
  Home,
  BarChart3,
  Calendar
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const summaryCards = [
  { label: "Tổng doanh thu", value: "952.8 triệu", icon: DollarSign, color: "bg-green-500", period: "12 tháng qua" },
  { label: "Tổng công nợ", value: "22.0 triệu", icon: AlertCircle, color: "bg-red-500", period: "Hiện tại" },
  { label: "Tỷ lệ lấp đầy", value: "75%", icon: TrendingUp, color: "bg-blue-500", period: "18/24 căn" },
  { label: "Hợp đồng hiệu lực", value: "18", icon: FileText, color: "bg-purple-500", period: "Đang hoạt động" },
];

const monthlyRevenue = [
  { month: "T5/2025", revenue: 68 },
  { month: "T6/2025", revenue: 72 },
  { month: "T7/2025", revenue: 75 },
  { month: "T8/2025", revenue: 70 },
  { month: "T9/2025", revenue: 74 },
  { month: "T10/2025", revenue: 72 },
  { month: "T11/2025", revenue: 78 },
  { month: "T12/2025", revenue: 82 },
  { month: "T1/2026", revenue: 75 },
  { month: "T2/2026", revenue: 80 },
  { month: "T3/2026", revenue: 77 },
  { month: "T4/2026", revenue: 86.5 },
];

const roomRevenue = [
  { room: "A101", revenue: 54 },
  { room: "A102", revenue: 48 },
  { room: "A103", revenue: 50 },
  { room: "B201", revenue: 58 },
  { room: "B202", revenue: 52 },
  { room: "B203", revenue: 62 },
  { room: "C301", revenue: 45 },
  { room: "C302", revenue: 42 },
];

const roomRevenueTable = [
  { room: "B203", address: "Tầng 2, Khu B", revenue: "62.4 triệu", occupancy: "12/12 tháng", status: "Đang thuê" },
  { room: "B201", address: "Tầng 2, Khu B", revenue: "58.0 triệu", occupancy: "12/12 tháng", status: "Đang thuê" },
  { room: "A101", address: "Tầng 1, Khu A", revenue: "54.0 triệu", occupancy: "12/12 tháng", status: "Đang thuê" },
  { room: "B202", address: "Tầng 2, Khu B", revenue: "52.0 triệu", occupancy: "11/12 tháng", status: "Đang thuê" },
  { room: "A103", address: "Tầng 1, Khu A", revenue: "50.0 triệu", occupancy: "10/12 tháng", status: "Đang thuê" },
  { room: "A102", address: "Tầng 1, Khu A", revenue: "48.0 triệu", occupancy: "12/12 tháng", status: "Đang thuê" },
  { room: "C301", address: "Tầng 3, Khu C", revenue: "45.0 triệu", occupancy: "12/12 tháng", status: "Đang thuê" },
  { room: "C302", address: "Tầng 3, Khu C", revenue: "42.0 triệu", occupancy: "9/12 tháng", status: "Đang thuê" },
  { room: "A201", address: "Tầng 2, Khu A", revenue: "0 triệu", occupancy: "0/12 tháng", status: "Trống" },
  { room: "A202", address: "Tầng 2, Khu A", revenue: "0 triệu", occupancy: "0/12 tháng", status: "Trống" },
];

const unpaidDebts = [
  { invoice: "HD003", tenant: "Lê Văn D", room: "C305", amount: "3.8 triệu", dueDate: "25/04/2026", overdueDays: 0 },
  { invoice: "HD005", tenant: "Hoàng Văn F", room: "B101", amount: "3.5 triệu", dueDate: "22/04/2026", overdueDays: 2 },
  { invoice: "HD001", tenant: "Nguyễn Văn B", room: "A101", amount: "4.5 triệu", dueDate: "30/04/2026", overdueDays: 0 },
  { invoice: "HD002", tenant: "Trần Thị C", room: "B203", amount: "5.2 triệu", dueDate: "28/04/2026", overdueDays: 0 },
  { invoice: "HD004", tenant: "Phạm Thị E", room: "A205", amount: "4.8 triệu", dueDate: "30/04/2026", overdueDays: 0 },
];

const insights = [
  {
    title: "Căn nhà doanh thu cao nhất",
    value: "B203 - 62.4 triệu VNĐ",
    description: "12 tháng liên tục đầy",
    icon: Home,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Căn nhà trống lâu nhất",
    value: "A201 - 4 tháng",
    description: "Cần xem xét giá hoặc điều kiện",
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    title: "Hợp đồng sắp hết hạn",
    value: "3 hợp đồng",
    description: "Trong vòng 60 ngày tới",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Tốc độ tăng trưởng",
    value: "+12% tháng này",
    description: "So với tháng trước",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
];

export function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
        <p className="text-gray-500 mt-1">Phân tích chi tiết doanh thu và hoạt động kinh doanh</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-xs text-gray-500">{card.period}</p>
            </div>
          );
        })}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Doanh thu theo tháng</h2>
          <p className="text-sm text-gray-500">12 tháng gần nhất (đơn vị: triệu VNĐ)</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Doanh thu"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Room Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Doanh thu theo căn nhà</h2>
          <p className="text-sm text-gray-500">Top 8 căn doanh thu cao nhất (đơn vị: triệu VNĐ)</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={roomRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="room" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Room Revenue Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Chi tiết doanh thu theo căn nhà</h2>
          <p className="text-sm text-gray-500">Tổng hợp doanh thu 12 tháng qua</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Mã phòng</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Địa chỉ</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Doanh thu</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Tỷ lệ lấp đầy</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {roomRevenueTable.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{row.room}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{row.address}</td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">{row.revenue}</td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">{row.occupancy}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      row.status === "Đang thuê"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unpaid Debts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Danh sách công nợ chưa thanh toán</h2>
          <p className="text-sm text-gray-500">Tổng: 22.0 triệu VNĐ</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Mã HĐ</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Người thuê</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Phòng</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Số tiền</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Hạn thanh toán</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {unpaidDebts.map((debt, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{debt.invoice}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{debt.tenant}</td>
                  <td className="py-3 px-4 text-gray-600">{debt.room}</td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">{debt.amount}</td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">{debt.dueDate}</td>
                  <td className="py-3 px-4 text-center">
                    {debt.overdueDays > 0 ? (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Quá hạn {debt.overdueDays} ngày
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        Chưa thanh toán
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className={`${insight.bgColor} rounded-xl border-2 border-gray-200 p-6`}>
              <Icon className={`w-8 h-8 ${insight.color} mb-3`} />
              <h3 className="text-sm font-medium text-gray-700 mb-2">{insight.title}</h3>
              <p className={`text-xl font-bold ${insight.color} mb-1`}>{insight.value}</p>
              <p className="text-xs text-gray-600">{insight.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
