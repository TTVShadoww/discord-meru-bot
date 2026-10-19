"use client";

import {
  AlarmClock,
  Braces,
  Command,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Rocket,
  ScrollText,
  Search,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CommandPalette } from "@/components/command-palette";

const GROUPS: { label: string; items: { href: string; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    label: "Operate",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
      { href: "/commands", label: "Library", icon: Command },
      { href: "/playground", label: "Playground", icon: FlaskConical },
      { href: "/logs", label: "Logs", icon: ScrollText },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/analytics", label: "Analytics", icon: Gauge },
      { href: "/automations", label: "Automations", icon: AlarmClock },
    ],
  },
  {
    label: "Build",
    items: [
      { href: "/builder", label: "Studio", icon: Wand2 },
      { href: "/setup", label: "Deploy", icon: Rocket },
      { href: "/api-access", label: "API Access", icon: Braces },
    ],
  },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-abyss">
      <div className="pointer-events-none fixed inset-0 bg-grid" />
      <div className="pointer-events-none fixed inset-0 bg-noise" />
      <div className="pointer-events-none fixed -top-40 left-1/2 h-130 w-200 -translate-x-1/2 rounded-full bg-blurple/12 blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-52 -left-40 h-120 w-120 rounded-full bg-rose/8 blur-[130px]" />

      <CommandPalette />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-edge bg-panel/80 backdrop-blur-xl lg:w-60">
        <Link href="/" className="group flex items-center gap-3 border-b border-edge px-3 py-5 lg:px-5">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-raise">
            <Image src="/bot-avatar.png" alt="ORBIT avatar" width={40} height={40} className="object-cover" />
          </span>
          <span className="hidden lg:block">
            <span className="block font-display text-lg font-bold tracking-[0.18em] text-ink">ORBIT</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-faint">
              bot mind v2 · pro
            </span>
          </span>
        </Link>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("orbit:open-palette"))}
          className="mx-2 mt-3 flex items-center gap-2.5 rounded-lg border border-line bg-raise/70 px-3 py-2.5 text-left text-xs font-medium text-faint transition-colors hover:border-blurple/40 hover:text-mute lg:mx-3"
        >
          <Search size={13} />
          <span className="hidden lg:inline">Search everything</span>
          <kbd className="ml-auto hidden rounded border border-line bg-abyss px-1.5 py-0.5 font-mono text-[9px] lg:inline">
            ⌘K
          </kbd>
        </button>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3 lg:px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1 hidden px-3 text-[9px] font-bold uppercase tracking-[0.24em] text-faint/70 lg:block">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "bg-blurple/15 text-ink shadow-[inset_0_0_0_1px_rgba(88,101,242,0.4)]"
                          : "text-mute hover:bg-raise hover:text-ink"
                      }`}
                    >
                      <Icon
                        size={17}
                        strokeWidth={2.2}
                        className={active ? "text-blurple-soft" : "text-faint group-hover:text-mute"}
                      />
                      <span className="hidden lg:inline">{label}</span>
                      {active && <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-blurple-soft lg:block" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-edge p-3">
          <div className="flex items-center gap-2.5 rounded-lg border border-line bg-raise/60 px-3 py-2.5">
            <span className="pulse-dot h-2 w-2 shrink-0 rounded-full bg-mint" />
            <div className="hidden lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mint">Gateway online</p>
              <p className="font-mono text-[10px] text-faint">shard 0/16 · 21ms · 1000 cmds</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="relative z-10 ml-16 min-h-dvh lg:ml-60">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
