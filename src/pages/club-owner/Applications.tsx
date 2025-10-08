import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Send,
  Building2,
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
  {
    href: "/club-owner/organization-request",
    label: "Organization Request",
    icon: Building2,
  },
];

export default function ClubOwnerApplications() {
  const applications = [
    {
      id: 1,
      name: "Sarah Connor",
      email: "sarah@example.com",
      reason:
        "I am passionate about technology and want to learn more about web development.",
      experience: "2 years of Python programming",
      appliedDate: "2025-01-05",
      avatar: "/placeholder.svg?key=app1",
    },
    {
      id: 2,
      name: "Michael Scott",
      email: "michael@example.com",
      reason: "Looking to expand my network and collaborate on tech projects.",
      experience: "Beginner in JavaScript",
      appliedDate: "2025-01-06",
      avatar: "/placeholder.svg?key=app2",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Applications</h1>
            <p className="text-muted-foreground">
              Review and manage membership applications
            </p>
          </div>

          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={app.avatar || "/placeholder.svg"}
                          alt={app.name}
                        />
                        <AvatarFallback>
                          {app.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{app.name}</CardTitle>
                        <CardDescription>{app.email}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Why they want to join:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {app.reason}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Experience:</h4>
                    <p className="text-sm text-muted-foreground">
                      {app.experience}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Applied on {app.appliedDate}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline">Reject</Button>
                      <Button>Approve</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
