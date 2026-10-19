"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, FlaskConical, LayoutDashboard, Search, Wand2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { CATEGORY_META } from "@/lib/command-data";
import { fuzzyRank } from "@/lib/fuzzy";

interface PaletteCmd {
  id: number;
  name: string;
  description: string;
  category: string;
  aliases: string[];
  enabled: boolean;
}

const PAGES = [
  { href: "/", label: "Overview", hint: "dashboard home", icon: LayoutDashboard },
  { href: "/commands", label: "Library", hint: "all 1,000 commands", icon: Zap },
  { href: "/playground", label: "Playground", hint: "execute anything live", icon: FlaskConical },
  { href: "/builder", label: "Studio", hint: "forge a custom command", icon: Wand2 },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const [commands, setCommands] = useState<PaletteCmd[] | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("orbit:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("orbit:open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
      if (!commands) {
        fetch("/api/commands?pageSize=1200&sort=name")
          .then((r) => r.json())
          .then((d) => setCommands(d.commands ?? []))
          .catch(() => setCommands([]));
      }
    }
  }, [open, commands]);

  const results = useMemo(() => {
    if (!q.trim() || !commands) return { pages: PAGES, cmds: commands?.slice(0, 6) ?? [] };
    const pages = PAGES.filter((p) => p.label.toLowerCase().includes(q.toLowerCase()));
    const cmds = fuzzyRank(q, commands, 8);
    return { pages, cmds };
  }, [q, commands]);

  const flat = useMemo(
    () => [
      ...results.pages.map((p) => ({ type: "page" as const, ...p })),
      ...results.cmds.map((c) => ({ type: "cmd" as const, ...c })),
    ],
    [results]
  );

  useEffect(() => setCursor(0), [q]);
  useEffect(() => {
    const el = listRef.current?.children[cursor] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const go = useCallback(
    (index: number) => {
      const item = flat[index];
      if (!item) return;
      setOpen(false);
      if (item.type === "page") {
        router.push(item.href);
      } else {
        router.push(`/commands?q=${encodeURIComponent(item.name)}`);
      }
    },
    [flat, router]
  );

  const goPlayground = useCallback(
    (index: number) => {
      const item = flat[index];
      if (!item || item.type !== "cmd") return;
      setOpen(false);
      router.push(`/playground?cmd=${encodeURIComponent(item.name)}`);
    },
    [flat, router]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 flex items-start justify-center bg-abyss/70 px-4 pt-[14vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center gap-3 border-b border-edge px-5 py-4">
              <Search size={17} className="shrink-0 text-blurple-soft" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCursor((c) => Math.min(flat.length - 1, c + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setCursor((c) => Math.max(0, c - 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (e.metaKey || e.ctrlKey) goPlayground(cursor);
                    else go(cursor);
                  }
                }}
                placeholder={commands ? `Search ${commands.length.toLocaleString()} commands, pages, anything...` : "Loading the mind..."}
                className="w-full bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none"
              />
              <kbd className="shrink-0 rounded border border-line bg-raise px-1.5 py-0.5 font-mono text-[10px] text-faint">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-2">
              {flat.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-faint">
                  {commands === null ? "Booting..." : `Nothing on that wavelength. Forge it in the Studio.`}
                </p>
              )}
              {results.pages.length > 0 && q.trim() === "" && (
                <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-widest text-faint">Jump to</p>
              )}
              {flat.map((item, i) =>
                item.type === "page" ? (
                  <button
                    key={`p-${item.href}`}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(i)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      cursor === i ? "bg-blurple/15" : ""
                    }`}
                  >
                    <item.icon size={15} className="shrink-0 text-blurple-soft" />
                    <span className="text-sm font-semibold text-ink">{item.label}</span>
                    <span className="truncate text-xs text-faint">{item.hint}</span>
                  </button>
                ) : (
                  <button
                    key={`c-${item.id}`}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(i)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      cursor === i ? "bg-blurple/15" : ""
                    }`}
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-md border"
                      style={{
                        borderColor: `${(CATEGORY_META[item.category] ?? CATEGORY_META.custom).accent}44`,
                        color: (CATEGORY_META[item.category] ?? CATEGORY_META.custom).accent,
                      }}
                    >
                      <CategoryIcon category={item.category} size={13} />
                    </span>
                    <span className="shrink-0 font-mono text-sm text-ink">
                      <span className="text-blurple-soft">/</span>
                      {item.name}
                    </span>
                    <span className="truncate text-xs text-faint">{item.description}</span>
                    {!item.enabled && (
                      <span className="ml-auto shrink-0 rounded bg-amber/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber">
                        paused
                      </span>
                    )}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-edge px-5 py-2.5 text-[10px] font-medium text-faint">
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-line bg-raise px-1 font-mono">↑↓</kbd> navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-line bg-raise px-1 font-mono">
                  <CornerDownLeft size={9} className="inline" />
                </kbd>{" "}
                inspect
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-line bg-raise px-1 font-mono">⌘↵</kbd> run in playground
              </span>
              <span className="ml-auto font-mono">orbit palette v2</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
