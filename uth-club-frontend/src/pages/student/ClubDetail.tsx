import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Calendar, MapPin, Mail, Sparkles, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import axios from "axios";

const API_BASE = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

const normalizeImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80";
  }
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  if (imagePath.startsWith("/uploads/")) return `${API_BASE}${imagePath}`;
  return `${API_BASE}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

export default function StudentClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = !!localStorage.getItem("authToken");

  const [club, setClub] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchClub = async () => {
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get(`${API_BASE}/clubs/${id}`, { headers });
        const data = res.data;
        if (!data) throw new Error("Not found");

        setClub({
          id: data.id,
          name: data.name,
          category: data.category,
          description: data.description || "",
          founded: data.created_at ? new Date(data.created_at).getFullYear().toString() : "2024",
          email: data.owner?.email || data.email || "",
          location: data.location || "Cơ sở chính UTH",
          image: normalizeImageUrl(data.club_image),
        });

        setMembers(Array.isArray(data.memberships) ? data.memberships.map((m: any) => ({
          id: m.id,
          user: { name: m.user?.name, email: m.user?.email, mssv: m.user?.mssv },
          join_date: m.join_date,
        })) : []);

        setUpcomingEvents(Array.isArray(data.events) ? data.events.map((e: any) => ({
          id: e.id,
          title: e.name,
          date: e.date ? new Date(e.date).toLocaleDateString("vi-VN") : "",
          location: e.location || "UTH Campus",
          description: e.description || "",
          activities: e.activities || "",
          attendees: e.attending_users_number || 0,
          registered: e.isRegistered || false,
          visibility: e.visibility || "public",
          max_capacity: e.max_capacity,
          registration_deadline: e.registration_deadline,
        })) : []);
      } catch (e: any) {
        console.error("[ClubDetail] fetch error", e);
        setError("Không thể tải thông tin câu lạc bộ");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchClub();
  }, [id]);

  const [joinReason, setJoinReason] = useState("");
  const [skills, setSkills] = useState("");
  const [promiseText, setPromiseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleJoinClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({ title: "Yêu cầu đăng nhập", description: "Vui lòng đăng nhập trước khi gửi đơn", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      await axios.post(`${API_BASE}/memberships/${id}/join`, {
        join_reason: joinReason,
        skills: skills,
        promise: promiseText,
      }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });

      toast({ title: "Thành công!", description: "Đã gửi đơn tham gia thành công!" });
      setJoinReason("");
      setSkills("");
      setPromiseText("");
    } catch (error: any) {
      toast({ title: "Lỗi!", description: error.response?.data?.message || "Có lỗi xảy ra", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterEvent = async (eventId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({ title: "Yêu cầu đăng nhập", description: "Vui lòng đăng nhập để đăng ký tham gia", variant: "destructive" });
        return;
      }

      await axios.post(`${API_BASE}/event-registrations/${eventId}/register`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Thành công!", description: "Bạn đã đăng ký tham gia thành công." });

      // Refresh events
      const res = await axios.get(`${API_BASE}/clubs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data;
      if (data && data.events) {
        setUpcomingEvents(data.events.map((e: any) => ({
          id: e.id,
          title: e.name,
          date: e.date ? new Date(e.date).toLocaleDateString("vi-VN") : "",
          location: e.location || "UTH Campus",
          description: e.description || "",
          activities: e.activities || "",
          attendees: e.attending_users_number || 0,
          registered: e.isRegistered || false,
          visibility: e.visibility || "public",
          max_capacity: e.max_capacity,
          registration_deadline: e.registration_deadline,
        })));
      }
    } catch (error: any) {
      toast({ title: "Lỗi!", description: error.response?.data?.message || "Lỗi đăng ký", variant: "destructive" });
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-40 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></motion.div>
        <p className="text-gray-500 font-bold">Đang tải dữ liệu câu lạc bộ...</p>
      </div>
    </div>
  );

  if (error || !club) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-40 text-center">
        <h2 className="text-2xl font-black mb-4">{error || "Không tìm thấy câu lạc bộ"}</h2>
        <Link to="/student/clubs" className="px-6 py-2 bg-teal-600 text-white font-bold rounded">Quay lại</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[600px] bg-gray-900 text-white overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          src={club.image}
          alt={club.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

        <div className="container mx-auto px-6 relative h-full flex flex-col justify-end pb-20 leading-tight">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link to="/student/clubs" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 group transition-all">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Khám phá các câu lạc bộ khác</span>
            </Link>
            <div className="flex gap-3 mb-6">
              <span className="px-4 py-1 bg-teal-500 font-black text-[10px] uppercase tracking-widest rounded shadow-lg">{club.category}</span>
              <span className="px-4 py-1 bg-white/10 backdrop-blur-md border border-white/20 font-black text-[10px] uppercase tracking-widest rounded">Est. {club.founded}</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 drop-shadow-2xl">{club.name}</h1>
            <div className="flex flex-wrap gap-x-12 gap-y-6 text-white/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Users className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="text-xs text-white/60 font-bold uppercase tracking-wider">Thành Viên</div>
                  <div className="text-xl font-black">{members.length} sinh viên</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <MapPin className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-xs text-white/60 font-bold uppercase tracking-wider">Địa Điểm</div>
                  <div className="text-xl font-black">{club.location}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-3 gap-20">

          {/* Left Column: About & Events */}
          <div className="lg:col-span-2 space-y-24">

            {/* About */}
            <section>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-4xl font-black text-gray-900">Về Chúng Tôi</h2>
                  <div className="h-1 flex-1 bg-gray-100 rounded-full">
                    <div className="h-full w-24 bg-teal-500 rounded-full"></div>
                  </div>
                </div>
                <div className="prose prose-xl text-gray-700 leading-relaxed max-w-none">
                  {club.description.split('\n').map((p: string, i: number) => (
                    <p key={i} className="mb-6 last:mb-0">{p}</p>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-12">
                  <div className="p-8 bg-gray-50 border-2 border-gray-100 rounded-2xl">
                    <Sparkles className="w-8 h-8 text-teal-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Sứ mệnh</h3>
                    <p className="text-gray-600">Kiến tạo cộng đồng sinh viên năng động, sáng tạo và gắn kết thông qua các hoạt động {club.category.toLowerCase()}.</p>
                  </div>
                  <div className="p-8 bg-gray-50 border-2 border-gray-100 rounded-2xl">
                    <Clock className="w-8 h-8 text-orange-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Hoạt động</h3>
                    <p className="text-gray-600">Chúng tôi duy trì lịch sinh hoạt định kỳ hàng tuần tại {club.location}.</p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Events */}
            <section>
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-4xl font-black text-gray-900">Sự Kiện Sắp Tới</h2>
                <div className="h-1 flex-1 bg-gray-100 rounded-full">
                  <div className="h-full w-24 bg-teal-500 rounded-full"></div>
                </div>
              </div>

              <div className="space-y-6">
                {upcomingEvents.length > 0 ? upcomingEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white border-2 border-gray-100 overflow-hidden hover:border-teal-500 hover:shadow-2xl transition-all duration-300 rounded-2xl"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-64 bg-teal-600 flex flex-col items-center justify-center p-8 text-white">
                        <Calendar className="w-12 h-12 mb-4 opacity-40" />
                        <div className="text-2xl font-black">{event.date.split('/')[0]}</div>
                        <div className="text-sm font-bold opacity-80 uppercase tracking-widest text-center">Tháng {event.date.split('/')[1]}, {event.date.split('/')[2]}</div>
                      </div>
                      <div className="flex-1 p-8 relative">
                        {event.visibility === 'members_only' && (
                          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-xl tracking-widest">Members Only</div>
                        )}
                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">{event.title}</h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-gray-500 mb-6">
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> {event.location}</div>
                          <div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> {event.attendees} / {event.max_capacity || '∞'}</div>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <p className="text-gray-600 line-clamp-2 text-sm">{event.description}</p>
                          {event.registered ? (
                            <button className="px-8 py-3 bg-teal-900 text-white font-black text-sm rounded-xl cursor-default flex items-center gap-2">
                              <Sparkles className="w-4 h-4" /> Đã tham gia
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegisterEvent(event.id)}
                              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-xl shadow-lg shadow-teal-100 hover:shadow-teal-200 transition-all active:scale-95 whitespace-nowrap"
                            >
                              Đăng ký ngay
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="p-12 border-2 border-dashed border-gray-200 rounded-2xl text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">Hiện chưa có sự kiện nào được công bố.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Contact & Join */}
          <div className="space-y-12">

            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 blur-[100px] opacity-20"></div>
              <h3 className="text-2xl font-black mb-8">Liên hệ CLB</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-teal-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-white/50 font-bold uppercase">Email công việc</div>
                    <div className="font-bold">{club.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-teal-500 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-white/50 font-bold uppercase">Văn phòng CLB</div>
                    <div className="font-bold">{club.location}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Join Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-gray-100 p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-2">Gia nhập cộng đồng</h3>
              <p className="text-gray-500 mb-8 font-medium">Bạn đã sẵn sàng để trở thành một phần của {club.name}?</p>

              <form onSubmit={handleJoinClub} className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-wider mb-2">Động lực tham gia</label>
                  <Textarea
                    value={joinReason}
                    onChange={e => setJoinReason(e.target.value)}
                    placeholder="Tại sao bạn chọn chúng tôi?"
                    className="rounded-xl border-gray-200 focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-wider mb-2">Kỹ năng sẵn có</label>
                  <Input
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    placeholder="Giao tiếp, Coding, Design..."
                    className="rounded-xl border-gray-200 focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-wider mb-2">Lời cam kết</label>
                  <Textarea
                    value={promiseText}
                    onChange={e => setPromiseText(e.target.value)}
                    placeholder="Bạn cam kết gì với câu lạc bộ?"
                    className="rounded-xl border-gray-200 focus:border-teal-500"
                    required
                  />
                </div>
                <button
                  disabled={submitting}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-lg shadow-teal-100 hover:shadow-teal-300 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {submitting ? "Đang gửi đơn..." : (
                    <>
                      Gửi đơn đăng ký
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
