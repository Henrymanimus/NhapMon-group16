import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Save, Info, AlertCircle, Loader2 } from "lucide-react";
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

interface TenantDetailResponse {
  item: TenantDto;
}

export function TenantForm() {
  const { id } = useParams();
  const decodedId = id ? decodeURIComponent(id) : undefined;
  const navigate = useNavigate();
  const isEdit = !!decodedId;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    idCard: "",
    dateOfBirth: "",
    address: "",
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !decodedId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSubmitError(null);

    apiFetch<TenantDetailResponse>(`/tenants/${encodeURIComponent(decodedId)}`)
      .then((data) => {
        if (cancelled) {
          return;
        }
        const tenant = data.item;
        setFormData({
          name: tenant.hoTen,
          phone: tenant.soDienThoai,
          email: tenant.email ?? "",
          idCard: tenant.cccd,
          dateOfBirth: tenant.ngaySinh ? tenant.ngaySinh.slice(0, 10) : "",
          address: tenant.diaChi ?? "",
          note: tenant.ghiChu ?? "",
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setSubmitError(
            err instanceof ApiResponseError
              ? err.message
              : "Không thể tải thông tin người thuê. Vui lòng thử lại."
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
  }, [isEdit, decodedId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ và tên";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9]{9,12}$/.test(formData.phone)) newErrors.phone = "Số điện thoại phải có 9-12 chữ số";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    if (!formData.idCard.trim()) newErrors.idCard = "Vui lòng nhập CCCD/CMND";
    else if (!/^[0-9]{9,12}$/.test(formData.idCard)) newErrors.idCard = "CCCD/CMND phải có 9-12 chữ số";
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ thường trú";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        hoTen: formData.name.trim(),
        soDienThoai: formData.phone.trim(),
        cccd: formData.idCard.trim(),
        email: formData.email.trim() || null,
        ngaySinh: formData.dateOfBirth || null,
        diaChi: formData.address.trim() || null,
        ghiChu: formData.note.trim() || null,
      };

      if (isEdit && decodedId) {
        await apiFetch<{ item: TenantDto }>(`/tenants/${encodeURIComponent(decodedId)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        navigate(`/tenants/${encodeURIComponent(decodedId)}`, {
          replace: true,
          state: { successMessage: "Cập nhật người thuê thành công" },
        });
      } else {
        await apiFetch<{ item: TenantDto }>("/tenants", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        navigate("/tenants", {
          replace: true,
          state: { successMessage: "Tạo người thuê thành công" },
        });
      }
    } catch (err) {
      setSubmitError(
        err instanceof ApiResponseError
          ? err.message
          : "Không thể lưu người thuê. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 border ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors`;

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải dữ liệu người thuê...</span>
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link to="/tenants" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Chỉnh sửa người thuê" : "Thêm người thuê mới"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? "Cập nhật thông tin cá nhân người thuê" : "Điền thông tin cá nhân người thuê mới"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Lưu ý về gán phòng</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Người thuê <strong>không được gán phòng trực tiếp</strong> tại đây.
            Việc gán phòng, vai trò (Đại diện / Ở cùng) và trạng thái cư trú
            sẽ được thực hiện khi <Link to="/contracts/new" className="underline font-semibold">tạo hợp đồng</Link>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">1</span>
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className={inputClass("name")} placeholder="VD: Nguyễn Văn A" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                  className={inputClass("phone")} placeholder="VD: 0901234567" />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className={inputClass("email")} placeholder="VD: email@example.com" />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  CCCD/CMND <span className="text-red-500">*</span>
                </label>
                <input type="text" name="idCard" value={formData.idCard} onChange={handleChange}
                  className={inputClass("idCard")} placeholder="VD: 079123456789" />
                {errors.idCard && <p className="mt-1 text-xs text-red-500">{errors.idCard}</p>}
                {isEdit && (
                  <p className="mt-1 text-xs text-gray-500">
                    Nếu người thuê đã tham gia hợp đồng, hệ thống sẽ không cho đổi CCCD.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày sinh</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                  className={inputClass("dateOfBirth")} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">2</span>
              Địa chỉ và ghi chú
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Địa chỉ thường trú <span className="text-red-500">*</span>
                </label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                  className={`${inputClass("address")} resize-none`}
                  placeholder="VD: 123 Đường Lê Lợi, Quận 1, TP.HCM" />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
                <textarea name="note" value={formData.note} onChange={handleChange} rows={3}
                  className={`${inputClass("note")} resize-none`}
                  placeholder="Thông tin bổ sung (nếu có)" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link to="/tenants" className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              Hủy
            </Link>
            <button type="submit" disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSubmitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
