"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Dice5, Hammer, Loader2, MoveRight, RotateCcw, Trash2, Wand2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { DiscordMessage } from "@/components/discord-mock";
import { useToast } from "@/components/toast";
import { CATEGORY_META, CATEGORY_ORDER, renderResponse } from "@/lib/command-data";

interface Forged {
  id: number;
  name: string;
  description: string;
  category: string;
  uses: number;
  enabled: boolean;
}

const EXAMPLES = [
  { name: "vibe-check", description: "Scan the channel's aura", response: "Channel vibe scan: {pick:immaculate|charging|chaotic| transcendent} — {n:1-100}% pure, requested by {user}." },
  { name: "hydrate", description: "Remind a member to drink water", response: "**{target}**, hydrate. This has been your mandated water break. — via {user}" },
  { name: "loot-goblin", description: "Summon the loot goblin", response: "The Loot Goblin screeches and drops **{n:10-500}** coins for {user}. {pick:He vanishes.|He judges you.|He demands tribute.}" },
];

export default function Studio() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("custom");
  const [usageHint, setUsageHint] = useState("");
  const [aliases, setAliases] = useState("");
  const [cooldown, setCooldown] = useState(3);
  const [response, setResponse] = useState("The forge answers {user}: {pick:yes|no|ask again at dawn}.");
  const [forged, setForged] = useState<Forged[]>([]);
  const [busy, setBusy] = useState(false);
  const [seed, setSeed] = useState(0);
  const [loadingForged, setLoadingForged] = useState(true);

  const cleanName = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const loadForged = useCallback(() => {
    setLoadingForged(true);
    fetch("/api/commands?status=custom&sort=uses&pageSize=96")
      .then((r) => r.json())
      .then((d) => setForged(d.commands ?? []))
      .catch(() => {})
      .finally(() => setLoadingForged(false));
  }, []);

  useEffect(() => loadForged(), [loadForged]);

  const preview = useMemo(() => {
    void seed;
    return renderResponse(response || "...", { user: "@nova", target: "@kai", args: "spark test", server: "Nexus Station" });
  }, [response, seed]);

  const submit = async () => {
    if (!cleanName || !description.trim() || !response.trim()) {
      toast.push("err", "Name, description and response are all required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          description,
          category,
          usageHint,
          cooldown,
          response,
          aliases: aliases.split(",").map((a) => a.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.push("err", json.error ?? "Forge failed.");
      } else {
        toast.push("ok", `/${cleanName} forged and hot-swapped into the mind.`);
        setName("");
        setDescription("");
        setAliases("");
        setUsageHint("");
        loadForged();
      }
    } finally {
      setBusy(false);
    }
  };

  const destroy = async (id: number, cmdName: string) => {
    const res = await fetch(`/api/commands/${id}`, { method: "DELETE" });
    if (res.ok) {
      setForged((f) => f.filter((x) => x.id !== id));
      toast.push("ok", `/${cmdName} scrapped.`);
    } else {
      toast.push("err", "Could not delete.");
    }
  };

  const applyExample = (ex: (typeof EXAMPLES)[number]) => {
    setName(ex.name);
    setDescription(ex.description);
    setResponse(ex.response);
  };

  return (
    <div className="space-y-8 pt-2">
      <div>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-blurple-soft">
          <Wand2 size={13} /> Command forge
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">The Studio</h1>
        <p className="mt-2 max-w-xl text-sm text-mute">
          Mint a brand-new slash command. It lands in the mind instantly — searchable in the Library,
          executable in the Playground, zero restarts.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* form */}
        <div className="space-y-4 rounded-2xl border border-edge bg-panel/90 p-6">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.name}
                onClick={() => applyExample(ex)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold text-mute transition-colors hover:border-blurple/50 hover:text-ink"
              >
                <Dice5 size={11} /> {ex.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-faint">Name</span>
              <div className="flex items-center rounded-xl border border-line bg-abyss focus-within:border-blurple/60">
                <span className="pl-3 font-mono text-sm text-blurple-soft">/</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="loot-goblin"
                  maxLength={32}
                  className="w-full bg-transparent px-2 py-2.5 font-mono text-sm text-ink placeholder:text-faint focus:outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-faint">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-line bg-abyss px-3 py-2.5 text-sm text-ink focus:border-blurple/60 focus:outline-none"
              >
                <option value="custom">Custom</option>
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_META[c].label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-faint">Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What shows up in Discord's slash picker"
              maxLength={100}
              className="w-full rounded-xl border border-line bg-abyss px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus:border-blurple/60 focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-faint">Usage hint</span>
              <input
                value={usageHint}
                onChange={(e) => setUsageHint(e.target.value)}
                placeholder="[@member] [amount]"
                className="w-full rounded-xl border border-line bg-abyss px-3.5 py-2.5 font-mono text-xs text-ink placeholder:text-faint focus:border-blurple/60 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-faint">Aliases (comma)</span>
              <input
                value={aliases}
                onChange={(e) => setAliases(e.target.value)}
                placeholder="lg, goblin"
                className="w-full rounded-xl border border-line bg-abyss px-3.5 py-2.5 font-mono text-xs text-ink placeholder:text-faint focus:border-blurple/60 focus:outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-widest text-faint">
              Cooldown <span className="font-mono text-mute">{cooldown}s</span>
            </span>
            <input
              type="range"
              min={0}
              max={60}
              value={cooldown}
              onChange={(e) => setCooldown(Number(e.target.value))}
              className="w-full accent-blurple"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-faint">
              Response template
            </span>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-line bg-abyss px-3.5 py-3 font-mono text-xs leading-relaxed text-ink focus:border-blurple/60 focus:outline-none"
            />
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              {["{user}", "{target}", "{args}", "{server}", "{n:1-100}", "{pick:a|b}"].map((t) => (
                <button
                  key={t}
                  onClick={() => setResponse((r) => `${r}${r.endsWith(" ") || r === "" ? "" : " "}${t}`)}
                  className="rounded border border-line bg-raise px-1.5 py-0.5 font-mono text-[10px] text-blurple-soft transition-colors hover:border-blurple/50"
                >
                  {t}
                </button>
              ))}
            </span>
          </label>

          <button
            onClick={submit}
            disabled={busy}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blurple py-3.5 text-sm font-semibold text-white transition-all hover:bg-blurple-soft hover:shadow-[0_0_30px_rgba(88,101,242,0.4)] disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Hammer size={16} />}
            Forge command
            <MoveRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* preview + forged list */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-edge bg-panel/90 p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">Live preview — as Discord would render it</p>
              <button
                onClick={() => setSeed((s) => s + 1)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blurple-soft hover:underline"
              >
                <RotateCcw size={10} /> re-roll
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-line bg-[#12131c] py-2">
              <DiscordMessage msg={{ id: "u", author: "user", username: "you", content: `/${cleanName || "unnamed"} ${usageHint}`.trim() }} userAvatarHue={150} />
              <DiscordMessage
                msg={{
                  id: "b",
                  author: "bot",
                  username: "ORBIT",
                  embed: {
                    title: `/${cleanName || "unnamed"}`,
                    body: preview,
                    accent: (CATEGORY_META[category] ?? CATEGORY_META.custom).accent,
                    footer: `${category} · cooldown ${cooldown}s`,
                  },
                }}
              />
            </div>
            {cleanName && (
              <Link
                href="/playground"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blurple-soft hover:underline"
              >
                After forging, run /{cleanName} in the playground <MoveRight size={12} />
              </Link>
            )}
          </div>

          <div className="rounded-2xl border border-edge bg-panel/90 p-6">
            <p className="mb-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-faint">
              Your forged arsenal
              <span className="rounded bg-blurple/15 px-2 py-0.5 text-blurple-soft">{forged.length}</span>
            </p>
            {loadingForged ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="shimmer h-11 rounded-lg" />
                ))}
              </div>
            ) : forged.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line py-8 text-center text-xs text-faint">
                Nothing forged yet. The anvil is warm.
              </p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {forged.map((f) => (
                    <motion.div
                      key={f.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className="flex items-center gap-3 rounded-xl border border-line bg-raise/60 px-4 py-3"
                    >
                      <CategoryIcon category={f.category} size={14} className="text-blurple-soft" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-xs font-semibold text-ink">/{f.name}</p>
                        <p className="truncate text-[11px] text-faint">{f.description}</p>
                      </div>
                      <span className="font-mono text-[10px] text-faint">{f.uses} runs</span>
                      <button
                        onClick={() => destroy(f.id, f.name)}
                        className="rounded-lg border border-line p-2 text-faint transition-colors hover:border-rose/40 hover:text-rose"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
