import { useState } from "react";
import { useNavigate } from "react-router";
import { Home, Lock, User, Eye, EyeOff, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { saveAuth } from "../../../lib/auth";
import { apiFetch, ApiResponseError } from "../../../lib/api";

const emptyRegisterForm = {
  hoTen: "",
  email: "",
  soDienThoai: "",
  tenDangNhap: "",
  matKhau: "",
  xacNhanMatKhau: "",
};

const emptyRegisterErrors = {
  hoTen: "",
  email: "",
  soDienThoai: "",
  tenDangNhap: "",
  matKhau: "",
  xacNhanMatKhau: "",
};

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [forgotStage, setForgotStage] = useState<"request" | "verify" | "reset">("request");
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotEmailMasked, setForgotEmailMasked] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotErrors, setForgotErrors] = useState({ identifier: "", otp: "", newPassword: "", confirmPassword: "" });
  const [forgotSubmitError, setForgotSubmitError] = useState("");
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState("");
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [registerErrors, setRegisterErrors] = useState(emptyRegisterErrors);
  const [registerSubmitError, setRegisterSubmitError] = useState("");
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const resetForgotState = () => {
    setForgotStage("request");
    setForgotIdentifier("");
    setForgotEmailMasked("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setShowForgotNewPassword(false);
    setShowForgotConfirmPassword(false);
    setForgotErrors({ identifier: "", otp: "", newPassword: "", confirmPassword: "" });
    setForgotSubmitError("");
    setForgotSuccessMessage("");
    setIsSubmittingForgot(false);
  };

  const resetRegisterState = () => {
    setRegisterForm(emptyRegisterForm);
    setRegisterErrors(emptyRegisterErrors);
    setRegisterSubmitError("");
    setIsSubmittingRegister(false);
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
  };

  const updateRegisterField = (field: keyof typeof emptyRegisterForm, value: string) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
    setRegisterErrors((prev) => ({ ...prev, [field]: "" }));
    setRegisterSubmitError("");
  };

  const validateRegisterForm = () => {
    const nextErrors = { ...emptyRegisterErrors };
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!registerForm.hoTen.trim()) {
      nextErrors.hoTen = "Vui lòng nhập họ tên";
    }
    if (!registerForm.email.trim()) {
      nextErrors.email = "Vui lòng nhập email";
    } else if (!emailPattern.test(registerForm.email.trim())) {
      nextErrors.email = "Email không hợp lệ";
    }
    if (!registerForm.soDienThoai.trim()) {
      nextErrors.soDienThoai = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(registerForm.soDienThoai.trim())) {
      nextErrors.soDienThoai = "Số điện thoại phải có 10 chữ số";
    }
    if (!registerForm.tenDangNhap.trim()) {
      nextErrors.tenDangNhap = "Vui lòng nhập tên đăng nhập";
    }
    if (!registerForm.matKhau) {
      nextErrors.matKhau = "Vui lòng nhập mật khẩu";
    } else if (registerForm.matKhau.length < 6) {
      nextErrors.matKhau = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!registerForm.xacNhanMatKhau) {
      nextErrors.xacNhanMatKhau = "Vui lòng xác nhận mật khẩu";
    } else if (registerForm.matKhau !== registerForm.xacNhanMatKhau) {
      nextErrors.xacNhanMatKhau = "Mật khẩu xác nhận không khớp";
    }

    setRegisterErrors(nextErrors);
    return Object.values(nextErrors).every((message) => !message);
  };

  const openForgotDialog = () => {
    setShowForgotDialog(true);
    setForgotStage("request");
    setForgotIdentifier(username);
    setForgotSuccessMessage("");
    setForgotSubmitError("");
    setForgotErrors({ identifier: "", otp: "", newPassword: "", confirmPassword: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const newErrors = { username: "", password: "" };

    if (!username) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    }

    setErrors(newErrors);

    if (!newErrors.username && !newErrors.password) {
      try {
        setIsSubmitting(true);
        const data = await apiFetch<{ token: string; chuTro: Record<string, unknown> }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            tenDangNhap: username,
            matKhau: password,
          }),
        });

        if (data?.token && data?.chuTro) {
          saveAuth(data.token, data.chuTro as any);
          navigate("/dashboard");
          return;
        }

        setSubmitError("Đăng nhập thất bại. Vui lòng thử lại.");
      } catch (err) {
        if (err instanceof ApiResponseError) {
          setSubmitError(err.message);
        } else {
          setSubmitError("Không kết nối được máy chủ. Vui lòng thử lại.");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterSubmitError("");
    setSubmitSuccess("");

    if (!validateRegisterForm()) {
      return;
    }

    try {
      setIsSubmittingRegister(true);
      await apiFetch<{ message: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          hoTen: registerForm.hoTen.trim(),
          email: registerForm.email.trim(),
          soDienThoai: registerForm.soDienThoai.trim(),
          tenDangNhap: registerForm.tenDangNhap.trim(),
          matKhau: registerForm.matKhau,
        }),
      });

      const nextUsername = registerForm.tenDangNhap.trim();
      setShowRegisterDialog(false);
      resetRegisterState();
      setUsername(nextUsername);
      setPassword("");
      setSubmitError("");
      setSubmitSuccess("Đăng ký tài khoản thành công. Vui lòng đăng nhập.");
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setRegisterSubmitError(err.message);
      } else {
        setRegisterSubmitError("Không kết nối được máy chủ. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmittingRegister(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitError("");
    setForgotSuccessMessage("");

    const newErrors = { identifier: "", otp: "", newPassword: "", confirmPassword: "" };
    if (!forgotIdentifier.trim()) {
      newErrors.identifier = "Vui lòng nhập tên đăng nhập hoặc email";
    }

    setForgotErrors(newErrors);
    if (newErrors.identifier) {
      return;
    }

    try {
      setIsSubmittingForgot(true);
      const data = await apiFetch<{ email: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ tenDangNhap: forgotIdentifier.trim() }),
      });

      setForgotEmailMasked(data.email);
      setForgotStage("verify");
      setForgotSuccessMessage(`Đã gửi mã OTP 5 chữ số tới email ${data.email}`);
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setForgotSubmitError(err.message);
      } else {
        setForgotSubmitError("Không kết nối được máy chủ. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitError("");
    setForgotSuccessMessage("");

    const newErrors = { identifier: "", otp: "", newPassword: "", confirmPassword: "" };
    if (!forgotOtp.trim()) {
      newErrors.otp = 'Vui lòng nhập mã OTP';
    }
    setForgotErrors(newErrors);
    if (newErrors.otp) {
      return;
    }

    try {
      setIsSubmittingForgot(true);
      await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ tenDangNhap: forgotIdentifier.trim(), otp: forgotOtp.trim() }),
      });
      setForgotStage('reset');
      setForgotSuccessMessage('OTP hợp lệ. Vui lòng nhập mật khẩu mới.');
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setForgotSubmitError(err.message);
      } else {
        setForgotSubmitError('Không kết nối được máy chủ. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitError("");
    setForgotSuccessMessage("");

    const newErrors = { identifier: "", otp: "", newPassword: "", confirmPassword: "" };
    if (!forgotNewPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    }
    if (!forgotConfirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    }
    if (forgotNewPassword && forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    setForgotErrors(newErrors);
    if (newErrors.newPassword || newErrors.confirmPassword) {
      return;
    }

    try {
      setIsSubmittingForgot(true);
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          tenDangNhap: forgotIdentifier.trim(),
          otp: forgotOtp.trim(),
          matKhauMoi: forgotNewPassword,
        }),
      });
      setShowForgotDialog(false);
      resetForgotState();
      setSubmitError('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setForgotSubmitError(err.message);
      } else {
        setForgotSubmitError('Không kết nối được máy chủ. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  const stats = [
    { label: "Nhà trọ", value: "8" },
    { label: "Người thuê", value: "6" },
    { label: "Hợp đồng HĐ", value: "9" },
    { label: "Doanh thu/tháng", value: "23.5M" },
  ];

  return (
    <div
      className="min-h-screen flex relative"
      style={{
        backgroundImage: `url(https://images.unsplash.com/photo-1520106392146-ef585c111254?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzc2OTc5MDMwfDA&ixlib=rb-4.1.0&q=80&w=1080)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Global overlay */}
      <div className="absolute inset-0 bg-blue-900/60" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:flex-1 relative flex-col justify-between p-10 overflow-hidden">
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-base leading-tight">Nhà Trọ Pro</p>
              <p className="text-blue-200 text-xs">Hệ thống quản lý nhà trọ</p>
            </div>
          </div>

          {/* Center text */}
          <div className="flex-1 flex flex-col justify-center mt-8">
            <span className="text-blue-300 text-sm mb-3 flex items-center gap-1">
              <span className="text-blue-400">✦</span> Quản lý thông minh
            </span>
            <h1 className="text-white mb-4" style={{ fontSize: "2.2rem", lineHeight: "1.2" }}>
              Quản lý nhà trọ
              <br />
              <span className="text-blue-300">dễ dàng &amp; hiệu quả</span>
            </h1>
            <p className="text-blue-100 text-sm max-w-xs leading-relaxed">
              Theo dõi toàn bộ hoạt động: từ hợp đồng, hóa đơn đến báo cáo doanh thu — tất cả trong một nền tảng.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-8 max-w-sm">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3"
                >
                  <p className="text-blue-200 text-xs mb-1">{stat.label}</p>
                  <p className="text-white text-2xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-blue-300 text-xs">
            © 2024 Nhà Trọ Pro. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Nhà Trọ Pro</p>
              <p className="text-gray-500 text-xs">Hệ thống quản lý nhà trọ</p>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <h2 className="text-gray-900 mb-1" style={{ fontSize: "1.5rem" }}>Đăng nhập</h2>
              <p className="text-gray-500 text-sm">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border text-sm ${
                      errors.username ? "border-red-400" : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors`}
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      openForgotDialog();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 border text-sm ${
                      errors.password ? "border-red-400" : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors`}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              {submitError && (
                <p className="text-sm text-red-500">{submitError}</p>
              )}
              {submitSuccess && (
                <p className="text-sm text-green-600">{submitSuccess}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors mt-2"
              >
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRegisterDialog(true);
                  resetRegisterState();
                  setSubmitError("");
                  setSubmitSuccess("");
                }}
                className="w-full inline-flex items-center justify-center gap-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Đăng ký tài khoản
              </button>
            </form>
          </div>

          <Dialog open={showRegisterDialog} onOpenChange={(open) => { setShowRegisterDialog(open); if (!open) resetRegisterState(); }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Đăng ký tài khoản</DialogTitle>
                <DialogDescription>
                  Điền thông tin chủ trọ để tạo tài khoản đăng nhập mới.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={registerForm.hoTen}
                      onChange={(e) => updateRegisterField("hoTen", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm ${registerErrors.hoTen ? "border-red-400" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Nguyễn văn B"
                    />
                    {registerErrors.hoTen && <p className="mt-1 text-xs text-red-500">{registerErrors.hoTen}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => updateRegisterField("email", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm ${registerErrors.email ? "border-red-400" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="vanb@gmail.com"
                    />
                    {registerErrors.email && <p className="mt-1 text-xs text-red-500">{registerErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={registerForm.soDienThoai}
                      onChange={(e) => updateRegisterField("soDienThoai", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm ${registerErrors.soDienThoai ? "border-red-400" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="0909992221"
                    />
                    {registerErrors.soDienThoai && <p className="mt-1 text-xs text-red-500">{registerErrors.soDienThoai}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên đăng nhập <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={registerForm.tenDangNhap}
                      onChange={(e) => updateRegisterField("tenDangNhap", e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm ${registerErrors.tenDangNhap ? "border-red-400" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="vanb"
                    />
                    {registerErrors.tenDangNhap && <p className="mt-1 text-xs text-red-500">{registerErrors.tenDangNhap}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        value={registerForm.matKhau}
                        onChange={(e) => updateRegisterField("matKhau", e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm ${registerErrors.matKhau ? "border-red-400" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Tối thiểu 6 ký tự"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showRegisterPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerErrors.matKhau && <p className="mt-1 text-xs text-red-500">{registerErrors.matKhau}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type={showRegisterConfirmPassword ? "text" : "password"}
                        value={registerForm.xacNhanMatKhau}
                        onChange={(e) => updateRegisterField("xacNhanMatKhau", e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm ${registerErrors.xacNhanMatKhau ? "border-red-400" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Nhập lại mật khẩu"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterConfirmPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showRegisterConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                      >
                        {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerErrors.xacNhanMatKhau && <p className="mt-1 text-xs text-red-500">{registerErrors.xacNhanMatKhau}</p>}
                  </div>
                </div>

                {registerSubmitError && <p className="text-sm text-red-500">{registerSubmitError}</p>}

                <DialogFooter>
                  <DialogClose asChild>
                    <button type="button" className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                      Hủy
                    </button>
                  </DialogClose>
                  <button
                    type="submit"
                    disabled={isSubmittingRegister}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isSubmittingRegister ? "Đang đăng ký..." : "Apply"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showForgotDialog} onOpenChange={(open) => { setShowForgotDialog(open); if (!open) resetForgotState(); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quên mật khẩu</DialogTitle>
                <DialogDescription>
                  {forgotStage === 'request' && 'Nhập tên đăng nhập hoặc email để nhận mã OTP 5 chữ số.'}
                  {forgotStage === 'verify' && `Mã OTP đã được gửi tới ${forgotEmailMasked}. Nhập mã để tiếp tục.`}
                  {forgotStage === 'reset' && 'Nhập mật khẩu mới và xác nhận để hoàn tất.'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={forgotStage === 'request' ? handleForgotRequest : forgotStage === 'verify' ? handleVerifyOtp : handleResetPassword} className="space-y-4">
                {(forgotStage === 'request') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập hoặc email</label>
                    <input
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm ${forgotErrors.identifier ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Nhập tên đăng nhập hoặc email"
                    />
                    {forgotErrors.identifier && <p className="mt-1 text-xs text-red-500">{forgotErrors.identifier}</p>}
                  </div>
                )}

                {(forgotStage === 'verify' || forgotStage === 'reset') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập hoặc email</label>
                    <input
                      type="text"
                      value={forgotIdentifier}
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
                    />
                  </div>
                )}

                {(forgotStage === 'verify' || forgotStage === 'reset') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      className={`w-full rounded-lg border px-3 py-2 text-sm ${forgotErrors.otp ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Nhập mã OTP"
                    />
                    {forgotErrors.otp && <p className="mt-1 text-xs text-red-500">{forgotErrors.otp}</p>}
                  </div>
                )}

                {(forgotStage === 'reset') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                      <div className="relative">
                        <input
                          type={showForgotNewPassword ? "text" : "password"}
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm ${forgotErrors.newPassword ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Nhập mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotNewPassword((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label={showForgotNewPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                        >
                          {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {forgotErrors.newPassword && <p className="mt-1 text-xs text-red-500">{forgotErrors.newPassword}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                      <div className="relative">
                        <input
                          type={showForgotConfirmPassword ? "text" : "password"}
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm ${forgotErrors.confirmPassword ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotConfirmPassword((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label={showForgotConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                        >
                          {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {forgotErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{forgotErrors.confirmPassword}</p>}
                    </div>
                  </>
                )}

                {forgotSubmitError && <p className="text-sm text-red-500">{forgotSubmitError}</p>}
                {forgotSuccessMessage && <p className="text-sm text-green-600">{forgotSuccessMessage}</p>}

                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <button type="button" className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                      Hủy
                    </button>
                  </DialogClose>
                  <button
                    type="submit"
                    disabled={isSubmittingForgot}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {forgotStage === 'request' ? 'Gửi OTP' : forgotStage === 'verify' ? 'Xác nhận OTP' : 'Đổi mật khẩu'}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <p className="text-center text-xs text-gray-400 mt-5">
            © 2024 Nhà Trọ Pro. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>

      {/* Help button */}
      <div className="fixed bottom-6 right-6">
        
      </div>
    </div>
  );
}
