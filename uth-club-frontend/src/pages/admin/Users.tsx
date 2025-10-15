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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

type UserRole = 'ADMIN' | 'CLUB_LEADER' | 'STUDENT';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Clubs", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/users", label: "Users", icon: UsersIcon, active: true },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/users');
        // const data = await response.json();
        
        // Mock data
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            isActive: true,
            createdAt: '2023-01-01T00:00:00Z',
          },
          {
            id: '2',
            email: 'leader@example.com',
            firstName: 'Club',
            lastName: 'Leader',
            role: 'CLUB_LEADER',
            isActive: true,
            createdAt: '2023-02-15T00:00:00Z',
          },
          {
            id: '3',
            email: 'student@example.com',
            firstName: 'John',
            lastName: 'Doe',
            studentId: '65000001',
            role: 'STUDENT',
            isActive: true,
            createdAt: '2023-03-20T00:00:00Z',
          },
        ];
        
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
      (user.studentId && user.studentId.includes(searchTerm)) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // TODO: Replace with actual API call
        // await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const method = currentUser.id ? 'PUT' : 'POST';
      const url = currentUser.id 
        ? `/api/users/${currentUser.id}`
        : '/api/users';
      
      // TODO: Replace with actual API call
      // const response = await fetch(url, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(currentUser),
      // });
      // const data = await response.json();
      
      if (currentUser.id) {
        // Update existing user
        setUsers(users.map(u => u.id === currentUser.id ? currentUser : u));
      } else {
        // Add new user
        // setUsers([...users, data]);
      }
      
      setIsDialogOpen(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;
    const { name, value, type, checked } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: type === 'checkbox' ? checked : value,
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setCurrentUser(null)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {currentUser?.id ? 'Edit User' : 'Add New User'}
                  </DialogTitle>
                  <DialogDescription>
                    {currentUser?.id 
                      ? 'Update user information'
                      : 'Add a new user to the system'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={currentUser?.firstName || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={currentUser?.lastName || ''}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={currentUser?.email || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {(!currentUser?.id || currentUser?.role === 'STUDENT') && (
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        name="studentId"
                        value={currentUser?.studentId || ''}
                        onChange={handleInputChange}
                        disabled={!!currentUser?.id}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={currentUser?.role || ''}
                      onValueChange={(value: UserRole) => 
                        currentUser && setCurrentUser({ ...currentUser, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="CLUB_LEADER">Club Leader</SelectItem>
                        <SelectItem value="STUDENT">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={currentUser?.isActive || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Label htmlFor="isActive" className="text-sm font-medium">
                      Active
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
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

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
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.studentId || '-'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === 'ADMIN'
                                  ? 'default'
                                  : user.role === 'CLUB_LEADER'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
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
