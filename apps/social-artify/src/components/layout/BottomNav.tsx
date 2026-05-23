"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/discover",
    label: "Discover",
    match: (p: string) => p === "/discover" || p.startsWith("/artwork"),
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#810B38" : "#6B4A36"} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/artist/upload",
    label: "3D",
    match: (p: string) => p.startsWith("/artist"),
    icon: (_active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#810B38" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "You",
    match: (p: string) => p === "/profile",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? "#810B38" : "#6B4A36"} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed z-40 left-1/2 -translate-x-1/2"
      style={{
        bottom: "max(20px, calc(env(safe-area-inset-bottom, 0px) + 16px))",
      }}
    >
      <div
        className="flex items-center rounded-full border border-border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-surface)",
          boxShadow: "0 8px 32px rgba(18, 10, 4, 0.35), 0 2px 8px rgba(18, 10, 4, 0.2)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className="flex flex-col items-center gap-1 px-7 py-3 min-w-[72px] transition-colors"
              style={{
                borderRight: tab.label !== "You" ? "1px solid var(--color-border)" : undefined,
              }}
            >
              {tab.icon(isActive)}
              <span
                className="text-[9px] font-semibold uppercase tracking-widest leading-none"
                style={{ color: isActive ? "#810B38" : "#6B4A36" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
