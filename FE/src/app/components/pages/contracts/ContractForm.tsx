import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Info, Loader2, Plus, Save, X } from "lucide-react";
import { apiFetch, ApiResponseError } from "../../../../lib/api";

type ContractStatusApi = "DANG_HIEU_LUC" | "DA_KET_THUC" | "DA_HUY";
type TenantRoleApi = "DAI_DIEN" | "O_CUNG";
type TenantStayStatusApi = "DANG_O" | "DA_ROI";

interface RoomOptionDto {
  maNhaTro: string;
  tenNhaTro: string;
  diaChi: string;
  dienTich: number;
  giaThue: number;
  tienCoc: number;
  trangThai: "TRONG" | "DANG_THUE" | "BAO_TRI";
}

interface TenantOptionDto {
  maNguoiThue: string;
  hoTen: string;
  soDienThoai: string;
  cccd: string;
}

interface ContractItemDto {
  maHopDong: string;
  maNhaTro: string;
  maNguoiDaiDien: string;
  ngayBatDau: string;
  ngayKetThuc: string | null;
  tienThue: number;
  tienCoc: number;
  ghiChu: string | null;
  trangThai: ContractStatusApi;
}

interface ContractTenantDto {
  maNguoiThue: string;
  vaiTro: TenantRoleApi;
  trangThai: TenantStayStatusApi;
  ngayThamGia: string;
}

interface ContractDetailResponse {
  item: ContractItemDto;
  nguoiThue: ContractTenantDto[];
  hoaDon: Array<{ maHoaDon: string }>;
}

interface ContractOptionsResponse {
  rooms: RoomOptionDto[];
  tenants: TenantOptionDto[];
}

