import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Send,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

const sidebarLinks = [
  { href: "/club-owner/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/club-owner/members", label: "Thành viên", icon: Users },
  { href: "/club-owner/applications", label: "Đề án", icon: FileText },
  { href: "/club-owner/events", label: "Sự kiện", icon: Calendar },
  { href: "/club-owner/requests", label: "Yêu cầu", icon: Send },
];

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function ClubOwnerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [eventsGrowth, setEventsGrowth] = useState<any[]>([]);
  const [membersGrowth, setMembersGrowth] = useState<any[]>([]);
  const [clubName, setClubName] = useState<string>("");
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const headers = getAuthHeaders();

      // Get clubId from JWT token
      const token = localStorage.getItem("authToken");
      let clubId: number | null = null;
      if (token) {
        try {
          const parts = token.split(".");
          // Fix base64url → base64 padding before decoding
          const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const padded = b64.padEnd(
            b64.length + ((4 - (b64.length % 4)) % 4),
            "=",
          );
          const payload = JSON.parse(atob(padded));
          clubId = payload.clubId || null;
        } catch (e) {
          console.error("Failed to decode token", e);
        }
      }

      // Fetch all data including club info
      const promises = [
        axios.get(`${API_BASE}/statistics/own-club_statistics`, {
          headers,
        }),
        axios.get(`${API_BASE}/statistics/club-owner/events-growth`, {
          headers,
        }),
        axios.get(`${API_BASE}/statistics/club-owner/members-growth`, {
          headers,
        }),
      ];

      // If we have clubId, fetch club info
      if (clubId) {
        promises.push(
          axios.get(`${API_BASE}/clubs/${clubId}`, {
            headers,
          }),
        );
      }

      // Fetch join requests
      promises.push(
        axios.get(`${API_BASE}/memberships/request`, {
          headers,
          params: { page: 1, limit: 10 } // recent 10 requests
        }),
      );

      const results = await Promise.all(promises);
      const [statsRes, eventsGrowthRes, membersGrowthRes, ...rest] = results;

      setStats(statsRes.data);
      setEventsGrowth(eventsGrowthRes.data);
      setMembersGrowth(membersGrowthRes.data);

      // If club info was fetched, set club name
      if (clubId && rest.length > 0) {
        const clubRes = rest[0] as any;
        if (clubRes?.data?.name) {
          setClubName(clubRes.data.name);
        }
      }
      // Set join requests if they exist
      const requestsRes = results[promises.length - 1] as any;
      if (requestsRes?.data?.data) {
        setJoinRequests(requestsRes.data.data.filter((r: any) => r.status === 'pending'));
      }

    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        navigate("/login");
        return;
      }
      console.error("Failed to fetch statistics", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [navigate]);

  const handleApproveRequest = async (id: number) => {
    try {
      await axios.patch(`${API_BASE}/memberships/${id}/approve`, {}, { headers: getAuthHeaders() });
      toast({ title: "Thành công", description: "Đã duyệt đơn gia nhập." });
      fetchStats();
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể duyệt đơn.", variant: "destructive" });
    }
  };

  const handleRejectRequest = async (id: number) => {
    try {
      await axios.patch(`${API_BASE}/memberships/${id}/reject`, {}, { headers: getAuthHeaders() });
      toast({ title: "Thành công", description: "Đã từ chối đơn gia nhập." });
      fetchStats();
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể từ chối đơn.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Bảng điều khiển</h1>
                <p className="text-muted-foreground">
                  Chào mừng trở lại! Tổng quan câu lạc bộ của bạn
                </p>
              </div>
              {clubName && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg border border-primary/20">
                  <Building2 className="h-5 w-5" />
                  <span className="font-semibold text-lg">{clubName}</span>
                </div>
              )}
            </div>
            {clubName && (
              <div className="text-sm text-muted-foreground">
                Quản lý câu lạc bộ:{" "}
                <span className="font-medium text-foreground">{clubName}</span>
              </div>
            )}
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Tổng thành viên", value: stats.totalMembersInClub || 0, sub: "Thành viên hiện tại", icon: Users },
              { title: "Tổng sự kiện", value: stats.totalEvents || 0, sub: "Sự kiện đã duyệt", icon: Calendar },
              { title: "Sự kiện chờ duyệt", value: stats.pendingEvents || 0, sub: "Đang chờ admin duyệt", icon: FileText },
              { title: "Sự kiện đã qua", value: stats.pastEvents || 0, sub: "Sự kiện đã hoàn thành", icon: Calendar },
            ].map((s, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
                key={idx}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {s.title}
                    </CardTitle>
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {s.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.sub}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Member Growth Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Biểu đồ thành viên (Năm nay)</CardTitle>
                  <CardDescription>
                    Số lượng thành viên theo thời gian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={membersGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="count"
                          fill="hsl(var(--primary))"
                          name="Thành viên mới"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Events Growth Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Biểu đồ sự kiện (Năm nay)</CardTitle>
                  <CardDescription>
                    Số sự kiện tạo bởi CLB mỗi tháng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={eventsGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8884d8"
                          strokeWidth={2}
                          name="Sự kiện"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Pending Members Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Yêu cầu tham gia mới nhất</CardTitle>
                <CardDescription>
                  Duyệt hoặc từ chối sinh viên muốn gia nhập CLB
                </CardDescription>
              </CardHeader>
              <CardContent>
                {joinRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                    Không có yêu cầu tham gia mới nào
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinRequests.map((req) => (
                      <div key={req.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="mb-4 md:mb-0">
                          <p className="font-semibold text-gray-900">{req.user?.name} <span className="text-sm font-normal text-muted-foreground">({req.user?.mssv || req.user?.email})</span></p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1"><span className="font-medium text-gray-800">Lý do:</span> {req.joinReason || "Không có lý do"}</p>
                          <p className="text-sm text-gray-600 line-clamp-1"><span className="font-medium text-gray-800">Cam kết:</span> {req.promise || "Không có cam kết"}</p>
                        </div>
                        <div className="flex bg-white gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleRejectRequest(req.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Từ chối
                          </Button>
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700"
                            onClick={() => handleApproveRequest(req.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Duyệt
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        </main>
      </div>
    </div>
  );
}
