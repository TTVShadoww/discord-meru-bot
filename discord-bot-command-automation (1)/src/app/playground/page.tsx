"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Eraser, FlaskConical, Loader2, SlashSquare, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DiscordMessage, TypingIndicator, type ChatMessage } from "@/components/discord-mock";
import { useToast } from "@/components/toast";
import { CATEGORY_META, renderResponse } from "@/lib/command-data";
import { interpret } from "@/lib/fuzzy";

interface Cmd {
  id: number;
  name: string;
  description: string;
  category: string;
  usage: string;
  aliases: string[];
  response: string;
  enabled: boolean;
  premium: boolean;
}

const QUICK = ["eightball", "tarot-draw", "gas", "daily-digest", "dex-voidmare", "hug"];

function PlaygroundInner() {
  const sp = useSearchParams();
  const [commands, setCommands] = useState<Cmd[] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "boot",
      author: "bot",
      username: "ORBIT",
      embed: {
        title: "Playground armed — v2 router online",
        body: "Type any `/command`, or just **describe what you want in plain language** — the intent router will find and execute the closest of 1,000 commands. Try `/tarot-draw` or just `scare away the raiders`.",
        accent: "#5865f2",
        footer: "sandbox · nexus-station · nlp router",
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [count, setCount] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const uid = useRef(0);
  const nid = (p: string) => `${p}-${Date.now()}-${uid.current++}`;

  useEffect(() => {
    fetch("/api/commands?pageSize=1200")
      .then((r) => r.json())
      .then((d) => setCommands(d.commands ?? []))
      .catch(() => toast.push("err", "Could not load the command mind."));
  }, [toast]);

  useEffect(() => {
    const pre = sp.get("cmd");
    if (pre && commands?.length) {
      setInput(`/${pre} `);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [sp, commands]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const token = input.startsWith("/") ? input.slice(1).split(" ")[0].toLowerCase() : null;
  const suggestions = useMemo(() => {
    if (!commands || token === null || input.includes(" ")) return [];
    return commands
      .filter((c) => c.name.startsWith(token) || c.aliases.some((a) => a.startsWith(token)))
      .slice(0, 8);
  }, [commands, token, input]);

  useEffect(() => setHighlight(0), [suggestions.length]);

  const run = useCallback(
    async (raw: string) => {
      if (!commands) return;
      const trimmed = raw.trim();
      if (!trimmed) return;

      setMessages((m) => [...m, { id: nid("u"), author: "user", username: "you", content: trimmed }]);

      let cmd: Cmd | undefined;
      let argString = "";
      let mention: string | undefined;
      let routed: { via: string; confidence: number } | null = null;

      if (trimmed.startsWith("/")) {
        const [, rest] = trimmed.split("/", 2);
        const [rawName, ...argParts] = (rest ?? "").split(/\s+/);
        const name = rawName.toLowerCase();
        argString = argParts.join(" ");
        mention = argParts.find((p) => p.startsWith("@"))?.slice(1);
        cmd = commands.find((c) => c.name === name) ?? commands.find((c) => c.aliases.includes(name));
      } else {
        const guess = interpret(trimmed, commands);
        if (guess) {
          cmd = commands.find((c) => c.name === guess.command.name);
          mention = trimmed.match(/@(\w+)/)?.[1];
          routed = { via: guess.command.name, confidence: guess.confidence };
        }
      }

      setTyping(true);
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 600));
      setTyping(false);

      const fresh: ChatMessage[] = [];

      // Unknown slash command
      if (trimmed.startsWith("/") && !cmd) {
        fresh.push({
          id: nid("e"),
          author: "bot",
          username: "ORBIT",
          embed: {
            title: "Unknown command",
            body: `No \`${trimmed.split(" ")[0]}\` in the mind. It might not exist — or it hasn't been forged yet. The Studio can fix that in seconds.`,
            accent: "#f0564a",
            footer: "error 404 · command not found",
          },
        });
      }
      // Natural language with no confident match
      else if (!trimmed.startsWith("/") && !cmd) {
        fresh.push({
          id: nid("e"),
          author: "bot",
          username: "ORBIT",
          embed: {
            title: "Intent unclear",
            body: "I couldn't map that to any of the 1,000 commands confidently. Try naming an action — `ban`, `fish`, `tarot`, `gas`, `remind`… or just start typing `/` and I'll autocomplete you.",
            accent: "#f0b357",
            footer: "router · low confidence",
          },
        });
      } else if (cmd) {
        // NL router bridge message
        if (routed) {
          fresh.push({
            id: nid("r"),
            author: "bot",
            username: "ORBIT",
            embed: {
              title: "Intent routed",
              body: `Heard: "${trimmed.length > 60 ? trimmed.slice(0, 60) + "…" : trimmed}" → executing \`/${routed.via}\` (**${Math.round(routed.confidence * 100)}%** confidence).`,
              accent: "#5865f2",
              footer: "nlp router · semantic match",
            },
          });
        }

        if (!cmd.enabled) {
          fresh.push({
            id: nid("p"),
            author: "bot",
            username: "ORBIT",
            embed: {
              title: `/${cmd.name} is paused`,
              body: "This command was switched off in the Library. Flip its toggle and it comes right back.",
              accent: "#f0b357",
              footer: `${cmd.category} · paused`,
            },
          });
        } else {
          const rendered = renderResponse(cmd.response, {
            user: "@you",
            target: mention ? `@${mention}` : undefined,
            args: argString || undefined,
            server: "Nexus Station",
          });
          fetch(`/api/commands/${cmd.id}/run`, { method: "POST" }).catch(() => {});
          setCount((c) => c + 1);
          const meta = CATEGORY_META[cmd.category] ?? CATEGORY_META.custom;
          fresh.push({
            id: nid("b"),
            author: "bot",
            username: "ORBIT",
            embed: {
              title: `/${cmd.name}`,
              body: rendered,
              accent: meta.accent,
              footer: `${cmd.category} · cooldown ok`,
            },
          });
        }
      }

      setMessages((m) => [...m, ...fresh]);
    },
    [commands]
  );

  const submit = (value: string) => {
    if (!value.trim()) return;
    setInput("");
    void run(value);
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col space-y-4 pb-2 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-blurple-soft">
            <FlaskConical size={13} /> Simulation chamber
          </p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-ink">Playground</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-lg border border-blurple/30 bg-blurple/10 px-3 py-1.5 font-mono text-xs text-blurple-soft sm:inline-flex">
            <Sparkles size={12} /> nlp router
          </span>
          <span className="rounded-lg border border-line bg-panel px-3 py-1.5 font-mono text-xs text-mute">
            {commands ? `${commands.length.toLocaleString()} commands loaded` : "loading mind..."}
          </span>
          <span className="rounded-lg border border-mint/30 bg-mint/10 px-3 py-1.5 font-mono text-xs text-mint">
            {count} run{count === 1 ? "" : "s"}
          </span>
          <button
            onClick={() => setMessages((m) => m.slice(0, 1))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-xs font-semibold text-mute transition-colors hover:text-rose"
          >
            <Eraser size={13} /> Wipe
          </button>
        </div>
      </div>

      {/* chat */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-[#10121b]">
        <div className="border-b border-edge px-5 py-3">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <span className="text-faint">#</span> playground
          </p>
          <p className="text-xs text-faint">Every execution here writes to the real usage ledger.</p>
        </div>

        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto py-3">
          {commands === null ? (
            <div className="flex items-center gap-2 px-5 py-4 text-sm text-faint">
              <Loader2 size={15} className="animate-spin" /> Booting 1,000-command mind...
            </div>
          ) : (
            messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <DiscordMessage msg={m} userAvatarHue={150} />
              </motion.div>
            ))
          )}
          {typing && <TypingIndicator />}
        </div>

        {/* quick chips */}
        <div className="flex gap-2 overflow-x-auto border-t border-edge px-5 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => submit(`/${q}`)}
              className="shrink-0 rounded-full border border-line bg-panel px-3 py-1 font-mono text-[11px] text-mute transition-colors hover:border-blurple/50 hover:text-ink"
            >
              /{q}
            </button>
          ))}
          <button
            onClick={() => submit("check gas prices before I bridge")}
            className="shrink-0 rounded-full border border-blurple/40 bg-blurple/10 px-3 py-1 font-mono text-[11px] text-blurple-soft transition-colors hover:bg-blurple/20"
          >
            try: "check gas prices before I bridge"
          </button>
        </div>

        {/* composer */}
        <div className="relative border-t border-edge p-4">
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-full left-4 right-4 z-20 mb-2 overflow-hidden rounded-xl border border-line bg-raise shadow-2xl"
              >
                <p className="border-b border-edge px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-faint">
                  Commands matching /{token}
                </p>
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setInput(`/${s.name} `);
                      inputRef.current?.focus();
                    }}
                    className={`flex w-full items-baseline gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === highlight ? "bg-blurple/15" : "hover:bg-blurple/10"
                    }`}
                  >
                    <span className="font-mono text-sm text-ink">
                      <span className="text-blurple-soft">/</span>
                      {s.name}
                    </span>
                    <span className="truncate text-xs text-faint">{s.description}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 rounded-xl border border-line bg-[#1a1d2b] px-4 py-1 transition-colors focus-within:border-blurple/60">
            <SlashSquare size={18} className="shrink-0 text-blurple-soft" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" && suggestions.length) {
                  e.preventDefault();
                  setHighlight((h) => (h + 1) % suggestions.length);
                } else if (e.key === "ArrowUp" && suggestions.length) {
                  e.preventDefault();
                  setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
                } else if (e.key === "Tab" && suggestions.length) {
                  e.preventDefault();
                  setInput(`/${suggestions[highlight].name} `);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (suggestions.length && input.startsWith("/") && !input.includes(" ")) {
                    submit(`/${suggestions[highlight].name}`);
                  } else {
                    submit(input);
                  }
                }
              }}
              placeholder={commands ? "Message #playground — /command or plain language" : "loading..."}
              disabled={!commands}
              className="w-full bg-transparent py-3 text-[15px] text-ink placeholder:text-faint focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => submit(input)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blurple text-white transition-colors hover:bg-blurple-soft"
            >
              <CornerDownLeft size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Playground() {
  return (
    <Suspense
      fallback={
        <div className="grid place-items-center py-40 text-faint">
          <Loader2 size={22} className="animate-spin" />
        </div>
      }
    >
      <PlaygroundInner />
    </Suspense>
  );
}
