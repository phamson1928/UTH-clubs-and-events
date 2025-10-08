import {
  LayoutDashboard,
  Building2,
  Calendar,
  FileText,
  Search,
  MoreVertical,
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

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Clubs", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/requests", label: "Requests", icon: FileText },
];

export default function AdminClubs() {
  const clubs = [
    {
      id: 1,
      name: "Tech Club",
      category: "Technology",
      members: 150,
      status: "active",
      owner: "John Doe",
    },
    {
      id: 2,
      name: "Art Society",
      category: "Arts",
      members: 89,
      status: "active",
      owner: "Jane Smith",
    },
    {
      id: 3,
      name: "Sports League",
      category: "Sports",
      members: 200,
      status: "active",
      owner: "Bob Johnson",
    },
    {
      id: 4,
      name: "Music Band",
      category: "Music",
      members: 67,
      status: "active",
      owner: "Alice Williams",
    },
    {
      id: 5,
      name: "Drama Club",
      category: "Arts",
      members: 45,
      status: "inactive",
      owner: "Charlie Brown",
    },
  ];

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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search clubs..." className="pl-10" />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Club Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubs.map((club) => (
                    <TableRow key={club.id}>
                      <TableCell className="font-medium">{club.name}</TableCell>
                      <TableCell>{club.category}</TableCell>
                      <TableCell>{club.owner}</TableCell>
                      <TableCell>{club.members}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            club.status === "active" ? "default" : "secondary"
                          }
                        >
                          {club.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>
                              {club.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
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
        </main>
      </div>
    </div>
  );
}
