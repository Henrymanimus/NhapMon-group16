import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Edit,
  FileText,
  Home,
  Loader2,
  Phone,
  Receipt,
  Trash2,
  UserMinus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { API_BASE_URL, apiFetch, ApiResponseError, getAuthHeaders } from "../../../../lib/api";
import { getAuthUser } from "../../../../lib/auth";

type ContractStatusApi = "DANG_HIEU_LUC" | "DA_KET_THUC" | "DA_HUY";
type TenantRoleApi = "DAI_DIEN" | "O_CUNG";
type TenantStayStatusApi = "DANG_O" | "DA_ROI";

interface ContractItemDto {
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
  ghiChu: string | null;
  trangThai: ContractStatusApi;
  daKy: boolean;
  ngayKy: string | null;
  soNguoiThue: number;
  soHoaDon: number;
  soHoaDonChuaThanhToan: number;
}

interface ContractTenantDto {
  maNguoiThue: string;
  hoTen: string;
  soDienThoai: string;
  cccd: string;
  vaiTro: TenantRoleApi;
  ngayThamGia: string;
  ngayRoiDi: string | null;
  trangThai: TenantStayStatusApi;
}

interface ContractInvoiceDto {
  maHoaDon: string;
  thang: number;
  nam: number;
  tongTien: number;
  trangThai: "CHUA_THANH_TOAN" | "DA_THANH_TOAN";
  hanThanhToan: string | null;
}

