import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Send,
  Plus,
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

const sidebarLinks = [
  { href: "/club-owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/club-owner/members", label: "Members", icon: Users },
  { href: "/club-owner/applications", label: "Applications", icon: FileText },
  { href: "/club-owner/events", label: "Events", icon: Calendar },
  { href: "/club-owner/requests", label: "Requests", icon: Send },
];

export default function ClubOwnerEvents() {
  const events = [
    {
      id: 1,
      title: "React Workshop",
      date: "2025-01-15",
      time: "14:00",
      location: "Lab 3",
      attendees: 45,
    },
    {
      id: 2,
      title: "Hackathon 2025",
      date: "2025-01-22",
      time: "09:00",
      location: "Main Hall",
      attendees: 120,
    },
    {
      id: 3,
      title: "Tech Talk: AI Trends",
      date: "2025-02-05",
      time: "16:00",
      location: "Auditorium",
      attendees: 89,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Events</h1>
              <p className="text-muted-foreground">Manage your club events</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>

          <div className="grid gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>
                        {event.date} at {event.time} • {event.location}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees} attendees</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">Manage</Button>
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
