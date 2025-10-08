import { Search, Calendar, Users, TrendingUp } from "lucide-react";
import Navbar from "../../components/Navbar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Link } from "react-router-dom";

export default function StudentHome() {
  const featuredClubs = [
    {
      id: 1,
      name: "Tech Club",
      members: 150,
      category: "Technology",
      image: "/tech-club.jpg",
    },
    {
      id: 2,
      name: "Art Society",
      members: 89,
      category: "Arts",
      image: "/art-society.jpg",
    },
    {
      id: 3,
      name: "Sports League",
      members: 200,
      category: "Sports",
      image: "/generic-sports-league.png",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Workshop",
      club: "Tech Club",
      date: "2025-01-15",
      attendees: 45,
    },
    {
      id: 2,
      title: "Art Exhibition",
      club: "Art Society",
      date: "2025-01-18",
      attendees: 67,
    },
    {
      id: 3,
      title: "Basketball Tournament",
      club: "Sports League",
      date: "2025-01-20",
      attendees: 120,
    },
  ];

  const [heroQuery, setHeroQuery] = useState("");
  const navigate = useNavigate();

  function onHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = heroQuery.trim();
    if (q) navigate(`/student/clubs?q=${encodeURIComponent(q)}`);
    else navigate(`/student/clubs`);
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] page-backdrop">
      <Navbar />

      {/* Hero Section */}
      <section className="py-24">
        <div className="container px-4">
          <div
            className="relative overflow-hidden rounded-2xl p-12"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, rgba(0,134,137,0.85) 100%)",
            }}
          >
            {/* decorative blobs */}
            <svg
              className="absolute -top-10 -left-10 opacity-30"
              width="220"
              height="220"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <g fill="none">
                <circle cx="50" cy="50" r="60" fill="rgba(0,134,137,0.18)" />
                <circle cx="150" cy="140" r="50" fill="rgba(0,134,137,0.12)" />
              </g>
            </svg>

            <div className="max-w-3xl mx-auto text-center relative z-10 text-white">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
                Discover Your Community at UTH
              </h1>
              <p className="text-lg opacity-90 mb-8">
                Join clubs, attend events, and connect with students who share
                your interests
              </p>

              <form
                onSubmit={onHeroSearch}
                className="flex gap-3 max-w-xl mx-auto"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search for clubs..."
                    className="pl-10 bg-white text-gray-900"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                >
                  Search
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="border border-white/30 text-white"
                  onClick={() => navigate("/student/clubs")}
                >
                  Explore
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-accent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Clubs
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">
                  Across all categories
                </p>
              </CardContent>
            </Card>

            <Card className="card-accent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Events
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card className="card-accent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">Active students</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Clubs */}
      <section className="py-12">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Clubs</h2>
            <Button variant="outline" asChild>
              <Link to="/student/clubs">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredClubs.map((club) => (
              <Card
                key={club.id}
                className="overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <img
                  src={club.image || "/placeholder.svg"}
                  alt={club.name}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <CardTitle>{club.name}</CardTitle>
                  <CardDescription>{club.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{club.members} members</span>
                    </div>
                    <Button size="sm" asChild>
                      <Link to={`/student/clubs/${club.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 bg-muted/40">
        <div className="container px-4">
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>

          <div className="grid gap-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>{event.club}</CardDescription>
                    </div>
                    <Button size="sm">Register</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees} attending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
