import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-accent text-accent-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="text-accent-foreground text-lg font-semibold">
              UTH Club System
            </div>
            <p className="text-sm leading-6">
              Discover, join, and manage university clubs. Built for students,
              club owners, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="text-accent-foreground font-medium">Students</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    className="hover:text-accent-foreground transition-colors"
                    to="/"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-accent-foreground transition-colors"
                    to="/student/clubs"
                  >
                    Clubs
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <div className="text-accent-foreground font-medium">
                Dashboards
              </div>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    className="hover:text-accent-foreground transition-colors"
                    to="/club-owner/dashboard"
                  >
                    Club Owner
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-accent-foreground transition-colors"
                    to="/admin/dashboard"
                  >
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-accent-foreground font-medium">About</div>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  className="hover:text-accent-foreground transition-colors"
                  href="#"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  className="hover:text-accent-foreground transition-colors"
                  href="#"
                >
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-xs text-center">
          <p>© {year} UTH Club System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
