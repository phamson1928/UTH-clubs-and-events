import {
  LayoutDashboard,
  Building2,
  Calendar,
  Search,
  MoreVertical,
  Trash2,
  Users,
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
import SearchAndFilters, { Filters } from "../../components/SearchAndFilters";
import { useEffect, useMemo, useState } from "react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
} from "../../components/ui/dialog";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Câu lạc bộ", icon: Building2 },
  { href: "/admin/events", label: "Sự kiện", icon: Calendar },
  { href: "/admin/users", label: "Người dùng", icon: Users },
];

export default function AdminClubs() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClub, setCurrentClub] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClubs, setTotalClubs] = useState(0);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    query: "",
    category: "all",
    sort: "popular",
  });

  const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Helper function to normalize image URLs
  const normalizeImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) {
      return "";
    }
    // If it's already a full URL (starts with http:// or https://), return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // If it's a relative path starting with /uploads/, prepend API_BASE
    if (imagePath.startsWith("/uploads/")) {
      return `${API_BASE}${imagePath}`;
    }
    // Otherwise, assume it's a relative path and prepend API_BASE
    return `${API_BASE}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  useEffect(() => {
    const fetchClubs = async () => {
      setIsLoading(true);
      try {
        const clubsRes = await axios.get(`${API_BASE}/clubs`, {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: filters.query,
          },
          headers: { ...getAuthHeaders() },
        });

        const { data, total } = clubsRes.data;
        setClubs(data || []);
        setTotalClubs(total || 0);
        setTotalPages(Math.ceil((total || 0) / itemsPerPage));
      } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          navigate("/login");
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersRes = await axios.get(`${API_BASE}/users`, {
          params: { limit: 200 },
          headers: { ...getAuthHeaders() },
        });
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []);
        setUsers(usersData);
      } catch (error) { }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchClubs();
    }, 300);

    fetchUsers();

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, filters.query]);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.query]);

  const stats = useMemo(() => {
    const totalClubs = clubs.length;
    const totalMembers = clubs.reduce(
      (sum, c: any) => sum + Number(c?.members || 0),
      0,
    );
    const avgMembers =
      totalClubs > 0 ? Math.round(totalMembers / totalClubs) : 0;

    return { totalClubs, totalMembers, avgMembers };
  }, [clubs]);

  const clubCategories = useMemo(() => {
    const unique = Array.from(
      new Set(clubs.map((c: any) => c.category).filter(Boolean)),
    ) as string[];
    return unique.sort();
  }, [clubs]);

  const visible = clubs;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleEdit = (club: any) => {
    setCurrentClub({ ...club, ownerId: club.owner?.id });
    setIsDialogOpen(true);
  };

  const handleDelete = async (clubId: number) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;
    try {
      await axios.delete(`${API_BASE}/clubs/${clubId}`, {
        headers: { ...getAuthHeaders() },
      });
      setClubs((prev) => prev.filter((c) => c.id !== clubId));
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        navigate("/login");
        return;
      }
      console.error("Delete club failed", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentClub) return;
    const { name, value } = e.target;
    setCurrentClub({ ...currentClub, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClub?.id) return;
    setIsSubmitting(true);
    try {
      let uploadedImageUrl = currentClub.club_image;

      // Upload image if a new file was selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await axios.post(
          `${API_BASE}/upload/image`,
          formData,
          {
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "multipart/form-data",
            },
          },
        );
        uploadedImageUrl = uploadRes.data.path;
      }

      const payload = {
        name: currentClub.name,
        description: currentClub.description,
        category: currentClub.category,
        club_image: uploadedImageUrl,
        ownerId: currentClub.ownerId,
      };
      await axios.patch(`${API_BASE}/clubs/${currentClub.id}`, payload, {
        headers: { ...getAuthHeaders() },
      });

      // Refresh clubs to get updated owner info
      const clubsRes = await axios.get(`${API_BASE}/clubs`, {
        headers: { ...getAuthHeaders() },
      });
      const clubsData = Array.isArray(clubsRes.data) ? clubsRes.data : (clubsRes.data?.data || []);
      setClubs(clubsData);

      setIsDialogOpen(false);
      setCurrentClub(null);
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        navigate("/login");
        return;
      }
      console.error("Update club failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Quản lý câu lạc bộ</h1>
            <p className="text-muted-foreground">Quản lý tất cả câu lạc bộ đã đăng ký</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clubs
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClubs}</div>
                <p className="text-xs text-muted-foreground">
                  {totalClubs} clubs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Across all clubs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgMembers}</div>
                <p className="text-xs text-muted-foreground">Per club</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tất Cả Câu Lạc Bộ</CardTitle>
                  <CardDescription>
                    Danh sách tất cả câu lạc bộ đã đăng ký trong hệ thống
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <SearchAndFilters
                  value={filters}
                  onChange={setFilters}
                  categories={clubCategories}
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên CLB</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Thành viên</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : visible.length > 0 ? (
                    visible.map((club: any) => (
                      <TableRow key={club.id}>
                        <TableCell className="font-medium">{club.name}</TableCell>
                        <TableCell>{club.category}</TableCell>
                        <TableCell>{club.owner?.name || "-"}</TableCell>
                        <TableCell>{Number(club.members || 0)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(club)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(club.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        Không tìm thấy câu lạc bộ nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {!isLoading && totalClubs > 0 && (
                <div className="flex items-center justify-between mt-6 px-2">
                  <div className="text-sm text-muted-foreground">
                    Đang hiển thị <span className="font-medium">{clubs.length}</span> trên <span className="font-medium">{totalClubs}</span> câu lạc bộ
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Club</DialogTitle>
                <DialogDescription>Update club information</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ Tên</Label>
                  <Input
                    id="name"
                    name="name"
                    value={currentClub?.name || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Input
                    id="description"
                    name="description"
                    value={currentClub?.description || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={currentClub?.category || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club_image">Club Image</Label>
                  <Input
                    id="club_image"
                    name="club_image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {(imagePreview || currentClub?.club_image) && (
                    <div className="mt-2">
                      <img
                        src={
                          imagePreview ||
                          normalizeImageUrl(currentClub?.club_image)
                        }
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerId">Owner</Label>
                  <select
                    id="ownerId"
                    name="ownerId"
                    value={currentClub?.ownerId || currentClub?.owner?.id || ""}
                    onChange={(e) =>
                      setCurrentClub({
                        ...currentClub,
                        ownerId: Number(e.target.value),
                      })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Select owner</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setCurrentClub(null);
                      setImageFile(null);
                      setImagePreview("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
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
