import {
  Search,
  Calendar,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Star,
  Quote,
} from "lucide-react";
import { useState } from "react";
import Navbar from "../../components/Navbar";

export default function StudentHome() {
  const [heroQuery, setHeroQuery] = useState("");

  const upcomingEvents = [
    {
      id: 1,
      title: "Hackathon 2025: AI Revolution",
      club: "Innovation Lab",
      date: "Nov 15, 2025",
      time: "9:00 AM",
      attendees: 156,
      color: "bg-teal-500",
    },
    {
      id: 2,
      title: "Digital Art Showcase",
      club: "Creative Collective",
      date: "Nov 18, 2025",
      time: "6:00 PM",
      attendees: 89,
      color: "bg-purple-500",
    },
    {
      id: 3,
      title: "Inter-University Championship",
      club: "Velocity Sports",
      date: "Nov 22, 2025",
      time: "2:00 PM",
      attendees: 340,
      color: "bg-orange-500",
    },
    {
      id: 4,
      title: "Leadership Summit",
      club: "Global Leaders",
      date: "Nov 25, 2025",
      time: "10:00 AM",
      attendees: 124,
      color: "bg-blue-500",
    },
  ];

  const stats = [
    {
      label: "Active Clubs",
      value: "52",
      subtext: "Across all categories",
      icon: Users,
      color: "text-teal-600",
    },
    {
      label: "Monthly Events",
      value: "38",
      subtext: "Join something new",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      label: "Active Members",
      value: "2,847",
      subtext: "Growing community",
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      label: "Success Stories",
      value: "500+",
      subtext: "Achievements made",
      icon: Sparkles,
      color: "text-blue-600",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      club: "Tech Innovation Club",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      text: "Joining the Tech Club was the best decision of my university life. I've learned so much, made incredible friends, and even landed my dream internship through connections here!",
    },
    {
      id: 2,
      name: "Marcus Johnson",
      club: "Arts & Culture Society",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      text: "The creative freedom and support I've found here is unmatched. Every event is an opportunity to showcase our work and collaborate with talented peers.",
    },
    {
      id: 3,
      name: "Aisha Patel",
      club: "Global Leaders Forum",
      image:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
      text: "This club opened doors I never knew existed. From networking events to leadership workshops, I've grown both personally and professionally.",
    },
  ];

  function onHeroSearch(e: React.FormEvent) {
    e.preventDefault();
    console.log("Searching for:", heroQuery);
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#008689] via-teal-600 to-cyan-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-sm border border-white/30 mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Welcome to UTH Student Community
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              Discover Your
              <br />
              Community at UTH
            </h1>

            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with passionate students, join exciting clubs, and create
              unforgettable memories. Your university journey starts here.
            </p>

            <div className="flex gap-4 max-w-2xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for clubs, events, or interests..."
                  className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onHeroSearch(e)}
                />
              </div>
              <button
                onClick={onHeroSearch}
                className="px-8 py-4 bg-white text-teal-700 hover:bg-gray-100 font-bold transition-all"
              >
                Search
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                "Technology",
                "Arts & Design",
                "Sports",
                "Business",
                "Leadership",
                "Social",
              ].map((cat) => (
                <button
                  key={cat}
                  className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all text-sm font-medium"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 p-8 hover:border-teal-500 hover:shadow-lg transition-all group"
                >
                  <Icon className={`w-10 h-10 ${stat.color} mb-4`} />
                  <div className="text-5xl font-black text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600">{stat.subtext}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Events Section - Image Left */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80"
                alt="Students at event"
                className="w-full h-[600px] object-cover shadow-2xl"
              />
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-teal-500 opacity-20"></div>
            </div>
            <div>
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                Events That
                <br />
                Inspire Growth
              </h2>
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                From hackathons to art exhibitions, leadership summits to sports
                tournaments - our diverse events calendar offers something for
                everyone.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Each event is carefully designed to foster learning,
                collaboration, and fun. Whether you're looking to develop new
                skills, network with peers, or simply enjoy your university
                experience, you'll find opportunities that match your interests.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      38+ Monthly Events
                    </h3>
                    <p className="text-gray-600">
                      Regular activities across all categories
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Open to All Students
                    </h3>
                    <p className="text-gray-600">
                      Everyone is welcome to participate
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Skill Development
                    </h3>
                    <p className="text-gray-600">
                      Workshops and hands-on experiences
                    </p>
                  </div>
                </div>
              </div>
              <button className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all">
                Explore All Events
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Activities Section - Image Right */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-black text-gray-900 mb-6">
                Activities That
                <br />
                Build Community
              </h2>
              <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                Beyond events, our clubs organize regular activities that bring
                students together in meaningful ways. From weekly meetups to
                collaborative projects.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                These activities are where lasting friendships are formed and
                real learning happens. Whether it's a coding session, art
                workshop, sports practice, or community service project, you'll
                find your people here.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white border-2 border-gray-200 p-6">
                  <div className="text-4xl font-black text-teal-600 mb-2">
                    52
                  </div>
                  <div className="font-bold text-gray-900">Active Clubs</div>
                </div>
                <div className="bg-white border-2 border-gray-200 p-6">
                  <div className="text-4xl font-black text-purple-600 mb-2">
                    2.8K
                  </div>
                  <div className="font-bold text-gray-900">Members</div>
                </div>
                <div className="bg-white border-2 border-gray-200 p-6">
                  <div className="text-4xl font-black text-orange-600 mb-2">
                    150+
                  </div>
                  <div className="font-bold text-gray-900">
                    Weekly Activities
                  </div>
                </div>
                <div className="bg-white border-2 border-gray-200 p-6">
                  <div className="text-4xl font-black text-blue-600 mb-2">
                    500+
                  </div>
                  <div className="font-bold text-gray-900">Success Stories</div>
                </div>
              </div>
              <button className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold transition-all">
                Join a Club Today
              </button>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80"
                alt="Students collaborating"
                className="w-full h-[600px] object-cover shadow-2xl"
              />
              <div className="absolute -top-8 -left-8 w-64 h-64 bg-purple-500 opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600">
              Don't miss these exciting opportunities
            </p>
          </div>

          <div className="grid gap-6 max-w-5xl mx-auto">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white border-2 border-gray-200 hover:border-teal-500 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center">
                  <div className={`w-2 h-full ${event.color}`}></div>
                  <div className="flex-1 p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 font-medium mb-4">
                          {event.club}
                        </p>
                        <div className="flex items-center gap-8 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">
                              {event.attendees} attending
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all">
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-4 border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 font-bold transition-all inline-flex items-center gap-2">
              View All Events <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              What Students Say
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our community members
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white border-2 border-gray-200 p-8 hover:border-teal-500 hover:shadow-xl transition-all"
              >
                <Quote className="w-10 h-10 text-teal-500 mb-6" />
                <p className="text-gray-700 mb-8 leading-relaxed italic">
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
          <h2 className="text-5xl font-black mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join thousands of students who have found their community at UTH.
            Your journey begins today.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-10 py-5 bg-white text-teal-700 hover:bg-gray-100 font-bold text-lg transition-all">
              Browse All Clubs
            </button>
            <button className="px-10 py-5 border-2 border-white hover:bg-white hover:text-teal-700 text-white font-bold text-lg transition-all">
              View Events Calendar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
