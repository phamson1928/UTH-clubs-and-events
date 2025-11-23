import { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
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
import { ArrowLeft, Lock } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError("Thiếu token hoặc token không hợp lệ.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API_BASE}/auth/reset-password`, {
        token,
        newPassword: password,
      });

      if (res.status !== 201 && res.status !== 200) {
        // Try to read error message if provided
        let details = "";
        try {
          const data = await res.data;
          details = (data?.message as string) || (data?.error as string) || "";
        } catch {}
        throw new Error(details || `Yêu cầu thất bại (HTTP ${res.status})`);
      }

      setMessage(
        "Đặt lại mật khẩu thành công. Đang chuyển về trang đăng nhập...",
      );
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đã xảy ra lỗi. Vui lòng thử lại sau.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Nhập mật khẩu mới cho tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!token && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3">
                Thiếu token. Vui lòng sử dụng link trong email của bạn.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Nhập lại mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirm"
                  type="password"
                  className="pl-10"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {message && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 p-3">
                {message}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !token}
            >
              {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
