import {
  Search,
  Users,
  Filter,
  ChevronDown,
  Star,
  Quote,
  ArrowRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";

export default function StudentClubs() {
  const clubs = [
    {
      id: 1,
      name: "Tech Innovators Hub",
      members: 324,
      category: "Technology",
      description:
        "Building the future with cutting-edge technology and innovation",
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    },
    {
      id: 2,
      name: "Creative Arts Collective",
      members: 187,
      category: "Arts",
      description:
        "Express yourself through various forms of artistic expression",
      image:
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    },
    {
      id: 3,
      name: "Athletic Excellence",
      members: 412,
      category: "Sports",
      description: "Push your physical limits and achieve sporting greatness",
      image:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    },
    {
      id: 4,
      name: "Music Production Studio",
      members: 156,
      category: "Music",
      description: "Create, produce, and perform music with talented musicians",
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    },
    {
      id: 5,
      name: "Business Leaders Forum",
      members: 289,
      category: "Business",
      description: "Develop entrepreneurial skills and business acumen",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    },
    {
      id: 6,
      name: "Digital Design Lab",
      members: 198,
      category: "Arts",
      description: "Master digital design tools and create stunning visuals",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    },
    {
      id: 7,
      name: "Robotics Engineering",
      members: 145,
      category: "Technology",
      description: "Design, build, and program advanced robotic systems",
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    },
    {
      id: 8,
      name: "Dance Performance",
      members: 234,
      category: "Arts",
      description: "Express through movement and choreography",
      image:
        "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&q=80",
    },
    {
      id: 9,
      name: "E-Sports Champions",
      members: 378,
      category: "Sports",
      description: "Compete in professional gaming tournaments",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    },
  ];

  const [filters, setFilters] = useState({
    query: "",
    category: "all",
    sort: "popular",
  });

  const categories = [
    "all",
    "Technology",
    "Arts",
    "Sports",
    "Music",
    "Business",
  ];

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
  }, [filters]);

  const testimonials = [
    {
      id: 1,
      name: "Emma Rodriguez",
      club: "Tech Innovators Hub",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      text: "This club changed my perspective on technology. The mentorship and projects have been invaluable to my growth as a developer.",
    },
    {
      id: 2,
      name: "James Chen",
      club: "Business Leaders Forum",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      text: "The networking opportunities and real-world business challenges have prepared me for my career like nothing else could.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#008689] via-teal-600 to-cyan-700 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-6xl font-black mb-6">Explore Our Clubs</h1>
            <p className="text-xl text-white/90 mb-10">
              Find the perfect community to match your interests and passions
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-gray-50 border-b-2 border-gray-200 py-8">
        <div className="container mx-auto px-6">
          <div className="bg-white border-2 border-gray-200 p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clubs by name, description..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-gray-900"
                    value={filters.query}
                    onChange={(e) =>
                      setFilters({ ...filters, query: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:border-teal-500 focus:outline-none appearance-none text-gray-900 bg-white"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t-2 border-gray-100">
              <span className="text-sm font-semibold text-gray-700">
                Sort by:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, sort: "popular" })}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    filters.sort === "popular"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Most Popular
                </button>
                <button
                  onClick={() => setFilters({ ...filters, sort: "name" })}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    filters.sort === "name"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Name A-Z
                </button>
                <button
                  onClick={() => setFilters({ ...filters, sort: "newest" })}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    filters.sort === "newest"
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Newest
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4">
            <p className="text-gray-600 font-medium">
              Showing {visible.length} {visible.length === 1 ? "club" : "clubs"}
            </p>
          </div>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {visible.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No clubs found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visible.map((club) => (
                <div
                  key={club.id}
                  className="bg-white border-2 border-gray-200 hover:border-teal-500 hover:shadow-2xl transition-all group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={club.image}
                      alt={club.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                        {club.name}
                      </h3>
                    </div>
                    <div className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-bold mb-3">
                      {club.category}
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {club.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-5 w-5 text-teal-600" />
                        <span className="font-semibold">
                          {club.members} members
                        </span>
                      </div>
                      <Link
                        to={`/student/clubs/${club.id}`}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Join Section - Image Left */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80"
                alt="Students collaborating"
                className="w-full h-[500px] object-cover shadow-2xl"
              />
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-teal-500 opacity-20"></div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                Why Join a Club?
              </h2>
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                Clubs are more than just extracurricular activities - they're
                where you'll build lifelong friendships, develop valuable
                skills, and create memories that will last forever.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Build Your Network
                    </h3>
                    <p className="text-gray-600">
                      Connect with peers who share your passions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Develop New Skills
                    </h3>
                    <p className="text-gray-600">
                      Learn through hands-on experience and mentorship
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Career Opportunities
                    </h3>
                    <p className="text-gray-600">
                      Open doors to internships and job prospects
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Member Experiences
            </h2>
            <p className="text-xl text-gray-600">
              Hear what our club members have to say
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gray-50 border-2 border-gray-200 p-8 hover:border-teal-500 hover:shadow-xl transition-all"
              >
                <Quote className="w-10 h-10 text-teal-500 mb-6" />
                <p className="text-gray-700 mb-8 leading-relaxed text-lg italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.club}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-black mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Start your own club and bring together students who share your
            unique interests
          </p>
          <button className="px-10 py-5 bg-white text-teal-700 hover:bg-gray-100 font-bold text-lg transition-all">
            Create a New Club
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black mb-2">UTH Student Clubs</div>
              <div className="text-gray-400">
                Building community, one connection at a time
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 University of Technology Ho Chi Minh. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
