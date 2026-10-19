"use client";

import Image from "next/image";
import type { ReactNode } from "react";

/** Render **bold** and `code` inline markdown. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const parts: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length > 0) {
    const bold = rest.match(/\*\*([^*]+)\*\*/);
    const code = rest.match(/`([^`]+)`/);
    const candidates = [bold, code]
      .filter((m): m is RegExpMatchArray => !!m && m.index !== undefined)
      .sort((a, b) => a.index! - b.index!);
    if (candidates.length === 0) {
      parts.push(<span key={key++}>{rest}</span>);
      break;
    }
    const m = candidates[0];
    const idx = m.index!;
    if (idx > 0) parts.push(<span key={key++}>{rest.slice(0, idx)}</span>);
    if (m[0].startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-ink">
          {m[1]}
        </strong>
      );
    } else {
      parts.push(
        <code key={key++} className="rounded bg-abyss px-1 py-0.5 font-mono text-[0.85em] text-blurple-soft">
          {m[1]}
        </code>
      );
    }
    rest = rest.slice(idx + m[0].length);
  }
  return <span className={className}>{parts}</span>;
}

function timeNow() {
  const d = new Date();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `Today at ${h}:${m} ${ampm}`;
}

export interface ChatMessage {
  id: string | number;
  author: "user" | "bot";
  username: string;
  accent?: string;
  content?: string;
  embed?: { title: string; body: string; accent: string; footer?: string };
}

export function DiscordMessage({ msg, userAvatarHue = 262 }: { msg: ChatMessage; userAvatarHue?: number }) {
  const isBot = msg.author === "bot";
  return (
    <div className="group flex gap-3 px-4 py-2 transition-colors hover:bg-white/2">
      {isBot ? (
        <span className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line">
          <Image src="/bot-avatar.png" alt="ORBIT" fill sizes="40px" className="object-cover" />
        </span>
      ) : (
        <span
          className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, hsl(${userAvatarHue} 70% 55%), hsl(${userAvatarHue + 40} 70% 40%))` }}
        >
          {msg.username.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className={`text-[15px] font-semibold ${isBot ? "text-blurple-soft" : "text-ink"}`}>
            {msg.username}
          </span>
          {isBot && (
            <span className="rounded-sm bg-blurple px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-white">
              App
            </span>
          )}
          <span className="text-[11px] font-medium text-faint">{timeNow()}</span>
        </p>
        {msg.content && (
          <p className="mt-0.5 wrap-break-word text-[15px] leading-relaxed text-ink/90">
            <RichText text={msg.content} />
          </p>
        )}
        {msg.embed && (
          <div
            className="mt-1.5 max-w-lg rounded-md border-l-4 bg-raise/90 px-4 py-3"
            style={{ borderColor: msg.embed.accent }}
          >
            <p className="text-sm font-bold text-ink">
              <RichText text={msg.embed.title} />
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink/85">
              <RichText text={msg.embed.body} />
            </p>
            {msg.embed.footer && (
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-faint">
                {msg.embed.footer}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-mute">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-mute"
            style={{ animation: `caret-blink 1s ${i * 0.18}s infinite` }}
          />
        ))}
      </span>
      <span className="text-xs font-medium">ORBIT is thinking</span>
    </div>
  );
}
