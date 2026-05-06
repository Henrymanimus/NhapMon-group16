import { useState } from "react";
import { useNavigate } from "react-router";
import { Home, Lock, User, Eye, EyeOff } from "lucide-react";
import { saveAuth } from "../../../lib/auth";
import { apiFetch, ApiResponseError } from "../../../lib/api";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

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
          navigate("/");
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
                  <a href="#" className="text-xs text-blue-600 hover:text-blue-700">
                    Quên mật khẩu?
                  </a>
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors mt-2"
              >
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </div>

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