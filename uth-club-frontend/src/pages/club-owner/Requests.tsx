import { LayoutDashboard, Users, FileText, Calendar, Send } from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const sidebarLinks = [
  { href: "/club-owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/club-owner/members", label: "Members", icon: Users },
  { href: "/club-owner/applications", label: "Applications", icon: FileText },
  { href: "/club-owner/events", label: "Events", icon: Calendar },
  { href: "/club-owner/requests", label: "Requests", icon: Send },
];

export default function ClubOwnerRequests() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Requests</h1>
            <p className="text-muted-foreground">
              Manage various club requests
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>No Requests</CardTitle>
              <CardDescription>
                You don't have any pending requests at the moment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Requests from members and other club activities will appear
                here.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
