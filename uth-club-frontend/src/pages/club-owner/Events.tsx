import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Send,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const sidebarLinks = [
  { href: "/club-owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/club-owner/members", label: "Members", icon: Users },
  { href: "/club-owner/applications", label: "Applications", icon: FileText },
  { href: "/club-owner/events", label: "Events", icon: Calendar },
  { href: "/club-owner/requests", label: "Requests", icon: Send },
];

type EventStatus = "all" | "pending" | "approved" | "rejected" | "canceled";

export default function ClubOwnerEvents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<EventStatus>("all");

  const fetchEvents = async (status?: EventStatus) => {
    setIsLoading(true);
    try {
      const endpoint =
        status && status !== "all"
          ? `${API_BASE}/events/club_owner?status=${status}`
          : `${API_BASE}/events/club_owner`;

      const res = await axios.get(endpoint, {
        headers: getAuthHeaders(),
      });

      const items = Array.isArray(res.data)
        ? res.data.map((event: any) => ({
            id: event.id,
            title: event.name || event.title || "Untitled Event",
            description: event.description || "",
            date: event.date ? new Date(event.date).toLocaleDateString() : "",
            time: event.time || "",
            location: event.location || "",
            activities: event.activities || "",
            status: event.status || "pending",
            club: event.club?.name || "Unknown",
          }))
        : [];
      setEvents(items);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        navigate("/login");
        return;
      }
      console.error("[Events] Failed to fetch", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (value: EventStatus) => {
    setStatusFilter(value);
    fetchEvents(value);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "canceled":
        return "outline";
      default:
        return "secondary";
    }
  };

  useEffect(() => {
    fetchEvents(statusFilter);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Events</h1>
              <p className="text-muted-foreground">Manage your club events</p>
            </div>
            <Button onClick={() => navigate("/club-owner/requests")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event Request
            </Button>
          </div>

          <div className="mb-6">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>Loading events...</CardTitle>
                </CardHeader>
              </Card>
            )}
            {!isLoading && events.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No Events</CardTitle>
                  <CardDescription>
                    You don't have any events at the moment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create a new event request to get started.
                  </p>
                </CardContent>
              </Card>
            )}
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>{event.title}</CardTitle>
                        <Badge variant={getStatusBadgeVariant(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {event.date && event.time && (
                          <>
                            {event.date} at {event.time}
                          </>
                        )}
                        {event.location && <> • {event.location}</>}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.description && (
                    <div>
                      <h4 className="font-semibold mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  )}
                  {event.activities && (
                    <div>
                      <h4 className="font-semibold mb-1">Activities</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.activities}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
