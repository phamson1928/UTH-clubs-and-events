import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  Clock,
  MapPin,
  Edit,
} from "lucide-react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [ongoingEvents, setOngoingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    activities: "",
  });
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
        // Fetch pending events
        const pendingRes = await axios.get(`${API_BASE}/events`, {
          params: { status: "pending" },
          headers: { ...getAuthHeaders() },
        });
        setPendingEvents(pendingRes.data);

        // Fetch approved events (đang diễn ra)
        const approvedRes = await axios.get(`${API_BASE}/events`, {
          params: { status: "approved" },
          headers: { ...getAuthHeaders() },
        });

        setOngoingEvents(approvedRes.data);
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
      const updatedEvents = pendingEvents.filter((event) => event.id !== id);
      setPendingEvents(updatedEvents);

      // Refresh ongoing events after approval
      const approvedRes = await axios.get(`${API_BASE}/events`, {
        params: { status: "approved" },
        headers: { ...getAuthHeaders() },
      });
      setOngoingEvents(approvedRes.data);
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
      const updatedEvents = pendingEvents.filter((event) => event.id !== id);
      setPendingEvents(updatedEvents);
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

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForInput = (dateString: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEditClick = (event: any) => {
    setCurrentEvent(event);
    setEditFormData({
      name: event.name || "",
      description: event.description || "",
      date: formatDateForInput(event.date),
      location: event.location || "",
      activities: event.activities || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: editFormData.name,
        description: editFormData.description,
        date: new Date(editFormData.date).toISOString(),
        location: editFormData.location,
        activities: editFormData.activities,
      };

      await axios.patch(`${API_BASE}/events/${currentEvent.id}`, payload, {
        headers: { ...getAuthHeaders() },
      });

      // Refresh ongoing events
      const approvedRes = await axios.get(`${API_BASE}/events`, {
        params: { status: "approved" },
        headers: { ...getAuthHeaders() },
      });
      setOngoingEvents(approvedRes.data);

      setIsEditDialogOpen(false);
      setCurrentEvent(null);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        navigate("/login");
        return;
      }
      setError("Không thể cập nhật sự kiện.");
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-3xl font-bold mb-2">Events Management</h1>
            <p className="text-muted-foreground">
              Quản lý và duyệt các sự kiện của câu lạc bộ
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="pending">
                Pending Events ({pendingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="ongoing">
                Ongoing Events ({ongoingEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </div>
                ) : pendingEvents.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">
                        Không có sự kiện nào đang chờ duyệt.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">
                              {event.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {event.description}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="ml-4">
                            {event.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Ngày diễn ra:
                              </span>
                              <p className="font-medium">
                                {formatDate(event.date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Địa điểm:
                              </span>
                              <p className="font-medium">
                                {event.location || "Chưa cập nhật"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {event.club && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Câu lạc bộ:
                            </span>
                            <span className="font-medium">
                              {event.club.name}
                            </span>
                          </div>
                        )}

                        {event.description && (
                          <div>
                            <span className="text-sm font-semibold text-muted-foreground">
                              Mô tả:
                            </span>
                            <p className="text-sm mt-1 text-foreground">
                              {event.description}
                            </p>
                          </div>
                        )}

                        {event.activities && (
                          <div>
                            <span className="text-sm font-semibold text-muted-foreground">
                              Hoạt động:
                            </span>
                            <p className="text-sm mt-1 text-foreground">
                              {event.activities}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleReject(event.id)}
                          >
                            Từ chối
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => handleApprove(event.id)}
                          >
                            Duyệt
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="ongoing" className="mt-6">
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </div>
                ) : ongoingEvents.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">
                        Không có sự kiện nào đang diễn ra.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  ongoingEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-xl">
                                {event.name}
                              </CardTitle>
                              <Badge variant="default" className="bg-green-500">
                                Đang diễn ra
                              </Badge>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {event.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-2">
                            <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Ngày diễn ra:
                              </span>
                              <p className="font-semibold text-foreground">
                                {formatDate(event.date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Địa điểm:
                              </span>
                              <p className="font-semibold text-foreground">
                                {event.location || "Chưa cập nhật"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {event.club && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Câu lạc bộ:
                              </span>
                              <span className="font-medium">
                                {event.club.name}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-muted-foreground">
                              Người tham gia:
                            </span>
                            <span className="font-semibold text-blue-600">
                              {event.attending_users_number || 0} người
                            </span>
                          </div>
                        </div>

                        {event.description && (
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <span className="text-sm font-semibold text-muted-foreground">
                              Mô tả:
                            </span>
                            <p className="text-sm mt-2 text-foreground">
                              {event.description}
                            </p>
                          </div>
                        )}

                        {event.activities && (
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <span className="text-sm font-semibold text-muted-foreground">
                              Hoạt động:
                            </span>
                            <p className="text-sm mt-2 text-foreground">
                              {event.activities}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleEditClick(event)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Edit Event Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa sự kiện</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin sự kiện đang diễn ra
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Tên sự kiện *</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    required
                    placeholder="Nhập tên sự kiện"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Mô tả</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Nhập mô tả sự kiện"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">Ngày và giờ diễn ra *</Label>
                    <Input
                      id="edit-date"
                      type="datetime-local"
                      value={editFormData.date}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Địa điểm *</Label>
                    <Input
                      id="edit-location"
                      value={editFormData.location}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          location: e.target.value,
                        })
                      }
                      required
                      placeholder="Nhập địa điểm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-activities">Hoạt động *</Label>
                  <Textarea
                    id="edit-activities"
                    value={editFormData.activities}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        activities: e.target.value,
                      })
                    }
                    required
                    placeholder="Nhập các hoạt động của sự kiện"
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
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
