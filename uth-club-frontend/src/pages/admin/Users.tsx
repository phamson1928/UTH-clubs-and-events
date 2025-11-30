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
import axios from "axios";
type UserRole = "ADMIN" | "CLUB_LEADER" | "STUDENT";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Clubs", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/users", label: "Users", icon: UsersIcon, active: true },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users`, {
          headers: {
            ...getAuthHeaders(),
          },
        });
        setUsers(res.data);
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

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.name.toLowerCase().includes(searchLower) ||
      (user.mssv && user.mssv.includes(searchTerm)) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

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
        const res = await axios.delete(`${API_BASE}/users/delete/${userId}`, {
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
        setUsers(users.map((u) => (u.id === currentUser.id ? currentUser : u)));
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
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-gray-500">Manage all users in the system</p>
            </div>
            <Button onClick={handleCreate}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentUser?.id ? "Edit User" : "Add New User"}
                </DialogTitle>
                <DialogDescription>
                  {currentUser?.id
                    ? "Update user information"
                    : "Add a new user to the system"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
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
                    <Label htmlFor="password">Password</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="mssv">Student ID (MSSV)</Label>
                  <Input
                    id="mssv"
                    name="mssv"
                    value={currentUser?.mssv || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={currentUser?.role || ""}
                    onValueChange={(value: string) =>
                      currentUser &&
                      setCurrentUser({ ...currentUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
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
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    Manage all users in the system
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-9 w-[300px]"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Club</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
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
                              {user.role.replace("_", " ")}
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
                                {user.memberships.length} club(s)
                              </Badge>
                            ) : (
                              <Badge variant="outline">No club</Badge>
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
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
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
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
