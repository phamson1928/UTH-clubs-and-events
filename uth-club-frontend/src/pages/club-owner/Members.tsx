import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Send,
  Search,
  MoreVertical,
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
// Lightweight JWT decode (no verification). Parses payload base64.
function decodeJwt(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    console.error("[Members] Failed to decode JWT", e);
    return null;
  }
}
import { useNavigate } from "react-router-dom";
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
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
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

export default function ClubOwnerMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [owner, setOwner] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Directly fetch using JWT-bound clubId
        const res = await axios.get(`${API_BASE}/memberships/members`, {
          headers: getAuthHeaders(),
        });
        console.log(
          "[Members] memberships response count:",
          Array.isArray(res.data) ? res.data.length : "non-array"
        );
        if (Array.isArray(res.data) && res.data.length > 0) {
          console.log("[Members] first membership sample:", res.data[0]);
        }
        setMembers(
          res.data.map((m: any) => ({
            id: m.id, // membership id for actions
            userId: m.user?.id,
            name: m.user?.name,
            email: m.user?.email,
            mssv: m.user?.mssv,
            joinedDate: m.join_date
              ? new Date(m.join_date).toLocaleDateString()
              : "",
            joinReason: m.join_reason || "",
            skills: m.skills || "",
            promise: m.promise || "",
            avatar: "/placeholder.svg",
          }))
        );
        // Also fetch owner info via clubId decoded from JWT
        const token = localStorage.getItem("authToken");
        if (token) {
          const payload: any = decodeJwt(token);
          const clubId = payload?.clubId;
          if (clubId) {
            const clubRes = await axios.get(`${API_BASE}/clubs/${clubId}`);
            const club = clubRes.data;
            setOwner(
              club?.owner
                ? {
                    id: club.owner.id,
                    name: club.owner.name,
                    email: club.owner.email,
                    role: "Owner",
                    mssv: club.owner.mssv,
                    avatar: "/placeholder.svg",
                  }
                : null
            );
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(
            "[Members] fetch error status:",
            error.response?.status
          );
          console.error("[Members] fetch error data:", error.response?.data);
        }
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          navigate("/login");
          return;
        }
        console.error("[Members] Failed to fetch members", error);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Members</h1>
            <p className="text-muted-foreground">Manage your club members</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Members</CardTitle>
                  <CardDescription>
                    A list of all members in your club
                  </CardDescription>
                </div>
                <Button>Add Member</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>MSSV</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>Join Reason</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owner && (
                    <TableRow key={`owner-${owner.id}`} className="bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={owner.avatar} alt={owner.name} />
                            <AvatarFallback>
                              {owner.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{owner.name}</span>
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                            Owner
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{owner.email}</TableCell>
                      <TableCell>{owner.mssv || "-"}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-right"></TableCell>
                    </TableRow>
                  )}
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={member.avatar || "/placeholder.svg"}
                              alt={member.name}
                            />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.mssv || "-"}</TableCell>
                      <TableCell>{member.joinedDate}</TableCell>
                      <TableCell
                        className="max-w-[240px] truncate"
                        title={member.joinReason}
                      >
                        {member.joinReason || "-"}
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate"
                        title={member.skills}
                      >
                        {member.skills || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
