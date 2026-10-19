"use client";

import { motion } from "framer-motion";
import { Pause, Play, RefreshCcw, ScrollText, Sparkles, ToggleRight, Trash2, Wand2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/toast";

interface LogRow {
  id: number;
  kind: string;
  message: string;
  createdAt: string;
}

const KIND_STYLE: Record<string, { icon: typeof Play; color: string }> = {
  run: { icon: Play, color: "text-mint" },
  toggle: { icon: ToggleRight, color: "text-amber" },
  create: { icon: Wand2, color: "text-blurple-soft" },
  delete: { icon: Trash2, color: "text-rose" },
  seed: { icon: Sparkles, color: "text-mint" },
  system: { icon: Pause, color: "text-faint" },
};

function rel(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Logs() {
  const [logs, setLogs] = useState<LogRow[] | null>(null);
  const [spinning, setSpinning] = useState(false);
  const toast = useToast();

  const load = useCallback(() => {
    setSpinning(true);
    fetch("/api/logs")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .catch(() => toast.push("err", "Log stream unreachable."))
      .finally(() => setTimeout(() => setSpinning(false), 400));
  }, [toast]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-blurple-soft">
            <ScrollText size={13} /> Event firehose
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">Logs</h1>
          <p className="mt-2 text-sm text-mute">
            Everything the mind does, in order. Refreshes every 8 seconds.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2.5 text-xs font-semibold text-mute transition-colors hover:text-ink"
        >
          <RefreshCcw size={13} className={spinning ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-edge bg-panel/90">
        {logs === null ? (
          <div className="space-y-px p-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="shimmer h-12 rounded-lg" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="py-20 text-center text-sm text-faint">The mind is silent. Run a command in the playground.</p>
        ) : (
          <div className="divide-y divide-edge/60">
            {logs.map((l, i) => {
              const style = KIND_STYLE[l.kind] ?? KIND_STYLE.system;
              const Icon = style.icon;
              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i, 14) * 0.03 }}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-raise/60"
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-raise ${style.color}`}>
                    <Icon size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink/90">{l.message}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-faint">{l.kind}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-faint">{rel(l.createdAt)}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
