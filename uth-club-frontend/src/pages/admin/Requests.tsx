import {
  LayoutDashboard,
  Building2,
  Calendar,
  FileText,
  Users,
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
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";

const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Clubs", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminRequests() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/memberships/admin/all-requests`,
        {
          headers: getAuthHeaders(),
        },
      );
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        navigate("/login");
        return;
      }
      console.error("[AdminRequests] Failed to fetch", error);
      toast({
        title: "Error",
        description: "Failed to load membership requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await axios.patch(
        `${API_BASE}/memberships/${id}/approve`,
        {},
        { headers: getAuthHeaders() },
      );
      toast({ title: "Approved", description: "Membership request approved." });
      await fetchRequests();
    } catch (error) {
      console.error("[AdminRequests] Approve failed", error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      await axios.patch(
        `${API_BASE}/memberships/${id}/reject`,
        {},
        { headers: getAuthHeaders() },
      );
      toast({ title: "Rejected", description: "Membership request rejected." });
      await fetchRequests();
    } catch (error) {
      console.error("[AdminRequests] Reject failed", error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
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
            <h1 className="text-3xl font-bold mb-2">Membership Requests</h1>
            <p className="text-muted-foreground">
              Review and approve club membership requests
            </p>
          </div>

          {isLoading && (
            <p className="text-muted-foreground">Loading requests...</p>
          )}

          {!isLoading && requests.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending membership requests.
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{req.user?.name ?? "Unknown User"}</CardTitle>
                      <CardDescription>
                        Requesting to join{" "}
                        <strong>{req.club?.name ?? "Unknown Club"}</strong>
                        {" · "}
                        {req.created_at
                          ? new Date(req.created_at).toLocaleDateString()
                          : ""}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{req.status ?? "pending"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Email:</span>
                      <p className="text-sm text-muted-foreground">
                        {req.user?.email ?? "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Club:</span>
                      <p className="text-sm text-muted-foreground">
                        {req.club?.name ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`comment-${req.id}`}>
                        Admin Comment (Optional)
                      </Label>
                      <Textarea
                        id={`comment-${req.id}`}
                        placeholder="Add a comment for the applicant..."
                        rows={3}
                        value={comments[req.id] ?? ""}
                        onChange={(e) =>
                          setComments((prev) => ({
                            ...prev,
                            [req.id]: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        disabled={processingId === req.id}
                        onClick={() => handleReject(req.id)}
                      >
                        Reject
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={processingId === req.id}
                        onClick={() => handleApprove(req.id)}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
