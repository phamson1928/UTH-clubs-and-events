import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  User,
  LayoutDashboard,
  Building2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Navbar() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<any | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) setAuthUser(JSON.parse(raw));
      else setAuthUser(null);
    } catch {
      setAuthUser(null);
    }
  }, []);

  const displayName = useMemo(() => {
    if (!authUser) return "";
    return authUser.name || authUser.email || "User";
  }, [authUser]);

  const role = authUser?.role as "user" | "admin" | "club_owner" | undefined;

  const initials = useMemo(() => {
    const name =
      (authUser?.name as string) || (authUser?.email as string) || "";
    return (
      name
        .split(" ")
        .map((p: string) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U"
    );
  }, [authUser]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setAuthUser(null);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm shadow-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="Go to homepage"
        >
          <span className="font-semibold text-lg">
            <img
              src="https://portal.ut.edu.vn/images/sv_logo_dashboard.png"
              alt="UTH Club"
            />
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Primary Navigation */}
          <Button asChild variant="ghost" size="sm">
            <Link to="/student/clubs">Clubs</Link>
          </Button>
          {/* Auth actions */}
          {!authUser ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Đăng ký</span>
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium truncate max-w-[160px]"
                title={displayName}
              >
                {displayName}
              </span>
            </div>
          )}

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          {/* Role-based dashboard shortcuts */}
          {role === "admin" && (
            <Button asChild variant="ghost" size="icon" title="Admin Dashboard">
              <Link to="/admin/dashboard">
                <LayoutDashboard className="h-5 w-5" />
              </Link>
            </Button>
          )}
          {role === "club_owner" && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              title="Club Owner Dashboard"
            >
              <Link to="/club-owner/dashboard">
                <Building2 className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {authUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar>
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="User"
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleLogout}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
