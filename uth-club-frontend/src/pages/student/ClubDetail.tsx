import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Calendar, MapPin, Mail } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../hooks/use-toast";
import axios from "axios";

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

// Helper function to normalize image URLs
const normalizeImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80";
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

export default function StudentClubDetail() {
  const { id } = useParams();
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
        if (!data) {
          throw new Error("Not found");
        }
        setClub({
          id: data.id,
          name: data.name,
          category: data.category,
          description: data.description || "",
          founded: data.created_at
            ? new Date(data.created_at).getFullYear().toString()
            : "",
          email: data.owner?.email || data.email || "",
          location: data.location || "",
          image: normalizeImageUrl(data.club_image),
        });
        setMembers(
          Array.isArray(data.memberships)
            ? data.memberships.map((m: any) => ({
                id: m.id,
                user: {
                  name: m.user?.name,
                  email: m.user?.email,
                  mssv: m.user?.mssv,
                },
                join_date: m.join_date,
              }))
            : [],
        );
        setUpcomingEvents(
          Array.isArray(data.events)
            ? data.events.map((e: any) => ({
                id: e.id,
                title: e.name,
                date: e.date ? new Date(e.date).toLocaleDateString() : "",
                location: e.location || "",
                description: e.description || "",
                activities: e.activities || "",
                attendees: e.attending_users_number || 0,
                registered: e.isRegistered || false,
                color: "bg-teal-500",
              }))
            : [],
        );
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
        toast({
          title: "Yêu cầu đăng nhập",
          description: "Vui lòng đăng nhập trước khi gửi đơn",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE}/memberships/${id}/join`,
        {
          join_reason: joinReason,
          skills: skills,
          promise: promiseText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "Thành công!",
          description: "Đã gửi đơn tham gia thành công!",
          variant: "default",
        });
        setJoinReason("");
        setSkills("");
        setPromiseText("");
      }
    } catch (error: any) {
      console.error("[ClubDetail] join request error", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Có lỗi xảy ra";
      toast({
        title: "Lỗi!",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterEvent = async (eventId: number) => {
    console.log(
      `[ClubDetail] handleRegisterEvent called — eventId: ${eventId}, clubId: ${id}`,
    );
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.warn("[ClubDetail] No auth token found, aborting registration");
        alert("Vui lòng đăng nhập để đăng ký tham gia event");
        return;
      }
      console.log(
        `[ClubDetail] Token present, sending POST /event-registrations/${eventId}/register`,
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
        `[ClubDetail] Registration successful — eventId: ${eventId}`,
        response.data,
      );

      toast({
        title: "Thành công!",
        description: "Bạn đã đăng ký tham gia sự kiện thành công.",
        variant: "default",
      });

      // Refresh club data để lấy dữ liệu mới nhất từ server
      console.log(`[ClubDetail] Refreshing club data for clubId: ${id}...`);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/clubs/${id}`, { headers });
      const data = res.data;
      console.log(
        `[ClubDetail] Club data refreshed — events count: ${data?.events?.length ?? 0}`,
      );

      if (data && data.events) {
        setUpcomingEvents(
          Array.isArray(data.events)
            ? data.events.map((e: any) => ({
                id: e.id,
                title: e.name,
                date: e.date ? new Date(e.date).toLocaleDateString() : "",
                location: e.location || "",
                description: e.description || "",
                activities: e.activities || "",
                attendees: e.attending_users_number || 0,
                registered: e.isRegistered || false,
                color: "bg-teal-500",
              }))
            : [],
        );
      }
    } catch (error: any) {
      console.error(
        `[ClubDetail] Register event error — eventId: ${eventId}`,
        error,
      );
      console.error("[ClubDetail] Response data:", error.response?.data);
      console.error("[ClubDetail] Status:", error.response?.status);
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

      {isLoading ? (
        <div className="container mx-auto px-6 py-16">
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Đang tải câu lạc bộ...
            </h3>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      ) : error ? (
        <div className="container mx-auto px-6 py-16">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{error}</h3>
            <Link to="/student/clubs" className="text-teal-600 font-bold">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      ) : !club ? (
        <div className="container mx-auto px-6 py-16">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Không tìm thấy câu lạc bộ
            </h3>
            <Link to="/student/clubs" className="text-teal-600 font-bold">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Hero */}
          <section className="relative bg-gradient-to-br from-[#008689] via-teal-600 to-cyan-700 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
            </div>
            <div className="container mx-auto px-6 py-16 relative z-10">
              <div className="mb-6">
                <Link
                  to="/student/clubs"
                  className="inline-flex items-center gap-2 text-white/90 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" /> Quay Lại Danh Sách CLB
                </Link>
              </div>

              <div className="grid md:grid-cols-[2fr,1fr] gap-10 items-center">
                <div>
                  <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
                    {club.name}
                  </h1>
                  <p className="text-white/90 text-lg max-w-2xl mb-6">
                    {club.description}
                  </p>
                  <div className="flex flex-wrap gap-6 text-white/90">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span className="font-semibold">
                        {members.length} thành viên
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span className="font-semibold">
                        Thành lập {club.founded}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span className="font-semibold">{club.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      <span className="font-semibold">{club.email}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-full h-64 object-cover shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="relative">
                  <img
                    src={club.image}
                    alt={`${club.name} banner`}
                    className="w-full h-[480px] object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-teal-500 opacity-20"></div>
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                    Giới Thiệu {club.name}
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    {club.description}
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 border-2 border-gray-200 p-6">
                      <div className="text-3xl font-black text-teal-600 mb-2">
                        {members.length}
                      </div>
                      <div className="font-bold text-gray-900">Thành Viên</div>
                    </div>
                    <div className="bg-gray-50 border-2 border-gray-200 p-6">
                      <div className="text-3xl font-black text-purple-600 mb-2">
                        {club.founded}
                      </div>
                      <div className="font-bold text-gray-900">Thành Lập</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Members Section */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                  Thành Viên
                </h2>
              </div>
              {members.length === 0 ? (
                <div className="text-center text-gray-600">
                  Chưa có thành viên
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {members.map((m: any) => (
                    <div
                      key={m.id}
                      className="bg-white border-2 border-gray-200 p-6"
                    >
                      <div className="font-bold text-gray-900">
                        {m?.user?.name || "Member"}
                      </div>
                      {isAuthenticated && (
                        <>
                          <div className="text-sm text-gray-600">
                            {m?.user?.email}
                          </div>
                          <div className="text-sm text-gray-600">
                            {m?.user?.mssv}
                          </div>
                        </>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        Tham gia:{" "}
                        {m?.join_date
                          ? new Date(m.join_date).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                  Sự Kiện Sắp Tới
                </h2>
              </div>
              <div className="grid gap-6 max-w-5xl mx-auto">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white border-2 border-gray-200 hover:border-teal-500 hover:shadow-xl transition-all group overflow-hidden"
                  >
                    <div className="flex">
                      <div className={`w-2 ${event.color}`}></div>
                      <div className="flex-1 p-6">
                        {/* Header với title và nút đăng ký */}
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors flex-1">
                            {event.title}
                          </h3>
                          <button
                            onClick={() =>
                              !event.registered && handleRegisterEvent(event.id)
                            }
                            className={`px-6 py-2 text-white font-bold transition-all ml-4 whitespace-nowrap ${
                              event.registered
                                ? "bg-teal-900 cursor-default"
                                : "bg-teal-600 hover:bg-teal-700 cursor-pointer"
                            }`}
                          >
                            {event.registered
                              ? "✓ Đã đăng ký tham gia"
                              : "Đăng Ký"}
                          </button>
                        </div>

                        {/* Grid thông tin cơ bản */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Ngày
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                              <Calendar className="w-4 h-4 text-teal-600" />
                              {event.date}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Địa Điểm
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                              <MapPin className="w-4 h-4 text-orange-600" />
                              {event.location}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Người Tham Gia
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                              <Users className="w-4 h-4 text-blue-600" />
                              {event.attendees} người
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {event.description && (
                          <div className="mb-3">
                            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                              Mô Tả
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {event.description}
                            </p>
                          </div>
                        )}

                        {/* Activities */}
                        {event.activities && (
                          <div>
                            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                              Hoạt Động
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {event.activities}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
            <div className="container mx-auto px-6 max-w-3xl">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-black mb-3">
                  Muốn Tham Gia {club.name}?
                </h2>
                <p className="text-lg md:text-xl opacity-90">
                  Điền vào biểu mẫu dưới đây để gửi yêu cầu tham gia.
                </p>
              </div>
              <div className="bg-white text-gray-900 p-6">
                <form onSubmit={handleJoinClub} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Vì sao bạn muốn tham gia?
                    </label>
                    <Textarea
                      value={joinReason}
                      onChange={(e) => setJoinReason(e.target.value)}
                      required
                      placeholder="Mục tiêu, động lực..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Kỹ năng của bạn
                    </label>
                    <Input
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      required
                      placeholder="VD: React, thiết kế, tổ chức sự kiện..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Cam kết khi tham gia
                    </label>
                    <Textarea
                      value={promiseText}
                      onChange={(e) => setPromiseText(e.target.value)}
                      required
                      placeholder="Bạn sẽ đóng góp điều gì?"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {submitting ? "Đang gửi..." : "Gửi đơn tham gia"}
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
