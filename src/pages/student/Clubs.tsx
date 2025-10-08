import { Search, Filter, Users } from "lucide-react";
import Navbar from "../../components/Navbar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Link } from "react-router-dom";
import SearchAndFilters, { Filters } from "../../components/SearchAndFilters";
import { useMemo, useState } from "react";

export default function StudentClubs() {
  const clubs = [
    {
      id: 1,
      name: "Tech Club",
      members: 150,
      category: "Technology",
      description: "Learn coding and tech skills",
      image: "/tech-club.jpg",
    },
    {
      id: 2,
      name: "Art Society",
      members: 89,
      category: "Arts",
      description: "Express your creativity",
      image: "/art-society.jpg",
    },
    {
      id: 3,
      name: "Sports League",
      members: 200,
      category: "Sports",
      description: "Stay active and healthy",
      image: "/generic-sports-league.png",
    },
    {
      id: 4,
      name: "Music Band",
      members: 67,
      category: "Music",
      description: "Make music together",
      image: "/music-band.jpg",
    },
    {
      id: 5,
      name: "Drama Club",
      members: 45,
      category: "Arts",
      description: "Perform on stage",
      image: "/drama-club.jpg",
    },
    {
      id: 6,
      name: "Robotics Team",
      members: 78,
      category: "Technology",
      description: "Build robots and compete",
      image: "/robotics-team.jpg",
    },
  ];

  const [filters, setFilters] = useState<Filters>({
    query: "",
    category: "all",
    sort: "popular",
  });

  const visible = useMemo(() => {
    let items = clubs.slice();

    if (filters.query.trim()) {
      const q = filters.query.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== "all") {
      items = items.filter((c) => c.category === filters.category);
    }

    if (filters.sort === "name") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === "newest") {
      items.sort((a, b) => b.id - a.id);
    } else {
      items.sort((a, b) => b.members - a.members);
    }

    return items;
  }, [clubs, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Clubs</h1>
          <p className="text-muted-foreground">
            Find the perfect club to join and connect with like-minded students
          </p>
        </div>

        <SearchAndFilters value={filters} onChange={setFilters} />

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((club) => (
            <Card
              key={club.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
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
                <p className="text-sm text-muted-foreground mb-4">
                  {club.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{club.members} members</span>
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/student/clubs/${club.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
