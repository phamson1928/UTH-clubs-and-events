import { LayoutDashboard, Building2, Calendar, Users } from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Clubs", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/events`, {
          params: { status: "pending" },
        });
        setEvents(res.data);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          navigate("/login");
          return;
        }
        setError("Không thể tải danh sách sự kiện.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
  const handleApprove = async (id: number) => {
    try {
      await axios.patch(
        `${API_BASE}/events/${id}/approved`,
        {},
        {
          headers: { ...getAuthHeaders() },
        }
      );
      const updatedEvents = events.filter((event) => event.id !== id);
      setEvents(updatedEvents);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        navigate("/login");
        return;
      }
      setError("Không thể duyệt sự kiện.");
    }
  };
  const handleReject = async (id: number) => {
    try {
      await axios.patch(
        `${API_BASE}/events/${id}/rejected`,
        {},
        {
          headers: { ...getAuthHeaders() },
        }
      );
      const updatedEvents = events.filter((event) => event.id !== id);
      setEvents(updatedEvents);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        navigate("/login");
        return;
      }
      setError("Không thể từ chối sự kiện.");
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Pending Events</h1>
            <p className="text-muted-foreground">
              Review and approve club events awaiting approval
            </p>
          </div>

          <div className="space-y-6">
            {events.length === 0 ? (
              <p className="text-muted-foreground">
                Không có sự kiện nào đang chờ duyệt.
              </p>
            ) : (
              events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{event.name}</CardTitle>
                        <CardDescription>{event.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{event.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <p className="font-medium">{event.date}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">{event.location}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Attending Users:
                        </span>
                        <p className="font-medium">
                          {event.attending_users_number || 0}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground">
                        Description:
                      </span>
                      <p className="text-sm mt-1">{event.description}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Activities:
                      </span>
                      <p className="text-sm mt-1">{event.activities}</p>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleReject(event.id)}
                      >
                        Reject
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleApprove(event.id)}
                      >
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
