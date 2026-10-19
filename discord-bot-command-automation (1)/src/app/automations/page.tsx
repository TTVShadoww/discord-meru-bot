"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlarmClock, Hash, Loader2, Play, Plus, Repeat, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { Toggle } from "@/components/toggle";
import { useToast } from "@/components/toast";
import { CATEGORY_META } from "@/lib/command-data";

interface Automation {
  id: number;
  name: string;
  commandName: string;
  cadence: string;
  channel: string;
  enabled: boolean;
  runs: number;
  lastRunAt: string | null;
  createdAt: string;
}

interface CmdOpt {
  name: string;
  category: string;
  description: string;
}

const CADENCE_MS: Record<string, number> = {
  "5m": 5 * 60e3,
  "15m": 15 * 60e3,
  "1h": 3600e3,
  "6h": 6 * 3600e3,
  "12h": 12 * 3600e3,
  "24h": 24 * 3600e3,
  weekly: 7 * 24 * 3600e3,
};

const PRESETS = [
  { name: "Daily newsletter", commandName: "daily-digest", cadence: "24h", channel: "announcements" },
  { name: "Word factory", commandName: "wordoftheday", cadence: "12h", channel: "general" },
  { name: "Gas sentinel", commandName: "gas", cadence: "1h", channel: "trading" },
];

function nextFire(a: Automation) {
  const base = a.lastRunAt ? new Date(a.lastRunAt).getTime() : new Date(a.createdAt).getTime();
  return base + (CADENCE_MS[a.cadence] ?? 3600e3);
}

