import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"
import type { LucideIcon } from "lucide-react"

interface SidebarProps {
  links: {
    href: string
    label: string
    icon: LucideIcon
  }[]
}

export default function Sidebar({ links }: SidebarProps) {
  const location = useLocation()

  return (
    <aside className="w-64 border-r bg-muted/40 min-h-[calc(100vh-4rem)]">
      <nav className="flex flex-col gap-2 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.href

          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
