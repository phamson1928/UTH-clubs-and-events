import { useState, useEffect } from "react";
import axios from "axios";
import {
    Search,
    Calendar,
    MapPin,
    Users,
    Filter,
    Clock,
    Sparkles
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useToast } from "../../hooks/use-toast";
import { motion } from "framer-motion";

const API_BASE = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

export default function StudentEvents() {
    const { toast } = useToast();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all"); // all, ongoing, upcoming

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const res = await axios.get(`${API_BASE}/events?status=approved&limit=100`, { headers });
            const eventsData = Array.isArray(res.data) ? res.data : (res.data?.data || []);

            setEvents(eventsData.map((e: any) => ({
                ...e,
                isExpired: e.registration_deadline && new Date(e.registration_deadline) < new Date(),
                isFull: e.max_capacity && (e.attending_users_number || 0) >= e.max_capacity,
            })));
        } catch (error) {
            console.error("Failed to fetch events:", error);
            toast({
                title: "Lỗi!",
                description: "Không thể tải danh sách sự kiện trường.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterEvent = async (eventId: number) => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            toast({
                title: "Yêu cầu đăng nhập",
                description: "Vui lòng đăng nhập để đăng ký tham gia sự kiện.",
                variant: "destructive",
            });
            return;
        }

        try {
            await axios.post(`${API_BASE}/event-registrations/${eventId}/register`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({
                title: "Thành công!",
                description: "Bạn đã đăng ký tham gia sự kiện thành công.",
            });
            fetchEvents(); // Refresh
        } catch (error: any) {
            toast({
                title: "Lỗi!",
                description: error.response?.data?.message || "Không thể đăng ký tham gia.",
                variant: "destructive",
            });
        }
    };

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.club?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === "upcoming") return matchesSearch && !e.isExpired;
        if (filter === "expired") return matchesSearch && e.isExpired;
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Hero Header */}
            <section className="bg-teal-700 text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl font-extrabold mb-4">Sự Kiện Toàn Trường</h1>
                        <p className="text-teal-100 text-lg max-w-2xl">
                            Khám phá các hoạt động, workshop và ngày hội sôi động đang diễn ra tại UTH.
                        </p>
                    </motion.div>
                </div>
            </section>

            <main className="flex-1 container mx-auto px-6 py-8">
                {/* Filters & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between"
                >
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${filter === "all" ? "bg-teal-600 text-white shadow-teal-200" : "bg-white text-gray-600 border"}`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilter("upcoming")}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${filter === "upcoming" ? "bg-teal-600 text-white shadow-teal-200" : "bg-white text-gray-600 border"}`}
                        >
                            Đang mở
                        </button>
                        <button
                            onClick={() => setFilter("expired")}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${filter === "expired" ? "bg-teal-600 text-white shadow-teal-200" : "bg-white text-gray-600 border"}`}
                        >
                            Đã kết thúc
                        </button>
                    </div>

                    <div className="relative w-full md:w-96 shadow-sm rounded-lg overflow-hidden">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sự kiện, câu lạc bộ..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Không tìm thấy sự kiện nào</h3>
                        <p className="text-gray-600 mt-2">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredEvents.map((event, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                                key={event.id}
                                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row group"
                            >
                                {/* Event Image Placeholder/Visual */}
                                <div className={`w-full md:w-56 bg-gradient-to-br ${event.visibility === 'members_only' ? 'from-yellow-400 to-orange-500' : 'from-teal-500 to-cyan-600'} flex items-center justify-center text-white p-8 md:p-0 relative overflow-hidden`}>
                                    <Calendar className="w-16 h-16 opacity-30 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <div className="flex-1 p-6 md:p-8 relative">
                                    {event.visibility === 'members_only' && (
                                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-xl tracking-widest shadow-sm">
                                            Members Only
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{event.club?.name || 'UTH Event'}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-3 truncate-2-lines group-hover:text-teal-600 transition-colors">{event.name}</h3>

                                            <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-600 mb-5">
                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <Clock className="w-4 h-4 text-teal-600" />
                                                    <span className="font-medium">{new Date(event.date).toLocaleDateString("vi-VN")}</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <MapPin className="w-4 h-4 text-orange-600" />
                                                    <span className="truncate max-w-[200px] font-medium">{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <Users className="w-4 h-4 text-blue-600" />
                                                    <span className="font-medium">{event.attending_users_number || 0} / {event.max_capacity || '∞'}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-0">
                                                {event.description}
                                            </p>
                                        </div>

                                        <div className="flex flex-col justify-center items-stretch md:items-end gap-3 min-w-[160px]">
                                            {event.isRegistered ? (
                                                <button className="w-full py-3 bg-teal-900 text-white text-sm font-bold rounded-lg shadow-sm opacity-90 cursor-default flex items-center justify-center gap-2">
                                                    <Sparkles className="w-4 h-4" />
                                                    Đã đăng ký
                                                </button>
                                            ) : event.isExpired ? (
                                                <button disabled className="w-full py-3 bg-gray-100 text-gray-400 text-sm font-bold rounded-lg cursor-not-allowed border border-gray-200">
                                                    Đã hết hạn
                                                </button>
                                            ) : event.isFull ? (
                                                <button disabled className="w-full py-3 bg-gray-100 text-gray-400 text-sm font-bold rounded-lg cursor-not-allowed border border-gray-200">
                                                    Hết chỗ
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleRegisterEvent(event.id)}
                                                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg shadow-teal-100 shadow-lg hover:shadow-teal-200 hover:-translate-y-1 transition-all active:translate-y-0.5"
                                                >
                                                    Đăng Ký Ngay
                                                </button>
                                            )}

                                            {event.registration_deadline && !event.isExpired && (
                                                <span className="text-[10px] text-red-500 font-bold italic text-center md:text-right">
                                                    Hạn chót: {new Date(event.registration_deadline).toLocaleDateString("vi-VN")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
