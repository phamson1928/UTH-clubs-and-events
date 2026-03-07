import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  Clock,
  MapPin,
  Edit,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
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
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Câu lạc bộ", icon: Building2 },
  { href: "/admin/events", label: "Sự kiện", icon: Calendar },
  { href: "/admin/users", label: "Người dùng", icon: Users },
];

export default function AdminEvents() {
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [ongoingEvents, setOngoingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [approvedTotal, setApprovedTotal] = useState(0);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

  // A stable ref so we can cancel stale requests
  const isMounted = useRef(true);

  const fetchEvents = async (tab: string, page: number, search: string) => {
    setLoading(true);
    const statusParam = tab === "ongoing" ? "approved" : tab;
    try {
      const [activeRes, pendingCountRes, approvedCountRes] = await Promise.all([
        axios.get(`${API_BASE}/events`, {
          params: { status: statusParam, page, limit: itemsPerPage, search },
          headers: { ...getAuthHeaders() },
        }),
        axios.get(`${API_BASE}/events`, {
          params: { status: "pending", page: 1, limit: 1, search },
          headers: { ...getAuthHeaders() },
        }),
        axios.get(`${API_BASE}/events`, {
          params: { status: "approved", page: 1, limit: 1, search },
          headers: { ...getAuthHeaders() },
        }),
      ]);

      if (!isMounted.current) return;

      const { data, total } = activeRes.data;
      if (tab === "pending") {
        setPendingEvents(data || []);
      } else {
        setOngoingEvents(data || []);
      }
      setTotalEvents(total || 0);
      setTotalPages(Math.ceil((total || 0) / itemsPerPage));
      setPendingTotal(pendingCountRes.data?.total || 0);
      setApprovedTotal(approvedCountRes.data?.total || 0);
    } catch (err) {
      if (!isMounted.current) return;
      if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
        navigate("/login");
        return;
      }
      // Don't show error for 400s (validation issues on count endpoints)
      console.error("Fetch events error:", err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // Single effect — fires on mount and whenever filters/pagination change
  useEffect(() => {
    isMounted.current = true;
    fetchEvents(activeTab, currentPage, searchTerm);
    return () => { isMounted.current = false; };
  }, [activeTab, currentPage, searchTerm]);

  // When search text changes, reset to page 1 first (this will also trigger the effect above via currentPage change)
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // When tab changes, reset to page 1
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleApprove = async (id: number) => {
    try {
      await axios.patch(
        `${API_BASE}/events/${id}/approved`,
        {},
        { headers: { ...getAuthHeaders() } },
      );
      // Refetch both tabs to update counts
      await fetchEvents(activeTab, currentPage, searchTerm);
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        navigate("/login");
        return;
      }
      setActionError("Không thể duyệt sự kiện.");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.patch(
        `${API_BASE}/events/${id}/rejected`,
        {},
        { headers: { ...getAuthHeaders() } },
      );
      // Refetch both tabs to update counts
      await fetchEvents(activeTab, currentPage, searchTerm);
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        navigate("/login");
        return;
      }
      setActionError("Không thể từ chối sự kiện.");
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
      const approvedData = Array.isArray(approvedRes.data) ? approvedRes.data : (approvedRes.data?.data || []);
      setOngoingEvents(approvedData);

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
      setActionError("Không thể cập nhật sự kiện.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-3xl font-bold mb-2">Quản lý sự kiện</h1>
            <p className="text-muted-foreground">
              Quản lý và duyệt các sự kiện của câu lạc bộ
            </p>
          </div>

          {actionError && (
            <div className="flex items-center justify-between bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded mb-4">
              <span>{actionError}</span>
              <button
                onClick={() => setActionError(null)}
                className="ml-4 font-bold text-lg leading-none hover:opacity-70"
                aria-label="dismiss"
              >
                ×
              </button>
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="pending">
                  Chờ duyệt ({pendingTotal})
                </TabsTrigger>
                <TabsTrigger value="ongoing">
                  Đang diễn ra ({approvedTotal})
                </TabsTrigger>
              </TabsList>

              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9 w-full"
                  placeholder="Tìm kiếm sự kiện, địa điểm..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </div>
                ) : pendingEvents.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Không có yêu cầu tổ chức sự kiện nào đang chờ.
                    </CardContent>
                  </Card>
                ) : (
                  pendingEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">
                              {event.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">
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

                        {event.proposalUrl && (
                          <div className="pt-2">
                            <a
                              href={event.proposalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-md transition-colors border border-teal-100"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Xem Đề án / Kế hoạch (PDF)
                            </a>
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

              {!loading && totalEvents > 0 && activeTab === "pending" && (
                <div className="flex items-center justify-between mt-8 bg-card p-4 rounded-lg border shadow-sm">
                  <div className="text-sm text-muted-foreground font-medium">
                    Hiển thị <span className="text-foreground font-bold">{pendingEvents.length}</span> trên <span className="text-foreground font-bold">{totalEvents}</span> sự kiện
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || loading}
                      className="h-9 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1.5" />
                      Trước
                    </Button>
                    <div className="bg-muted/50 px-3 py-1.5 rounded-md text-sm font-bold min-w-[3.5rem] text-center border shadow-inner">
                      {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || loading}
                      className="h-9 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      Tiếp
                      <ChevronRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}
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

              {!loading && totalEvents > 0 && activeTab === "ongoing" && (
                <div className="flex items-center justify-between mt-8 bg-card p-4 rounded-lg border shadow-sm">
                  <div className="text-sm text-muted-foreground font-medium">
                    Hiển thị <span className="text-foreground font-bold">{ongoingEvents.length}</span> trên <span className="text-foreground font-bold">{totalEvents}</span> sự kiện
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || loading}
                      className="h-9 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1.5" />
                      Trước
                    </Button>
                    <div className="bg-muted/50 px-3 py-1.5 rounded-md text-sm font-bold min-w-[3.5rem] text-center border shadow-inner">
                      {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || loading}
                      className="h-9 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      Tiếp
                      <ChevronRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}
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
