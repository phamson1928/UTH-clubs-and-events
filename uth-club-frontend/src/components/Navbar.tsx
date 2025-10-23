import {
  Bell,
  User,
  LayoutDashboard,
  Building2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
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
          {/* Login and Register Buttons */}
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

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          {/* Admin Dashboard shortcut */}
          <Button asChild variant="ghost" size="icon" title="Admin Dashboard">
            <Link to="/admin/dashboard">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          </Button>
          {/* Club Owner Dashboard shortcut */}
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
                  <AvatarFallback>JD</AvatarFallback>
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
              <DropdownMenuItem className="text-destructive">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
