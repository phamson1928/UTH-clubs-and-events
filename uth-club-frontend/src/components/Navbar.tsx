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
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<any | null>(null);

  useEffect(() => {
    const syncAuth = () => {
      try {
        const raw = localStorage.getItem("authUser");
        if (raw) setAuthUser(JSON.parse(raw));
        else setAuthUser(null);
      } catch {
        setAuthUser(null);
      }
    };

    syncAuth();

    // Sync auth state when another tab logs in/out
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
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
            <Link to="/student/clubs">Câu Lạc Bộ</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/student/events">Sự Kiện</Link>
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

          {authUser && <NotificationBell />}

          {/* Role-based dashboard shortcuts */}
          {role === "admin" && (
            <Button asChild variant="ghost" size="icon" title="Bảng điều khiển Admin">
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
              title="Bảng điều khiển CLB"
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
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/student/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                {role === "user" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/student/my-clubs")}>
                      <Building2 className="mr-2 h-4 w-4" />
                      CLB của tôi
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/student/my-events")}>
                      <Bell className="mr-2 h-4 w-4" />
                      Sự kiện của tôi
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive font-bold"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
