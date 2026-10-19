"use client";

import { motion } from "framer-motion";
import { Braces, Check, ClipboardCopy, KeyRound, Loader2, ShieldAlert, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/toast";

interface KeyRow {
  id: number;
  label: string;
  prefix: string;
  active: boolean;
  requests: number;
  createdAt: string;
  lastUsedAt: string | null;
}

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/commands?q=raid&category=security",
    desc: "Search, filter and paginate the 1,000-command mind.",
    curl: `curl "https://your-host/api/commands?q=raid&category=security" \\
  -H "Authorization: Bearer orb_live_..."`,
  },
  {
    method: "POST",
    path: "/api/commands/{id}/run",
    desc: "Record an execution — feeds analytics and the firehose.",
    curl: `curl -X POST "https://your-host/api/commands/42/run" \\
  -H "Authorization: Bearer orb_live_..."`,
  },
  {
    method: "PATCH",
    path: "/api/commands/{id}",
    desc: "Toggle, retune cooldowns or rewrite a response template.",
    curl: `curl -X PATCH "https://your-host/api/commands/42" \\
  -H "Authorization: Bearer orb_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"enabled": false}'`,
  },
  {
    method: "POST",
    path: "/api/commands/bulk",
    desc: "Arm or pause an entire category in one call.",
    curl: `curl -X POST "https://your-host/api/commands/bulk" \\
  -H "Authorization: Bearer orb_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"category": "music", "enabled": true}'`,
  },
];

const METHOD_STYLE: Record<string, string> = {
  GET: "bg-mint/15 text-mint border-mint/30",
  POST: "bg-blurple/15 text-blurple-soft border-blurple/30",
  PATCH: "bg-amber/15 text-amber border-amber/30",
  DELETE: "bg-rose/15 text-rose border-rose/30",
};

export default function ApiAccess() {
  const toast = useToast();
  const [keys, setKeys] = useState<KeyRow[] | null>(null);
  const [label, setLabel] = useState("Production key");
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState<{ label: string; keyValue: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/keys")
      .then((r) => r.json())
      .then((d) => setKeys(d.keys ?? []))
      .catch(() => toast.push("err", "Key vault unreachable."));
  }, [toast]);

  useEffect(() => load(), [load]);

  const mint = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.push("err", "Minting failed.");
      } else {
        setFresh({ label: json.key.label, keyValue: json.key.keyValue });
        load();
      }
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (k: KeyRow) => {
    await fetch(`/api/keys/${k.id}`, { method: "DELETE" });
    toast.push("ok", `"${k.label}" revoked.`);
    load();
  };

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-8 pt-2">
      <div>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-blurple-soft">
          <Braces size={13} /> Programmatic control
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">API Access</h1>
        <p className="mt-2 max-w-xl text-sm text-mute">
          Every surface of this command center is a REST endpoint. Mint a key, wire your tools, own the mind
          from anywhere.
        </p>
      </div>

      {/* mint */}
      <div className="rounded-2xl border border-edge bg-panel/90 p-6">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex-1 min-w-56">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-faint">Key label</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-xl border border-line bg-abyss px-4 py-3 text-sm text-ink focus:border-blurple/60 focus:outline-none"
            />
          </label>
          <button
            onClick={mint}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-blurple px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blurple-soft disabled:opacity-60"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
            Mint key
          </button>
        </div>

        {fresh && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-xl border border-mint/30 bg-mint/5 p-4"
          >
            <p className="flex items-center gap-2 text-xs font-semibold text-mint">
              <ShieldAlert size={13} /> "{fresh.label}" minted — shown exactly once. Store it like a seed phrase.
            </p>
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-mint/20 bg-abyss px-4 py-3">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-mint">{fresh.keyValue}</code>
              <button
                onClick={() => copy(fresh.keyValue, "fresh")}
                className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-blurple-soft"
              >
                {copied === "fresh" ? <Check size={12} /> : <ClipboardCopy size={12} />}
                {copied === "fresh" ? "copied" : "copy"}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* keys table */}
      <div className="overflow-hidden rounded-2xl border border-edge bg-panel/90">
        <div className="border-b border-edge px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">Active keyring</p>
        </div>
        {keys === null ? (
          <div className="p-4">
            <div className="shimmer h-12 rounded-lg" />
          </div>
        ) : keys.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-faint">No keys yet — mint one above.</p>
        ) : (
          <div className="divide-y divide-edge/60">
            {keys.map((k) => (
              <div key={k.id} className="flex flex-wrap items-center gap-4 px-6 py-3.5">
                <KeyRound size={15} className="shrink-0 text-blurple-soft" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{k.label}</p>
                  <p className="font-mono text-[11px] text-faint">{k.prefix}••••••••</p>
                </div>
                <span className="font-mono text-xs text-mute">{k.requests.toLocaleString()} req</span>
                <span className="hidden font-mono text-[11px] text-faint sm:block">
                  {new Date(k.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => revoke(k)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-[11px] font-semibold text-faint transition-colors hover:border-rose/40 hover:text-rose"
                >
                  <Trash2 size={12} /> Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* endpoint reference */}
      <div>
        <h2 className="mb-4 font-display text-xl font-bold text-ink">Endpoint reference</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {ENDPOINTS.map((e, i) => (
            <motion.div
              key={e.path}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-edge bg-panel/90 p-5"
            >
              <p className="flex items-center gap-2.5">
                <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${METHOD_STYLE[e.method]}`}>
                  {e.method}
                </span>
                <code className="truncate font-mono text-xs text-ink">{e.path}</code>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-mute">{e.desc}</p>
              <div className="relative mt-3 rounded-lg border border-line bg-abyss p-3">
                <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-ink/70">{e.curl}</pre>
                <button
                  onClick={() => copy(e.curl, e.path)}
                  className="absolute right-2 top-2 rounded-md border border-line bg-raise p-1.5 text-faint transition-colors hover:text-ink"
                >
                  {copied === e.path ? <Check size={11} className="text-mint" /> : <ClipboardCopy size={11} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
