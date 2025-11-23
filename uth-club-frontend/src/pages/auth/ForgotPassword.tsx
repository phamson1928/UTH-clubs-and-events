import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE}/auth/forgot-password`, {
        email,
      });

      if (res.status !== 200) {
        // Try to read error message if provided
        let details = "";
        try {
          const data = await res.data;
          details = data?.message || data?.error || "";
        } catch {}
        throw new Error(details || `Yêu cầu thất bại (HTTP ${res.status})`);
      }

      setMessage(
        "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
      );
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập địa chỉ email để nhận hướng dẫn đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi hướng dẫn"}
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
