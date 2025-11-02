import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, Calendar, MapPin, Mail } from "lucide-react";
import Navbar from "../../components/Navbar";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

export default function StudentClubDetail() {
  const { id } = useParams();

  const club = {
    id: Number(id) || 1,
    name: "Tech Innovators Hub",
    category: "Technology",
    description:
      "A community for tech enthusiasts to learn, build, and innovate together. We organize workshops, hackathons, and tech talks.",
    founded: "2020",
    email: "techclub@uth.edu",
    location: "Engineering Building, Room 301",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80",
  };

  const members = [
    {
      id: 1,
      user: { name: "Nguyen Van A", email: "a@uth.edu", mssv: "20123456" },
      join_date: new Date().toISOString(),
    },
    {
      id: 2,
      user: { name: "Tran Thi B", email: "b@uth.edu", mssv: "20123457" },
      join_date: new Date().toISOString(),
    },
    {
      id: 3,
      user: { name: "Le Van C", email: "c@uth.edu", mssv: "20123458" },
      join_date: new Date().toISOString(),
    },
  ];

  const [joinReason, setJoinReason] = useState("");
  const [skills, setSkills] = useState("");
  const [promiseText, setPromiseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const upcomingEvents = [
    {
      id: 1,
      title: "Hackathon 2025: AI Revolution",
      date: "Nov 15, 2025",
      time: "9:00 AM",
      location: "Main Hall",
      color: "bg-teal-500",
    },
    {
      id: 2,
      title: "React Deep Dive Workshop",
      date: "Nov 22, 2025",
      time: "2:00 PM",
      location: "Lab 3",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#008689] via-teal-600 to-cyan-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="mb-6">
            <Link
              to="/student/clubs"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Clubs
            </Link>
          </div>

          <div className="grid md:grid-cols-[2fr,1fr] gap-10 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
                {club.name}
              </h1>
              <p className="text-white/90 text-lg max-w-2xl mb-6">{club.description}</p>
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">{members.length} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-semibold">Founded {club.founded}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="font-semibold">{club.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <span className="font-semibold">{club.email}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src={club.image}
                alt={club.name}
                className="w-full h-64 object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img
                src={club.image}
                alt={`${club.name} banner`}
                className="w-full h-[480px] object-cover shadow-2xl"
              />
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-teal-500 opacity-20"></div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                About {club.name}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {club.description}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 border-2 border-gray-200 p-6">
                  <div className="text-3xl font-black text-teal-600 mb-2">
                    {members.length}
                  </div>
                  <div className="font-bold text-gray-900">Members</div>
                </div>
                <div className="bg-gray-50 border-2 border-gray-200 p-6">
                  <div className="text-3xl font-black text-purple-600 mb-2">
                    {club.founded}
                  </div>
                  <div className="font-bold text-gray-900">Founded</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Members Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">Members</h2>
          </div>
          {members.length === 0 ? (
            <div className="text-center text-gray-600">No members to show</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {members.map((m: any) => (
                <div key={m.id} className="bg-white border-2 border-gray-200 p-6">
                  <div className="font-bold text-gray-900">{m?.user?.name || "Member"}</div>
                  <div className="text-sm text-gray-600">{m?.user?.email}</div>
                  <div className="text-sm text-gray-600">{m?.user?.mssv}</div>
                  <div className="text-xs text-gray-500 mt-2">Joined: {m?.join_date ? new Date(m.join_date).toLocaleDateString() : "-"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">Upcoming Events</h2>
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
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all">
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-black mb-3">Want to Join {club.name}?</h2>
            <p className="text-lg md:text-xl opacity-90">Fill in the form below to send a join request.</p>
          </div>
          <div className="bg-white text-gray-900 p-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                setTimeout(() => {
                  setJoinReason("");
                  setSkills("");
                  setPromiseText("");
                  setSubmitting(false);
                  alert("Đã gửi đơn tham gia (mock)");
                }, 600);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold mb-2">Vì sao bạn muốn tham gia?</label>
                <Textarea value={joinReason} onChange={(e) => setJoinReason(e.target.value)} required placeholder="Mục tiêu, động lực..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Kỹ năng của bạn</label>
                <Input value={skills} onChange={(e) => setSkills(e.target.value)} required placeholder="VD: React, thiết kế, tổ chức sự kiện..." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Cam kết khi tham gia</label>
                <Textarea value={promiseText} onChange={(e) => setPromiseText(e.target.value)} required placeholder="Bạn sẽ đóng góp điều gì?" />
              </div>
              <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white">
                {submitting ? "Đang gửi..." : "Gửi đơn tham gia"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
