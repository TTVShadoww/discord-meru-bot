"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  FlaskConical,
  Loader2,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { DiscordMessage } from "@/components/discord-mock";
import { Toggle } from "@/components/toggle";
import { useToast } from "@/components/toast";
import { CATEGORY_META, CATEGORY_ORDER, renderResponse } from "@/lib/command-data";

interface LibCommand {
  id: number;
  name: string;
  description: string;
  category: string;
  usage: string;
  aliases: string[];
  permissions: string[];
  cooldown: number;
  response: string;
  enabled: boolean;
  premium: boolean;
  custom: boolean;
  uses: number;
}

interface ApiResult {
  commands: LibCommand[];
  total: number;
  page: number;
  pages: number;
  categoryCounts: Record<string, number>;
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "enabled", label: "Online" },
  { key: "paused", label: "Paused" },
  { key: "premium", label: "Premium" },
  { key: "custom", label: "Custom" },
];

function LibraryInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name");
  const [data, setData] = useState<ApiResult | null>(null);
  const [items, setItems] = useState<LibCommand[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [selected, setSelected] = useState<LibCommand | null>(null);
  const [previewSeed, setPreviewSeed] = useState(0);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [dq, setDq] = useState("");

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setDq(q), 260);
    return () => clearTimeout(debounce.current);
  }, [q]);

  const load = useCallback(
    async (pageNum: number, append: boolean) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: dq,
          category,
          status,
          sort,
          page: String(pageNum),
          pageSize: "48",
        });
        const res = await fetch(`/api/commands?${params}`);
        const json: ApiResult = await res.json();
        setData(json);
        setItems((prev) => (append ? [...prev, ...json.commands] : json.commands));
        setPage(json.page);
      } catch {
        toast.push("err", "Failed to reach the command core.");
      } finally {
        setLoading(false);
      }
    },
    [dq, category, status, sort, toast]
  );

  useEffect(() => {
    load(1, false);
  }, [load]);

  const toggle = async (cmd: LibCommand) => {
    const next = !cmd.enabled;
    setItems((prev) => prev.map((c) => (c.id === cmd.id ? { ...c, enabled: next } : c)));
    if (selected?.id === cmd.id) setSelected({ ...selected, enabled: next });
    const res = await fetch(`/api/commands/${cmd.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    if (!res.ok) {
      setItems((prev) => prev.map((c) => (c.id === cmd.id ? { ...c, enabled: !next } : c)));
      toast.push("err", `Could not toggle /${cmd.name}.`);
    } else {
      toast.push("ok", next ? `/${cmd.name} is back online.` : `/${cmd.name} paused.`);
    }
  };

  const remove = async (cmd: LibCommand) => {
    const res = await fetch(`/api/commands/${cmd.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((c) => c.id !== cmd.id));
      setSelected(null);
      toast.push("ok", `/${cmd.name} deleted.`);
    } else {
      const j = await res.json().catch(() => ({}));
      toast.push("err", j.error ?? "Delete failed.");
    }
  };

  const reseed = async () => {
    setResetting(true);
    await fetch("/api/seed", { method: "POST" }).catch(() => {});
    setResetting(false);
    toast.push("ok", "Library resealed — 400 built-ins restored.");
    load(1, false);
  };

  const counts = data?.categoryCounts ?? {};
  const total = data?.total ?? 0;

  const preview = useMemo(() => {
    if (!selected) return null;
    void previewSeed;
    return renderResponse(selected.response, { user: "@nova", target: "@kai", args: "junk raid cleanup", server: "Nexus Station" });
  }, [selected, previewSeed]);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pt-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blurple-soft">Command core</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
            The Library <span className="text-faint">/</span>{" "}
            <span className="text-blurple-soft">{total}</span>
          </h1>
          <p className="mt-2 max-w-lg text-sm text-mute">
            Every command the bot knows. Pause what you hate, tune what you love, delete what you forged.
          </p>
        </div>
        <button
          onClick={reseed}
          disabled={resetting}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-xs font-semibold text-mute transition-colors hover:border-rose/40 hover:text-rose"
        >
          <RotateCcw size={14} className={resetting ? "animate-spin" : ""} />
          Reseal library
        </button>
      </div>

      {/* search + tabs */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search 1,000 commands — try 'raid', 'tarot', 'gas'..."
            className="w-full rounded-xl border border-line bg-panel py-3 pl-11 pr-4 text-sm text-ink placeholder:text-faint focus:border-blurple/60 focus:outline-none focus:ring-2 focus:ring-blurple/20"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-line bg-panel p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                status === t.key ? "bg-blurple text-white" : "text-mute hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-line bg-panel px-4 py-3 text-xs font-semibold text-mute focus:outline-none"
        >
          <option value="name">A → Z</option>
          <option value="uses">Most executed</option>
          <option value="category">By category</option>
        </select>
      </div>

      {/* category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setCategory("all")}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
            category === "all"
              ? "border-blurple/60 bg-blurple/15 text-ink"
              : "border-line bg-panel text-mute hover:text-ink"
          }`}
        >
          All minds
        </button>
        {[...CATEGORY_ORDER, "custom"].map((key) => {
          const meta = CATEGORY_META[key];
          const active = category === key;
          return (
            <button
              key={key}
              onClick={() => {
                setCategory(key);
                if (key === "custom") setStatus("all");
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                active ? "text-ink" : "border-line bg-panel text-mute hover:text-ink"
              }`}
              style={
                active
                  ? { borderColor: `${meta.accent}88`, background: `${meta.accent}22`, color: meta.accent }
                  : undefined
              }
            >
              <CategoryIcon category={key} size={12} />
              {meta.label}
              <span className="font-mono text-[10px] opacity-70">{counts[key] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {/* bulk ops for focused category */}
      {category !== "all" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel px-5 py-3"
        >
          <CategoryIcon category={category} size={15} className="text-blurple-soft" />
          <p className="text-xs text-mute">
            <span className="font-bold text-ink">{CATEGORY_META[category]?.label}</span> — bulk operations affect{" "}
            <span className="font-mono text-ink">{counts[category] ?? items.length}</span> commands at once.
          </p>
          <div className="ml-auto flex gap-2">
            <button
              onClick={async () => {
                await fetch("/api/commands/bulk", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ category, enabled: true }),
                });
                toast.push("ok", `Entire ${CATEGORY_META[category]?.label} mind armed.`);
                load(1, false);
              }}
              className="rounded-lg border border-mint/40 px-3.5 py-1.5 text-[11px] font-semibold text-mint transition-colors hover:bg-mint/10"
            >
              Arm all
            </button>
            <button
              onClick={async () => {
                await fetch("/api/commands/bulk", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ category, enabled: false }),
                });
                toast.push("ok", `Entire ${CATEGORY_META[category]?.label} mind paused.`);
                load(1, false);
              }}
              className="rounded-lg border border-rose/40 px-3.5 py-1.5 text-[11px] font-semibold text-rose transition-colors hover:bg-rose/10"
            >
              Pause all
            </button>
          </div>
        </motion.div>
      )}

      {/* grid */}
      {items.length === 0 && !loading ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-line py-24 text-center">
          <FlaskConical size={28} className="text-faint" />
          <p className="mt-4 font-display text-lg font-semibold text-ink">Nothing matches that wavelength</p>
          <p className="mt-1 text-sm text-mute">Loosen the filters or forge it yourself in the Studio.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((cmd, i) => {
              const meta = CATEGORY_META[cmd.category] ?? CATEGORY_META.custom;
              return (
                <motion.article
                  layout
                  key={cmd.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, delay: Math.min(i % 48, 12) * 0.025 }}
                  onClick={() => {
                    setSelected(cmd);
                    setPreviewSeed((s) => s + 1);
                  }}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 ${
                    cmd.enabled
                      ? "border-edge bg-panel/90 hover:border-line hover:bg-raise"
                      : "border-edge/60 bg-panel/50 opacity-60 saturate-50 hover:opacity-80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border"
                      style={{ borderColor: `${meta.accent}44`, color: meta.accent, background: `${meta.accent}12` }}
                    >
                      <CategoryIcon category={cmd.category} size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 font-mono text-sm font-semibold text-ink">
                        <span className="text-blurple-soft">/</span>
                        <span className="truncate">{cmd.name}</span>
                        {cmd.premium && <Star size={12} className="shrink-0 fill-amber text-amber" />}
                        {cmd.custom && (
                          <span className="shrink-0 rounded bg-blurple/20 px-1.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-blurple-soft">
                            forged
                          </span>
                        )}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-mute">{cmd.description}</p>
                    </div>
                    <Toggle on={cmd.enabled} onChange={() => toggle(cmd)} />
                  </div>
                  <div className="mt-3 flex items-center gap-3 pl-12 text-[10px] font-medium uppercase tracking-wider text-faint">
                    <span className="inline-flex items-center gap-1">
                      <Timer size={11} /> {cmd.cooldown}s
                    </span>
                    <span>{cmd.uses.toLocaleString()} runs</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-faint transition-colors group-hover:text-blurple-soft">
                      inspect <ChevronRight size={11} />
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* load more */}
      <div className="flex justify-center pt-2">
        {loading ? (
          <span className="inline-flex items-center gap-2 text-sm text-faint">
            <Loader2 size={15} className="animate-spin" /> Streaming commands...
          </span>
        ) : (
          data &&
          page < data.pages && (
            <button
              onClick={() => load(page + 1, true)}
              className="rounded-xl border border-line bg-panel px-6 py-2.5 text-xs font-semibold text-mute transition-colors hover:border-blurple/50 hover:text-ink"
            >
              Load more ({total - items.length} remaining)
            </button>
          )
        )}
      </div>

      {/* drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-50 bg-abyss/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-l border-line bg-panel"
            >
              <div className="flex items-start justify-between gap-3 border-b border-edge p-6">
                <div>
                  <p className="font-mono text-2xl font-bold text-ink">
                    <span className="text-blurple-soft">/</span>
                    {selected.name}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">{selected.description}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg border border-line p-2 text-mute transition-colors hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-6 p-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-line bg-raise/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">Usage</p>
                    <p className="mt-1 font-mono text-xs text-ink">{selected.usage}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-raise/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">Executions</p>
                    <p className="mt-1 font-mono text-xs text-ink">{selected.uses.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-raise/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">Cooldown</p>
                    <p className="mt-1 font-mono text-xs text-ink">{selected.cooldown}s</p>
                  </div>
                  <div className="rounded-xl border border-line bg-raise/60 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">Aliases</p>
                    <p className="mt-1 font-mono text-xs text-ink">
                      {selected.aliases.length ? selected.aliases.map((a) => `/${a}`).join(" ") : "—"}
                    </p>
                  </div>
                </div>

                {selected.permissions.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-faint">
                      <ShieldCheck size={12} /> Required permission
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selected.permissions.map((p) => (
                        <span key={p} className="rounded-md border border-line bg-raise px-2.5 py-1 text-xs font-mono text-mute">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">
                      Live response preview
                    </p>
                    <button
                      onClick={() => setPreviewSeed((s) => s + 1)}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blurple-soft hover:underline"
                    >
                      <RotateCcw size={10} /> re-roll
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-line bg-[#12131c] py-2">
                    {preview && (
                      <DiscordMessage
                        msg={{
                          id: "p",
                          author: "bot",
                          username: "ORBIT",
                          embed: {
                            title: `/${selected.name}`,
                            body: preview,
                            accent: (CATEGORY_META[selected.category] ?? CATEGORY_META.custom).accent,
                            footer: `${selected.category} · cooldown ${selected.cooldown}s`,
                          },
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-edge p-6">
                <Toggle on={selected.enabled} onChange={() => toggle(selected)} />
                <span className="text-xs font-semibold text-mute">
                  {selected.enabled ? "Online" : "Paused"}
                </span>
                <Link
                  href="/playground"
                  className="ml-auto inline-flex items-center gap-2 rounded-lg bg-blurple px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blurple-soft"
                >
                  <Play size={13} /> Test in playground
                </Link>
                {selected.custom && (
                  <button
                    onClick={() => remove(selected)}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose/40 px-4 py-2.5 text-xs font-semibold text-rose transition-colors hover:bg-rose/10"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
                <button onClick={() => router.push("/playground")} className="hidden" />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="grid place-items-center py-40 text-faint">
          <Loader2 size={22} className="animate-spin" />
        </div>
      }
    >
      <LibraryInner />
    </Suspense>
  );
}
