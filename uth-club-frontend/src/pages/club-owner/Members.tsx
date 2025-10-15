import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Send,
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

const sidebarLinks = [
  { href: "/club-owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/club-owner/members", label: "Members", icon: Users },
  { href: "/club-owner/applications", label: "Applications", icon: FileText },
  { href: "/club-owner/events", label: "Events", icon: Calendar },
  { href: "/club-owner/requests", label: "Requests", icon: Send },
];

export default function ClubOwnerMembers() {
  const members = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Member",
      joinedDate: "2024-01-15",
      avatar: "/placeholder.svg?key=member1",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Admin",
      joinedDate: "2024-01-10",
      avatar: "/placeholder.svg?key=member2",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "Member",
      joinedDate: "2024-02-01",
      avatar: "/placeholder.svg?key=member3",
    },
    {
      id: 4,
      name: "Alice Williams",
      email: "alice@example.com",
      role: "Member",
      joinedDate: "2024-02-15",
      avatar: "/placeholder.svg?key=member4",
    },
  ];

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
                  <Input placeholder="Search members..." className="pl-10" />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
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
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>{member.joinedDate}</TableCell>
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
