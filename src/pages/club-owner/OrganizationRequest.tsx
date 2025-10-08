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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";

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

export default function ClubOwnerOrganizationRequest() {
  const previousRequests = [
    {
      id: 1,
      organizationName: "Tech Innovators Club",
      status: "approved",
      submittedDate: "2024-12-15",
      reviewedDate: "2024-12-20",
      adminComment: "Great proposal! Approved.",
    },
    {
      id: 2,
      organizationName: "AI Research Group",
      status: "pending",
      submittedDate: "2025-01-03",
      reviewedDate: null,
      adminComment: null,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar links={sidebarLinks} />

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Organization Request</h1>
            <p className="text-muted-foreground">
              Submit a request to register your organization with the admin
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">1</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">1</div>
              </CardContent>
            </Card>
          </div>

          {/* Request Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Submit New Organization Request</CardTitle>
              <CardDescription>
                Fill out the form below to request organization registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name *</Label>
                  <Input id="orgName" placeholder="Enter organization name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="arts">Arts</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your organization's purpose and activities..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission">Mission Statement *</Label>
                <Textarea
                  id="mission"
                  placeholder="What is your organization's mission?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Request *</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why you want to register this organization..."
                  rows={4}
                />
              </div>

              <Button className="w-full" size="lg">
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            </CardContent>
          </Card>

          {/* Previous Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Request History</CardTitle>
              <CardDescription>
                View your previous organization requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previousRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">
                          {request.organizationName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Submitted on {request.submittedDate}
                        </p>
                      </div>
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "default"
                            : request.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>

                    {request.adminComment && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">
                          Admin Comment:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.adminComment}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Reviewed on {request.reviewedDate}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
