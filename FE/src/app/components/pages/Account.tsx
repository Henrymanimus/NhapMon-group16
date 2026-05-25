import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Lock, Save, Camera, Eye, EyeOff } from "lucide-react";
import { apiFetch, ApiResponseError } from "../../../lib/api";
import { getAuthUser, saveAuth, getToken, type AuthUser } from "../../../lib/auth";

export function Account() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordVisible, setPasswordVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load profile on mount
  useEffect(() => {
    apiFetch<{ chuTro: AuthUser }>("/auth/me")
      .then(({ chuTro }) => {
        setFormData({
          name: chuTro.hoTen ?? "",
          email: chuTro.email ?? "",
          phone: chuTro.soDienThoai ?? "",
          address: chuTro.diaChi ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email không hợp lệ";
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại phải có 10 chữ số";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = "Vui lòng nhập mật khẩu cũ";
    if (!passwordData.newPassword) newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (passwordData.newPassword.length < 6)
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    if (passwordData.newPassword !== passwordData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setSaving(true);
    setApiError("");
    try {
      const { chuTro } = await apiFetch<{ chuTro: AuthUser }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          hoTen: formData.name,
          email: formData.email || null,
          soDienThoai: formData.phone || null,
          diaChi: formData.address || null,
        }),
      });
      // Update localStorage so header/avatar reflects new name immediately
      const token = getToken()!;
      saveAuth(token, chuTro);
      setIsEditing(false);
      setSuccessMsg("Đã cập nhật thông tin thành công");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setApiError(err instanceof ApiResponseError ? err.message : "Lỗi khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    setChangingPw(true);
    setApiError("");
    try {
      await apiFetch("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({
          matKhauCu: passwordData.currentPassword,
          matKhauMoi: passwordData.newPassword,
        }),
      });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordVisible({ currentPassword: false, newPassword: false, confirmPassword: false });
      setErrors({});
      setSuccessMsg("Đổi mật khẩu thành công");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        currentPassword: err instanceof ApiResponseError && err.code === "WRONG_PASSWORD"
          ? "Mật khẩu cũ không đúng"
          : "",
      }));
      if (!(err instanceof ApiResponseError && err.code === "WRONG_PASSWORD")) {
        setApiError(err instanceof ApiResponseError ? err.message : "Lỗi khi đổi mật khẩu");
      }
    } finally {
      setChangingPw(false);
    }
  };

  const initials = formData.name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const authUser = getAuthUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Đang tải thông tin...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tài khoản chủ trọ</h1>
        <p className="text-gray-500 mt-1">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMsg}
        </div>
      )}
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Thông tin cá nhân</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setErrors({}); setApiError(""); }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                {isEditing ? (
                  <>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </>
                ) : (
                  <p className="font-medium text-gray-900">{formData.name || "—"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1 text-gray-400" />Email
                </label>
                {isEditing ? (
                  <>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </>
                ) : (
                  <p className="font-medium text-gray-900">{formData.email || "—"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-1 text-gray-400" />Số điện thoại
                </label>
                {isEditing ? (
                  <>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                      className={`w-full px-4 py-2 border ${errors.phone ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                  </>
                ) : (
                  <p className="font-medium text-gray-900">{formData.phone || "—"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1 text-gray-400" />Địa chỉ
                </label>
                {isEditing ? (
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                ) : (
                  <p className="font-medium text-gray-900">{formData.address || "—"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Bảo mật</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Mật khẩu</p>
                    <p className="text-sm text-gray-500">••••••••</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPasswordModal(true);
                    setPasswordVisible({ currentPassword: false, newPassword: false, confirmPassword: false });
                    setApiError("");
                    setErrors({});
                  }}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Avatar & Info */}
        <div className="space-y-6">
          {/* Avatar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ảnh đại diện</h2>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                {initials || <User className="w-12 h-12" />}
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed" disabled>
                <Camera className="w-5 h-5" />
                Thay đổi ảnh
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin tài khoản</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tên đăng nhập</span>
                <span className="font-bold text-gray-900">{authUser?.tenDangNhap ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mã chủ trọ</span>
                <span className="font-mono text-sm text-gray-500">{authUser?.maChuTro ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white/95 rounded-xl p-6 max-w-md w-full shadow-xl border border-white/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Đổi mật khẩu</h3>
                <p className="text-sm text-gray-500">Cập nhật mật khẩu của bạn</p>
              </div>
            </div>

            {apiError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {apiError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input type={passwordVisible.currentPassword ? "text" : "password"} name="currentPassword" value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 pr-10 border ${errors.currentPassword ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((prev) => ({ ...prev, currentPassword: !prev.currentPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={passwordVisible.currentPassword ? "Ẩn mật khẩu hiện tại" : "Hiện mật khẩu hiện tại"}
                  >
                    {passwordVisible.currentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <input type={passwordVisible.newPassword ? "text" : "password"} name="newPassword" value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 pr-10 border ${errors.newPassword ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={passwordVisible.newPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                  >
                    {passwordVisible.newPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input type={passwordVisible.confirmPassword ? "text" : "password"} name="confirmPassword" value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 pr-10 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={passwordVisible.confirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                  >
                    {passwordVisible.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setPasswordVisible({ currentPassword: false, newPassword: false, confirmPassword: false });
                  setErrors({});
                  setApiError("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                disabled={changingPw}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {changingPw ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
