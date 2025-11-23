import {
  LayoutDashboard,
  Building2,
  Calendar,
  FileText,
  Users,
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
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clubs", label: "Clubs", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminRequests() {
  const organizationRequests = [
    {
      id: 1,
      organizationName: "AI Research Group",
      category: "Technology",
      description:
        "A group focused on artificial intelligence research and development",
      mission: "To advance AI knowledge and applications among students",
      contactEmail: "ai-research@uth.edu",
      reason: "We want to create a community for AI enthusiasts",
      submittedBy: "Michael Chen",
      submittedDate: "2025-01-03",
      status: "pending",
    },
    {
      id: 2,
      organizationName: "Drama Society",
      category: "Arts",
      description: "Theater and performing arts club",
      mission: "To promote theatrical arts and performance",
      contactEmail: "drama@uth.edu",
      reason: "To provide a platform for students interested in theater",
      submittedBy: "Sarah Johnson",
      submittedDate: "2025-01-05",
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
            <h1 className="text-3xl font-bold mb-2">Organization Requests</h1>
            <p className="text-muted-foreground">
              Review and approve organization registration requests
            </p>
          </div>

          <div className="space-y-6">
            {organizationRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{request.organizationName}</CardTitle>
                      <CardDescription>
                        Submitted by {request.submittedBy} on{" "}
                        {request.submittedDate}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{request.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Category:</span>
                      <p className="text-sm text-muted-foreground">
                        {request.category}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Contact:</span>
                      <p className="text-sm text-muted-foreground">
                        {request.contactEmail}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Description:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {request.description}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium">
                      Mission Statement:
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {request.mission}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium">
                      Reason for Request:
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {request.reason}
                    </p>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`comment-${request.id}`}>
                        Admin Comment (Optional)
                      </Label>
                      <Textarea
                        id={`comment-${request.id}`}
                        placeholder="Add a comment for the applicant..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        Reject
                      </Button>
                      <Button className="flex-1">Approve</Button>
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
