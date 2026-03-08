import {
  Search,
  Users,
  Filter,
  ChevronDown,
  Star,
  Quote,
  ArrowRight,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

// Helper function to normalize image URLs
export const normalizeImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80";
  }
  // If it's already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // If it's a relative path starting with /uploads/, prepend API_BASE
  if (imagePath.startsWith("/uploads/")) {
    return `${API_BASE}${imagePath}`;
  }
  // Otherwise, assume it's a relative path and prepend API_BASE
  return `${API_BASE}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

export default function StudentClubs() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    query: "",
    category: "all",
    sort: "popular",
  });

  const [categories, setCategories] = useState<string[]>(["all"]);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setFilters((prev) => ({ ...prev, category: categoryParam }));
    }
    fetchClubs();
  }, [location.search]);

  const fetchClubs = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/clubs`);
      const clubsData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const items = clubsData.map((club: any) => ({
        id: club.id,
        name: club.name || "Unnamed Club",
        members: club.members || 0,
        category: club.category || "General",
        description: club.description || "No description available",
        image: normalizeImageUrl(club.club_image),
        owner: club.owner?.name || "Unknown",
        createdAt: club.created_at,
      }));
      setClubs(items);

      // Extract unique categories
      const uniqueCategories = [
        "all",
        ...Array.from(new Set(items.map((c: any) => c.category))).filter(
          Boolean
        ),
      ];
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error("[Clubs] Failed to fetch clubs", error);
    } finally {
      setIsLoading(false);
    }
  };

  const visible = useMemo(() => {
    let items = clubs.slice();

    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== "all") {
      items = items.filter((c) => c.category === filters.category);
    }

    if (filters.sort === "name") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === "newest") {
      items.sort((a, b) => b.id - a.id);
    } else {
      items.sort((a, b) => b.members - a.members);
    }

    return items;
  }, [filters, clubs]);

  const testimonials = [
    {
      id: 1,
      name: "Emma Rodriguez",
      club: "Tech Innovators Hub",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      text: "This club changed my perspective on technology. The mentorship and projects have been invaluable to my growth as a developer.",
    },
    {
      id: 2,
      name: "James Chen",
      club: "Business Leaders Forum",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      text: "The networking opportunities and real-world business challenges have prepared me for my career like nothing else could.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#008689] via-teal-600 to-cyan-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-6xl font-black mb-6">Khám Phá Câu Lạc Bộ</h1>
            <p className="text-xl text-white/90 mb-10">
              Tìm cộng đồng hoàn hảo phù hợp với sở thích và đam mê của bạn
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-gray-50 border-b-2 border-gray-200 py-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-gray-200 p-6 shadow-sm"
          >
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm câu lạc bộ theo tên, mô tả..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-gray-900"
                    value={filters.query}
                    onChange={(e) =>
                      setFilters({ ...filters, query: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:border-teal-500 focus:outline-none appearance-none text-gray-900 bg-white"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "Tất Cả Danh Mục" : cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t-2 border-gray-100">
              <span className="text-sm font-semibold text-gray-700">
                Sắp xếp theo:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, sort: "popular" })}
                  className={`px-4 py-2 text-sm font-medium transition-all ${filters.sort === "popular"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Phổ Biến Nhất
                </button>
                <button
                  onClick={() => setFilters({ ...filters, sort: "name" })}
                  className={`px-4 py-2 text-sm font-medium transition-all ${filters.sort === "name"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Tên A-Z
                </button>
                <button
                  onClick={() => setFilters({ ...filters, sort: "newest" })}
                  className={`px-4 py-2 text-sm font-medium transition-all ${filters.sort === "newest"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Mới Nhất
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Count */}
          <div className="mt-4">
            <p className="text-gray-600 font-medium">
              Hiển thị {visible.length} câu lạc bộ
            </p>
          </div>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Đang tải câu lạc bộ...
              </h3>
              <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Không tìm thấy câu lạc bộ
              </h3>
              <p className="text-gray-600">
                Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visible.map((club, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={club.id}
                  className="bg-white border-2 border-gray-200 hover:border-teal-500 hover:shadow-2xl transition-all group overflow-hidden flex flex-col"
                >
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img
                      src={club.image}
                      alt={club.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-teal-700 text-xs font-bold rounded-full shadow-sm">
                      {club.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                        {club.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed line-clamp-2 flex-1 text-sm">
                      {club.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 text-teal-600" />
                        <span className="font-semibold">
                          {club.members} thành viên
                        </span>
                      </div>
                      <Link
                        to={`/student/clubs/${club.id}`}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all shadow-sm hover:shadow-md"
                      >
                        Xem Chi Tiết
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Join Section - Image Left */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80"
                alt="Students collaborating"
                className="w-full h-[500px] object-cover shadow-2xl"
              />
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-teal-500 opacity-20"></div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                Tại Sao Nên Tham Gia Câu Lạc Bộ?
              </h2>
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                Câu lạc bộ không chỉ là hoạt động ngoại khóa - đây là nơi bạn
                xây dựng tình bạn suốt đời, phát triển kỹ năng quý giá và tạo
                nên những kỷ niệm không thể nào quên.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Xây Dựng Mạng Lưới Quan Hệ
                    </h3>
                    <p className="text-gray-600">
                      Kết nối với những người cùng đam mê
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Phát Triển Kỹ Năng Mới
                    </h3>
                    <p className="text-gray-600">
                      Học hỏi qua kinh nghiệm thực tế và được hướng dẫn
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Cơ Hội Nghề Nghiệp
                    </h3>
                    <p className="text-gray-600">
                      Mở ra cơ hội thực tập và việc làm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Trải Nghiệm Thành Viên
            </h2>
            <p className="text-xl text-gray-600">
              Nghe chia sẻ từ các thành viên câu lạc bộ
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gray-50 border-2 border-gray-200 p-8 hover:border-teal-500 hover:shadow-xl transition-all"
              >
                <Quote className="w-10 h-10 text-teal-500 mb-6" />
                <p className="text-gray-700 mb-8 leading-relaxed text-lg italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.club}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-black mb-6">
            Không Tìm Thấy Điều Bạn Muốn?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Tạo câu lạc bộ của riêng bạn và kết nối những sinh viên có chung sở
            thích độc đáo
          </p>
          <button className="px-10 py-5 bg-white text-teal-700 hover:bg-gray-100 font-bold text-lg transition-all">
            Tạo Câu Lạc Bộ Mới
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black mb-2">
                Câu Lạc Bộ Sinh Viên UTH
              </div>
              <div className="text-gray-400">
                Xây dựng cộng đồng, từng kết nối một
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Trường Đại học Công nghệ TP.HCM. Bảo lưu mọi quyền.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