interface SelectedTenant {
  maNguoiThue: string;
  vaiTro: TenantRoleApi;
  ngayThamGia: string;
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function ContractForm() {
  const { id } = useParams();
  const decodedId = id ? decodeURIComponent(id) : undefined;
  const isEdit = !!decodedId;
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<RoomOptionDto[]>([]);
  const [tenants, setTenants] = useState<TenantOptionDto[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedRepresentativeId, setSelectedRepresentativeId] = useState("");
  const [selectedTenants, setSelectedTenants] = useState<SelectedTenant[]>([]);
  const [addTenantId, setAddTenantId] = useState("");
  const [hasInvoices, setHasInvoices] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    ngayBatDau: "",
    ngayKetThuc: "",
    tienThue: "",
    tienCoc: "",
    ghiChu: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const options = await apiFetch<ContractOptionsResponse>("/contracts/options");
      setRooms(options.rooms);
      setTenants(options.tenants);

      if (isEdit && decodedId) {
        const detail = await apiFetch<ContractDetailResponse>(`/contracts/${encodeURIComponent(decodedId)}`);
        const activeTenants = detail.nguoiThue.filter((item) => item.trangThai === "DANG_O");

        setSelectedRoomId(detail.item.maNhaTro);
        setSelectedRepresentativeId(detail.item.maNguoiDaiDien);
        setSelectedTenants(
          activeTenants.map((item) => ({
            maNguoiThue: item.maNguoiThue,
            vaiTro: item.vaiTro,
            ngayThamGia: item.ngayThamGia.slice(0, 10),
          }))
        );
        setForm({
          ngayBatDau: detail.item.ngayBatDau.slice(0, 10),
          ngayKetThuc: detail.item.ngayKetThuc ? detail.item.ngayKetThuc.slice(0, 10) : "",
          tienThue: String(detail.item.tienThue),
          tienCoc: String(detail.item.tienCoc),
          ghiChu: detail.item.ghiChu ?? "",
        });
        setHasInvoices(detail.hoaDon.length > 0);
      }
    } catch (err) {
      setError(err instanceof ApiResponseError ? err.message : "Không thể tải dữ liệu hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [isEdit, decodedId]);

  const selectedRoom = useMemo(
    () => rooms.find((item) => item.maNhaTro === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );

  useEffect(() => {
    if (!selectedRoom) {
      return;
    }

    if (!isEdit) {
      setForm((prev) => ({
        ...prev,
        tienThue: prev.tienThue || String(selectedRoom.giaThue),
        tienCoc: prev.tienCoc || String(selectedRoom.tienCoc),
      }));
    }
  }, [selectedRoom, isEdit]);

  const addTenantToContract = () => {
    if (!addTenantId || selectedTenants.some((item) => item.maNguoiThue === addTenantId)) {
      return;
    }

    setSelectedTenants((prev) => [
      ...prev,
      {
        maNguoiThue: addTenantId,
        vaiTro: "O_CUNG",
        ngayThamGia: form.ngayBatDau || new Date().toISOString().slice(0, 10),
      },
    ]);
    setAddTenantId("");
  };

  const pickRepresentative = (tenantId: string) => {
    setSelectedRepresentativeId(tenantId);
    setSelectedTenants((prev) => {
      const hasTenant = prev.some((item) => item.maNguoiThue === tenantId);
      const next = prev.map((item) => ({
        ...item,
        vaiTro: (item.maNguoiThue === tenantId ? "DAI_DIEN" : "O_CUNG") as TenantRoleApi,
      }));

      if (!hasTenant) {
        next.unshift({
          maNguoiThue: tenantId,
          vaiTro: "DAI_DIEN" as TenantRoleApi,
          ngayThamGia: form.ngayBatDau || new Date().toISOString().slice(0, 10),
        });
      }

      return next;
    });
  };

  const removeTenant = (tenantId: string) => {
    if (tenantId === selectedRepresentativeId) {
      return;
    }
    setSelectedTenants((prev) => prev.filter((item) => item.maNguoiThue !== tenantId));
  };

  const validate = (): string | null => {
    if (!selectedRoomId) {
      return "Vui lòng chọn phòng";
    }

    if (!selectedRepresentativeId) {
      return "Vui lòng chọn người đại diện";
    }

    if (selectedTenants.length === 0) {
      return "Hợp đồng phải có ít nhất một người thuê";
    }

    if (!selectedTenants.some((item) => item.maNguoiThue === selectedRepresentativeId)) {
      return "Người đại diện phải nằm trong danh sách người thuê";
    }

    if (!form.ngayBatDau) {
      return "Vui lòng chọn ngày bắt đầu";
    }

    if (form.ngayKetThuc && new Date(form.ngayKetThuc) < new Date(form.ngayBatDau)) {
      return "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu";
    }

    if (!form.tienThue || Number(form.tienThue) < 0) {
      return "Tiền thuê không hợp lệ";
    }

    if (!form.tienCoc || Number(form.tienCoc) < 0) {
      return "Tiền cọc không hợp lệ";
    }

    return null;
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) {
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      maNhaTro: selectedRoomId,
      maNguoiDaiDien: selectedRepresentativeId,
      ngayBatDau: form.ngayBatDau,
      ngayKetThuc: form.ngayKetThuc || null,
      tienThue: Number(form.tienThue),
      tienCoc: Number(form.tienCoc),
      ghiChu: form.ghiChu.trim() || null,
      nguoiThue: selectedTenants.map((item) => ({
        maNguoiThue: item.maNguoiThue,
        vaiTro: item.maNguoiThue === selectedRepresentativeId ? "DAI_DIEN" : "O_CUNG",
        ngayThamGia: item.ngayThamGia || form.ngayBatDau,
      })),
    };

    try {
      setSubmitting(true);
      setError(null);

      if (isEdit && decodedId) {
        await apiFetch(`/contracts/${encodeURIComponent(decodedId)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        navigate(`/contracts/${encodeURIComponent(decodedId)}`);
      } else {
        const res = await apiFetch<{ item: ContractItemDto }>("/contracts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        navigate(`/contracts/${encodeURIComponent(res.item.maHopDong)}`);
      }
    } catch (err) {
      setError(err instanceof ApiResponseError ? err.message : "Không thể lưu hợp đồng");
    } finally {
      setSubmitting(false);
    }
  };

  const availableAddTenants = tenants.filter(
    (tenant) => !selectedTenants.some((item) => item.maNguoiThue === tenant.maNguoiThue)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/contracts" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? "Chỉnh sửa hợp đồng" : "Tạo hợp đồng mới"}</h1>
          <p className="text-sm text-gray-500">Dữ liệu phòng và người thuê được lấy trực tiếp từ DB</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-500 py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          Đang tải dữ liệu...
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {!loading && (
        <form onSubmit={submitForm} className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">1. Thông tin phòng</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng</label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                disabled={isEdit && hasInvoices}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((room) => (
                  <option
                    key={room.maNhaTro}
                    value={room.maNhaTro}
                    disabled={room.trangThai !== "TRONG" && room.maNhaTro !== selectedRoomId}
                  >
                    {room.maNhaTro} - {room.tenNhaTro} ({room.trangThai})
                  </option>
                ))}
              </select>
              {isEdit && hasInvoices && (
                <p className="text-xs text-gray-500 mt-1">Hợp đồng đã có hóa đơn nên không thể đổi phòng.</p>
              )}
            </div>
            {selectedRoom && (
              <div className="text-sm bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1">
                <p><span className="text-gray-500">Địa chỉ:</span> {selectedRoom.diaChi}</p>
                <p><span className="text-gray-500">Diện tích:</span> {selectedRoom.dienTich} m2</p>
                <p><span className="text-gray-500">Giá thuê:</span> {formatCurrency(selectedRoom.giaThue)}/tháng</p>
                <p><span className="text-gray-500">Tiền cọc:</span> {formatCurrency(selectedRoom.tienCoc)}</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">2. Người thuê</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Người đại diện</label>
                <select
                  value={selectedRepresentativeId}
                  onChange={(e) => pickRepresentative(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">-- Chọn người đại diện --</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.maNguoiThue} value={tenant.maNguoiThue}>
                      {tenant.hoTen} - {tenant.soDienThoai}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thêm người ở cùng</label>
                <div className="flex gap-2">
                  <select
                    value={addTenantId}
                    onChange={(e) => setAddTenantId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">-- Chọn người thuê --</option>
                    {availableAddTenants.map((tenant) => (
                      <option key={tenant.maNguoiThue} value={tenant.maNguoiThue}>
                        {tenant.hoTen} - {tenant.soDienThoai}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={addTenantToContract} className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="px-3 py-2">Người thuê</th>
                    <th className="px-3 py-2">Vai trò</th>
                    <th className="px-3 py-2">Ngày tham gia</th>
                    <th className="px-3 py-2 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedTenants.map((item) => {
                    const tenant = tenants.find((t) => t.maNguoiThue === item.maNguoiThue);
                    return (
                      <tr key={item.maNguoiThue}>
                        <td className="px-3 py-2">
                          <p className="font-medium">{tenant?.hoTen ?? item.maNguoiThue}</p>
                          <p className="text-xs text-gray-500">{tenant?.soDienThoai} - {tenant?.cccd}</p>
                        </td>
                        <td className="px-3 py-2">{item.maNguoiThue === selectedRepresentativeId ? "Đại diện" : "Ở cùng"}</td>
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={item.ngayThamGia}
                            onChange={(e) =>
                              setSelectedTenants((prev) =>
                                prev.map((p) =>
                                  p.maNguoiThue === item.maNguoiThue ? { ...p, ngayThamGia: e.target.value } : p
                                )
                              )
                            }
                            className="px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeTenant(item.maNguoiThue)}
                            disabled={item.maNguoiThue === selectedRepresentativeId}
                            className="p-1 text-red-500 disabled:text-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {selectedTenants.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-gray-500">Chưa có người thuê trong hợp đồng</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              Người đại diện bắt buộc phải nằm trong danh sách người thuê theo SRS.
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">3. Thời gian và chi phí</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={form.ngayBatDau}
                  onChange={(e) => setForm((prev) => ({ ...prev, ngayBatDau: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, ngayBatDau: new Date().toISOString().slice(0, 10) }))}
                  className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full hover:bg-indigo-700"
                >
                  <Info className="w-3 h-3" />
                  Hôm nay: {new Date().toLocaleDateString("vi-VN")}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                <input
                  type="date"
                  value={form.ngayKetThuc}
                  onChange={(e) => setForm((prev) => ({ ...prev, ngayKetThuc: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiền thuê</label>
                <input
                  type="number"
                  min={0}
                  value={form.tienThue}
                  onChange={(e) => setForm((prev) => ({ ...prev, tienThue: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc</label>
                <input
                  type="number"
                  min={0}
                  value={form.tienCoc}
                  onChange={(e) => setForm((prev) => ({ ...prev, tienCoc: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <textarea
                rows={3}
                value={form.ghiChu}
                onChange={(e) => setForm((prev) => ({ ...prev, ghiChu: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link to="/contracts" className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Hủy</Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? "Cập nhật hợp đồng" : "Tạo hợp đồng"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
