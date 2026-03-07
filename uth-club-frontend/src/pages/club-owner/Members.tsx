import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Send,
  Search,
  MoreVertical,
  Download,
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";

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
        .join(""),
    );
    return JSON.parse(json);
  } catch (e) {
    console.error("[Members] Failed to decode JWT", e);
    return null;
  }
}

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

export default function ClubOwnerMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [owner, setOwner] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditEmailOpen, setIsEditEmailOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("member");
  const navigate = useNavigate();
  const { toast } = useToast();

  const openAddDialog = async () => {
    try {
      const res = await axios.get(`${API_BASE}/memberships/no-club-users`, {
        headers: getAuthHeaders(),
      });
      const items = Array.isArray(res.data)
        ? res.data.map((u: any) => ({
          id: u.id ?? u.user?.id,
          name: u.name ?? u.user?.name,
          email: u.email ?? u.user?.email,
        }))
        : [];
      setCandidates(items.filter((x: any) => x?.id));
      setIsAddOpen(true);
    } catch (error) {
      console.error("[Members] candidates error:", error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setIsSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/memberships/${selectedUserId}/add-to-club`,
        {},
        { headers: getAuthHeaders() },
      );
      await reloadMembers();
      setIsAddOpen(false);
      setSelectedUserId("");
      toast({
        title: "Success",
        description: "Member added successfully",
      });
    } catch (error) {
      console.error("[Members] add member error:", error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reloadMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/memberships/members`, {
        headers: getAuthHeaders(),
      });
      setMembers(
        res.data.map((m: any) => ({
          id: m.id,
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
          clubRole: m.club_role || "member",
          avatar: "/placeholder.svg",
        })),
      );
    } catch (e) {
      console.error("[Members] reload failed", e);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      await axios.delete(`${API_BASE}/memberships/members/${memberId}`, {
        headers: getAuthHeaders(),
      });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setConfirmRemoveId(null);
      toast({
        title: "Success",
        description: "Member removed from club",
      });
    } catch (error) {
      console.error("[Members] remove failed", error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handleEditEmail = async () => {
    if (!editingMemberId || !newEmail) return;
    try {
      const member = members.find((m) => m.id === editingMemberId);
      if (!member?.userId) return;

      await axios.post(
        `${API_BASE}/users/club-owner/edit-email/${member.userId}`,
        { email: newEmail },
        { headers: getAuthHeaders() },
      );
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMemberId ? { ...m, email: newEmail } : m,
        ),
      );
      setIsEditEmailOpen(false);
      setEditingMemberId(null);
      setNewEmail("");
      toast({
        title: "Success",
        description: "Email updated successfully",
      });
    } catch (error) {
      console.error("[Members] edit email failed", error);
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async () => {
    if (!editingMemberId || !selectedRole) return;
    try {
      await axios.patch(
        `${API_BASE}/memberships/${editingMemberId}/role`,
        { role: selectedRole },
        { headers: getAuthHeaders() },
      );
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMemberId ? { ...m, clubRole: selectedRole } : m,
        ),
      );
      setIsEditRoleOpen(false);
      setEditingMemberId(null);
      toast({
        title: "Thành công",
        description: "Vai trò đã được cập nhật",
      });
    } catch (error: any) {
      console.error("[Members] edit role failed", error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật vai trò",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Chủ nhiệm';
      case 'vice_president': return 'Phó Chủ nhiệm';
      case 'secretary': return 'Thư ký';
      case 'treasurer': return 'Thủ quỹ';
      case 'member': default: return 'Thành viên';
    }
  };

  const handleExportMembers = async () => {
    try {
      if (!owner && members.length === 0) return;

      const token = localStorage.getItem("authToken");
      let clubId = null;
      if (token) {
        const payload: any = decodeJwt(token);
        clubId = payload?.clubId;
      }
      if (!clubId) {
        toast({ title: "Lỗi", description: "Không lấy được thông tin CLB", variant: "destructive" });
        return;
      }

      const res = await axios.get(`${API_BASE}/event-registrations/export/members?clubId=${clubId}`, {
        headers: getAuthHeaders(),
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DanhSachThanhVien_CLB_${clubId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Thành công",
        description: "Đã tải xuống danh sách thành viên.",
      });
    } catch (error) {
      console.error("Export Members Error", error);
      toast({
        title: "Lỗi",
        description: "Không thể xuất danh sách thành viên",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Directly fetch using JWT-bound clubId
        const res = await axios.get(`${API_BASE}/memberships/members`, {
          headers: getAuthHeaders(),
        });
        console.log(
          "[Members] memberships response count:",
          Array.isArray(res.data) ? res.data.length : "non-array",
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
            clubRole: m.club_role || "member",
            avatar: "/placeholder.svg",
          })),
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
                : null,
            );
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(
            "[Members] fetch error status:",
            error.response?.status,
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
  }, [navigate]);

  const filteredMembers = members.filter(
    (m) =>
      (m.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (m.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Thành viên</h1>
            <p className="text-muted-foreground">Quản lý thành viên câu lạc bộ</p>
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm thành viên..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportMembers}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Excel
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>MSSV</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>Join Reason</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
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
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Chủ nhiệm
                        </span>
                      </TableCell>
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
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${member.clubRole === 'vice_president' ? 'bg-orange-100 text-orange-800' :
                            member.clubRole === 'secretary' ? 'bg-blue-100 text-blue-800' :
                              member.clubRole === 'treasurer' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {getRoleLabel(member.clubRole)}
                        </span>
                      </TableCell>
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
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingMemberId(member.id);
                                setSelectedRole(member.clubRole);
                                setIsEditRoleOpen(true);
                              }}
                            >
                              Phân công vai trò
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingMemberId(member.id);
                                setNewEmail(member.email);
                                setIsEditEmailOpen(true);
                              }}
                            >
                              Change Email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setConfirmRemoveId(member.id)}
                            >
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

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Member to Club</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="candidate">Select User</Label>
                  <select
                    id="candidate"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">-- Choose a user --</option>
                    {candidates.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={!selectedUserId}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditEmailOpen} onOpenChange={setIsEditEmailOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Email</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email">New Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditEmailOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditEmail}>Lưu</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Phân công vai trò</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="member">Thành viên</option>
                    <option value="vice_president">Phó Chủ nhiệm</option>
                    <option value="secretary">Thư ký</option>
                    <option value="treasurer">Thủ quỹ</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditRoleOpen(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleChangeRole}>Lưu thay đổi</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {confirmRemoveId !== null && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle>Remove Member</CardTitle>
                  <CardDescription>
                    Are you sure you want to remove this member from the club?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setConfirmRemoveId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveMember(confirmRemoveId)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
