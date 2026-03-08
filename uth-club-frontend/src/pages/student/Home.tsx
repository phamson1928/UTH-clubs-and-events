import {
  Search,
  Calendar,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Star,
  Quote,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { useToast } from "../../hooks/use-toast";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function StudentHome() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [heroQuery, setHeroQuery] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [liveStats, setLiveStats] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchApprovedEvents();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/statistics/member_statistics`);
      const d = res.data;
      setLiveStats({
        clubs: d.totalClubs != null ? String(d.totalClubs) : "",
        events: d.totalEvents != null ? String(d.totalEvents) : "",
        members:
          d.totalMembers != null
            ? Number(d.totalMembers).toLocaleString("vi-VN")
            : "",
      });
    } catch {
      // Keep hardcoded fallback values
    }
  };

  const fetchApprovedEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(`${API_BASE}/events?status=approved&limit=20`, {
        headers,
      });
      const rawData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      const now = new Date();
      const eventsData = rawData.filter((e: any) => {
        const eventDate = new Date(e.date);
        return eventDate > now && e.status === 'approved';
      }).slice(0, 6);
      const items = eventsData.map((event: any, index: number) => ({
        id: event.id,
        clubId: event.club?.id,
        title: event.name || "Untitled Event",
        club: event.club?.name || "Unknown Club",
        date: event.date
          ? new Date(event.date).toLocaleDateString()
          : "TBA",
        attendees: event.attending_users_number || 0,
        registered: event.isRegistered || false,
        description: event.description || "",
        location: event.location || "",
        activities: event.activities || "",
        visibility: event.visibility || "public",
        max_capacity: event.max_capacity,
        registration_deadline: event.registration_deadline,
        color: [
          "bg-teal-500",
          "bg-purple-500",
          "bg-orange-500",
          "bg-blue-500",
          "bg-green-500",
          "bg-pink-500",
        ][index % 6],
      }));
      setUpcomingEvents(items);
    } catch (error) {
      console.error("[Home] Failed to fetch events", error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const stats = [
    {
      label: "Câu Lạc Bộ Hoạt Động",
      value: liveStats.clubs || "52",
      subtext: "Trên tất cả các danh mục",
      icon: Users,
      color: "text-teal-600",
    },
    {
      label: "Sự Kiện Hàng Tháng",
      value: liveStats.events || "38",
      subtext: "Tham gia điều gì đó mới",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      label: "Thành Viên Hoạt Động",
      value: liveStats.members || "2.847",
      subtext: "Cộng đồng đang phát triển",
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      label: "Câu Chuyện Thành Công",
      value: "500+",
      subtext: "Thành tựu đạt được",
      icon: Sparkles,
      color: "text-blue-600",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Nguyễn Minh Anh",
      club: "Câu Lạc Bộ Công Nghệ Sáng Tạo",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      text: "Tham gia CLB Công Nghệ là quyết định đúng đắn nhất trong đời sinh viên của mình. Mình đã học được rất nhiều, kết bạn với những người tuyệt vời, và thậm chí còn có được công việc thực tập mơ ước nhờ những mối quan hệ ở đây!",
    },
    {
      id: 2,
      name: "Trần Hoàng Nam",
      club: "Hội Nghệ Thuật & Văn Hóa",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      text: "Sự tự do sáng tạo và hỗ trợ mà mình tìm thấy ở đây là vô song. Mỗi sự kiện đều là cơ hội để giới thiệu tác phẩm và cộng tác với những người bạn tài năng.",
    },
    {
      id: 3,
      name: "Lê Hồng Phương",
      club: "Diễn Đàn Lãnh Đạo Toàn Cầu",
      image:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
      text: "CLB này đã mở ra những cánh cửa mà mình không bao giờ nghĩ tới. Từ các sự kiện kết nối đến workshop lãnh đạo, mình đã phát triển cả về mặt cá nhân lẫn nghề nghiệp.",
    },
  ];

  function onHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(
      `/student/clubs${heroQuery.trim() ? `?q=${encodeURIComponent(heroQuery.trim())}` : ""}`,
    );
  }

  const handleRegisterEvent = async (eventId: number) => {
    console.log(`[Home] handleRegisterEvent called — eventId: ${eventId}`);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.warn("[Home] No auth token found, aborting registration");
        alert("Vui lòng đăng nhập để đăng ký tham gia event");
        return;
      }
      console.log(
        `[Home] Token present, sending POST /event-registrations/${eventId}/register`,
      );

      const response = await axios.post(
        `${API_BASE}/event-registrations/${eventId}/register`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(
        `[Home] Registration successful — eventId: ${eventId}`,
        response.data,
      );

      toast({
        title: "Thành công!",
        description: "Bạn đã đăng ký tham gia sự kiện thành công.",
        variant: "default",
      });

      // Refresh events để lấy dữ liệu mới nhất từ server
      console.log("[Home] Refreshing approved events list...");
      await fetchApprovedEvents();
      console.log("[Home] Events refreshed after registration");
    } catch (error: any) {
      console.error(`[Home] Register event error — eventId: ${eventId}`, error);
      console.error("[Home] Response data:", error.response?.data);
      console.error("[Home] Status:", error.response?.status);
      const errorMsg =
        error.response?.data?.message || "Không thể đăng ký tham gia event";
      toast({
        title: "Lỗi!",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#008689] via-teal-600 to-cyan-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-sm border border-white/30 mb-8 rounded-full shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Chào Mừng Đến Cộng Đồng Sinh Viên UTH
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight drop-shadow-md">
              Khám Phá Cộng Đồng
              <br />
              Của Bạn Tại UTH
            </h1>

            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Kết nối với những sinh viên đam mê, tham gia câu lạc bộ thú vị và
              tạo nên những kỷ niệm khó quên. Hành trình đại học của bạn bắt đầu
              từ đây.
            </p>

            <div className="flex gap-4 max-w-2xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu lạc bộ, sự kiện, hoặc sở thích..."
                  className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onHeroSearch(e)}
                />
              </div>
              <button
                onClick={onHeroSearch}
                className="px-8 py-4 bg-white text-teal-700 hover:bg-gray-100 font-bold transition-all"
              >
                Tìm Kiếm
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                "Công Nghệ",
                "Nghệ Thuật & Thiết Kế",
                "Thể Thao",
                "Kinh Doanh",
                "Lãnh Đạo",
                "Xã Hội",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    navigate(
                      `/student/clubs?category=${encodeURIComponent(cat)}`,
                    )
                  }
                  className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all text-sm font-medium"
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  key={index}
                  className="bg-white border-2 border-gray-200 p-8 rounded-2xl hover:border-teal-500 hover:shadow-2xl transition-all group"
                >
                  <Icon className={`w-10 h-10 ${stat.color} mb-4 transform group-hover:-translate-y-1 transition-transform`} />
                  <div className="text-5xl font-black text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600">{stat.subtext}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Events Section - Image Left */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80"
                alt="Students at event"
                className="w-full h-[600px] object-cover shadow-2xl"
              />
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-teal-500 opacity-20"></div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                Sự Kiện Truyền Cảm Hứng
                <br />
                Phát Triển Bản Thân
              </h2>
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                Từ hackathon đến triển lãm nghệ thuật, hội nghị lãnh đạo đến
                giải đấu thể thao - lịch sự kiện đa dạng của chúng tôi có điều
                gì đó dành cho tất cả mọi người.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Mỗi sự kiện được thiết kế cẩn thận để thúc đẩy việc học tập,
                cộng tác và vui chơi. Dù bạn đang muốn phát triển kỹ năng mới,
                kết nối với bạn bè hay đơn giản là tận hưởng trải nghiệm đại
                học, bạn sẽ tìm thấy cơ hội phù hợp với sở thích của mình.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      38+ Sự Kiện Hàng Tháng
                    </h3>
                    <p className="text-gray-600">
                      Hoạt động thường xuyên trên tất cả các danh mục
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Mở Cho Tất Cả Sinh Viên
                    </h3>
                    <p className="text-gray-600">
                      Mọi người đều được chào đón tham gia
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Phát Triển Kỹ Năng
                    </h3>
                    <p className="text-gray-600">
                      Workshop và trải nghiệm thực hành
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/student/events")}
                className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all"
              >
                Khám Phá Tất Cả Sự Kiện
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Activities Section - Image Right */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                Hoạt Động
                <br />
                Xây Dựng Cộng Đồng
              </h2>
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                Ngoài các sự kiện, câu lạc bộ của chúng tôi tổ chức các hoạt
                động thường xuyên gắn kết sinh viên với nhau theo những cách ý
                nghĩa. Từ các buổi gặp mặt hàng tuần đến các dự án cộng tác.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Đây là nơi hình thành tình bạn bền vững và học hỏi thực sự. Cho
                cho dù đó là buổi coding, workshop nghệ thuật, luyện tập thể thao
                hay dự án phục vụ cộng đồng, bạn sẽ tìm thấy những người đồng
                hành.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white border-2 border-gray-200 p-6">
                  <div className="text-4xl font-black text-teal-600 mb-2">
                    52
                  </div>
                  <div className="font-bold text-gray-900">CLB Hoạt Động</div>
                </div>
                <div className="bg-white border-2 border-gray-200 p-6">
                  <div className="text-4xl font-black text-purple-600 mb-2">
                    2.8K
                  </div>
                  <div className="font-bold text-gray-900">Thành Viên</div>
                </div>
                <div className="bg-white border-2 border-gray-200 p-6">
                  <div className="text-4xl font-black text-orange-600 mb-2">
                    150+
                  </div>
                  <div className="font-bold text-gray-900">
                    Hoạt Động Hàng Tuần
                  </div>
                </div>
                <div className="bg-white border-2 border-gray-200 p-6">
                  <div className="text-4xl font-black text-blue-600 mb-2">
                    500+
                  </div>
                  <div className="font-bold text-gray-900">
                    Câu Chuyện Thành Công
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/student/clubs")}
                className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold transition-all"
              >
                Tham Gia CLB Ngay Hôm Nay
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80"
                alt="Students collaborating"
                className="w-full h-[600px] object-cover shadow-2xl"
              />
              <div className="absolute -top-8 -left-8 w-64 h-64 bg-purple-500 opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Sự Kiện Sắp Diễn Ra
            </h2>
            <p className="text-xl text-gray-600">
              Đừng bỏ lỡ những cơ hội thú vị này
            </p>
          </motion.div>

          {isLoadingEvents ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Đang tải sự kiện...</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Không Có Sự Kiện Sắp Tới
              </h3>
              <p className="text-gray-600">
                Hãy quay lại sớm để xem sự kiện mới!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 max-w-5xl mx-auto">
              {upcomingEvents.map((event, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={event.id}
                  className="bg-white border-2 border-gray-200 hover:border-teal-500 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-start">
                    <div className={`w-2 h-full ${event.color}`}></div>
                    <div className="flex-1 p-6 relative">
                      {/* Ribbon cho Visibility */}
                      {event.visibility === "members_only" && (
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                          Chỉ Dành Cho Thành Viên
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-4">
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                            {event.title}
                          </h3>
                          <div className="text-sm text-teal-700 font-semibold mt-1">
                            {event.club}
                          </div>
                        </div>

                        {/* Nút Đăng Ký */}
                        {(() => {
                          const now = new Date();
                          const isFull = event.max_capacity && event.attendees >= event.max_capacity;
                          const isDeadlinePassed = event.registration_deadline && new Date(event.registration_deadline) < now;
                          const isEventPassed = event.date && new Date(event.date) < now;
                          const isClosed = isFull || isDeadlinePassed || isEventPassed;

                          if (event.registered) {
                            return (
                              <button className="px-6 py-2 text-white font-bold whitespace-nowrap bg-teal-900 cursor-default rounded border border-teal-900 shadow-sm">
                                ✓ Đã tham gia
                              </button>
                            );
                          }

                          if (isClosed) {
                            return (
                              <button className="px-6 py-2 text-white font-bold whitespace-nowrap bg-gray-400 cursor-not-allowed rounded shadow-sm" disabled>
                                {isFull ? "Hết chỗ" : "Đã quá hạn"}
                              </button>
                            );
                          }

                          return (
                            <button
                              onClick={() => handleRegisterEvent(event.id)}
                              className="px-6 py-2 text-white font-bold whitespace-nowrap bg-teal-600 hover:bg-teal-700 cursor-pointer shadow hover:shadow-md transition-all rounded hover:-translate-y-0.5"
                            >
                              Đăng Ký
                            </button>
                          );
                        })()}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-100">
                        <div>
                          <div className="text-xs text-gray-500 mb-1 font-medium tracking-wide uppercase">Ngày Tổ Chức</div>
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <Calendar className="w-4 h-4 text-teal-600" />
                            {event.date}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1 font-medium tracking-wide uppercase">Địa Điểm</div>
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            <span className="truncate" title={event.location}>{event.location}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1 font-medium tracking-wide uppercase">Người Tham Gia</div>
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <Users className="w-4 h-4 text-blue-600" />
                            {event.attendees} {event.max_capacity ? `/ ${event.max_capacity}` : "người"}
                          </div>
                        </div>
                        {event.registration_deadline && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1 font-medium tracking-wide uppercase">Hạn Đăng Ký</div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                              <Calendar className="w-4 h-4 text-red-500" />
                              {new Date(event.registration_deadline).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} - {new Date(event.registration_deadline).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">
                            Mô Tả
                          </div>
                          <p className="text-sm text-gray-700">
                            {event.description}
                          </p>
                        </div>
                      )}

                      {event.activities && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Hoạt Động
                          </div>
                          <p className="text-sm text-gray-700">
                            {event.activities}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/student/events")}
              className="px-8 py-4 border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 font-bold transition-all inline-flex items-center gap-2"
            >
              Xem Tất Cả Sự Kiện <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Sinh Viên Nói Gì
            </h2>
            <p className="text-xl text-gray-600">
              Lắng nghe từ các thành viên cộng đồng
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                key={testimonial.id}
                className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-teal-500 hover:shadow-2xl transition-all relative"
              >
                <Quote className="w-10 h-10 text-teal-500 mb-6" />
                <p className="text-gray-700 mb-8 leading-relaxed italic">
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-teal-600 to-cyan-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-0 top-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 drop-shadow-sm">Sẵn Sàng Bắt Đầu?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90 leading-relaxed">
              Tham gia cùng hàng ngàn sinh viên đã tìm thấy cộng đồng của họ tại
              UTH. Hành trình của bạn bắt đầu hôm nay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/student/clubs")}
                className="px-10 py-5 bg-white text-teal-700 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 font-bold text-lg transition-all"
              >
                Duyệt Tất Cả Câu Lạc Bộ
              </button>
              <button
                onClick={() => navigate("/student/events")}
                className="px-10 py-5 rounded-full border-2 border-white/50 hover:bg-white/10 hover:border-white text-white font-bold text-lg transition-all"
              >
                Xem Lịch Sự Kiện
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div >
  );
}