interface ContractDetailResponse {
  item: ContractItemDto;
  nguoiThue: ContractTenantDto[];
  hoaDon: ContractInvoiceDto[];
  congNo: {
    tongNo: number;
  };
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

function statusLabel(status: ContractStatusApi): string {
  if (status === "DANG_HIEU_LUC") {
    return "Đang hiệu lực";
  }
  if (status === "DA_KET_THUC") {
    return "Đã kết thúc";
  }
  return "Đã hủy";
}

function roleLabel(role: TenantRoleApi): string {
  return role === "DAI_DIEN" ? "Đại diện" : "Ở cùng";
}

function stayStatusLabel(status: TenantStayStatusApi): string {
  return status === "DANG_O" ? "Đang ở" : "Đã rời";
}

export function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const decodedId = id ? decodeURIComponent(id) : "";
  const [data, setData] = useState<ContractDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [terminateDate, setTerminateDate] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [signConfirmOpen, setSignConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const authUser = useMemo(() => getAuthUser(), []);

  const loadData = async () => {
    if (!decodedId) {
      setError("Thiếu mã hợp đồng");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ContractDetailResponse>(`/contracts/${encodeURIComponent(decodedId)}`);
      setData(res);
    } catch (err) {
      setError(err instanceof ApiResponseError ? err.message : "Không thể tải chi tiết hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [decodedId]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const representative = useMemo(
    () => data?.nguoiThue.find((item) => item.vaiTro === "DAI_DIEN") ?? null,
    [data]
  );

  const coTenants = useMemo(
    () => data?.nguoiThue.filter((item) => item.vaiTro === "O_CUNG") ?? [],
    [data]
  );

  const terminateContract = async (ngayKetThuc: string) => {
    if (!data?.item || busy) {
      return;
    }

    try {
      setBusy(true);
      await apiFetch(`/contracts/${encodeURIComponent(data.item.maHopDong)}/terminate`, {
        method: "POST",
        body: JSON.stringify({ ngayKetThuc }),
      });
      setTerminateDate(null);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiResponseError ? err.message : "Không thể kết thúc hợp đồng");
    } finally {
      setBusy(false);
    }
  };

  const deleteContract = async () => {
    if (!data?.item || busy) {
      return;
    }

    try {
      setBusy(true);
      await apiFetch(`/contracts/${encodeURIComponent(data.item.maHopDong)}`, {
        method: "DELETE",
      });
      setDeleteConfirmOpen(false);
      navigate("/contracts");
    } catch (err) {
      setError(err instanceof ApiResponseError ? err.message : "Không thể xóa hợp đồng");
    } finally {
      setBusy(false);
    }
  };

  const confirmContractSigning = async () => {
    if (!data?.item || busy) {
      return;
    }

    try {
      setBusy(true);
      await apiFetch(`/contracts/${encodeURIComponent(data.item.maHopDong)}/sign`, {
        method: "POST",
      });
      setSignConfirmOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiResponseError ? err.message : "Không thể xác nhận ký hợp đồng");
    } finally {
      setBusy(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const openContractPreview = async () => {
    if (!data?.item || previewLoading) {
      return;
    }

    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/contracts/${encodeURIComponent(data.item.maHopDong)}/preview.pdf`,
        { headers: getAuthHeaders() }
      );

      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const body = await res.json();
          message = body?.error?.message ?? message;
        } catch {
          // ignore parse error
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Khong the tai preview hop dong");
    } finally {
      setPreviewLoading(false);
    }
  };

  const markTenantLeft = async (maNguoiThue: string) => {
    if (!data?.item || busy) {
      return;
    }

    try {
      setBusy(true);
      await apiFetch(
        `/contracts/${encodeURIComponent(data.item.maHopDong)}/tenants/${encodeURIComponent(maNguoiThue)}/leave`,
        {
          method: "POST",
          body: JSON.stringify({ ngayRoiDi: new Date().toISOString().slice(0, 10) }),
        }
      );
      await loadData();
    } catch (err) {
      setError(err instanceof ApiResponseError ? err.message : "Không thể cập nhật trạng thái người thuê");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/contracts" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết hợp đồng</h1>
            {data?.item && <p className="text-sm text-gray-500">Mã hợp đồng: {data.item.maHopDong}</p>}
          </div>
        </div>

        {data?.item && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => !data.item.daKy && setDeleteConfirmOpen(true)}
              disabled={data.item.daKy || busy}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                data.item.daKy
                  ? "border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
              }`}
              title={data.item.daKy ? "Hợp đồng đã xác nhận ký nên không thể xóa" : "Xóa hợp đồng"}
            >
              <Trash2 className="w-4 h-4" />
              Xóa hợp đồng
            </button>
            {data.item.daKy ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 bg-gray-100 text-gray-400 rounded-lg text-sm cursor-not-allowed"
                title="Hợp đồng đã xác nhận ký nên không thể chỉnh sửa"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </button>
            ) : (
              <Link
                to={`/contracts/${encodeURIComponent(data.item.maHopDong)}/edit`}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </Link>
            )}
            {data.item.trangThai === "DANG_HIEU_LUC" && (
              <button
                type="button"
                onClick={() => setTerminateDate(new Date().toISOString().slice(0, 10))}
                disabled={busy}
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" />
                Kết thúc
              </button>
            )}
          </div>
        )}
      </div>

      {previewOpen && data?.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div className="absolute inset-0 bg-black/50" onClick={closePreview} />
          <div
            className="relative bg-white rounded-xl shadow-xl flex flex-col overflow-hidden"
            style={{
              width: "min(96vw, 1440px)",
              height: "calc(100vh - 200px)",
              minWidth: "1100px",
              minHeight: "560px",
            }}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">Preview Hợp đồng</h3>
                <p className="text-xs text-gray-500">{data.item.maHopDong}</p>
              </div>
              <div className="flex items-center gap-2">
                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Mở PDF
                  </a>
                )}
                <button
                  type="button"
                  onClick={closePreview}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="Đóng preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100">
              {previewLoading && (
                <div className="h-full flex items-center justify-center gap-2 text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang tải PDF...
                </div>
              )}
              {!previewLoading && previewError && (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {previewError}
                  </div>
                </div>
              )}
              {!previewLoading && !previewError && previewUrl && (
                <iframe
                  title="Preview hợp đồng PDF"
                  src={`${previewUrl}#toolbar=1&navpanes=0&zoom=page-width`}
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {deleteConfirmOpen && data?.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirmOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Xóa hợp đồng</h3>
              <p className="text-sm text-gray-500 mt-1">{data.item.maHopDong}</p>
            </div>
            <p className="text-sm leading-6 text-gray-700">
              Bạn có chắc muốn xóa hợp đồng này khỏi DB không? Các hóa đơn liên quan đến hợp đồng này cũng sẽ bị xóa.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void deleteContract()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-60"
                disabled={busy}
              >
                {busy ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {signConfirmOpen && data?.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSignConfirmOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Xác nhận ký hợp đồng</h3>
              <p className="text-sm text-gray-500 mt-1">{data.item.maHopDong}</p>
            </div>
            <p className="text-sm leading-6 text-gray-700">
              Bên cho thuê <span className="font-semibold text-gray-900">{authUser?.hoTen ?? "chủ trọ"}</span> và bên thuê{" "}
              <span className="font-semibold text-gray-900">{data.item.tenNguoiDaiDien}</span> đã ký hợp đồng chưa?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSignConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmContractSigning()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-60"
                disabled={busy}
              >
                {busy ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {terminateDate !== null && data?.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setTerminateDate(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Kết thúc hợp đồng {data.item.maHopDong}</h3>
            <p className="text-sm text-gray-600">
              Phòng: <span className="font-medium">{data.item.maNhaTro} - {data.item.tenNhaTro}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc thực tế</label>
              <input
                type="date"
                value={terminateDate}
                min={data.item.ngayBatDau.slice(0, 10)}
                onChange={(e) => setTerminateDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setTerminateDate(new Date().toISOString().slice(0, 10))}
                className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full hover:bg-indigo-700"
              >
                <Calendar className="w-3 h-3" />
                Hôm nay: {new Date().toLocaleDateString("vi-VN")}
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTerminateDate(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={busy}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => terminateDate && void terminateContract(terminateDate)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-60"
                disabled={busy || !terminateDate}
              >
                {busy ? "Đang xử lý..." : "Xác nhận kết thúc"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Đang tải chi tiết hợp đồng...
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {!loading && !error && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-base font-bold text-gray-900">Thông tin hợp đồng</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openContractPreview}
                    disabled={previewLoading}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-sm disabled:opacity-60"
                  >
                    <FileText className="w-4 h-4" />
                    Preview Hợp đồng
                  </button>
                  {data.item.daKy ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 px-3 py-2 border border-green-200 bg-green-50 text-green-700 rounded-lg text-sm cursor-not-allowed"
                      title={data.item.ngayKy ? `Đã xác nhận ký ngày ${formatDate(data.item.ngayKy)}` : "Đã xác nhận ký"}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Đã ký
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSignConfirmOpen(true)}
                      disabled={busy}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-60"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Xác nhận ký
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Trạng thái</p>
                  <p className="font-semibold">{statusLabel(data.item.trangThai)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Xác nhận ký</p>
                  <p className={data.item.daKy ? "font-semibold text-green-700" : "font-semibold text-gray-700"}>
                    {data.item.daKy ? `Đã ký${data.item.ngayKy ? ` - ${formatDate(data.item.ngayKy)}` : ""}` : "Chưa ký"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Người đại diện</p>
                  <p className="font-semibold">{data.item.tenNguoiDaiDien}</p>
                  <p className="text-gray-500 text-xs">{data.item.soDienThoaiNguoiDaiDien}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ngày bắt đầu</p>
                  <p className="font-semibold">{formatDate(data.item.ngayBatDau)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ngày kết thúc</p>
                  <p className="font-semibold">{formatDate(data.item.ngayKetThuc)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tiền thuê</p>
                  <p className="font-semibold">{formatCurrency(data.item.tienThue)}/tháng</p>
                </div>
                <div>
                  <p className="text-gray-500">Tiền cọc</p>
                  <p className="font-semibold">{formatCurrency(data.item.tienCoc)}</p>
                </div>
              </div>
              {data.item.ghiChu && (
                <div className="mt-4 text-sm">
                  <p className="text-gray-500">Ghi chú</p>
                  <p className="text-gray-700">{data.item.ghiChu}</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Người thuê trong hợp đồng</h2>
              <div className="space-y-2">
                {representative && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="font-semibold text-blue-700">{representative.hoTen} (Đại diện)</p>
                    <p className="text-sm text-gray-600">{representative.soDienThoai} - {representative.cccd}</p>
                  </div>
                )}
                {coTenants.map((tenant) => (
                  <div key={tenant.maNguoiThue} className="p-3 rounded-lg border border-gray-200 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{tenant.hoTen}</p>
                      <p className="text-sm text-gray-500">
                        {tenant.soDienThoai} - {tenant.cccd} - {roleLabel(tenant.vaiTro)} - {stayStatusLabel(tenant.trangThai)}
                      </p>
                    </div>
                    {data.item.trangThai === "DANG_HIEU_LUC" && tenant.trangThai === "DANG_O" && (
                      <button
                        type="button"
                        onClick={() => markTenantLeft(tenant.maNguoiThue)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-orange-300 text-orange-700 rounded-lg"
                        disabled={busy}
                      >
                        <UserMinus className="w-3 h-3" />
                        Đã rời
                      </button>
                    )}
                  </div>
                ))}
                {data.nguoiThue.length === 0 && <p className="text-sm text-gray-500">Chưa có người thuê trong hợp đồng.</p>}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Hóa đơn liên quan</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                      <th className="py-2 pr-2">Mã hóa đơn</th>
                      <th className="py-2 pr-2">Kỳ</th>
                      <th className="py-2 pr-2 text-right">Tổng tiền</th>
                      <th className="py-2 pr-2">Hạn thanh toán</th>
                      <th className="py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.hoaDon.map((invoice) => (
                      <tr key={invoice.maHoaDon}>
                        <td className="py-2 pr-2 font-semibold text-blue-700">{invoice.maHoaDon}</td>
                        <td className="py-2 pr-2">{String(invoice.thang).padStart(2, "0")}/{invoice.nam}</td>
                        <td className="py-2 pr-2 text-right">{formatCurrency(invoice.tongTien)}</td>
                        <td className="py-2 pr-2">{formatDate(invoice.hanThanhToan)}</td>
                        <td className="py-2">
                          {invoice.trangThai === "DA_THANH_TOAN" ? (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Đã thanh toán</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700">Chưa thanh toán</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {data.hoaDon.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">Chưa phát sinh hóa đơn</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">Phòng</h3>
              <p className="text-sm text-gray-500 mb-1">Mã phòng</p>
              <p className="font-mono font-semibold text-blue-700">{data.item.maNhaTro}</p>
              <p className="text-sm text-gray-500 mt-3 mb-1">Tên phòng</p>
              <p className="font-medium">{data.item.tenNhaTro}</p>
              <Link to={`/rooms/${encodeURIComponent(data.item.maNhaTro)}`} className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600">
                <Home className="w-4 h-4" />Xem chi tiết phòng
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-3">Tóm tắt</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Số người thuê</span><span>{data.item.soNguoiThue}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Số hóa đơn</span><span>{data.item.soHoaDon}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Hóa đơn chưa thanh toán</span><span>{data.item.soHoaDonChuaThanhToan}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Công nợ</span><span className="font-semibold text-red-600">{formatCurrency(data.congNo.tongNo)}</span></div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> Người đại diện phải nằm trong danh sách người thuê</div>
              <div className="flex items-center gap-2"><Receipt className="w-4 h-4 text-gray-400" /> Hóa đơn được gắn theo hợp đồng</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> Trạng thái phòng đồng bộ theo trạng thái hợp đồng</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> Cập nhật dữ liệu trực tiếp từ DB</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
