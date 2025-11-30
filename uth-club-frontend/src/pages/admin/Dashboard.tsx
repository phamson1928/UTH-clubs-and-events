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
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Clubs", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/users", label: "Users", icon: Users },
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
  const [eventsMonthlyStatus, setEventsMonthlyStatus] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = getAuthHeaders();
        const [
          statsRes,
          eventsGrowthRes,
          usersGrowthRes,
          clubCategoriesRes,
          eventsStatusRes,
          eventsMonthlyStatusRes,
        ] = await Promise.all([
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
        ]);

        setStats(statsRes.data);
        setEventsGrowth(eventsGrowthRes.data);
        setUsersGrowth(usersGrowthRes.data);
        setClubCategories(clubCategoriesRes.data);
        setEventsStatus(eventsStatusRes.data);
        setEventsMonthlyStatus(eventsMonthlyStatusRes.data);
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System overview and statistics
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clubs
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalClubs || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active clubs in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalMembers || 0}
                </div>
                <p className="text-xs text-muted-foreground">Verified users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Events
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalEvents || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total events</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Event
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pendingEvents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Events Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Events Growth (This Year)</CardTitle>
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
                        name="Events"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Users Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>New Users (This Year)</CardTitle>
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
                      <Bar dataKey="count" fill="#82ca9d" name="Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Club Categories Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Club Categories</CardTitle>
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
                <CardTitle>Events by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventsStatus}
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

            {/* Monthly Events by Status (stacked) */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Events by Status (This Year)</CardTitle>
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
                        name="Approved"
                      />
                      <Bar
                        dataKey="pending"
                        stackId="a"
                        fill={STATUS_COLORS.pending}
                        name="Pending"
                      />
                      <Bar
                        dataKey="rejected"
                        stackId="a"
                        fill={STATUS_COLORS.rejected}
                        name="Rejected"
                      />
                      <Bar
                        dataKey="canceled"
                        stackId="a"
                        fill={STATUS_COLORS.canceled}
                        name="Canceled"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
