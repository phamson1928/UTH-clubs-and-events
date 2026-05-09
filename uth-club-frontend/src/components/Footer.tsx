import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Globe, MessageSquare } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#002f30] text-gray-200">
      {/* Top Footer */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white tracking-tight">
              UTH <span className="text-teal-500">CLUBS</span>
            </h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Hệ thống quản lý câu lạc bộ và sự kiện chính thức của Trường Đại học Giao thông vận tải TP.HCM. Nơi kết nối đam mê và phát triển kỹ năng sinh viên.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all">
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
              Khám Phá
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                   Trang Chủ
                </Link>
              </li>
              <li>
                <Link to="/student/clubs" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                   Danh Sách Câu Lạc Bộ
                </Link>
              </li>
              <li>
                <Link to="/student/events" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                   Sự Kiện Sắp Diễn Ra
                </Link>
              </li>
              <li>
                <Link to="/student/profile" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                   Hồ Sơ Cá Nhân
                </Link>
              </li>
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Quản Trị
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/club-owner/dashboard" className="hover:text-orange-400 transition-colors">
                  Dành Cho Chủ Câu Lạc Bộ
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-orange-400 transition-colors">
                  Dành Cho Quản Trị Viên
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-orange-400 transition-colors">
                  Đăng Nhập Hệ Thống
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Liên Hệ
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-500 shrink-0" />
                <span>Số 2, Đường Võ Oanh, Phường 25, Quận Bình Thạnh, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teal-500 shrink-0" />
                <span>(028) 3899 1373</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teal-500 shrink-0" />
                <span>ut-clubs@ut.edu.vn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {year} Trường Đại học Giao thông vận tải TP.HCM. Bảo lưu mọi quyền.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

