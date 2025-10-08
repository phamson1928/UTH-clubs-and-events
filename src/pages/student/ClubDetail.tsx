import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Calendar, MapPin, Mail } from "lucide-react";
import Navbar from "../../components/Navbar";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";

export default function StudentClubDetail() {
  const { id } = useParams();

  const club = {
    id: 1,
    name: "Tech Club",
    category: "Technology",
    description:
      "A community for tech enthusiasts to learn, build, and innovate together. We organize workshops, hackathons, and tech talks.",
    members: 150,
    founded: "2020",
    email: "techclub@uth.edu",
    location: "Engineering Building, Room 301",
    image: "/tech-club-banner.jpg",
  };

  const upcomingEvents = [
    {
      id: 1,
      title: "React Workshop",
      date: "2025-01-15",
      time: "14:00",
      location: "Lab 3",
    },
    {
      id: 2,
      title: "Hackathon 2025",
      date: "2025-01-22",
      time: "09:00",
      location: "Main Hall",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link to="/student/clubs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clubs
          </Link>
        </Button>

        {/* Club Header */}
        <div className="mb-8">
          <img
            src={club.image || "/placeholder.svg"}
            alt={club.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
              <p className="text-muted-foreground mb-4">{club.category}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{club.members} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Founded {club.founded}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{club.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{club.email}</span>
                </div>
              </div>
            </div>

            <Button size="lg" className="md:w-auto w-full">
              Join Club
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="join">Join Request</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About {club.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {club.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Upcoming Events</h3>
              {upcomingEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {event.date} at {event.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button>Register for Event</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>Join {club.name}</CardTitle>
                <CardDescription>
                  Tell us why you want to join this club
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Why do you want to join?</Label>
                  <Textarea
                    id="reason"
                    placeholder="Share your interests and what you hope to gain from joining..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">
                    Relevant Experience (Optional)
                  </Label>
                  <Textarea
                    id="experience"
                    placeholder="Any relevant skills or experience..."
                    rows={3}
                  />
                </div>

                <Button className="w-full">Submit Join Request</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
