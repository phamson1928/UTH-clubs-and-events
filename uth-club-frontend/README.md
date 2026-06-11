# UTH Clubs & Events — Frontend

React SPA for the UTH Clubs & Events management platform.  
Three role-based interfaces: Student, Club Owner, and Admin.

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build:** Vite 6
- **Styling:** Tailwind CSS 3 + class-variance-authority + tailwind-merge
- **Animation:** Framer Motion
- **Charts:** Recharts
- **UI Components:** Radix UI (dialog, dropdown, tabs, toast, alert-dialog, select, avatar, separator, label)
- **HTTP Client:** Axios
- **Routing:** React Router DOM v6
- **Icons:** Lucide React

## Role-based Pages

### Student Pages
| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Hero, featured events, live stats |
| Events | `/events` | Browse, search, filter, register |
| Clubs | `/clubs` | Discover and join clubs |
| Club Detail | `/clubs/:id` | Club profile, events, members |
| My Clubs | `/my-clubs` | Clubs joined, membership status |
| My Events | `/my-events` | Registered events, history |
| Profile | `/profile` | Account settings, points |

### Club Owner Pages
| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/club-owner` | Club overview, recent events |
| Events | `/club-owner/events` | Manage own events, create new |
| Members | `/club-owner/members` | Member list, management |
| Applications | `/club-owner/applications` | Membership requests |
| Requests | `/club-owner/requests` | Event approval requests |

### Admin Pages
| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/admin` | System-wide analytics, charts |
| Events | `/admin/events` | Approve/reject events |
| Clubs | `/admin/clubs` | Manage clubs |
| Users | `/admin/users` | Manage users, roles |
| Requests | `/admin/requests` | Pending requests review |

## Setup

```bash
# Install dependencies
npm install

# Development
npm run dev        # http://localhost:5173

# Production build
npm run build      # Output in /dist

# Preview production build
npm run preview
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: `http://localhost:3000`) |

## Project Structure

```
src/
├── pages/
│   ├── student/            # Student views
│   ├── admin/              # Admin dashboard
│   └── club-owner/         # Club owner management
├── components/
│   ├── ui/                 # Reusable UI primitives (Radix)
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── SearchAndFilters.tsx
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── services/               # API service modules
├── styles/                 # Global styles
└── App.tsx                 # Root with router setup
```
