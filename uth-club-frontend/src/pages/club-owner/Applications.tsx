import { LayoutDashboard, Users, FileText, Calendar, Send } from "lucide-react";
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

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

export default function ClubOwnerApplications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmRejectId, setConfirmRejectId] = useState<number | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/memberships/request`, {
        headers: getAuthHeaders(),
      });
      const items = Array.isArray(res.data)
        ? res.data.map((m: any) => ({
            id: m.id,
            name: m.user?.name,
            email: m.user?.email,
            reason: m.join_reason || "",
            experience: m.skills || "",
            appliedDate: m.request_date
              ? new Date(m.request_date).toLocaleDateString()
              : "",
            avatar: "/placeholder.svg",
          }))
        : [];
      setApplications(items);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        navigate("/login");
        return;
      }
      console.error("[Applications] Failed to fetch", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await axios.patch(
        `${API_BASE}/memberships/${id}/approve`,
        {},
        { headers: getAuthHeaders() }
      );
      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast({
        title: "Success",
        description: "Member approved successfully",
      });
    } catch (error) {
      console.error("[Applications] approve failed", error);
      toast({
        title: "Error",
        description: "Failed to approve member",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.patch(
        `${API_BASE}/memberships/${id}/reject`,
        {},
        { headers: getAuthHeaders() }
      );
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setConfirmRejectId(null);
      toast({
        title: "Success",
        description: "Member rejected",
      });
    } catch (error) {
      console.error("[Applications] reject failed", error);
      toast({
        title: "Error",
        description: "Failed to reject member",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Applications</h1>
            <p className="text-muted-foreground">
              Review and manage membership applications
            </p>
          </div>

          <div className="space-y-4">
            {isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>Loading applications...</CardTitle>
                </CardHeader>
              </Card>
            )}
            {!isLoading && applications.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No pending applications</CardTitle>
                  <CardDescription>
                    New requests will appear here when members apply.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={app.avatar || "/placeholder.svg"}
                          alt={app.name}
                        />
                        <AvatarFallback>
                          {app.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{app.name}</CardTitle>
                        <CardDescription>{app.email}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Why they want to join:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {app.reason}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Experience:</h4>
                    <p className="text-sm text-muted-foreground">
                      {app.experience}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Applied on {app.appliedDate}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setConfirmRejectId(app.id)}
                      >
                        Reject
                      </Button>
                      <Button onClick={() => handleApprove(app.id)}>
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

      {confirmRejectId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Confirm Rejection</CardTitle>
              <CardDescription>
                Are you sure you want to reject this application?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setConfirmRejectId(null)}
                >
                  No
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(confirmRejectId)}
                >
                  Yes, Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
