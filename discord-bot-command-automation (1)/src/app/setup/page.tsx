"use client";

import { motion } from "framer-motion";
import { Check, ClipboardCopy, KeyRound, Link2, ListChecks, Rocket, ServerCog } from "lucide-react";
import { useMemo, useState } from "react";

const ENV_SNIPPET = `# --- dashboard .env (this web app) ---
DATABASE_URL=postgresql://user:pass@host:5432/orbit

# --- bot runtime env (inline or bot/.env) ---
DISCORD_TOKEN=your_bot_token_from_step_1
DISCORD_CLIENT_ID=your_application_id
ORBIT_API=http://localhost:3000       # where the dashboard runs
DISCORD_GUILD_ID=your_test_server_id  # optional: instant dev registration`;

const BOT_SNIPPET = `// bot/index.mjs — THE COMPLETE RUNTIME, already in this repo.
// Just set env vars and run: node bot/index.mjs
import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";

const ORBIT = process.env.ORBIT_API ?? "http://localhost:3000";

// 1. Pull the mind from the dashboard API (single source of truth).
const { commands } = await fetch(ORBIT + "/api/commands?pageSize=1200").then((r) => r.json());

// 2. Discord caps global slash commands at 100 per app —
//    so all 1,000 ride ONE umbrella command with live autocomplete.
const umbrella = new SlashCommandBuilder()
  .setName("orbit")
  .setDescription("Run any of ORBIT's 1,000 commands")
  .addStringOption((o) =>
    o.setName("command").setDescription("start typing to autocomplete")
      .setRequired(true).setAutocomplete(true))
  .addStringOption((o) => o.setName("input").setDescription("arguments"))
  .addUserOption((o) => o.setName("member").setDescription("target member"));

await new REST().setToken(process.env.DISCORD_TOKEN).put(
  Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
  { body: [umbrella.toJSON()] }
);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, (c) =>
  console.log("ORBIT online as " + c.user.tag + " — " + commands.length + " commands hot"));

client.on(Events.InteractionCreate, async (i) => {
  if (i.isAutocomplete()) {
    const q = i.options.getFocused().toLowerCase();
    return i.respond(
      commands.filter((c) => c.name.includes(q)).slice(0, 25)
        .map((c) => ({ name: ("/" + c.name + " — " + c.description).slice(0, 100), value: c.name }))
    );
  }
  if (!i.isChatInputCommand()) return;
  const cmd = commands.find((c) => c.name === i.options.getString("command"));
  if (!cmd?.enabled) return i.reply({ content: "Command offline.", ephemeral: true });

  await i.reply({
    embeds: [{ title: "/" + cmd.name, description: renderResponse(cmd.response, ctxFrom(i)) }],
  });
  fetch(ORBIT + "/api/commands/" + cmd.id + "/run", { method: "POST" }); // syncs this dashboard
});

client.login(process.env.DISCORD_TOKEN);`;

function CodeBlock({ title, code, lang }: { title: string; code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-abyss">
      <div className="flex items-center justify-between border-b border-edge px-4 py-2.5">
        <span className="font-mono text-xs text-faint">{title}</span>
        <span className="flex items-center gap-3">
          <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] uppercase text-faint">{lang}</span>
          <button onClick={copy} className="inline-flex items-center gap-1 text-[11px] font-semibold text-mute transition-colors hover:text-ink">
            {copied ? <Check size={12} className="text-mint" /> : <ClipboardCopy size={12} />}
            {copied ? "copied" : "copy"}
          </button>
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-ink/85">{code}</pre>
    </div>
  );
}

const STEPS = [
  {
    icon: KeyRound,
    title: "Summon the application",
    body: "Open the Discord Developer Portal, hit New Application, name it ORBIT (or anything), then flip to the Bot tab and smash Reset Token. That token is the bot's soul. Keep it server-side, always.",
  },
  {
    icon: ServerCog,
    title: "Private your secrets",
    body: "Drop the token and application ID into your environment — never into client code. This dashboard already reads secrets via process.env on the server.",
  },
  {
    icon: Link2,
    title: "Invite with the right scopes",
    body: "Bot + applications.commands scopes, with the permission integer below. Administrator (8) is the lazy dev-mode choice; scope it down for production.",
  },
  {
    icon: ListChecks,
    title: "Register the umbrella command",
    body: "Discord caps global slash commands at 100 per app — so the runtime registers ONE /orbit command with live autocomplete over all 1,000. Zero rate-limit pain, same native picker UX. Tip: set DISCORD_GUILD_ID for instant guild-scoped registration during dev (global propagates in ~1h).",
  },
  {
    icon: Rocket,
    title: "Ignite the gateway",
    body: "Run `node bot/index.mjs` — the runtime pulls the mind from this dashboard's API, connects the shard, and re-syncs every 60s so your toggles go live without a restart. Every execution syncs back here in real time.",
  },
];

