// ---------------------------------------------------------------------------
// ORBIT bot runtime — serves all 1,000 commands to Discord.
//
//   1. Pulls the command mind from the dashboard's REST API (single source
//      of truth — nothing is duplicated here).
//   2. Registers ONE umbrella `/orbit` slash command. Discord caps global
//      slash commands at 100 per app, so the full library rides on live
//      autocomplete (25 best matches per keystroke — same UX, no cap).
//   3. Executes response templates with the same token engine as the web
//      playground, then syncs usage back to the dashboard.
//   4. Re-syncs the mind every 60s, so toggles/forges in the dashboard go
//      live in Discord without a restart.
//
// Run:
//   node bot/index.mjs          (reads .env automatically)
//   — or inline —
//   DISCORD_TOKEN=xxx DISCORD_CLIENT_ID=123 ORBIT_API=http://localhost:3000 \
//   node bot/index.mjs
// ---------------------------------------------------------------------------

import "dotenv/config";

const { Client, EmbedBuilder, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = await import(
  "discord.js"
).catch(() => {
  console.error(
    [
      "",
      '  Could not load "discord.js" — it is not installed in this folder.',
      "",
      "  Fix (run ONE of these from the project root):",
      "      npm install            # installs everything from package.json",
      "      npm install discord.js # or just the bot dependency",
      "",
      "  Then start again:  node bot/index.mjs",
      "",
    ].join("\n")
  );
  process.exit(1);
});

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID; // optional: instant guild-scoped registration for dev
const ORBIT_API = (process.env.ORBIT_API ?? "http://localhost:3000").replace(/\/$/, "");
const REFRESH_MS = 60_000;

if (!TOKEN || !CLIENT_ID) {
  console.error("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID. See /setup in the dashboard.");
  process.exit(1);
}

// --- template token engine (same semantics as dashboard) -------------------
function renderResponse(template, ctx) {
  let out = template;
  out = out.replace(/\{n:(\d+)-(\d+)\}/g, (_, a, b) => {
    const min = Number(a), max = Number(b);
    return String(min + Math.floor(Math.random() * (max - min + 1)));
  });
  out = out.replace(/\{pick:([^}]+)\}/g, (_, list) => {
    const options = list.split("|").map((s) => s.trim()).filter(Boolean);
    return options[Math.floor(Math.random() * options.length)] ?? "";
  });
  out = out.replaceAll("{user}", ctx.user);
  out = out.replaceAll("{target}", ctx.target || "someone");
  out = out.replaceAll("{args}", ctx.args || "nothing");
  out = out.replaceAll("{server}", ctx.server || "this server");
  return out;
}

// md-lite → strip our **bold** markers into Discord-native bold (it IS markdown there)
const md = (s) => s; // Discord renders **bold**/`code` natively — pass through.

// deterministic accent per category (mirrors dashboard hue logic)
function accent(category) {
  let h = 0;
  for (const ch of category) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return { r: hsl(h, 0.72, 0.62).r, g: hsl(h, 0.72, 0.62).g, b: hsl(h, 0.72, 0.62).b };
}
function hsl(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const v = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(v * 255);
  };
  return { r: f(0), g: f(8), b: f(4) };
}
const colorInt = (c) => (c.r << 16) | (c.g << 8) | c.b;

// --- mind sync -------------------------------------------------------------
let mind = [];
let mindByName = new Map();

async function syncMind(reason) {
  try {
    const res = await fetch(`${ORBIT_API}/api/commands?pageSize=1200`);
    const json = await res.json();
    mind = json.commands ?? [];
    mindByName = new Map(mind.map((c) => [c.name, c]));
    console.log(`[mind] ${reason}: ${mind.length} commands loaded from ${ORBIT_API}`);
  } catch (e) {
    console.error(`[mind] sync failed (${reason}) — dashboard unreachable at ${ORBIT_API}.`, e.message);
  }
}

