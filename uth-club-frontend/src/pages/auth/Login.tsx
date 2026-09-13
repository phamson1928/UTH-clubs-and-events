import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GraduationCap, Lock, Mail, ShieldCheck, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import axios from "axios";

const TEST_ACCOUNTS = [
  {
    role: "Quản trị viên",
    description: "Quản lý toàn bộ hệ thống",
    email: "admin@uth.edu.vn",
    password: "Admin@123",
    icon: ShieldCheck,
  },
  {
    role: "Chủ câu lạc bộ",
    description: "Quản lý câu lạc bộ và sự kiện",
    email: "an.nguyen@uth.edu.vn",
    password: "Owner@123",
    icon: Users,
  },
  {
    role: "Sinh viên",
    description: "Tham gia câu lạc bộ và sự kiện",
    email: "quynh.ly@uth.edu.vn",
    password: "Student@123",
    icon: GraduationCap,
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isJustRegistered = searchParams.get("registered") === "true";

  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:3000";

  const selectTestAccount = (account: (typeof TEST_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      const { token, user } = res.data || {};

      if (!token || !user) throw new Error("Phản hồi không hợp lệ từ máy chủ");

      // Lưu thông tin đăng nhập
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));

      // Điều hướng theo role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "club_owner") {
        navigate("/club-owner/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/gts.jpg" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-white/20">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
            <CardDescription>
              Nhập thông tin đăng nhập của bạn để truy cập tài khoản
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {isJustRegistered && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 p-3 rounded">
                  Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài
                  khoản trước khi đăng nhập.
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
              <div className="text-sm text-center">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-white/20">
          <CardHeader>
            <CardTitle className="text-xl">Tài khoản dùng thử</CardTitle>
            <CardDescription>
              Chọn một vai trò để tự động điền thông tin đăng nhập.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {TEST_ACCOUNTS.map((account) => {
              const Icon = account.icon;

              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => selectTestAccount(account)}
                  className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={`Sử dụng tài khoản ${account.role}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900">{account.role}</div>
                      <div className="mb-2 text-xs text-gray-500">{account.description}</div>
                      <div className="grid gap-1 text-sm sm:grid-cols-[4.5rem_1fr]">
                        <span className="text-gray-500">Email</span>
                        <span className="break-all font-mono text-gray-900">{account.email}</span>
                        <span className="text-gray-500">Mật khẩu</span>
                        <span className="font-mono text-gray-900">{account.password}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            <p className="pt-1 text-center text-xs text-gray-500">
              Đây là tài khoản dành riêng cho mục đích trải nghiệm và kiểm thử.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
