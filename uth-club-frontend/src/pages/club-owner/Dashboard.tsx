import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Send,
  Building2,
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

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

const sidebarLinks = [
  { href: "/club-owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/club-owner/members", label: "Members", icon: Users },
  { href: "/club-owner/applications", label: "Applications", icon: FileText },
  { href: "/club-owner/events", label: "Events", icon: Calendar },
  { href: "/club-owner/requests", label: "Requests", icon: Send },
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = getAuthHeaders();

        // Get clubId from JWT token
        const token = localStorage.getItem("authToken");
        let clubId: number | null = null;
        if (token) {
          try {
            const parts = token.split(".");
            const payload = JSON.parse(atob(parts[1]));
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
            })
          );
        }

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
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back! Here's your club overview
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
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalMembersInClub || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active members in your club
                </p>
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
                <p className="text-xs text-muted-foreground">Approved events</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Events
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pendingEvents || 0}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Past Events
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pastEvents || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Completed events
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Member Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Member Growth (This Year)</CardTitle>
                <CardDescription>
                  Your club's member count over time
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
                        name="New Members"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Events Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Events Growth (This Year)</CardTitle>
                <CardDescription>
                  Number of events created each month
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
                        name="Events"
                      />
                    </LineChart>
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
