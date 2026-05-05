import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import {
  ArrowLeft,
  Edit,
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  MapPin,
  FileText,
  Home,
  Crown,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { apiFetch, ApiResponseError } from "../../../../lib/api";

interface TenantDto {
  maNguoiThue: string;
  hoTen: string;
  soDienThoai: string;
  cccd: string;
  email: string | null;
  ngaySinh: string | null;
  diaChi: string | null;
  ghiChu: string | null;
}

interface ContractHistoryDto {
  maHopDong: string;
  maNhaTro: string;
  tenNhaTro: string;
  vaiTro: "DAI_DIEN" | "O_CUNG";
  ngayBatDau: string;
  ngayKetThuc: string | null;
  trangThai: "DANG_HIEU_LUC" | "DA_KET_THUC" | "DA_HUY";
}

interface InvoiceDto {
  maHoaDon: string;
  maHopDong: string;
  thang: number;
  nam: number;
  tongTien: number;
  trangThai: "CHUA_THANH_TOAN" | "DA_THANH_TOAN";
}

interface TenantDetailResponse {
  item: TenantDto;
  lichSuHopDong: ContractHistoryDto[];
  hoaDonGanDay: InvoiceDto[];
  congNo: {
    soHoaDon: number;
    tongNo: number;
  };
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("vi-VN");
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

function roleBadge(vaiTro: ContractHistoryDto["vaiTro"]) {
  if (vaiTro === "DAI_DIEN") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
        <Crown className="w-3.5 h-3.5" /> Đại diện
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 font-medium">
      <Users className="w-3.5 h-3.5" /> Ở cùng
    </span>
  );
}

function contractStatusLabel(status: ContractHistoryDto["trangThai"]) {
  if (status === "DANG_HIEU_LUC") {
    return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Đang hiệu lực</span>;
  }
  if (status === "DA_KET_THUC") {
    return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">Đã kết thúc</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Đã hủy</span>;
}

export function TenantDetail() {
  const { id } = useParams();
  const location = useLocation();
  const decodedId = id ? decodeURIComponent(id) : "";

  const [data, setData] = useState<TenantDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const incoming = (location.state as { successMessage?: string } | null)?.successMessage;
    if (!incoming) {
      return;
    }
    setSuccessMessage(incoming);
  }, [location.state]);

  useEffect(() => {
    if (!decodedId) {
      setError("Thiếu mã người thuê");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    apiFetch<TenantDetailResponse>(`/tenants/${encodeURIComponent(decodedId)}`)
      .then((res) => {
        if (!cancelled) {
          setData(res);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiResponseError
              ? err.message
              : "Không thể tải chi tiết người thuê. Vui lòng thử lại."
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
  }, [decodedId]);

  const tenant = data?.item;
  const activeContract = data?.lichSuHopDong.find((item) => item.trangThai === "DANG_HIEU_LUC") ?? null;

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <span>{successMessage}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Đang tải chi tiết người thuê...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {!loading && !error && tenant && data && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link to="/tenants" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                  {getInitials(tenant.hoTen)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{tenant.hoTen}</h1>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {activeContract ? (
                      <>
                        {activeContract.vaiTro === "DAI_DIEN" ? "Đại diện" : "Ở cùng"} · Phòng {activeContract.maNhaTro}
                      </>
                    ) : (
                      "Hiện không ở phòng nào"
                    )}
                  </p>
                </div>
              </div>
            </div>
            <Link to={`/tenants/${encodeURIComponent(decodedId)}/edit`}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5">Thông tin cá nhân</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Họ và tên</p>
                      <p className="text-sm font-semibold text-gray-900">{tenant.hoTen}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Số điện thoại</p>
                      <p className="text-sm font-medium text-gray-900">{tenant.soDienThoai}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      <p className="text-sm font-medium text-gray-900">{tenant.email ?? "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">CCCD/CMND</p>
                      <p className="text-sm font-medium text-gray-900">{tenant.cccd}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Ngày sinh</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(tenant.ngaySinh)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Địa chỉ</p>
                      <p className="text-sm font-medium text-gray-900">{tenant.diaChi ?? "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Ghi chú</p>
                      <p className="text-sm font-medium text-gray-900">{tenant.ghiChu ?? "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Lịch sử hợp đồng</h2>
                {data.lichSuHopDong.length === 0 ? (
                  <p className="text-sm text-gray-500">Người thuê chưa có hợp đồng.</p>
                ) : (
                  <div className="space-y-3">
                    {data.lichSuHopDong.map((contract) => (
                      <div key={contract.maHopDong} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="font-semibold text-gray-900">Hợp đồng {contract.maHopDong}</p>
                            <p className="text-sm text-gray-600 inline-flex items-center gap-1.5 mt-0.5">
                              <Home className="w-3.5 h-3.5" />
                              {contract.maNhaTro} - {contract.tenNhaTro}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {roleBadge(contract.vaiTro)}
                            {contractStatusLabel(contract.trangThai)}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(contract.ngayBatDau)} - {formatDate(contract.ngayKetThuc)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {(() => {
                const isOCung = activeContract?.vaiTro === "O_CUNG";
                return (
                  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6${isOCung ? " opacity-50 pointer-events-none select-none" : ""}`}>
                    <h2 className="text-base font-bold text-gray-900 mb-4">Công nợ</h2>
                    {isOCung ? (
                      <p className="text-sm text-gray-400 italic">Người ở cùng không có công nợ riêng.</p>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">Số hóa đơn chưa thanh toán</p>
                          <p className="text-lg font-bold text-orange-600">{data.congNo.soHoaDon}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Tổng nợ</p>
                          <p className="text-lg font-bold text-red-600">{formatCurrency(data.congNo.tongNo)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Hóa đơn gần đây</h2>
                {data.hoaDonGanDay.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có hóa đơn.</p>
                ) : (
                  <div className="space-y-3">
                    {data.hoaDonGanDay.map((invoice) => (
                      <div key={invoice.maHoaDon} className="border border-gray-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-gray-900">{invoice.maHoaDon}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          HĐ {invoice.maHopDong} · {String(invoice.thang).padStart(2, "0")}/{invoice.nam}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.tongTien)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${invoice.trangThai === "DA_THANH_TOAN" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                            {invoice.trangThai === "DA_THANH_TOAN" ? "Đã thanh toán" : "Chưa thanh toán"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