await syncMind("boot");
if (mind.length === 0) {
  console.error("[mind] empty mind. Start the dashboard (npm run start) and try again.");
  process.exit(1);
}
setInterval(() => syncMind("refresh"), REFRESH_MS);

// --- command registration ----------------------------------------------------
const umbrella = new SlashCommandBuilder()
  .setName("orbit")
  .setDescription("Run any of ORBIT's 1,000 commands")
  .addStringOption((o) =>
    o.setName("command").setDescription("The command to run — start typing to autocomplete").setRequired(true).setAutocomplete(true)
  )
  .addStringOption((o) => o.setName("input").setDescription("Arguments: text, amounts, options…").setRequired(false))
  .addUserOption((o) => o.setName("member").setDescription("Target member (for moderation/fun/etc.)").setRequired(false));

const rest = new REST().setToken(TOKEN);
if (GUILD_ID) {
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [umbrella.toJSON()] });
  console.log(`[register] /orbit registered to guild ${GUILD_ID} (instant).`);
} else {
  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [umbrella.toJSON()] });
  console.log(`[register] /orbit registered globally (propagates within ~1h). Use DISCORD_GUILD_ID for instant dev.`);
}

// --- gateway ----------------------------------------------------------------
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  console.log(`[gateway] ORBIT online as ${c.user.tag} — mind hot with ${mind.length} commands.`);
  c.user.setActivity(`/orbit · ${mind.length} cmds`, { type: 3 }); // WATCHING
});

client.on(Events.InteractionCreate, async (i) => {
  try {
    // --- autocomplete: fuzzy-search the mind, best 25 -------------------------
    if (i.isAutocomplete()) {
      const q = (i.options.getFocused() ?? "").toLowerCase().replace(/^\//, "");
      const scored = mind
        .map((c) => {
          let s = 0;
          if (c.name.startsWith(q)) s = 100 - c.name.length;
          else if (c.name.includes(q)) s = 50 - c.name.indexOf(q);
          else if (c.description.toLowerCase().includes(q)) s = 10;
          else if (q === "") s = 1;
          return { c, s };
        })
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 25);
      await i.respond(
        scored.map(({ c }) => ({
          name: `/${c.name} — ${c.description}`.slice(0, 100),
          value: c.name,
        }))
      );
      return;
    }

    if (!i.isChatInputCommand() || i.commandName !== "orbit") return;

    const name = i.options.getString("command", true);
    const cmd = mindByName.get(name);

    if (!cmd) {
      await i.reply({ content: `Unknown command \`${name}\`. Start typing in the picker — autocomplete has the full mind.`, ephemeral: true });
      return;
    }
    if (!cmd.enabled) {
      await i.reply({ content: `\`/${cmd.name}\` is currently paused in the ORBIT dashboard.`, ephemeral: true });
      return;
    }

    const rendered = renderResponse(cmd.response, {
      user: i.user.toString(),
      target: i.options.getUser("member")?.toString(),
      args: i.options.getString("input") ?? "",
      server: i.guild?.name,
    });

    const embed = new EmbedBuilder()
      .setTitle(`/${cmd.name}`)
      .setDescription(md(rendered).slice(0, 4000))
      .setColor(colorInt(accent(cmd.category)))
      .setFooter({ text: `${cmd.category} · cooldown ${cmd.cooldown}s` });

    // honor native Discord cooldown: respond within 3s (we're fast), then sync
    await i.reply({ embeds: [embed] });

    fetch(`${ORBIT_API}/api/commands/${cmd.id}/run`, { method: "POST" }).catch(() => {});
  } catch (e) {
    console.error("[interaction] error:", e);
    if (i.isRepliable() && !i.replied && !i.deferred) {
      await i.reply({ content: "Something glitched in the mind. Check the dashboard logs.", ephemeral: true }).catch(() => {});
    }
  }
});

client.login(TOKEN);
