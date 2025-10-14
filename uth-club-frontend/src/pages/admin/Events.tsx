import { LayoutDashboard, Building2, Calendar, FileText, Users } from "lucide-react";
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

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Clubs", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminEvents() {
  const pendingEvents = [
    {
      id: 1,
      title: "Hackathon 2025",
      club: "Tech Club",
      date: "2025-01-22",
      time: "09:00",
      location: "Main Hall",
      description: "A 24-hour coding competition for students",
      status: "pending",
    },
    {
      id: 2,
      title: "Art Exhibition",
      club: "Art Society",
      date: "2025-01-18",
      time: "14:00",
      location: "Gallery",
      description: "Showcase of student artwork",
      status: "pending",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Events Management</h1>
            <p className="text-muted-foreground">
              Review and approve club events
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Pending Approval</h2>
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription>{event.club}</CardDescription>
                        </div>
                        <Badge variant="secondary">{event.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <p className="font-medium">
                            {event.date} at {event.time}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Location:
                          </span>
                          <p className="font-medium">{event.location}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-muted-foreground">
                          Description:
                        </span>
                        <p className="text-sm mt-1">{event.description}</p>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                        >
                          Reject
                        </Button>
                        <Button className="flex-1">Approve</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
