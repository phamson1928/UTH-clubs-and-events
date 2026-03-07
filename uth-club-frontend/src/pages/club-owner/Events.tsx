import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Send,
  Plus,
  Edit,
  QrCode,
  Download,
  AlertCircle,
  MessageSquare,
  Star,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
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
  { href: "/club-owner/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/club-owner/members", label: "Thành viên", icon: Users },
  { href: "/club-owner/applications", label: "Đề án", icon: FileText },
  { href: "/club-owner/events", label: "Sự kiện", icon: Calendar },
  { href: "/club-owner/requests", label: "Yêu cầu", icon: Send },
];

type EventStatus = "all" | "pending" | "approved" | "rejected" | "canceled";

export default function ClubOwnerEvents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<EventStatus>("all");
  const [participants, setParticipants] = useState<
    Record<number, { loading: boolean; data: any[]; error?: string }>
  >({});
  const [feedback, setFeedback] = useState<
    Record<number, { loading: boolean; data: any | null; error?: string }>
  >({});
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [currentQr, setCurrentQr] = useState<{ eventId: number; code: string; qrcode: string } | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

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
          location: event.location || "",
          activities: event.activities || "",
          status: event.status || "pending",
          club: event.club?.name || "Unknown",
          attendees: event.attending_users_number || 0,
          points: event.points || 0,
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

  const loadParticipants = async (eventId: number) => {
    setParticipants((prev) => ({
      ...prev,
      [eventId]: { loading: true, data: prev[eventId]?.data || [] },
    }));

    try {
      const res = await axios.get(
        `${API_BASE}/event-registrations/${eventId}/participants`,
        {
          headers: getAuthHeaders(),
        },
      );

      const list = Array.isArray(res.data?.participants)
        ? res.data.participants
        : [];

      setParticipants((prev) => ({
        ...prev,
        [eventId]: { loading: false, data: list },
      }));
    } catch (error) {
      console.error("[Events] Load participants error", error);
      setParticipants((prev) => ({
        ...prev,
        [eventId]: {
          loading: false,
          data: prev[eventId]?.data || [],
          error: "Không thể tải danh sách người tham gia",
        },
      }));
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người tham gia",
        variant: "destructive",
      });
    }
  };

  const loadFeedbackSummary = async (eventId: number) => {
    // Toggle off if already loaded
    if (feedback[eventId]?.data) {
      setFeedback((prev) => {
        const newFb = { ...prev };
        delete newFb[eventId];
        return newFb;
      });
      return;
    }

    setFeedback((prev) => ({
      ...prev,
      [eventId]: { loading: true, data: prev[eventId]?.data || null },
    }));

    try {
      const res = await axios.get(
        `${API_BASE}/feedback/${eventId}/summary`,
        { headers: getAuthHeaders() },
      );

      setFeedback((prev) => ({
        ...prev,
        [eventId]: { loading: false, data: res.data },
      }));
    } catch (error) {
      console.error("[Events] Load feedback error", error);
      setFeedback((prev) => ({
        ...prev,
        [eventId]: {
          loading: false,
          data: null,
          error: "Không thể tải đánh giá sự kiện",
        },
      }));
      toast({
        title: "Lỗi",
        description: "Không thể tải đánh giá",
        variant: "destructive",
      });
    }
  };

  const handleGenerateQr = async (eventId: number) => {
    setIsGeneratingQr(true);
    setQrModalOpen(true);
    try {
      const res = await axios.post(`${API_BASE}/event-registrations/${eventId}/qr`, {}, {
        headers: getAuthHeaders(),
      });
      setCurrentQr({ eventId, code: res.data.code, qrcode: res.data.qrImage });
      // Show Success Toast
      toast({
        title: "Thành công",
        description: "Đã tạo/refresh mã QR điểm danh.",
      });
    } catch (error) {
      console.error("[events] Render QR Error", error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo mã QR",
        variant: "destructive",
      });
      setQrModalOpen(false);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleExportAttendance = async (eventId: number) => {
    try {
      const res = await axios.get(`${API_BASE}/event-registrations/export/attendance/${eventId}`, {
        headers: getAuthHeaders(),
        responseType: "blob", // Important for file download
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DiemDanh_SuKien_${eventId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Thành công",
        description: "Đã tải xuống danh sách điểm danh.",
      });
    } catch (error) {
      console.error("Export Error", error);
      toast({
        title: "Lỗi",
        description: "Không thể xuất danh sách điểm danh",
        variant: "destructive",
      });
    }
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
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Sự Kiện</h1>
              <p className="text-muted-foreground">Quản lý các sự kiện của câu lạc bộ</p>
            </div>
            <Button onClick={() => navigate("/club-owner/requests")}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo yêu cầu sự kiện
            </Button>
          </div>

          <div className="mb-6">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
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
                        {event.date && <>{event.date}</>}
                        {event.location && <> • {event.location}</>}
                      </CardDescription>
                      <div className="text-sm text-muted-foreground mt-2">
                        <span className="font-semibold">Club:</span>{" "}
                        {event.club}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleGenerateQr(event.id)}
                        disabled={event.status !== "approved"}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        QR Điểm danh
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => loadParticipants(event.id)}
                        disabled={participants[event.id]?.loading}
                      >
                        {participants[event.id]?.loading
                          ? "Đang tải..."
                          : "Xem người tham gia"}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => loadFeedbackSummary(event.id)}
                        disabled={feedback[event.id]?.loading || event.status !== "approved"}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {feedback[event.id]?.loading
                          ? "Đang tải..."
                          : "Xem đánh giá"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/club-owner/requests")}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.description && (
                    <div>
                      <h4 className="font-semibold mb-1">Mô tả</h4>
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
                  {event.location && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold">Location:</span>{" "}
                      {event.location}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold">Điểm rèn luyện:</span>{" "}
                    {event.points} điểm
                  </div>

                  {participants[event.id]?.data && (
                    <div className="border rounded p-3 bg-muted/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Người tham gia</h4>
                        <div className="flex gap-2 items-center">
                          {participants[event.id]?.loading && (
                            <span className="text-xs text-muted-foreground">
                              Đang tải...
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportAttendance(event.id)}
                            title="Xuất danh sách điểm danh"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Xuất Excel
                          </Button>
                        </div>
                      </div>
                      {participants[event.id]?.error && (
                        <p className="text-sm text-destructive mb-2">
                          {participants[event.id]?.error}
                        </p>
                      )}
                      {participants[event.id]?.data?.length ? (
                        <div className="space-y-2 max-h-64 overflow-auto">
                          {participants[event.id].data.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between text-sm bg-white rounded border px-3 py-2"
                            >
                              <div>
                                <div className="font-semibold">{p.name}</div>
                                <div className="text-muted-foreground text-xs">
                                  {p.email}
                                </div>
                                {p.mssv && (
                                  <div className="text-muted-foreground text-xs">
                                    MSSV: {p.mssv}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="text-xs text-muted-foreground">
                                  {p.registered_at
                                    ? new Date(p.registered_at).toLocaleString()
                                    : ""}
                                </div>
                                {p.attended ? (
                                  <Badge variant="default" className="text-[10px] uppercase">
                                    Đã điểm danh
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[10px] uppercase">
                                    Chưa tham gia
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Chưa có người đăng ký.
                        </p>
                      )}
                    </div>
                  )}

                  {feedback[event.id]?.data && (
                    <div className="border rounded p-4 bg-teal-50/30">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-teal-900 flex items-center">
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Tổng quan Đánh giá
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center justify-center p-4 bg-white rounded shadow-sm border">
                          <span className="text-4xl font-bold text-teal-600">
                            {Number(feedback[event.id].data.averageRating).toFixed(1)}
                          </span>
                          <div className="flex mt-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(feedback[event.id].data.averageRating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground mt-2">
                            Dựa trên {feedback[event.id].data.totalFeedback} lượt đánh giá
                          </span>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <h5 className="font-medium text-sm">Phân bố đánh giá</h5>
                          <div className="space-y-1">
                            {[5, 4, 3, 2, 1].map((stars) => {
                              const count = Number(feedback[event.id].data.distribution?.[stars] || 0);
                              const total = Number(feedback[event.id].data.totalFeedback || 1);
                              const pct = (count / total) * 100;
                              return (
                                <div key={stars} className="flex items-center text-sm">
                                  <span className="w-12 text-gray-600 flex items-center text-xs">{stars} <Star className="w-3 h-3 ml-1 text-gray-400" /></span>
                                  <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-400" style={{ width: `${pct}%` }}></div>
                                  </div>
                                  <span className="w-8 text-right text-xs text-gray-500">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>

      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md flex flex-col items-center">
          <DialogHeader>
            <DialogTitle className="text-center">Mã QR Điểm Danh</DialogTitle>
            <DialogDescription className="text-center">
              Quét mã này để điểm danh sự kiện
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg">
            {isGeneratingQr ? (
              <div className="h-48 w-48 flex items-center justify-center bg-gray-100 rounded animate-pulse">
                <span className="text-gray-500">Đang tạo...</span>
              </div>
            ) : currentQr ? (
              <>
                <img src={currentQr.qrcode} alt="QR Code" className="h-[250px] w-[250px] object-contain border rounded-md" />
                <div className="mt-4 text-center">
                  <p className="font-mono text-xl tracking-wider font-bold p-2 bg-muted rounded-md">{currentQr.code}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 justify-center">
                    <AlertCircle className="h-3 w-3" />
                    Sinh viên có thể nhập mã này thủ công
                  </p>
                </div>
              </>
            ) : (
              <p className="text-destructive">Lỗi tải mã QR</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
