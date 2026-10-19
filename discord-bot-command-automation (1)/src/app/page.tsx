"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Flame,
  Layers,
  Pause,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { CountUp } from "@/components/count-up";
import { CATEGORY_META } from "@/lib/command-data";

interface Stats {
  total: number;
  enabled: number;
  paused: number;
  custom: number;
  premium: number;
  uses: number;
  categories: number;
  categoryCounts: Record<string, number>;
  top: { name: string; uses: number; category: string }[];
  logs: { id: number; kind: string; message: string; createdAt: string }[];
}

interface CommandRow {
  id: number;
  name: string;
  category: string;
}

const SCRIPTS: { input: string; out: string[] }[] = [
  { input: "/ban @raider42 spam links", out: ["Case #4821 — @raider42 banned from Nexus Station.", "Evidence archived · mod-log pinged."] },
  { input: "/price-bitcoin", out: ["Bitcoin: $97,214 (+6.2%) 24h · vol $41B"] },
  { input: "/tarot-draw", out: ["You draw: The Star (upright).", "Trust the weird pull."] },
  { input: "/giveaway 24h 2 Nitro Classic", out: ["GIVEAWAY armed — 2 winners · ends in 24h", "React below to enter."] },
  { input: "/deploy production v2.4.1", out: ["blue/green swap complete · pipeline #9284"] },
  { input: "/antiraid", out: ["Anti-raid ARMED — joins capped at 20/min"] },
];

