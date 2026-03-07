import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  FileText,
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
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Câu lạc bộ", icon: Building2 },
  { href: "/admin/events", label: "Sự kiện", icon: Calendar },
  { href: "/admin/users", label: "Người dùng", icon: Users },
];
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const STATUS_COLORS: Record<string, string> = {
  approved: "#22c55e",
  pending: "#f59e0b",
  rejected: "#ef4444",
  canceled: "#6b7280",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [eventsGrowth, setEventsGrowth] = useState<any[]>([]);
  const [usersGrowth, setUsersGrowth] = useState<any[]>([]);
  const [clubCategories, setClubCategories] = useState<any[]>([]);
  const [topClubs, setTopClubs] = useState<any[]>([]);
  const [eventsStatus, setEventsStatus] = useState<any[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);
  const [eventsMonthlyStatus, setEventsMonthlyStatus] = useState<any[]>([]);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = getAuthHeaders();
        const results = await Promise.all([
          axios.get(`${API_BASE}/statistics/admin_statistics`, { headers }),
          axios.get(`${API_BASE}/statistics/admin/events-growth`, { headers }),
          axios.get(`${API_BASE}/statistics/admin/users-growth`, { headers }),
          axios.get(`${API_BASE}/statistics/admin/club-categories`, {
            headers,
          }),
          axios.get(`${API_BASE}/statistics/admin/events-status`, { headers }),
          axios.get(`${API_BASE}/statistics/admin/events-monthly-status`, {
            headers,
          }),
          axios.get(`${API_BASE}/events`, {
            params: { status: "pending" },
            headers,
          }),
          axios.get(`${API_BASE}/statistics/admin/role-distribution`, {
            headers,
          }),
        ]);

        setStats(results[0].data);
        setEventsGrowth(results[1].data);
        setUsersGrowth(results[2].data);
        setClubCategories(results[3].data);
        setEventsStatus(results[4].data);
        setEventsMonthlyStatus(results[5].data);
        const pData = Array.isArray(results[6].data) ? results[6].data : (results[6].data?.data || []);
        setPendingEvents(pData);
        setRoleDistribution(results[7].data);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          navigate("/login");
          return;
        }
      }
    };
    fetchStats();
  }, []);

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
            <h1 className="text-3xl font-bold mb-2">Bảng điều khiển Admin</h1>
            <p className="text-muted-foreground">
              Tổng quan và thống kê hệ thống
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Tổng số CLB", value: stats.totalClubs || 0, sub: "Câu lạc bộ đang hoạt động", icon: Building2 },
              { title: "Tổng thành viên", value: stats.totalMembers || 0, sub: "Người dùng đã xác thực", icon: Users },
              { title: "Tổng sự kiện", value: stats.totalEvents || 0, sub: "Tất cả sự kiện", icon: Calendar },
              { title: "Sự kiện chờ duyệt", value: stats.pendingEvents || 0, sub: "Đang chờ duyệt", icon: FileText },
            ].map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
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
            {/* Events Growth Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Biểu đồ sự kiện (Năm nay)</CardTitle>
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
                          name="Sự kiện"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Users Growth Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Người dùng mới (Năm nay)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usersGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#82ca9d" name="Người dùng" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Danh mục câu lạc bộ Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Danh mục câu lạc bộ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clubCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="category"
                      >
                        {clubCategories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Events Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái sự kiện</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventsStatus.map(e => ({ ...e, status: e.status === 'approved' ? 'Đã duyệt' : e.status === 'pending' ? 'Chờ duyệt' : e.status === 'rejected' ? 'Từ chối' : e.status }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        dataKey="count"
                        nameKey="status"
                      >
                        {eventsStatus.map((entry, index) => (
                          <Cell
                            key={`status-cell-${index}`}
                            fill={
                              STATUS_COLORS[entry.status] ||
                              COLORS[index % COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* User Roles Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bổ theo vai trò (Roles)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistribution.map(r => ({ ...r, roleName: r.role === 'admin' ? 'Quản trị viên' : r.role === 'club_owner' ? 'Chủ câu lạc bộ' : 'Thành viên' }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ roleName, percent }) =>
                          `${roleName} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        dataKey="count"
                        nameKey="roleName"
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell
                            key={`role-cell-${index}`}
                            fill={
                              entry.role === 'admin' ? '#ef4444' :
                                entry.role === 'club_owner' ? '#3b82f6' :
                                  '#22c55e'
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Events by Status (stacked) */}
            <Card>
              <CardHeader>
                <CardTitle>Sự kiện hàng tháng theo trạng thái (Năm nay)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventsMonthlyStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="approved"
                        stackId="a"
                        fill={STATUS_COLORS.approved}
                        name="Đã duyệt"
                      />
                      <Bar
                        dataKey="pending"
                        stackId="a"
                        fill={STATUS_COLORS.pending}
                        name="Chờ duyệt"
                      />
                      <Bar
                        dataKey="rejected"
                        stackId="a"
                        fill={STATUS_COLORS.rejected}
                        name="Từ chối"
                      />
                      <Bar
                        dataKey="canceled"
                        stackId="a"
                        fill={STATUS_COLORS.canceled}
                        name="Đã hủy"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Events Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Sự kiện chờ duyệt (Mới nhất)</CardTitle>
                  <CardDescription>Các sự kiện vừa được các CLB gửi lên chờ phê duyệt</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin/events')}>Xem tất cả</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingEvents.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Không có yêu cầu chờ duyệt nào.</p>
                  ) : (
                    pendingEvents.slice(0, 5).map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border group hover:border-teal-500/50 transition-colors">
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="font-semibold text-foreground truncate">{event.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {event.club?.name}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.proposalUrl && (
                            <a
                              href={event.proposalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                              title="Xem đề án PDF"
                            >
                              <FileText className="w-5 h-5" />
                            </a>
                          )}
                          <Button size="sm" onClick={() => navigate('/admin/events')}>Chi tiết</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
