import { LayoutDashboard, Users, FileText, Calendar, Send, FileUp, ExternalLink } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const sidebarLinks = [
  { href: "/club-owner/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/club-owner/members", label: "Thành viên", icon: Users },
  { href: "/club-owner/applications", label: "Đề án", icon: FileText },
  { href: "/club-owner/events", label: "Sự kiện", icon: Calendar },
  { href: "/club-owner/requests", label: "Yêu cầu", icon: Send },
];

export default function ClubOwnerRequests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    expected_attendees: "",
    activities: "",
  });
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/events/pending_events`, {
        headers: getAuthHeaders(),
      });
      const items = Array.isArray(res.data)
        ? res.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description || "",
          date: event.date ? new Date(event.date).toLocaleDateString() : "",
          time: event.time || "",
          location: event.location || "",
          expectedAttendees:
            event.expected_attendees ?? event.activities ?? 0,
          activities: event.activities || "",
          organizer: event.club?.name || "Unknown",
          status: event.status || "pending",
          proposalUrl: event.proposalUrl || null,
        }))
        : [];
      setRequests(items);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        navigate("/login");
        return;
      }
      console.error("[Requests] Failed to fetch", error);
      toast({
        title: "Error",
        description: "Failed to load event requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let proposalUrl = "";

    try {
      if (proposalFile) {
        setIsUploading(true);
        const tfFormData = new FormData();
        tfFormData.append("file", proposalFile);
        const uploadRes = await axios.post(`${API_BASE}/memberships/upload/proposal`, tfFormData, {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        });
        proposalUrl = uploadRes.data.url;
        setIsUploading(false);
      }

      await axios.post(
        `${API_BASE}/events`,
        {
          name: formData.title,
          description: formData.description,
          date: new Date(
            `${formData.event_date}T${formData.event_time || "00:00"}`,
          ).toISOString(),
          location: formData.location,
          activities: formData.activities,
          proposalUrl: proposalUrl || undefined,
        },
        { headers: getAuthHeaders() },
      );
      setIsCreateOpen(false);
      setFormData({
        title: "",
        description: "",
        event_date: "",
        event_time: "",
        location: "",
        expected_attendees: "",
        activities: "",
      });
      setProposalFile(null);
      toast({
        title: "Success",
        description: "Event request submitted successfully",
      });
      await fetchRequests();
    } catch (error) {
      console.error("[Requests] Create event failed", error);
      toast({
        title: "Error",
        description: "Failed to create event request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Event Requests</h1>
            <p className="text-muted-foreground">
              Gửi và quản lý yêu cầu sự kiện
            </p>
          </div>

          <div className="mb-6">
            <Button onClick={() => setIsCreateOpen(true)}>
              Create Event Request
            </Button>
          </div>

          <div className="space-y-4">
            {isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>Loading event requests...</CardTitle>
                </CardHeader>
              </Card>
            )}
            {!isLoading && requests.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No Requests</CardTitle>
                  <CardDescription>
                    You don't have any pending event requests at the moment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Event requests will appear here once submitted.
                  </p>
                </CardContent>
              </Card>
            )}
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{request.title}</CardTitle>
                      <CardDescription>{request.organizer}</CardDescription>
                    </div>
                    <Badge variant="secondary">{request.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Date & Time</h4>
                      <p className="text-sm text-muted-foreground">
                        {request.date} {request.time}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Địa điểm</h4>
                      <p className="text-sm text-muted-foreground">
                        {request.location}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Mô tả</h4>
                    <p className="text-sm text-muted-foreground">
                      {request.description || "No description provided"}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Expected Attendees</h4>
                    <p className="text-sm text-muted-foreground">
                      {request.expectedAttendees}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Activities</h4>
                    <p className="text-sm text-muted-foreground">
                      {request.activities || "No activities provided"}
                    </p>
                  </div>
                  {request.proposalUrl && (
                    <div className="pt-2">
                      <a
                        href={request.proposalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-md transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Xem tệp Kế hoạch / Đề án
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Y�u C?u T?o S? Ki?n</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Input
                    id="description"
                    placeholder="Enter event description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) =>
                        setFormData({ ...formData, event_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.event_time}
                      onChange={(e) =>
                        setFormData({ ...formData, event_time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="Enter event location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendees">Expected Attendees</Label>
                  <Input
                    id="attendees"
                    type="number"
                    placeholder="0"
                    value={formData.expected_attendees}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expected_attendees: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activities">Activities</Label>
                  <Input
                    id="activities"
                    placeholder="Enter event activities"
                    value={formData.activities}
                    onChange={(e) =>
                      setFormData({ ...formData, activities: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposalFile">Proposal Document (PDF)</Label>
                  <Input
                    id="proposalFile"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setProposalFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <p className="text-xs text-muted-foreground">Attach a detailed plan or proposal document if required.</p>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isUploading}>
                    {isUploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