function useTypescript(scripts: typeof SCRIPTS) {
  const [typed, setTyped] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const script = scripts[idx % scripts.length];
    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const typeChar = (i: number) => {
      if (cancelled) return;
      if (i <= script.input.length) {
        setTyped(script.input.slice(0, i));
        timeout = setTimeout(() => typeChar(i + 1), 34 + Math.random() * 46);
      } else {
        timeout = setTimeout(() => printOut(0), 380);
      }
    };
    const printOut = (i: number) => {
      if (cancelled) return;
      if (i < script.out.length) {
        setLines((prev) => [...prev, script.out[i]]);
        timeout = setTimeout(() => printOut(i + 1), 420);
      } else {
        timeout = setTimeout(() => {
          if (cancelled) return;
          setLines([]);
          setTyped("");
          setIdx((v) => v + 1);
        }, 2100);
      }
    };
    typeChar(0);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [idx, scripts]);

  return { typed, lines };
}

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [names, setNames] = useState<CommandRow[]>([]);
  const { typed, lines } = useTypescript(SCRIPTS);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch("/api/stats").then((r) => r.json()).then((d) => setStats(d)).catch(() => {});
    fetch("/api/commands?pageSize=96&sort=uses")
      .then((r) => r.json())
      .then((d) => setNames(d.commands ?? []))
      .catch(() => {});
  }, []);

  const marqueeA = useMemo(() => names.slice(0, 48), [names]);
  const marqueeB = useMemo(() => [...names].reverse().slice(0, 48), [names]);

  return (
    <div className="space-y-16 pb-10">
      {/* ------------------------------------------------ HERO */}
      <section className="relative pt-8 lg:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-blurple-soft">
            <Sparkles size={13} /> Self-bootstrapping bot intelligence
          </p>
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            The bot that
            <br />
            <span className="bg-gradient-to-r from-blurple-soft via-ink to-rose bg-clip-text text-transparent">
              commands itself.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-mute">
            Point ORBIT at a Discord server and it compiles a mind of{" "}
            <span className="font-semibold text-ink">1,000 production-ready commands</span> — moderation
            hammers, tarot decks, a casino, crypto radar, devops consoles — then hands you the keys.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/commands"
              className="group inline-flex items-center gap-2 rounded-xl bg-blurple px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blurple-soft hover:shadow-[0_0_36px_rgba(88,101,242,0.5)]"
            >
              Open the Library
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-blurple/50 hover:bg-raise"
            >
              <Terminal size={16} className="text-blurple-soft" />
              Launch Playground
            </Link>
          </div>
        </motion.div>

        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="float-y mt-12 overflow-hidden rounded-2xl border border-line bg-panel/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 border-b border-edge px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-rose/70" />
            <span className="h-3 w-3 rounded-full bg-amber/70" />
            <span className="h-3 w-3 rounded-full bg-mint/70" />
            <span className="ml-3 font-mono text-xs text-faint">orbit@nexus-station — zsh</span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-mint">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" /> live
            </span>
          </div>
          <div className="min-h-44 space-y-2 p-5 font-mono text-sm">
            <p className="text-faint">
              <span className="text-blurple-soft">λ</span> compiled <span className="text-ink">1,000</span> commands
              across <span className="text-ink">31</span> categories in <span className="text-mint">14ms</span>
            </p>
            <p className="text-ink">
              <span className="mr-2 text-blurple-soft">❯</span>
              {typed}
              <span className="caret-blink ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-blurple-soft" />
            </p>
            {lines.map((l, i) => (
              <motion.p key={`${i}-${l}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="pl-5 text-mute">
                {l}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------ MARQUEE */}
      <section className="relative -mx-4 overflow-hidden py-2 sm:-mx-6 lg:-mx-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-abyss to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-abyss to-transparent" />
        <div className="space-y-3 [transform:rotate(-1.2deg)]">
          {[marqueeA, marqueeB].map((row, r) => (
            <div key={r} className="flex overflow-hidden">
              <div className={`flex shrink-0 items-center gap-3 pr-3 ${r === 0 ? "animate-marquee" : "animate-marquee-reverse"}`}>
                {[...row, ...row].map((c, i) => (
                  <span
                    key={`${c.id}-${i}`}
                    className="whitespace-nowrap rounded-full border border-line bg-panel/80 px-4 py-1.5 font-mono text-xs text-mute"
                  >
                    <span className="text-blurple-soft">/</span>
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ STATS */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Boxes, label: "Commands compiled", value: stats?.total, suffix: "", accent: "text-blurple-soft" },
          { icon: Layers, label: "Categories armed", value: stats ? stats.categories : undefined, suffix: "", accent: "text-mint" },
          { icon: Zap, label: "Total executions", value: stats?.uses, suffix: "", accent: "text-amber" },
          { icon: Pause, label: "Paused right now", value: stats?.paused, suffix: "", accent: "text-rose" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.07, duration: 0.5 }}
            className="group relative overflow-hidden rounded-2xl border border-edge bg-panel/80 p-5 backdrop-blur transition-colors hover:border-line"
          >
            <s.icon size={18} className={`${s.accent} mb-4`} />
            <p className="font-display text-4xl font-bold tracking-tight text-ink">
              {s.value === undefined ? <span className="text-faint">—</span> : <CountUp value={s.value} />}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-faint">{s.label}</p>
          </motion.div>
        ))}
      </section>

      {/* ------------------------------------------------ CATEGORIES */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Thirty-one minds, one bot
            </h2>
            <p className="mt-1 text-sm text-mute">Every command category ships pre-wired, pre-permissioned and toggleable.</p>
          </div>
          <Link href="/commands" className="hidden items-center gap-1 text-sm font-semibold text-blurple-soft hover:underline sm:inline-flex">
            Browse all <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(CATEGORY_META)
            .filter(([key]) => key !== "custom")
            .map(([key, meta], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (i % 4) * 0.06, duration: 0.45 }}
              >
                <Link
                  href={`/commands?category=${key}`}
                  className="group relative block overflow-hidden rounded-2xl border border-edge bg-panel/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-line hover:bg-raise"
                >
                  <span
                    className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-30"
                    style={{ background: meta.accent }}
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-lg border"
                      style={{ borderColor: `${meta.accent}55`, color: meta.accent, background: `${meta.accent}14` }}
                    >
                      <CategoryIcon category={key} size={16} />
                    </span>
                    <span className="font-mono text-xs text-faint">
                      {stats?.categoryCounts?.[key] ?? "·"} cmds
                    </span>
                  </div>
                  <p className="mt-4 font-display text-base font-bold text-ink">{meta.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-faint">{meta.blurb}</p>
                </Link>
              </motion.div>
            ))}
        </div>
      </section>

      {/* ------------------------------------------------ TOP + ACTIVITY */}
      <section className="grid gap-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-edge bg-panel/80 p-6 lg:col-span-3">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <Flame size={17} className="text-amber" /> Most executed this epoch
          </h3>
          <div className="mt-5 space-y-1">
            {(stats?.top ?? []).map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-raise"
              >
                <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-mono text-sm text-ink">
                  <span className="text-blurple-soft">/</span>
                  {c.name}
                </span>
                <span className="ml-auto hidden text-[10px] font-semibold uppercase tracking-widest text-faint sm:block" style={{ color: CATEGORY_META[c.category]?.accent }}>
                  {c.category}
                </span>
                <span className="w-16 text-right font-mono text-xs tabular-nums text-mute">
                  {c.uses.toLocaleString()} runs
                </span>
              </motion.div>
            ))}
            {!stats && [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="shimmer h-10 rounded-lg" />)}
          </div>
        </div>
        <div className="rounded-2xl border border-edge bg-panel/80 p-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
            <Terminal size={17} className="text-blurple-soft" /> Live firehose
          </h3>
          <div className="mt-5 space-y-3">
            {(stats?.logs ?? []).map((l, i) => (
              <motion.p
                key={l.id}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border-l-2 border-line pl-3 text-xs leading-relaxed text-mute"
              >
                <span className="font-mono text-blurple-soft">{l.kind.toUpperCase()}</span> · {l.message}
              </motion.p>
            ))}
            {!stats && [0, 1, 2, 3, 4].map((i) => <div key={i} className="shimmer h-5 rounded" />)}
          </div>
          <Link href="/logs" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-blurple-soft hover:underline">
            Open full logs <ArrowUpRight size={13} />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------ CTA */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-blurple/30 bg-gradient-to-br from-blurple/15 via-panel to-panel p-8 sm:p-12"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blurple/20 blur-3xl" />
        <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          Forge your own command in under sixty seconds.
        </h2>
        <p className="mt-3 max-w-xl text-mute">
          The Studio mints custom slash commands with live embed previews — then hot-swaps them into
          the bot&apos;s mind without a restart.
        </p>
        <Link
          href="/builder"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-abyss transition-transform hover:scale-[1.03]"
        >
          Enter the Studio <ArrowRight size={16} />
        </Link>
      </motion.section>
    </div>
  );
}
