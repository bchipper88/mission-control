"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/team", label: "Team", icon: "👥" },
  { href: "/memory", label: "Memory", icon: "🧠" },
  { href: "/tasks", label: "Tasks", icon: "📋" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Mission Control
        </h1>
        <p className="text-sm text-gray-500 mt-1">The Dark Lord's Empire</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 border border-purple-500/20">
          <p className="text-xs text-gray-400 mb-1">Mission</p>
          <p className="text-sm text-gray-200 leading-snug">
            Achieve financial independence through autonomous digital businesses
          </p>
        </div>
      </div>
    </aside>
  );
}
