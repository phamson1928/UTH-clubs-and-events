import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users as UsersIcon,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  UserPlus,
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
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import axios from "axios";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Câu lạc bộ", icon: Building2 },
  { href: "/admin/events", label: "Sự kiện", icon: Calendar },
  { href: "/admin/users", label: "Người dùng", icon: UsersIcon },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/users`, {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            role: roleFilter,
          },
          headers: {
            ...getAuthHeaders(),
          },
        });

        const { data, total, page } = res.data;
        setUsers(data || []);
        setTotalUsers(total || 0);
        setTotalPages(Math.ceil((total || 0) / itemsPerPage));
        if (page !== currentPage) setCurrentPage(page);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          navigate("/login");
          return;
        }
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm, roleFilter]);

  // Reset page when filtering or searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);


  const handleEdit = (user: any) => {
    setCurrentUser(user);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setCurrentUser({
      name: "",
      email: "",
      password: "",
      mssv: "",
      role: "user",
      verificationToken: "admin-created",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_BASE}/users/delete/${userId}`, {
          headers: {
            ...getAuthHeaders(),
          },
        });
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          navigate("/login");
          return;
        }
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const method = currentUser.id ? "PATCH" : "POST";
      const url = currentUser.id
        ? `${API_BASE}/users/update/${currentUser.id}`
        : `${API_BASE}/users/create`;

      // Only send necessary fields, exclude relations
      const { memberships, ownedClubs, createdAt, ...userData } = currentUser;

      const res = await axios({
        method,
        url,
        data: userData,
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (currentUser.id) {
        setUsers(users.map((u) => (u.id === currentUser.id ? res.data : u)));
      } else {
        setUsers([...users, res.data]);
      }

      setIsDialogOpen(false);
      setCurrentUser(null);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        navigate("/login");
        return;
      }
      console.error("Error saving user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;
    const { name, value, type, checked } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
              <p className="text-gray-500">Quản lý tất cả người dùng trong hệ thống</p>
            </div>
            <Button onClick={handleCreate}>
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentUser?.id ? "Sửa thông tin" : "Thêm người dùng mới"}
                </DialogTitle>
                <DialogDescription>
                  {currentUser?.id
                    ? "Cập nhật thông tin người dùng"
                    : "Thêm người dùng mới vào hệ thống"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ Tên</Label>
                  <Input
                    id="name"
                    name="name"
                    value={currentUser?.name || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={currentUser?.email || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {!currentUser?.id && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={currentUser?.password || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mssv">MSSV</Label>
                    <Input
                      id="mssv"
                      name="mssv"
                      value={currentUser?.mssv || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_points">Điểm Rèn Luyện</Label>
                    <Input
                      id="total_points"
                      name="total_points"
                      type="number"
                      value={currentUser?.total_points || 0}
                      onChange={(e) => setCurrentUser({ ...currentUser, total_points: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select
                    value={currentUser?.role || ""}
                    onValueChange={(value: string) =>
                      currentUser &&
                      setCurrentUser({ ...currentUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                      <SelectItem value="club_owner">Chủ nhiệm</SelectItem>
                      <SelectItem value="user">Sinh viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isVerified"
                    name="isVerified"
                    checked={currentUser?.isVerified || false}
                    onChange={(e) => setCurrentUser({ ...currentUser, isVerified: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <Label htmlFor="isVerified" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Đã xác thực tài khoản
                  </Label>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setCurrentUser(null);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Người Dùng</CardTitle>
                  <CardDescription>
                    Quản lý tất cả người dùng trong hệ thống
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      className="pl-9 w-full sm:w-[250px]"
                      placeholder="Tìm kiếm người dùng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Tabs value={roleFilter} onValueChange={setRoleFilter} className="w-full">
                  <TabsList className="grid w-full max-w-lg grid-cols-4">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                    <TabsTrigger value="club_owner">Chủ nhiệm</TabsTrigger>
                    <TabsTrigger value="user">Sinh viên</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>MSSV</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Điểm rèn luyện</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
                      <TableHead>CLB</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.mssv || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "admin"
                                  ? "default"
                                  : user.role === "club_owner"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {user.role === 'admin' ? 'Quản trị viên' : user.role === 'club_owner' ? 'Chủ nhiệm' : 'Sinh viên'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-teal-600">
                              {user.total_points || 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isVerified ? "default" : "secondary"} className={user.isVerified ? "bg-green-500 hover:bg-green-600" : ""}>
                              {user.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {user.role === "club_owner" &&
                              user.ownedClubs &&
                              user.ownedClubs.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {user.ownedClubs.map((club: any) => (
                                  <Badge key={club.id} variant="default">
                                    {club.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : user.memberships &&
                              user.memberships.length > 0 ? (
                              <Badge variant="secondary">
                                {user.memberships.length} CLB
                              </Badge>
                            ) : (
                              <Badge variant="outline">Không có</Badge>
                            )}
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
                                  onClick={() => handleEdit(user)}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          Không tìm thấy người dùng
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {!isLoading && totalUsers > 0 && (
                <div className="flex items-center justify-between mt-6 px-2">
                  <div className="text-sm text-muted-foreground">
                    Đang hiển thị <span className="font-medium">{users.length}</span> trên <span className="font-medium">{totalUsers}</span> người dùng
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Trước
                    </Button>
                    <div className="flex items-center gap-1 mx-2">
                      <Badge variant="outline" className="h-8 w-8 flex items-center justify-center p-0">
                        {currentPage}
                      </Badge>
                      <span className="text-muted-foreground text-sm">/ {totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Tiếp
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  );
}