export default function Setup() {
  const [clientId, setClientId] = useState("");
  const [perms, setPerms] = useState("8");
  const invite = useMemo(() => {
    const id = clientId.trim() || "YOUR_CLIENT_ID";
    const p = perms.trim() || "8";
    return `https://discord.com/oauth2/authorize?client_id=${id}&permissions=${p}&scope=bot%20applications.commands`;
  }, [clientId, perms]);
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-10 pt-2">
      <div>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-blurple-soft">
          <Rocket size={13} /> Launch sequence
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">Deploy to Discord</h1>
        <p className="mt-2 max-w-xl text-sm text-mute">
          Five moves from zero to a bot serving 400 commands in production. The runtime below is
          production-shaped: swap in your persistence layer and go.
        </p>
      </div>

      {/* steps */}
      <ol className="space-y-3">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
            className="flex gap-4 rounded-2xl border border-edge bg-panel/90 p-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-blurple/40 bg-blurple/10 text-blurple-soft">
              <s.icon size={18} />
            </span>
            <div>
              <p className="flex items-baseline gap-3 font-display text-base font-bold text-ink">
                <span className="font-mono text-xs text-faint">0{i + 1}</span> {s.title}
              </p>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-mute">{s.body}</p>
            </div>
          </motion.li>
        ))}
      </ol>

      {/* invite builder */}
      <div className="rounded-2xl border border-edge bg-panel/90 p-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">Invite URL builder</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={clientId}
            onChange={(e) => setClientId(e.target.value.replace(/\D/g, ""))}
            placeholder="Application / Client ID (digits only)"
            className="rounded-xl border border-line bg-abyss px-4 py-3 font-mono text-sm text-ink placeholder:text-faint focus:border-blurple/60 focus:outline-none"
          />
          <select
            value={perms}
            onChange={(e) => setPerms(e.target.value)}
            className="rounded-xl border border-line bg-abyss px-4 py-3 text-sm text-ink focus:border-blurple/60 focus:outline-none"
          >
            <option value="8">Administrator (8) — dev mode</option>
            <option value="2415931952">Scoped: mod + messages + voice (2415931952)</option>
            <option value="274877975552">Minimal: messages + embeds (274877975552)</option>
          </select>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-abyss px-4 py-3">
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-mint">{invite}</code>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(invite).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-blurple-soft"
          >
            {copied ? <Check size={12} /> : <ClipboardCopy size={12} />} {copied ? "copied" : "copy"}
          </button>
        </div>
      </div>

      {/* code */}
      <div className="grid gap-4">
        <CodeBlock title=".env" code={ENV_SNIPPET} lang="env" />
        <CodeBlock title="bot/index.js" code={BOT_SNIPPET} lang="js" />
      </div>

      {/* railway */}
      <div className="rounded-2xl border border-edge bg-panel/90 p-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-faint">
          Ship it on Railway — two services, one database
        </p>
        <ol className="mt-4 space-y-2.5 text-sm text-mute">
          {[
            "New Project → Deploy from GitHub repo. Name the service orbit-web.",
            "Add → Database → PostgreSQL. Railway provisions it in seconds.",
            "orbit-web variables: DATABASE_URL = ${{Postgres.DATABASE_URL}} (reference). railway.json already handles `db-push + next start`.",
            "Settings → Networking → Generate Domain for orbit-web. That URL is your ORBIT_API.",
            "Add one more service from the same repo: orbit-bot. Override: build `npm ci`, start `node bot/index.mjs`. No public domain needed.",
            "orbit-bot variables: DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID (dev), ORBIT_API = https://${{orbit-web.RAILWAY_PUBLIC_DOMAIN}}.",
            "Watch orbit-bot logs for: [mind] boot: 1000 commands loaded → [gateway] ORBIT online.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-line font-mono text-[10px] text-blurple-soft">
                {i + 1}
              </span>
              <span className="leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-abyss p-4">
            <p className="mb-2 font-mono text-[11px] font-bold text-mint">orbit-web</p>
            <pre className="font-mono text-[11px] leading-relaxed text-ink/70">{`DATABASE_URL=\${{Postgres.DATABASE_URL}}
# start (from railway.json):
node scripts/db-push.mjs && npm run start`}</pre>
          </div>
          <div className="rounded-xl border border-line bg-abyss p-4">
            <p className="mb-2 font-mono text-[11px] font-bold text-blurple-soft">orbit-bot</p>
            <pre className="font-mono text-[11px] leading-relaxed text-ink/70">{`DISCORD_TOKEN=<bot token>
DISCORD_CLIENT_ID=<app id>
DISCORD_GUILD_ID=<dev server>  # optional
ORBIT_API=https://\${{orbit-web.RAILWAY_PUBLIC_DOMAIN}}
# custom start: node bot/index.mjs`}</pre>
          </div>
        </div>
      </div>

      <p className="rounded-xl border border-amber/20 bg-amber/5 px-5 py-4 text-xs leading-relaxed text-amber">
        Never paste your token into the browser, a Git repo, or this dashboard&apos;s client bundle. If a
        token ever leaks, hit <span className="font-semibold">Reset Token</span> in the Developer Portal
        immediately — old tokens die instantly.
      </p>
    </div>
  );
}
