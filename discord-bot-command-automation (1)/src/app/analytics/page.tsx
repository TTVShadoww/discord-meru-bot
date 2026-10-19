"use client";

import { motion } from "framer-motion";
import { Activity, Gauge, Layers, Timer, TrendingUp, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { CountUp } from "@/components/count-up";
import { CATEGORY_META } from "@/lib/command-data";

interface CmdRow {
  id: number;
  name: string;
  category: string;
  uses: number;
  cooldown: number;
  enabled: boolean;
  premium: boolean;
}

interface Stats {
  total: number;
  enabled: number;
  paused: number;
  custom: number;
  premium: number;
  uses: number;
  categories: number;
  top: { name: string; uses: number; category: string }[];
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSeries(seed: number, days: number, scale: number) {
  const rand = mulberry32(seed * 7919 + days * 131);
  const pts: number[] = [];
  let base = scale * (0.55 + rand() * 0.4);
  for (let i = 0; i < days; i++) {
    base = Math.max(scale * 0.2, base + (rand() - 0.47) * scale * 0.28);
    pts.push(Math.round(base * (1 + Math.sin(i / 2.2) * 0.14)));
  }
  return pts;
}

function AreaChart({ data, accent }: { data: number[]; accent: string }) {
  const W = 720;
  const H = 200;
  const max = Math.max(...data) * 1.1;
  const step = W / (data.length - 1);
  const line = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(H - (v / max) * (H - 24)).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="areagrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#1c2032" strokeDasharray="3 6" />
      ))}
      <path d={area} fill="url(#areagrad)" />
      <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) =>
        i % Math.ceil(data.length / 10) === 0 ? (
          <circle key={i} cx={i * step} cy={H - (v / max) * (H - 24)} r="3" fill={accent} opacity="0.9" />
        ) : null
      )}
    </svg>
  );
}

function Donut({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = 70;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 180 180" className="h-40 w-40 -rotate-90">
        {slices.map((s) => {
          const frac = s.value / total;
          const el = (
            <circle
              key={s.label}
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="22"
              strokeDasharray={`${(frac * C - 3).toFixed(1)} ${(C - frac * C + 3).toFixed(1)}`}
              strokeDashoffset={(-offset * C).toFixed(1)}
              strokeLinecap="butt"
            />
          );
          offset += frac;
          return el;
        })}
      </svg>
      <div className="space-y-1.5">
        {slices.map((s) => (
          <p key={s.label} className="flex items-center gap-2 text-xs text-mute">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            <span className="capitalize">{s.label}</span>
            <span className="ml-auto font-mono tabular-nums text-ink/80">
              {((s.value / total) * 100).toFixed(1)}%
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [commands, setCommands] = useState<CmdRow[] | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {});
    fetch("/api/commands?pageSize=1200").then((r) => r.json()).then((d) => setCommands(d.commands ?? [])).catch(() => {});
  }, []);

  const byCategory = useMemo(() => {
    if (!commands) return [];
    const map = new Map<string, number>();
    for (const c of commands) map.set(c.category, (map.get(c.category) ?? 0) + c.uses);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [commands]);

  const series = useMemo(
    () => buildSeries((stats?.uses ?? 1000) % 99991, days, Math.max(200, (stats?.uses ?? 4000) / 90)),
    [stats, days]
  );

  const top12 = useMemo(
    () => (commands ? [...commands].sort((a, b) => b.uses - a.uses).slice(0, 12) : []),
    [commands]
  );

  const donutSlices = useMemo(() => {
    const top = byCategory.slice(0, 6).map(([key, v]) => ({
      label: CATEGORY_META[key]?.label ?? key,
      value: v,
      color: CATEGORY_META[key]?.accent ?? "#5865f2",
    }));
    const rest = byCategory.slice(6).reduce((s, [, v]) => s + v, 0);
    if (rest > 0) top.push({ label: "Other", value: rest, color: "#2a3050" });
    return top;
  }, [byCategory]);

  const maxCat = byCategory[0]?.[1] ?? 1;

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-blurple-soft">
            <Gauge size={13} /> Telemetry
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">Analytics</h1>
          <p className="mt-2 text-sm text-mute">Execution intelligence across the whole 1,000-command mind.</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-line bg-panel p-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                days === d ? "bg-blurple text-white" : "text-mute hover:text-ink"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Zap, label: "Lifetime executions", value: stats?.uses, accent: "text-blurple-soft" },
          { icon: Layers, label: "Active categories", value: stats?.categories, accent: "text-mint" },
          { icon: Activity, label: "Commands online", value: stats?.enabled, accent: "text-amber" },
          { icon: Timer, label: "Premium arsenal", value: stats?.premium, accent: "text-rose" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-edge bg-panel/90 p-5"
          >
            <k.icon size={16} className={`${k.accent} mb-3`} />
            <p className="font-display text-3xl font-bold tracking-tight text-ink">
              {k.value === undefined ? "—" : <CountUp value={k.value} />}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* area chart */}
      <div className="rounded-2xl border border-edge bg-panel/90 p-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <TrendingUp size={16} className="text-blurple-soft" /> Executions per day
          </h2>
          <span className="font-mono text-xs text-faint">{days}-day window</span>
        </div>
        <AreaChart data={series} accent="#5865f2" />
        <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
          <span>{days}d ago</span>
          <span>today</span>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {/* category bars */}
        <div className="rounded-2xl border border-edge bg-panel/90 p-6 lg:col-span-3">
          <h2 className="mb-4 font-display text-lg font-bold text-ink">Executions by category</h2>
          <div className="max-h-105 space-y-2.5 overflow-y-auto pr-2">
            {byCategory.map(([key, value], i) => {
              const meta = CATEGORY_META[key] ?? CATEGORY_META.custom;
              return (
                <div key={key} className="group">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-mute">
                      <span style={{ color: meta.accent }}>
                        <CategoryIcon category={key} size={12} />
                      </span>
                      {meta.label}
                    </span>
                    <span className="font-mono tabular-nums text-faint">{value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-abyss">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(2, (value / maxCat) * 100)}%` }}
                      transition={{ duration: 0.8, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${meta.accent}88, ${meta.accent})` }}
                    />
                  </div>
                </div>
              );
            })}
            {!commands && <div className="shimmer h-64 rounded-xl" />}
          </div>
        </div>

        {/* donut + top commands */}
        <div className="space-y-3 lg:col-span-2">
          <div className="rounded-2xl border border-edge bg-panel/90 p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-ink">Share of mind</h2>
            {commands ? <Donut slices={donutSlices} /> : <div className="shimmer h-40 rounded-xl" />}
          </div>
          <div className="rounded-2xl border border-edge bg-panel/90 p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-ink">Hot dozen</h2>
            <div className="space-y-1.5">
              {top12.map((c, i) => (
                <p key={c.id} className="flex items-baseline gap-2 text-xs">
                  <span className="w-5 font-mono text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-mono text-ink">
                    <span className="text-blurple-soft">/</span>
                    {c.name}
                  </span>
                  <span className="ml-auto font-mono tabular-nums text-faint">{c.uses.toLocaleString()}</span>
                </p>
              ))}
              {top12.length === 0 && <div className="shimmer h-56 rounded-xl" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