function rel(future: number) {
  const diff = future - Date.now();
  if (diff <= 0) return "due now";
  const m = Math.floor(diff / 60e3);
  if (m < 60) return `in ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `in ${h}h ${m % 60}m`;
  return `in ${Math.floor(h / 24)}d`;
}

export default function Automations() {
  const toast = useToast();
  const [list, setList] = useState<Automation[] | null>(null);
  const [cats, setCats] = useState<Record<string, string>>({});
  const [opts, setOpts] = useState<CmdOpt[] | null>(null);
  const [name, setName] = useState("");
  const [commandName, setCommand] = useState("");
  const [cadence, setCadence] = useState("1h");
  const [channel, setChannel] = useState("general");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch("/api/automations")
      .then((r) => r.json())
      .then((d) => setList(d.automations ?? []))
      .catch(() => toast.push("err", "Automation plane unreachable."));
  }, [toast]);

  useEffect(() => {
    load();
    fetch("/api/commands?pageSize=1200&sort=name")
      .then((r) => r.json())
      .then((d) => {
        const rows = (d.commands ?? []) as { name: string; category: string; description: string }[];
        setOpts(rows.map((c) => ({ name: c.name, category: c.category, description: c.description })));
        setCats(Object.fromEntries(rows.map((c) => [c.name, c.category])));
      })
      .catch(() => {});
  }, [load]);

  const create = async () => {
    if (!name.trim() || !commandName.trim()) {
      toast.push("err", "Name and command are required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, commandName: commandName.replace(/^\//, ""), cadence, channel }),
      });
      const json = await res.json();
      if (!res.ok) toast.push("err", json.error ?? "Failed to schedule.");
      else {
        toast.push("ok", `"${name}" scheduled — first fire ${rel(nextFire(json.automation))}.`);
        setName("");
        setCommand("");
        load();
      }
    } finally {
      setBusy(false);
    }
  };

  const patch = async (a: Automation, body: Record<string, unknown>) => {
    await fetch(`/api/automations/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  };

  const runNow = async (a: Automation) => {
    await fetch(`/api/automations/${a.id}`, { method: "POST" });
    toast.push("ok", `Fired /${a.commandName} in #${a.channel}.`);
    load();
  };

  const destroy = async (a: Automation) => {
    await fetch(`/api/automations/${a.id}`, { method: "DELETE" });
    toast.push("ok", `"${a.name}" decommissioned.`);
    load();
  };

  const totalRuns = useMemo(() => (list ?? []).reduce((s, a) => s + a.runs, 0), [list]);
  const active = useMemo(() => (list ?? []).filter((a) => a.enabled).length, [list]);

  return (
    <div className="space-y-6 pt-2">
      <div>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-blurple-soft">
          <AlarmClock size={13} /> Autonomous plane
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">Automations</h1>
        <p className="mt-2 max-w-xl text-sm text-mute">
          Schedule any of the 1,000 commands to fire on a cadence. Digests at dawn, gas pings hourly,
          word-of-the-day while you sleep.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Schedules armed", value: active, accent: "text-mint" },
          { label: "Total firings", value: totalRuns, accent: "text-blurple-soft" },
          { label: "Command pool", value: opts?.length ?? 0, accent: "text-amber" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-edge bg-panel/90 p-4">
            <p className={`font-display text-2xl font-bold ${k.accent}`}>{k.value.toLocaleString()}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">{k.label}</p>
          </div>
        ))}
      </div>

      {/* creator */}
      <div className="rounded-2xl border border-edge bg-panel/90 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">New schedule</p>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setName(p.name);
                setCommand(p.commandName);
                setCadence(p.cadence);
                setChannel(p.channel);
              }}
              className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold text-mute transition-colors hover:border-blurple/50 hover:text-ink"
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-12">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Automation name"
            className="rounded-xl border border-line bg-abyss px-4 py-3 text-sm text-ink placeholder:text-faint focus:border-blurple/60 focus:outline-none md:col-span-3"
          />
          <div className="relative md:col-span-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-blurple-soft">/</span>
            <input
              value={commandName}
              onChange={(e) => setCommand(e.target.value.replace(/^\//, "").toLowerCase())}
              placeholder="command name — try 'gas' or 'daily-digest'"
              list="automation-commands"
              className="w-full rounded-xl border border-line bg-abyss py-3 pl-8 pr-4 font-mono text-sm text-ink placeholder:text-faint focus:border-blurple/60 focus:outline-none"
            />
            <datalist id="automation-commands">
              {(opts ?? []).map((o) => (
                <option key={o.name} value={o.name}>
                  {o.description}
                </option>
              ))}
            </datalist>
          </div>
          <select
            value={cadence}
            onChange={(e) => setCadence(e.target.value)}
            className="rounded-xl border border-line bg-abyss px-4 py-3 text-sm text-ink focus:border-blurple/60 focus:outline-none md:col-span-2"
          >
            {["5m", "15m", "1h", "6h", "12h", "24h", "weekly"].map((c) => (
              <option key={c} value={c}>
                every {c}
              </option>
            ))}
          </select>
          <div className="relative md:col-span-2">
            <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={channel}
              onChange={(e) => setChannel(e.target.value.replace(/^#/, ""))}
              placeholder="channel"
              className="w-full rounded-xl border border-line bg-abyss py-3 pl-9 pr-4 text-sm text-ink placeholder:text-faint focus:border-blurple/60 focus:outline-none"
            />
          </div>
          <button
            onClick={create}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blurple px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blurple-soft disabled:opacity-60 md:col-span-1"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Arm
          </button>
        </div>
      </div>

      {/* list */}
      <div className="space-y-2.5">
        {list === null ? (
          [...Array(3)].map((_, i) => <div key={i} className="shimmer h-20 rounded-2xl" />)
        ) : list.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-line py-20 text-center">
            <Repeat size={26} className="text-faint" />
            <p className="mt-4 font-display text-lg font-semibold text-ink">The plane is empty</p>
            <p className="mt-1 text-sm text-mute">Arm your first schedule above — the presets are one click away.</p>
          </div>
        ) : (
          <AnimatePresence>
            {list.map((a, i) => {
              const cat = cats[a.commandName] ?? "custom";
              const meta = CATEGORY_META[cat] ?? CATEGORY_META.custom;
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition-colors ${
                    a.enabled ? "border-edge bg-panel/90" : "border-edge/60 bg-panel/50 opacity-60"
                  }`}
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border"
                    style={{ borderColor: `${meta.accent}44`, color: meta.accent, background: `${meta.accent}12` }}
                  >
                    <CategoryIcon category={cat} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{a.name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-xs text-mute">
                      <span>
                        <span className="text-blurple-soft">/</span>
                        {a.commandName}
                      </span>
                      <span className="text-faint">·</span>
                      <span>every {a.cadence}</span>
                      <span className="text-faint">·</span>
                      <span>#{a.channel}</span>
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="font-mono text-xs text-ink">{a.runs.toLocaleString()} runs</p>
                    <p className="text-[10px] text-faint">{a.lastRunAt ? `next ${rel(nextFire(a))}` : "first fire pending"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runNow(a)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[11px] font-semibold text-mute transition-colors hover:border-mint/50 hover:text-mint"
                    >
                      <Play size={12} /> Fire
                    </button>
                    <Toggle on={a.enabled} onChange={() => patch(a, { enabled: !a.enabled })} />
                    <button
                      onClick={() => destroy(a)}
                      className="rounded-lg border border-line p-2 text-faint transition-colors hover:border-rose/40 hover:text-rose"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
