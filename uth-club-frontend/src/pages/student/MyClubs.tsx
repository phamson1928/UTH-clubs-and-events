import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
import Navbar from "../../components/Navbar";
import { Calendar, Building2, Search, ArrowRight, XCircle } from "lucide-react";
import { normalizeImageUrl } from "./Clubs";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function StudentMyClubs() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [memberships, setMemberships] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchMyClubs();
    }, []);

    const fetchMyClubs = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get(`${API_BASE}/memberships/my-clubs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMemberships(res.data);
        } catch (error) {
            toast({
                title: "Lỗi!",
                description: "Không thể tải danh sách câu lạc bộ.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveClub = async (clubId: number, clubName: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn rời khỏi câu lạc bộ "${clubName}"?`)) return;
        try {
            const token = localStorage.getItem("authToken");
            await axios.delete(`${API_BASE}/memberships/leave/${clubId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({
                title: "Thành công!",
                description: `Đã rời ${clubName}.`,
            });
            fetchMyClubs(); // Reload list
        } catch (error: any) {
            toast({
                title: "Lỗi!",
                description: error.response?.data?.message || `Không thể rời nhóm ${clubName}.`,
                variant: "destructive"
            });
        }
    };

    const filteredMemberships = memberships.filter(m =>
        m.clubName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Hoạt động</span>;
            case 'pending': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Chờ duyệt</span>;
            case 'rejected': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">Từ chối</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 border-b pb-2 mb-2">Câu Lạc Bộ Của Tôi</h1>
                        <p className="text-gray-600">Những câu lạc bộ bạn đang tham gia hoặc gửi yêu cầu duyệt</p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm CLB..."
                            className="pl-9 w-full rounded border border-gray-300 py-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    </div>
                ) : filteredMemberships.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-100 mt-8">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Không Có Câu Lạc Bộ</h3>
                        <p className="text-gray-600 mb-6">Bạn chưa tham gia câu lạc bộ nào hoặc không tìm thấy kết quả phù hợp.</p>
                        <Link to="/student/clubs" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold rounded hover:bg-teal-700 transition">
                            Khám phá danh sách CLB <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMemberships.map((membership) => (
                            <div key={membership.clubId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group flex flex-col">
                                <div className="relative h-40 overflow-hidden bg-gray-100">
                                    {membership.clubImage ? (
                                        <img
                                            src={normalizeImageUrl(membership.clubImage)}
                                            alt={membership.clubName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-teal-50">
                                            <Building2 className="w-12 h-12 text-teal-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        {getStatusBadge(membership.membershipStatus)}
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-teal-600 transition">
                                        <Link to={`/student/clubs/${membership.clubId}`}>
                                            {membership.clubName}
                                        </Link>
                                    </h3>

                                    <div className="space-y-2 mt-auto mb-5 text-sm">
                                        {membership.joinDate && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4 text-teal-600" />
                                                <span>Đã tham gia: <strong className="text-gray-900">{new Date(membership.joinDate).toLocaleDateString('vi-VN')}</strong></span>
                                            </div>
                                        )}
                                        {membership.requestDate && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4 text-orange-600" />
                                                <span>Ngày yêu cầu: <strong className="text-gray-900">{new Date(membership.requestDate).toLocaleDateString('vi-VN')}</strong></span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <Link
                                            to={`/student/clubs/${membership.clubId}`}
                                            className="text-teal-600 font-bold hover:text-teal-700 text-sm flex items-center gap-1"
                                        >
                                            Đến trang CLB <ArrowRight className="w-4 h-4" />
                                        </Link>

                                        {membership.membershipStatus === 'approved' && (
                                            <button
                                                onClick={() => handleLeaveClub(membership.clubId, membership.clubName)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition text-sm flex items-center gap-1 font-semibold"
                                                title="Rời Câu Lạc Bộ"
                                            >
                                                <XCircle className="w-4 h-4" /> Rời
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
