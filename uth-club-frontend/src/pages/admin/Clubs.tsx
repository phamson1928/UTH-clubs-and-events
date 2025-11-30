import {
  LayoutDashboard,
  Building2,
  Calendar,
  Search,
  MoreVertical,
  Users,
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
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Clubs", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminClubs() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClub, setCurrentClub] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE =
    (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clubsRes, usersRes] = await Promise.all([
          axios.get(`${API_BASE}/clubs`),
          axios.get(`${API_BASE}/users`, {
            headers: { ...getAuthHeaders() },
          }),
        ]);
        setClubs(clubsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          navigate("/login");
          return;
        }
      }
    };
    fetchData();
  }, []);

  const [filters, setFilters] = useState<Filters>({
    query: "",
    category: "all",
    sort: "popular",
  });

  const stats = useMemo(() => {
    const totalClubs = clubs.length;
    const totalMembers = clubs.reduce(
      (sum, c: any) => sum + Number(c?.members || 0),
      0
    );
    const avgMembers =
      totalClubs > 0 ? Math.round(totalMembers / totalClubs) : 0;

    return { totalClubs, totalMembers, avgMembers };
  }, [clubs]);

  const visible = useMemo(() => {
    let items = clubs.slice();

    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.owner?.name && c.owner.name.toLowerCase().includes(q))
      );
    }

    if (filters.category && filters.category !== "all") {
      items = items.filter((c) => c.category === filters.category);
    }

    if (filters.sort === "name") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === "newest") {
      items.sort((a, b) => b.id - a.id);
    } else {
      items.sort((a, b) => b.members - a.members);
    }

    return items;
  }, [clubs, filters]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClub?.id) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: currentClub.name,
        category: currentClub.category,
        ownerId: currentClub.ownerId,
      };
      await axios.patch(`${API_BASE}/clubs/${currentClub.id}`, payload, {
        headers: { ...getAuthHeaders() },
      });

      // Refresh clubs to get updated owner info
      const clubsRes = await axios.get(`${API_BASE}/clubs`);
      setClubs(clubsRes.data);

      setIsDialogOpen(false);
      setCurrentClub(null);
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
            <h1 className="text-3xl font-bold mb-2">Clubs Management</h1>
            <p className="text-muted-foreground">Manage all registered clubs</p>
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
                <div className="text-2xl font-bold">{stats.totalClubs}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalClubs} clubs
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
                  <CardTitle>All Clubs</CardTitle>
                  <CardDescription>
                    A list of all registered clubs in the system
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <SearchAndFilters value={filters} onChange={setFilters} />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Club Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((club: any) => (
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
                  ))}
                </TableBody>
              </Table>
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
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={currentClub?.name || ""}
                    onChange={handleInputChange}
                    required
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
