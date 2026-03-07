import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
import Navbar from "../../components/Navbar";
import { Calendar, MapPin, Search, Tag, Users, CheckCircle, QrCode, Star, MessageSquare } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const API_BASE = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

export default function StudentMyEvents() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Check-in state
    const [checkInModalOpen, setCheckInModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [checkInCode, setCheckInCode] = useState("");
    const [isCheckingIn, setIsCheckingIn] = useState(false);

    // Feedback state
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE}/event-registrations/my-events`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(res.data);
        } catch (error) {
            toast({
                title: "Lỗi!",
                description: "Không thể tải danh sách sự kiện.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRegistration = async (eventId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này?")) return;
        try {
            const token = localStorage.getItem("authToken");
            await axios.delete(`${API_BASE}/event-registrations/${eventId}/cancel`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({
                title: "Thành công!",
                description: "Đã hủy đăng ký sự kiện.",
            });
            fetchMyEvents();
        } catch (error: any) {
            toast({
                title: "Lỗi!",
                description: error.response?.data?.message || "Không thể hủy đăng ký.",
                variant: "destructive"
            });
        }
    };

    const handleCheckIn = async () => {
        if (!selectedEventId || !checkInCode) return;
        setIsCheckingIn(true);
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.post(`${API_BASE}/event-registrations/${selectedEventId}/checkin`, {
                code: checkInCode
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast({
                title: "Thành công!",
                description: res.data.message || "Bạn đã điểm danh thành công.",
            });
            setCheckInModalOpen(false);
            setCheckInCode("");
            fetchMyEvents(); // re-fetch to update status
        } catch (error: any) {
            toast({
                title: "Lỗi!",
                description: error.response?.data?.message || "Mã check-in không hợp lệ.",
                variant: "destructive"
            });
        } finally {
            setIsCheckingIn(false);
        }
    };

    const openCheckInModal = (eventId: number) => {
        setSelectedEventId(eventId);
        setCheckInCode("");
        setCheckInModalOpen(true);
    };

    const openFeedbackModal = (eventId: number) => {
        setSelectedEventId(eventId);
        setRating(5);
        setComment("");
        setFeedbackModalOpen(true);
    };

    const handleSubmitFeedback = async () => {
        if (!selectedEventId || rating < 1 || rating > 5) return;
        setIsSubmittingFeedback(true);
        try {
            const token = localStorage.getItem("authToken");
            await axios.post(`${API_BASE}/feedback/${selectedEventId}`, {
                rating,
                comment,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast({
                title: "Thành công!",
                description: "Cảm ơn bạn đã gửi đánh giá.",
            });
            setFeedbackModalOpen(false);
        } catch (error: any) {
            toast({
                title: "Lỗi!",
                description: error.response?.data?.message || "Không thể gửi đánh giá. Bạn có thể đã gửi rồi.",
                variant: "destructive"
            });
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    const filteredEvents = events.filter(e =>
        e.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.clubName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Đã duyệt</span>;
            case 'pending': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Chờ duyệt</span>;
            case 'canceled': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Đã hủy</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 border-b pb-2 mb-2">Sự Kiện Của Tôi</h1>
                        <p className="text-gray-600">Những sự kiện bạn đã tham gia hoặc đăng ký thành công</p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm sự kiện hoặc tên CLB..."
                            className="pl-9 w-full rounded-md border border-gray-300 py-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-100">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Không Có Sự Kiện</h3>
                        <p className="text-gray-600 mb-6">Bạn chưa tham gia sự kiện nào hoặc không tìm thấy kết quả phù hợp.</p>
                        <Link to="/student/clubs" className="px-6 py-2 bg-teal-600 text-white font-bold rounded hover:bg-teal-700 transition">
                            Khám phá sự kiện tại CLB
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredEvents.map((evt) => (
                            <div key={evt.eventId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition">
                                <div className="w-2 bg-teal-500 hidden md:block"></div>

                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{evt.eventName}</h3>
                                        <div className="flex gap-2 items-center">
                                            {getStatusBadge(evt.status)}
                                        </div>
                                    </div>

                                    <div className="text-sm font-semibold text-teal-700 mb-4 flex items-center gap-1">
                                        <Users className="w-4 h-4" /> CLB Tổ Chức: {evt.clubName || "Hệ Thống"}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b py-3 my-4 bg-gray-50/50 rounded p-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs uppercase text-gray-500 font-bold tracking-wide">Thời gian</span>
                                            <span className="flex items-center gap-2 text-sm text-gray-900 mt-1">
                                                <Calendar className="w-4 h-4 text-teal-600" />
                                                {new Date(evt.date).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs uppercase text-gray-500 font-bold tracking-wide">Địa điểm</span>
                                            <span className="flex items-center gap-2 text-sm text-gray-900 mt-1">
                                                <MapPin className="w-4 h-4 text-orange-600" />
                                                <span className="truncate" title={evt.location}>{evt.location}</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs uppercase text-gray-500 font-bold tracking-wide">Ngày đăng ký</span>
                                            <span className="flex items-center gap-2 text-sm text-gray-900 mt-1">
                                                <Tag className="w-4 h-4 text-blue-600" />
                                                {new Date(evt.registeredAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            {evt.attended ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="text-green-600 flex items-center gap-1 font-semibold text-sm bg-green-50 px-3 py-1.5 rounded-full">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Đã điểm danh (+{evt.points || 0} ĐRL)
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openFeedbackModal(evt.eventId)}
                                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                    >
                                                        <MessageSquare className="w-4 h-4 mr-1" />
                                                        Đánh giá
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openCheckInModal(evt.eventId)}
                                                    className="text-teal-600 border-teal-200 hover:bg-teal-50"
                                                >
                                                    <QrCode className="w-4 h-4 mr-1" />
                                                    Điểm danh
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Only able to cancel if the event hasn't happened or they haven't attended */}
                                            {!evt.attended && (
                                                <button
                                                    onClick={() => handleCancelRegistration(evt.eventId)}
                                                    className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded text-sm font-bold transition flex items-center gap-2"
                                                >
                                                    Hủy
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Dialog open={checkInModalOpen} onOpenChange={setCheckInModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Điểm danh sự kiện</DialogTitle>
                        <DialogDescription>
                            Nhập mã kiểm tra do Ban tổ chức cung cấp để xác nhận bạn đã tham gia sự kiện.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={checkInCode}
                            onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
                            placeholder="Nhập mã (VD: UTH-1-ABCDEF12)"
                            className="font-mono text-center uppercase tracking-widest text-lg h-12"
                            maxLength={16}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCheckInModalOpen(false)}>Thoát</Button>
                        <Button onClick={handleCheckIn} disabled={!checkInCode || isCheckingIn}>
                            {isCheckingIn ? "Đang xử lý..." : "Xác nhận điểm danh"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Đánh giá sự kiện</DialogTitle>
                        <DialogDescription>
                            Đánh giá của bạn giúp ban tổ chức cải thiện trong các sự kiện tới.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium mb-2">Đánh giá chung</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star className={`w-8 h-8 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bình luận (Tùy chọn)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Bạn cảm thấy sự kiện này thế nào?"
                                className="w-full h-24 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                maxLength={500}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFeedbackModalOpen(false)}>Thoát</Button>
                        <Button onClick={handleSubmitFeedback} disabled={isSubmittingFeedback}>
                            {isSubmittingFeedback ? "Đang gửi..." : "Gửi đánh giá"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
