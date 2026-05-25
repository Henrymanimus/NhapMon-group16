import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Info, AlertCircle, Loader2 } from "lucide-react";
import { apiFetch, ApiResponseError } from "../../../../lib/api";

type RoomStatusApi = "TRONG" | "BAO_TRI" | "DANG_THUE";

interface RoomDto {
  maNhaTro: string;
  tenNhaTro: string;
  diaChi: string;
  dienTich: number;
  giaThue: number;
  tienCoc: number;
  moTa: string | null;
  tienNghi: string | null;
  trangThai: RoomStatusApi;
}

const STATUS_TO_LABEL: Record<Exclude<RoomStatusApi, "DANG_THUE">, "Trống" | "Bảo trì"> = {
  TRONG: "Trống",
  BAO_TRI: "Bảo trì",
};

const LABEL_TO_STATUS: Record<"Trống" | "Bảo trì", Exclude<RoomStatusApi, "DANG_THUE">> = {
  "Trống": "TRONG",
  "Bảo trì": "BAO_TRI",
};

export function RoomForm() {
  const { id } = useParams();
  const decodedId = id ? decodeURIComponent(id) : undefined;
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    area: "",
    price: "",
    deposit: "",
    // "Đang thuê" is auto-determined by active contract; only Trống/Bảo trì can be set manually
    status: "Trống",
    description: "",
    amenities: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSubmitError(null);

    if (isEdit && decodedId) {
      apiFetch<{ item: RoomDto }>(`/rooms/${encodeURIComponent(decodedId)}`)
        .then((data) => {
          if (cancelled) {
            return;
          }
          const dto = data.item;
          setFormData({
            code: dto.maNhaTro,
            name: dto.tenNhaTro,
            address: dto.diaChi,
            area: String(dto.dienTich),
            price: String(dto.giaThue),
            deposit: String(dto.tienCoc),
            status: dto.trangThai === "BAO_TRI" ? STATUS_TO_LABEL.BAO_TRI : STATUS_TO_LABEL.TRONG,
            description: dto.moTa ?? "",
            amenities: dto.tienNghi ?? "",
          });
        })
        .catch((err) => {
          if (!cancelled) {
            setSubmitError(
              err instanceof ApiResponseError
                ? err.message
                : "Không thể tải thông tin phòng. Vui lòng thử lại."
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    } else {
      apiFetch<{ nextCode: string }>("/rooms/code/next")
        .then((data) => {
          if (cancelled) {
            return;
          }
          setFormData((prev) => ({ ...prev, code: data.nextCode }));
        })
        .catch((err) => {
          if (!cancelled) {
            setSubmitError(
              err instanceof ApiResponseError
                ? err.message
                : "Không thể tải mã phòng tự động. Vui lòng thử lại."
            );
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [isEdit, decodedId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên phòng";
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!formData.area.trim()) newErrors.area = "Vui lòng nhập diện tích";
    else if (isNaN(Number(formData.area)) || Number(formData.area) <= 0)
      newErrors.area = "Diện tích phải là số dương";
    if (!formData.price.trim()) newErrors.price = "Vui lòng nhập giá thuê";
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0)
      newErrors.price = "Giá thuê phải là số dương";
    if (!formData.deposit.trim()) newErrors.deposit = "Vui lòng nhập tiền cọc";
    else if (isNaN(Number(formData.deposit)) || Number(formData.deposit) < 0)
      newErrors.deposit = "Tiền cọc phải là số không âm";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (isEdit && decodedId) {
        await apiFetch<{ item: RoomDto }>(`/rooms/${encodeURIComponent(decodedId)}`, {
          method: "PUT",
          body: JSON.stringify({
            tenNhaTro: formData.name.trim(),
            diaChi: formData.address.trim(),
            dienTich: Number(formData.area),
            giaThue: Number(formData.price),
            tienCoc: Number(formData.deposit),
            moTa: formData.description.trim() || null,
            tienNghi: formData.amenities.trim() || null,
            trangThai: LABEL_TO_STATUS[formData.status as "Trống" | "Bảo trì"],
          }),
        });
      } else {
        const roomPayload: Record<string, unknown> = {
          tenNhaTro: formData.name.trim(),
          diaChi: formData.address.trim(),
          dienTich: Number(formData.area),
          giaThue: Number(formData.price),
          tienCoc: Number(formData.deposit),
          moTa: formData.description.trim() || null,
          tienNghi: formData.amenities.trim() || null,
          trangThai: LABEL_TO_STATUS[formData.status as "Trống" | "Bảo trì"],
        };

        if (formData.code.trim()) {
          roomPayload.maNhaTro = formData.code.trim();
        }

        await apiFetch<{ item: RoomDto }>("/rooms", {
          method: "POST",
          body: JSON.stringify(roomPayload),
        });
      }

      navigate("/rooms");
    } catch (err) {
      setSubmitError(
        err instanceof ApiResponseError
          ? err.message
          : "Không thể lưu phòng. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: string, disabled = false) =>
    `w-full px-4 py-2.5 border ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}`;

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải dữ liệu phòng...</span>
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/rooms" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Chỉnh sửa phòng trọ" : "Thêm phòng mới"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? "Cập nhật thông tin phòng trọ" : "Điền đầy đủ thông tin phòng trọ mới"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="space-y-6">

          {/* ── Section 1: Thông tin cơ bản ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">1</span>
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Mã phòng */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mã phòng <span className="text-red-500">*</span>
                </label>
                <input type="text" name="code" value={formData.code}
                  readOnly
                  disabled
                  className={inputClass("code", true)}
                  placeholder="Mã phòng tự động"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mã phòng sẽ được cấp tự động theo định dạng <span className="font-semibold">NT001, NT002, NT003...</span>
                </p>
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
              </div>

              {/* Tên phòng */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên phòng <span className="text-red-500">*</span>
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className={inputClass("name")} placeholder="VD: Phòng A101" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Trạng thái
                </label>
                <select name="status" value={formData.status} onChange={handleChange}
                  className={inputClass("status")}>
                  <option value="Trống">Trống</option>
                  <option value="Bảo trì">Bảo trì</option>
                </select>
                <div className="mt-1.5 flex items-start gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>"Đang thuê" được tự động xác định khi có hợp đồng còn hiệu lực</span>
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="md:col-span-2 lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input type="text" name="address" value={formData.address} onChange={handleChange}
                  className={inputClass("address")} placeholder="VD: Tầng 1, Khu A, 123 Đường ABC, Quận 1, TP.HCM" />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>

              {/* Diện tích */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Diện tích (m²) <span className="text-red-500">*</span>
                </label>
                <input type="text" name="area" value={formData.area} onChange={handleChange}
                  className={inputClass("area")} placeholder="VD: 25" />
                {errors.area && <p className="mt-1 text-xs text-red-500">{errors.area}</p>}
              </div>
            </div>
          </div>

          {/* ── Section 2: Thông tin giá ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">2</span>
              Thông tin giá
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Giá thuê */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Giá thuê (VNĐ/tháng) <span className="text-red-500">*</span>
                </label>
                <input type="text" name="price" value={formData.price} onChange={handleChange}
                  className={inputClass("price")} placeholder="VD: 4500000" />
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                {formData.price && !errors.price && (
                  <p className="mt-1 text-xs text-green-600 font-medium">
                    → {Number(formData.price).toLocaleString("vi-VN")} VNĐ
                  </p>
                )}
              </div>

              {/* Tiền cọc */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tiền cọc (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input type="text" name="deposit" value={formData.deposit} onChange={handleChange}
                  className={inputClass("deposit")} placeholder="VD: 9000000" />
                {errors.deposit && <p className="mt-1 text-xs text-red-500">{errors.deposit}</p>}
                {formData.deposit && !errors.deposit && (
                  <p className="mt-1 text-xs text-green-600 font-medium">
                    → {Number(formData.deposit).toLocaleString("vi-VN")} VNĐ
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 3: Thông tin bổ sung ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">3</span>
              Thông tin bổ sung
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả phòng</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  placeholder="Mô tả chi tiết về phòng (vị trí, đặc điểm nổi bật...)..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiện nghi</label>
                <textarea name="amenities" value={formData.amenities} onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  placeholder="VD: Máy lạnh, Giường đôi, Tủ quần áo, WiFi (phân cách bằng dấu phẩy)" />
                <p className="mt-1 text-xs text-gray-400">Phân cách các tiện nghi bằng dấu phẩy</p>
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-end gap-3">
            <Link to="/rooms" className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Hủy bỏ
            </Link>
            <button type="submit"
              disabled={loading || isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <Save className="w-4 h-4" />
              {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật phòng" : "Thêm phòng"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
