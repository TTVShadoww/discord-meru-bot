// ---------------------------------------------------------------------------
// ORBIT auto-mind: 400-command generator.
// Produces a deterministic library of 400 unique slash commands across 16
// categories with usage grammar, permissions, cooldowns and live response
// templates that the playground simulator can actually execute.
// ---------------------------------------------------------------------------

import { PACK_COMMANDS } from "./command-packs";

export interface SeedCommand {
  name: string;
  description: string;
  category: string;
  usage: string;
  aliases: string[];
  permissions: string[];
  cooldown: number;
  response: string;
  premium: boolean;
}

export interface CategoryMeta {
  label: string;
  blurb: string;
  accent: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  moderation: { label: "Moderation", blurb: "Hammers, timeouts and purge engines.", accent: "#f0564a" },
  utility: { label: "Utility", blurb: "Search, reminders, polls and lookups.", accent: "#57a7f0" },
  fun: { label: "Fun", blurb: "Chaos generators and instant entropy.", accent: "#f0b357" },
  games: { label: "Games", blurb: "Playable loops straight inside chat.", accent: "#5ee6a8" },
  economy: { label: "Economy", blurb: "Coins, crime sprees and casino math.", accent: "#f0d357" },
  music: { label: "Music", blurb: "Queue, filters and voice-channel audio.", accent: "#c084fc" },
  anime: { label: "Anime", blurb: "Discovery, quotes and seasonal tracking.", accent: "#f472b6" },
  roleplay: { label: "Roleplay", blurb: "Reactions that keep servers warm.", accent: "#fb7185" },
  text: { label: "Text Tools", blurb: "Transform, encode and mangle any string.", accent: "#94a3b8" },
  image: { label: "Image FX", blurb: "On-the-fly avatar and media filters.", accent: "#38e0d4" },
  admin: { label: "Admin", blurb: "Server config, backups and announcements.", accent: "#a3b8f0" },
  security: { label: "Security", blurb: "Anti-raid, anti-nuke and gatekeeping.", accent: "#4ade80" },
  leveling: { label: "Leveling", blurb: "XP curves, ranks and role rewards.", accent: "#facc15" },
  tickets: { label: "Tickets", blurb: "Support pipelines with transcripts.", accent: "#7dd3fc" },
  giveaways: { label: "Giveaways", blurb: "Prize drops with fair rerolls.", accent: "#e879f9" },
  crypto: { label: "Crypto", blurb: "Tickers, gas and degen radar.", accent: "#f5b03a" },
  stocks: { label: "Stocks", blurb: "Tape, tickers and paper hands.", accent: "#34d399" },
  coder: { label: "Coder", blurb: "Dev tooling without leaving chat.", accent: "#60a5fa" },
  devops: { label: "DevOps", blurb: "Ship, observe and roll back.", accent: "#fb923c" },
  streamer: { label: "Streamer", blurb: "Chat-native broadcast ops.", accent: "#a855f7" },
  cards: { label: "Cards", blurb: "Tarot spreads and table games.", accent: "#e11d48" },
  bestiary: { label: "Bestiary", blurb: "Catch, train and battle creatures.", accent: "#84cc16" },
  space: { label: "Space", blurb: "Orbit, launches and night skies.", accent: "#818cf8" },
  radio: { label: "Radio", blurb: "24/7 genre stations in voice.", accent: "#d946ef" },
  wellness: { label: "Wellness", blurb: "Breathing, habits and posture cops.", accent: "#2dd4bf" },
  language: { label: "Language", blurb: "Words, etymology and wordplay.", accent: "#93c5fd" },
  memes: { label: "Memes", blurb: "Captionable template factory.", accent: "#fbbf24" },
  math: { label: "Math", blurb: "Exact answers, zero hand-waving.", accent: "#67e8f9" },
  science: { label: "Science", blurb: "Atoms, isotopes and lab rules.", accent: "#86efac" },
  ai: { label: "AI", blurb: "Model-powered text intelligence.", accent: "#c4b5fd" },
  news: { label: "News", blurb: "Wires, digests and fact-checks.", accent: "#fca5a5" },
  custom: { label: "Custom", blurb: "Commands you built in the studio.", accent: "#5865f2" },
};

export const CATEGORY_ORDER = [
  "moderation",
  "utility",
  "fun",
  "games",
  "economy",
  "music",
  "anime",
  "roleplay",
  "text",
  "image",
  "admin",
  "security",
  "leveling",
  "tickets",
  "giveaways",
  "crypto",
  "stocks",
  "coder",
  "devops",
  "streamer",
  "cards",
  "bestiary",
  "space",
  "radio",
  "wellness",
  "language",
  "memes",
  "math",
  "science",
  "ai",
  "news",
];

// ---------------------------------------------------------------------------
// Template tokens:
//   {user}            -> invoking member
//   {target}          -> mentioned member (falls back to "someone")
//   {server}          -> server name
//   {args}            -> trailing text
//   {n:min-max}       -> random integer
//   {pick:a|b|c}      -> random choice
// ---------------------------------------------------------------------------

export function renderResponse(template: string, ctx: { user: string; target?: string; args?: string; server?: string }) {
  let out = template;
  out = out.replace(/\{n:(\d+)-(\d+)\}/g, (_, a, b) => {
    const min = Number(a);
    const max = Number(b);
    return String(min + Math.floor(Math.random() * (max - min + 1)));
  });
  out = out.replace(/\{pick:([^}]+)\}/g, (_, list: string) => {
    const options = list.split("|").map((s) => s.trim()).filter(Boolean);
    return options[Math.floor(Math.random() * options.length)] ?? "";
  });
  out = out.replaceAll("{user}", ctx.user);
  out = out.replaceAll("{target}", ctx.target && ctx.target.length > 0 ? ctx.target : "someone");
  out = out.replaceAll("{args}", ctx.args && ctx.args.length > 0 ? ctx.args : "nothing");
  out = out.replaceAll("{server}", ctx.server ?? "Nexus Station");
  return out;
}

// --------------------------------------------------------------------------
// Builder
// --------------------------------------------------------------------------

type Opts = Partial<Pick<SeedCommand, "usage" | "aliases" | "permissions" | "cooldown" | "response" | "premium">>;
type Row = [string, string, (Opts | undefined)?];

function safeName(name: string) {
  return name.replace(/[^a-z0-9-]/g, "");
}

const MEMBER = "<@member> [reason]";
const AMOUNT = "<amount>";
const QUERY = "<query>";

function modDefaults(name: string): Opts {
  if (name.startsWith("purge") || name === "slowmode" || name === "lock" || name === "unlock") {
    return { permissions: ["Manage Messages"] };
  }
  if (name === "nick" || name === "resetnick") return { permissions: ["Manage Nicknames"] };
  if (["voicemute", "voiceunmute", "vckick", "deafen", "undeafen", "vcmove"].includes(name)) {
    return { permissions: ["Move Members"] };
  }
  if (["ban", "unban", "softban", "hackban", "tempban", "massban"].includes(name)) {
    return { permissions: ["Ban Members"] };
  }
  if (["kick", "softkick"].includes(name)) return { permissions: ["Kick Members"] };
  return { permissions: ["Moderate Members"] };
}

const MOD_VERBS: Array<[string, string]> = [
  ["ban", "Ban a member from the server, optionally deleting their messages"],
  ["unban", "Lift a ban and let a member back in"],
  ["softban", "Ban then instantly unban to wipe a member's messages"],
  ["hackban", "Ban a user by ID before they even join"],
  ["tempban", "Timed ban that automatically expires"],
  ["massban", "Ban a list of members in a single sweep"],
  ["kick", "Remove a member from the server"],
  ["softkick", "Kick with a courtesy DM explaining why"],
  ["mute", "Silence a member in text channels"],
  ["unmute", "Restore a member's ability to speak"],
  ["tempmute", "Mute that lifts itself after a duration"],
  ["timeout", "Put a member in timeout with Discord-native isolation"],
  ["untimeout", "End a member's timeout early"],
  ["warn", "Log a formal warning against a member"],
  ["unwarn", "Remove a specific warning by case ID"],
  ["warnings", "List every warning on a member's record"],
  ["clearwarnings", "Wipe a member's entire warning history"],
  ["purge", "Bulk-delete the last messages in this channel"],
  ["purge-user", "Bulk-delete messages from one member only"],
  ["purge-bots", "Bulk-delete messages authored by bots"],
  ["purge-links", "Bulk-delete messages containing links"],
  ["purge-images", "Bulk-delete messages containing attachments"],
  ["slowmode", "Set a per-user message rate limit on this channel"],
  ["lock", "Freeze a channel so no one can send messages"],
  ["unlock", "Re-open a locked channel"],
  ["lockdown", "Lock every public channel during a raid"],
  ["unlockdown", "Release the server-wide lockdown"],
  ["nuke", "Clone and replace a channel, wiping its history"],
  ["clone-channel", "Duplicate a channel with identical settings"],
  ["archive", "Snapshot a channel into a read-only archive"],
  ["nick", "Force-change a member's nickname"],
  ["resetnick", "Reset a member's nickname to default"],
  ["addrole", "Grant a role to a member"],
  ["removerole", "Strip a role from a member"],
  ["voicemute", "Server-mute a member in voice"],
  ["voiceunmute", "Restore a member's voice audio"],
  ["vckick", "Disconnect a member from voice"],
  ["deafen", "Server-deafen a member in voice"],
  ["undeafen", "Remove a voice deafen"],
  ["vcmove", "Move a member to another voice channel"],
];

function build(): SeedCommand[] {
  const rows: Array<Row & { category: string }> = [];

  const push = (category: string) => (name: string, description: string, opts?: Opts) => {
    const r = [safeName(name), description, opts] as unknown as Row & { category: string };
    r.category = category;
    rows.push(r);
  };

  // -- Moderation (40) -------------------------------------------------------
  const mod = push("moderation");
  const modResponses: Record<string, string> = {
    ban: "**{target}** has been banned from {server}. Case #{n:1000-9999} · by {user} — {args}",
    kick: "**{target}** was kicked. Case #{n:1000-9999} · by {user} — {args}",
    warn: "Warning logged for **{target}** (case #{n:1000-9999}): {args}",
    purge: "Deleted **{n:6-48}** messages in this channel. Sweeper by {user}.",
    mute: "**{target}** is now muted. Reason: {args}",
    timeout: "**{target}** timed out. Reason: {args}",
    lock: "Channel locked by {user}. Only staff can speak.",
    lockdown: "LOCKDOWN ENGAGED — all public channels sealed by {user}.",
    nuke: "Channel nuked. A pristine clone was created by {user}.",
  };
  MOD_VERBS.forEach(([name, desc]) => {
    const o = modDefaults(name) ?? {};
    mod(name, desc, {
      usage: name.startsWith("purge") ? `/{name} ${AMOUNT}` : `/${name} ${name === "warnings" || name === "clearwarnings" || name.startsWith("un") || name === "vcmove" ? "<@member>" : MEMBER}`,
      cooldown: 5,
      response:
        modResponses[name] ??
        fmt(`Case #{n:1000-9999} — **{target}** processed with \`/${name}\` by {user}. Reason: {args}`),
      ...o,
    });
  });

  // -- Utility (40) ----------------------------------------------------------
  const util = push("utility");
  const utilRows: Row[] = [
    ["afk", "Set an AFK status shown whenever someone pings you", { usage: "/afk [status]", response: "{user} is now AFK: {args}" }],
    ["avatar", "Fetch a member's avatar in full resolution", { usage: "/avatar [@member]", response: "Here is **{target}**'s avatar in 1024px, requested by {user}." }],
    ["banner", "Fetch a member's profile banner", { usage: "/banner [@member]" }],
    ["userinfo", "Deep profile card for any member", { usage: "/userinfo [@member]", response: "**{target}** — joined {n:20-400} days ago · {n:2-14} roles · account age {n:1-9}y" }],
    ["serverinfo", "Live stats about {server}", { usage: "/serverinfo", response: "{server}: {n:120-9800} members · {n:8-64} channels · boosted to level {n:0-3}" }],
    ["roleinfo", "Inspect a role's color, members and permissions", { usage: "/roleinfo <role>" }],
    ["channelinfo", "Inspect a channel's topic, age and settings", { usage: "/channelinfo [#channel]" }],
    ["emojiinfo", "Resolve any custom emoji into its raw asset", { usage: "/emojiinfo <emoji>" }],
    ["botinfo", "Everything about this bot: uptime, shards, versions", { usage: "/botinfo", response: "ORBIT v4.2.0 · 400 commands · {n:2-16} shards · {n:18-42}ms heartbeat" }],
    ["ping", "Round-trip latency to the gateway", { usage: "/ping", response: "Pong — gateway {n:12-38}ms, REST {n:40-120}ms." }],
    ["uptime", "How long the bot has been online", { usage: "/uptime", response: "Online for {n:2-99} days, {n:0-23}h {n:0-59}m — last restart {n:2-120}h ago." }],
    ["invite", "Get the bot's invite link with correct scopes", { usage: "/invite", response: "Invite ORBIT: discord.com/oauth2/authorize?scope=bot+applications.commands" }],
    ["support", "Link to the support server", { usage: "/support", response: "Support HQ: discord.gg/orbit-support — average reply time {n:2-18} min." }],
    ["time", "Current time for any timezone or member", { usage: "/time [timezone]" }],
    ["weather", "Hyperlocal weather for any city", { usage: "/weather <city>", response: "Weather in {args}: {n:-4-32}°C, {pick:clear|cloudy|rain|storm|snow} · wind {n:2-38} km/h" }],
    ["remind", "Schedule a reminder and get pinged later", { usage: "/remind <time> <text>", aliases: ["remindme"], response: "Got it {user} — I'll ping you about \"{args}\" right on schedule." }],
    ["translate", "Translate text between 100+ languages", { usage: "/translate <lang> <text>" }],
    ["urban", "Look up a term on Urban Dictionary", { usage: "/urban <term>", cooldown: 5 }],
    ["calculate", "Evaluate any math expression", { aliases: ["calc", "math"], usage: "/calculate <expression>", response: "{args} = **{n:2-4096}** — computed in {n:1-9}ms" }],
    ["convert", "Convert between units and currencies", { usage: "/convert <value> <from> <to>" }],
    ["shorturl", "Shorten a link with click tracking", { usage: "/shorturl <url>", response: "Short link created: orbit.to/{pick:x7q|k2m|n9w|p4d} ({args})" }],
    ["poll", "Yes/no poll with reaction voting", { usage: "/poll <question>", response: "**Poll by {user}:** {args} — vote below." }],
    ["strawpoll", "Multi-choice poll with live bars", { usage: "/strawpoll <question> <options...>" }],
    ["suggest", "Pipe a suggestion into the staff queue", { usage: "/suggest <idea>", response: "Suggestion #{n:100-999} filed by {user}: {args}" }],
    ["tag", "Recall a saved server tag", { usage: "/tag <name>" }],
    ["tag-create", "Save a reusable server tag", { usage: "/tag-create <name> <content>", permissions: ["Manage Messages"] }],
    ["tag-delete", "Delete a server tag", { usage: "/tag-delete <name>", permissions: ["Manage Messages"] }],
    ["todo", "Personal task list with check-offs", { usage: "/todo [add|done|list]" }],
    ["embed", "Compose a rich embed without touching code", { usage: "/embed <title> <text>", permissions: ["Manage Messages"], response: "**{args}** — embedded by {user}" }],
    ["color", "Preview any hex color with palette ideas", { usage: "/color <hex>", response: "Previewing {args}: rgb({n:0-255},{n:0-255},{n:0-255}) · closest name: {pick:aurora|ember|tide|void|moss}" }],
    ["qr", "Generate a QR code for any text or link", { usage: "/qr <text>", response: "QR rendered for \"{args}\" — scan away {user}." }],
    ["membercount", "Live member counter breakdown", { aliases: ["members"], response: "{server} holds **{n:120-9800}** members ({n:5-40}% online, {n:1-8}% bots)." }],
    ["snipe", "Recover the most recently deleted message", { response: "Sniped: \"{pick:Brb pizza arrived|who deleted that|it was definitely not me|classic typo moment|send help\"}\" — deleted {n:4-90}s ago" }],
    ["editsnipe", "See what a message said before its edit", {}],
    ["roles", "List every role in the server", { response: "{server} has {n:4-48} roles. Top: {pick:Admins|Guardians|Veterans|Boosters}" }],
    ["emojis", "List every custom emoji in the server", {}],
    ["inrole", "List all members holding a role", { usage: "/inrole <role>" }],
    ["boosters", "Hall-of-fame of current server boosters", { response: "{n:2-24} boosters keep {server} at level {n:1-3}. Salute." }],
    ["oldest", "Find the oldest accounts in the server", {}],
    ["stats", "Command usage analytics for this server", { response: "{server} ran **{n:120-9900}** commands this week. Hottest: {pick:/play|/meme|/giveaway|/rank}" }],
  ];
  utilRows.forEach(([n, d, o]) => util(n, d, o));

  // -- Fun (40) ---------------------------------------------------------------
  const fun = push("fun");
  const funRows: Row[] = [
    ["eightball", "Ask the oracle a yes/no question", { aliases: ["8ball"], usage: "/eightball <question>", response: "**{args}** — {pick:It is certain.|Without a doubt.|Signs point to yes.|Reply hazy, ask again.|Absolutely not.|My circuits say no.|Ask the void later.|Count on it.}" }],
    ["coinflip", "Flip a perfectly fair coin", { aliases: ["flip", "cf"], response: "{user} flipped a coin: **{pick:heads|tails}**." }],
    ["dice", "Roll any number of dice", { usage: "/dice [sides]", response: "{user} rolled a d{n:2-100}: **{n:1-100}**" }],
    ["roll", "Random number in any range", { usage: "/roll [min] [max]", response: "Rolled **{n:1-100}** for {user}." }],
    ["rps", "Rock-paper-scissors against the bot", { usage: "/rps <choice>", response: "{user} threw {args}. Orbit threw {pick:rock|paper|scissors}. {pick:You win.|You lose.|Tie game.|Clean hit.|No contest.}" }],
    ["meme", "Serve a fresh meme from the feed", { cooldown: 4, response: "Fresh meme deployed for {user}: \"{pick:and i took that personally|nobody: absolutely nobody:|it's not much but it's honest work|task failed successfully|this is the way}\"" }],
    ["joke", "A programmer-grade joke on demand", { response: "{pick:Why do Java devs wear glasses? Because they don't C#.|A SQL query walks into a bar and asks two tables: can I join you?|There are 10 kinds of people: those who know binary and those who don't.|I would tell you a UDP joke, but you might not get it.}" }],
    ["dadjoke", "Peak dad energy, zero shame", { response: "{pick:I'm reading a book about anti-gravity — impossible to put down.|I only know 25 letters of the alphabet. I don't know y.|What do you call a fish without eyes? A fsh.|I used to hate facial hair, but then it grew on me.}" }],
    ["roast", "Lovingly roast a member", { usage: "/roast [@member]", response: "**{target}**: {pick:brings everyone joy when they leave the room|has the energy of a sleep mode screen saver|talks in loading spinners|is proof evolution can reverse}" }],
    ["compliment", "Shower a member with genuine praise", { usage: "/compliment [@member]", response: "**{target}**: {pick:carries this server on pure vibes|debugs life faster than anyone|is the human version of a green build|makes every channel brighter}" }],
    ["ship", "Calculate compatibility between two members", { usage: "/ship <@a> <@b>", response: "Compatibility of {target}: **{n:1-99}%** — verdict: {pick:destined|it's complicated|run|wedding when?}" }],
    ["rate", "Rate literally anything out of 10", { usage: "/rate <thing>", response: "I rate {args} a solid **{n:0-10}/10**." }],
    ["choose", "Let the bot pick between your options", { aliases: ["pick"], usage: "/choose <a> <b> [...]", response: "Between {args}, I choose: **{pick:option one|option two|the third one|the last one|whatever {user} secretly wanted}**." }],
    ["fortune", "Crack open a digital fortune cookie", { response: "Fortune for {user}: {pick:A refactor you fear will refactor you.|Your next deploy happens on a Friday. It works.|Someone is about to bump your thread.|The bug is in the last place you'll look, obviously.}" }],
    ["hack", "Pretend-hack a member with a progress bar", { usage: "/hack [@member]", response: "Hacking **{target}**... [{n:20-99}%] injecting memes... [{n:20-99}%] done. Results: their search history is wholesome." }],
    ["iq", "Precisely measure a member's IQ", { usage: "/iq [@member]", response: "**{target}** clocks in at **{n:60-160} IQ** — {pick:certified genius|solidly above average|running on 2 brain cells|deferring judgment}" }],
    ["simp", "Simp-ometer, scientifically calibrated", { usage: "/simp [@member]", response: "**{target}** simp level: **{n:0-100}%** {pick:(untouchable)|(mild)|(borderline)|(lost cause)}" }],
    ["sus", "Detect exactly how sus someone is", { usage: "/sus [@member]", response: "**{target}** is **{n:0-100}%** sus. {pick:Vent noise detected.|Clear as glass.|Emergency meeting advised.|Task bar untouched.}" }],
    ["pressf", "Pay respects in chat", { aliases: ["f"], usage: "/pressf [reason]", response: "{user} presses F for {args}. {n:1-99} others join." }],
    ["cat", "Random cat on demand", { aliases: ["meow"], response: "Cat delivery for {user}: {pick:orange menace|void floof|loaf mode|biscuit engineer|3am sprinter}" }],
    ["dog", "Random dog on demand", { aliases: ["woof"], response: "Dog delivery for {user}: {pick:golden retriever energy|majesty of a husky|corgi butt detected|senior pup wisdom}" }],
    ["fox", "A wild fox appears", { response: "Fox fact + fox pic incoming {user}: {pick:nine tails, zero regrets|floof level maximum}" }],
    ["bird", "Serving fine feathered content", { response: "{pick:Parrot borrowed your mic|Birb status: judging|Crow hoards {n:3-40} shiny things}" }],
    ["panda", "Emergency panda deployment", { response: "Panda for {user}: rolls {n:2-18} times, achieves nothing, is loved anyway." }],
    ["bunny", "Certified hop content", { response: "Bunny for {user}: nose wiggles at {n:40-160} bpm." }],
    ["catfact", "Learn something disturbingly cat", { response: "Catfact #{n:100-999}: {pick:cats sleep 70% of their lives, and judge the rest|a group of cats is a clowder|cats ignore physics on purpose}" }],
    ["dogfact", "Daily canine intelligence briefing", { response: "Dogfact #{n:100-999}: {pick:dogs can smell your feelings literally|a wagging tail is an API with no docs}" }],
    ["numberfact", "Trivia about any number", { usage: "/numberfact [n]", response: "Number fact: {n:1-9999} {pick:is the atomic number of nothing important|appears in the digits of pi suspiciously often}" }],
    ["uselessfact", "Facts nobody asked for, delivered proudly", { response: "Useless fact: {pick:bananas are berries, strawberries are not|honey never spoils|your brain deletes memories to make room}" }],
    ["showerthought", "3am-grade philosophical payload", { response: "{pick:Every mirror you bought was used.|Your future self is watching you through memories.|Somewhere, a dog thinks you hung the moon.|Silence is just music nobody composed.}" }],
    ["gif", "Search and serve the perfect reaction GIF", { usage: "/gif <query>", response: "GIF for \"{args}\": {pick:deal-with-it shades|table flip in 4k|dramatic zoom intensifies}" }],
    ["say", "Make the bot repeat something", { usage: "/say <text>", permissions: ["Manage Messages"], response: "{args}" }],
    ["tts", "Text-to-speech in voice chat", { usage: "/tts <text>" }],
    ["countdown", "Hype countdown to any timestamp", { usage: "/countdown <time>", response: "Countdown running: T-{n:1-99}d {n:0-23}h until {args}." }],
    ["magicconch", "The conch has spoken", { usage: "/magicconch <question>", response: "The Magic Conch says: {pick:Yes.|No.|Maybe someday.|Try asking again.|Nothing.}" }],
    ["karma", "Check a member's karma score", { usage: "/karma [@member]", response: "**{target}** holds **{n:-50-500}** karma." }],
    ["wheel", "Spin a wheel of your own options", { usage: "/wheel <options...>", response: "The wheel lands on: **{pick:spin again|the obvious choice|the chaotic choice|{user}'s least favorite}**." }],
    ["percent", "How much percent is anything", { usage: "/percent <what>", response: "{args}: **{n:0-100}%** confirmed by science-adjacent math." }],
    ["vibe", "Vibe-check a member or the whole channel", { usage: "/vibe [@member]", response: "Vibe check on **{target}**: {pick:immaculate|passing|yikes|ascended|needs coffee}." }],
    ["aura", "Read a member's aura color", { usage: "/aura [@member]", response: "**{target}** radiates a {pick:neon violet|burnt amber|glacier teal|midnight static|solar flare} aura." }],
  ];
  funRows.forEach(([n, d, o]) => fun(n, d, o));

  // -- Games (30) --------------------------------------------------------------
  const games = push("games");
  const gameRows: Row[] = [
    ["trivia", "Rapid-fire trivia with streak scoring", { response: "**Trivia:** {pick:Which planet spins backwards?|What year did the first Discord server launch?|How many bits in a byte?|What does HTML stand for?} — you have 15s, {user}." }],
    ["hangman", "Classic hangman, letter by letter", { response: "Hangman started: _ _ _ _ _ _ _ ({n:4-9} letters). {user} guesses first." }],
    ["tictactoe", "Duel a member in tic-tac-toe", { aliases: ["ttt"], usage: "/tictactoe <@member>", response: "{user} vs **{target}** — tic-tac-toe board rendered. X moves first." }],
    ["connect4", "Gravity-powered connect four", { usage: "/connect4 <@member>", response: "Connect4: {user} vs **{target}**. Drop phase begins." }],
    ["battleship", "Sink your rival's fleet", { usage: "/battleship <@member>", response: "Fleets deployed. **{target}**, brace for {user}'s opening salvo." }],
    ["minesweeper", "Procedurally generated minefield", { response: "Field seeded: {n:8-16} mines on a {n:6-10}x{n:6-10} grid. Good luck {user}." }],
    ["snake", "The arcade classic in chat", { aliases: ["snek"], response: "Snake started for {user}. Grow, don't choke." }],
    ["memory", "Emoji memory match board", { response: "Memory board shuffled: {n:4-12} pairs. Timer: {n:30-90}s. Go {user}!" }],
    ["wordle", "Daily word duel, Discord flavored", { response: "Word of the day: 5 letters. {n:1-3} vowels. 6 tries, {user}." }],
    ["typerace", "Sprint-typing showdown with WPM", { response: "Type: \"{pick:the quick brown fox|massive latency detected|ship it before standup}\" — {user} vs {target}. Go!" }],
    ["scramble", "Unscramble the word fastest", { response: "Unscramble: {pick:ohtypn|rcesidod|evresr|gatwaye|sbardidoh}" }],
    ["anagram", "Find words hidden in a word", {}],
    ["mathquiz", "Mental math under pressure", { response: "Quick: {n:11-99} + {n:11-99} = ? (10 seconds, {user})" }],
    ["flagquiz", "Name the country from its flag", { response: "Flag shown: {pick:red circle, white field|three stripes vertical|nordic cross}" }],
    ["geoguess", "Guess the place from street clues", { response: "Clue: {pick:left-hand traffic, vending machines|yellow plates, tulips|cyrilic signs, trams}" }],
    ["riddle", "A proper brain-bender", { response: "{pick:I speak without a mouth and hear without ears. What am I?|The more you take, the more you leave behind. What am I?}" }],
    ["truthordare", "Party mode: truth or dare", { aliases: ["tod"], response: "{user} chose {pick:TRUTH|DARE}: {pick:what's your most bookmarked channel?|type with your eyes closed for one message|confess your oldest unread ping|voice-message the next reply}" }],
    ["wouldyourather", "Impossible choices, instant chaos", { aliases: ["wyr"], response: "Would you rather: {pick:never use /play again|always type in caps|lose all your XP|only speak in embeds}?" }],
    ["neverhaveiever", "Confession engine with gavel", { aliases: ["nhie"], response: "Never have I ever: {pick:deployed on a Friday|pinged everyone by accident|forgotten to slowmode a hype channel|read the entire changelog}" }],
    ["higherlower", "Is the next number higher or lower?", { response: "Current: {n:1-99}. Higher or lower, {user}?" }],
    ["duel", "Card combat against a member", { usage: "/duel <@member>", response: "{user} challenges **{target}**! Initiative roll: {n:1-20} vs {n:1-20}." }],
    ["fight", "Turn-based stat battle", { usage: "/fight <@member>", response: "{user} opens with {pick:plasma jab|compiler smash|sudo strike} — {n:8-40} dmg to **{target}**." }],
    ["gtn", "Guess the number between 1 and 100", { aliases: ["guess"], response: "Number locked in (1-{n:50-500}). {user} starts guessing." }],
    ["play2048", "Swipe tiles, chase the 2048", { aliases: ["2048"], response: "2048 spawned for {user}. Current high tile: {n:64-1024}." }],
    ["reaction", "Fastest finger wins the click", { response: "WAIT FOR GREEN... {user} clicked in {n:120-900}ms — {pick:new record|decent|grandma tier}" }],
    ["emojiquiz", "Decode the emoji riddle", { response: "Decode this: {pick:fire + truck = ???|eye + scream = ???|flag + wave = ???}" }],
    ["logoquiz", "Name the brand from its outline", {}],
    ["capitalquiz", "World capitals speedrun", { response: "Capital of {pick:Mongolia|Suriname|Kazakhstan|Slovenia}? Go!" }],
    ["impostor", "Social deduction mini-round", { response: "Lobby formed ({n:5-10} players). Impostor chosen. {user} is {pick:crew|sus|the impostor}." }],
    ["lightsout", "Toggle the grid until all lights die", { response: "LightsOut: {n:3-7}x{n:3-7} grid, {n:4-14} lights on. Minimum moves: {n:3-12}." }],
  ];
  gameRows.forEach(([n, d, o]) => games(n, d, o));

  // -- Economy (30) -------------------------------------------------------------
  const eco = push("economy");
  const ecoRows: Row[] = [
    ["balance", "Check your wallet and bank", { aliases: ["bal"], response: "{user}: wallet **{n:120-9800}** coins · bank **{n:5000-99000}**" }],
    ["daily", "Claim your daily coin drip", { response: "Daily claimed: +**{n:500-2500}** coins (streak x{n:2-60})." }],
    ["weekly", "Claim your weekly payout", { response: "Weekly claimed: +**{n:4000-12000}** coins." }],
    ["monthly", "Claim the big monthly drop", { response: "Monthly claimed: +**{n:20000-60000}** coins. Rent's paid." }],
    ["work", "Clock in for a shift", { response: "{user} worked as a {pick:meme curator|queue DJ|bug bounty hunter|server janitor} and earned **{n:200-1500}** coins." }],
    ["beg", "Beg the void for coins", { response: "{pick:A passing whale dropped|The void felt generous. You got|A cat walked across a keyboard and sent} **{n:5-400}** coins to {user}." }],
    ["crime", "High risk, higher reward", { cooldown: 30, response: "{pick:Success! You heisted a meme vault|Busted! The mods confiscated your loot} — **{pick:+|-}{n:300-3000}** coins." }],
    ["rob", "Attempt to rob another member", { usage: "/rob <@member>", cooldown: 30, response: "{pick:Clean getaway|Caught red-handed} — {pick:+|-}**{n:100-2000}** coins vs **{target}**." }],
    ["search", "Search random spots for loose coins", { response: "You searched the {pick:server couch|mod mail|voice channel floor} and found **{n:10-500}** coins." }],
    ["fish", "Cast a line and reel in profit", { response: "{user} caught a {pick:common carp|rare koi|legendary mecha-tuna|old boot} worth **{n:20-800}** coins." }],
    ["hunt", "Track loot through the wilds", { response: "Hunt result: {pick:rabbit|deer|golden goose|your own tail} → **{n:30-900}** coins." }],
    ["mine", "Swing a pickaxe for ore", { response: "Mined {n:1-12}x {pick:copper|iron|diamond|server copper} — sold for **{n:40-1200}** coins." }],
    ["chop", "Chop timber to sell", { response: "Chopped {n:2-20} logs, banked **{n:30-700}** coins." }],
    ["dig", "Dig for buried treasure", { response: "Digging... {pick:treasure chest|ancient ssd|dirt|another dirt} — **{n:10-950}** coins." }],
    ["farm", "Tend crops and harvest coins", { response: "Harvested {n:4-40} {pick:pixel potatoes|discord wheat|moon melons} → **{n:60-1500}** coins." }],
    ["postmeme", "Post a meme, farm engagement", { response: "Your meme got **{n:3-900}** upvotes → **{n:50-2000}** coins {pick:(viral!)|(solid)|(flopped hard, -coins)}" }],
    ["gamble", "Wager coins on a coin's mercy", { usage: "/gamble <amount>", cooldown: 10, response: "{pick:WINNER|BUSTED} — {pick:+|-}**{n:100-5000}** coins. House edge: emotional." }],
    ["slots", "Spin the slot machine", { usage: "/slots <amount>", response: "Reels: {pick:7 7 7 — JACKPOT +|cherry cherry bell — small win +|lemon lemon lemon — painful -}**{n:100-8000}** coins." }],
    ["roulette", "Bet on red, black or a number", { usage: "/roulette <bet>", response: "Ball lands on {n:0-36} {pick:red|black|green} → {pick:+|-}**{n:100-6000}** coins." }],
    ["blackjack", "Beat the dealer to 21", { aliases: ["bj"], usage: "/blackjack <amount>", response: "Your hand: {n:15-21}. Dealer: {n:15-22}. {pick:You win|Pushed|Dealer wins}." }],
    ["pay", "Transfer coins to a member", { usage: "/pay <@member> <amount>", response: "{user} sent **{n:50-5000}** coins to **{target}** (fee: {n:0-50})." }],
    ["gift", "Gift an item from your inventory", { usage: "/gift <@member> <item>", response: "{user} gifted a {pick:rare box|golden banana|mod trophy} to **{target}**." }],
    ["deposit", "Move coins into your bank", { aliases: ["dep"], usage: "/deposit <amount>", response: "Deposited **{n:100-9000}** coins. Bank total: {n:5000-99000}." }],
    ["withdraw", "Pull coins out of the bank", { aliases: ["with"], usage: "/withdraw <amount>", response: "Withdrew **{n:100-9000}** coins. Wallet: {n:120-9800}." }],
    ["shop", "Browse the item shop", { response: "Shop stock: {pick:lucky charm|fishing rod+|role color pass|lootbox} from {n:500-50000} coins." }],
    ["inventory", "View your item stash", { aliases: ["inv"], response: "{user}'s stash: {n:2-24} items incl. {pick:golden banana|ancient ssd|mod trophy}." }],
    ["buy", "Purchase an item from the shop", { usage: "/buy <item>", response: "Purchased {pick:lucky charm|role color pass|lootbox} for {n:500-5000} coins." }],
    ["sell", "Sell an item back for coins", { usage: "/sell <item>", response: "Sold for **{n:100-3000}** coins. The fence thanks you." }],
    ["richlist", "Top 10 richest members", { aliases: ["baltop"], response: "Richest in {server}: #1 holds **{n:100000-999999}** coins. {user} ranks #{n:4-99}." }],
    ["lottery", "Buy a ticket for the weekly jackpot", { usage: "/lottery <tickets>", response: "Bought {n:1-10} tickets. Jackpot: **{n:100000-999999}** coins. Drawing Friday." }],
  ];
  ecoRows.forEach(([n, d, o]) => eco(n, d, o));

  // -- Music (25) -----------------------------------------------------------------
  const music = push("music");
  const musicRows: Row[] = [
    ["play", "Play a track from any source", { usage: "/play <query>", response: "Queued: **{args}** ({n:2-6}:{n:10-59}) — position #1 for {user}." }],
    ["pause", "Freeze the current track", { response: "Paused by {user}." }],
    ["resume", "Resume the paused track", { response: "Resumed — enjoy {user}." }],
    ["skip", "Skip to the next track", { aliases: ["s"], response: "Skipped. Now playing: \"{pick:Midnight Compiler|Neon Rain|Lo-fi Greenlights|Gateway Heartbeat}\"." }],
    ["stop", "Stop playback and clear the queue", { response: "Stopped and queue cleared by {user}." }],
    ["queue", "Show the upcoming track list", { aliases: ["q"], response: "Queue holds **{n:3-40}** tracks, {n:4-120} min total." }],
    ["nowplaying", "What is playing right now", { aliases: ["np"], response: "Now playing: \"{pick:Midnight Compiler|Neon Rain|Lo-fi Greenlights|Gateway Heartbeat}\" — [{n:0-3}:{n:10-59}/{n:2-5}:{n:10-59}]" }],
    ["volume", "Set playback volume", { usage: "/volume <0-150>", response: "Volume set to **{n:10-150}%** by {user}." }],
    ["loop", "Loop the current track", { response: "Looping current track {pick:on|off}." }],
    ["loopqueue", "Loop the whole queue", { response: "Queue loop {pick:enabled|disabled}." }],
    ["shuffle", "Shuffle the queue", { response: "Queue shuffled — {n:3-40} tracks re-rolled." }],
    ["remove", "Remove a track from the queue", { usage: "/remove <position>", response: "Removed track #{n:1-40} from queue." }],
    ["move", "Reposition a queued track", { usage: "/move <from> <to>" }],
    ["seek", "Jump to a timestamp", { usage: "/seek <time>", response: "Jumped to {n:0-3}:{n:10-59}." }],
    ["previous", "Play the previous track again", { aliases: ["back"], response: "Rewinding to the previous track." }],
    ["clear", "Empty the queue without stopping", { response: "Queue cleared ({n:3-40} tracks dropped)." }],
    ["lyrics", "Lyrics for the current or any track", { usage: "/lyrics [query]", response: "Lyrics for \"{args}\": {n:3-8} verses found, synced mode ready." }],
    ["searchsong", "Search and pick from 10 results", { usage: "/searchsong <query>", response: "Top hit for \"{args}\": \"{pick:Midnight Compiler|Neon Rain|Gateway Heartbeat}\" — react to confirm." }],
    ["jump", "Jump the current track ahead", { usage: "/jump <seconds>" }],
    ["autoplay", "Auto-queue similar tracks forever", { response: "Autoplay {pick:enabled — infinite vibe mode|disabled}." }],
    ["filters", "Apply live audio filters", { usage: "/filters <preset>", response: "Filter applied: {pick:8D|karaoke|tremolo|EarRape-off} (takes a few seconds)." }],
    ["bassboost", "Crank the low end", { usage: "/bassboost <level>", response: "Bassboost level {n:1-3} engaged. Neighbors notified." }],
    ["nightcore", "Speed + pitch the current track", { response: "Nightcore mode {pick:on|off}." }],
    ["eightd", "8D surround drift effect", { aliases: ["8d"], response: "8D audio {pick:active — headphones on|disabled}." }],
    ["grab", "DM yourself the current track", { response: "Slid into {user}'s DMs with the current track info." }],
  ];
  musicRows.forEach(([n, d, o]) => music(n, d, o));

  // -- Anime (25) -------------------------------------------------------------------
  const anime = push("anime");
  const animeRows: Row[] = [
    ["anime", "Search any anime with full scoring", { usage: "/anime <title>", response: "**{args}** — {pick:9.1|8.7|8.2|7.9} rating · {n:12-24}x{n:1-4} episodes · {pick:finished|airing}" }],
    ["manga", "Search any manga or light novel", { usage: "/manga <title>", response: "**{args}** — {n:30-300} chapters · status: {pick:publishing|complete|hiatus}" }],
    ["character", "Look up any character", { usage: "/character <name>", response: "Character dossier for **{args}**: appears in {n:2-18} titles." }],
    ["studio", "Stats on an animation studio", { usage: "/studio <name>" }],
    ["seasonal", "This season's full lineup", { response: "{pick:Spring|Summer|Fall|Winter} season: {n:30-60} shows airing. Top hype: \"{pick:Blade of the Quiet Fox|Starset Union|Re:Builder}\"" }],
    ["schedule", "Daily airing schedule", { response: "Today airs: {n:4-12} episodes. Next drop in {n:1-9}h {n:5-55}m." }],
    ["airing", "Countdown to a show's next episode", { usage: "/airing <title>", response: "Next episode of **{args}** in {n:1-6}d {n:0-23}h." }],
    ["topanime", "All-time top rated anime", { response: "#1 all time: {pick:Fullmetal Alchemist: Brotherhood|Frieren|Steins;Gate} ({n:91-94}/100)." }],
    ["topmanga", "All-time top rated manga", {}],
    ["trending", "What the world is binging now", { response: "Trending #1 this hour: \"{pick:Blade of the Quiet Fox|Starset Union|Night Train Akane}\"" }],
    ["recommend", "Personalized show recommendations", { usage: "/recommend [genre]", response: "Based on your taste: **{pick:Blade of the Quiet Fox|Starset Union|Paper Lantern City}** — match {n:82-99}%." }],
    ["randomanime", "Roll for a random show", { response: "The dice picked: **{pick:Moonlit Parcel Service|Iron Garden|9th Period Ghost Club}** — enjoy!" }],
    ["animequote", "A legendary line on demand", { response: "\"{pick:The world isn't perfect, but it's there for us trying.|A lesson without pain is meaningless.|Fear is not evil — it tells you what weakness is.}\"" }],
    ["animeme", "Anime memes, freshly sliced", {}],
    ["neko", "Catgirl imagery, SFW only", { premium: true, response: "Neko deployed for {user} — nyaa." }],
    ["kitsune", "Foxgirl imagery, SFW only", { premium: true, response: "Kitsune deployed for {user} — kon kon." }],
    ["waifu", "Roll a random waifu card", { premium: true, response: "{user} pulled: **{pick:Mika of the Tides|Aster Vane|Yuno Solstice}** ({pick:SR|SSR|R})" }],
    ["husbando", "Roll a random husbando card", { premium: true, response: "{user} pulled: **{pick:Ren Kagetsu|Captain Hollis|Iori Vale}** ({pick:SR|SSR|R})" }],
    ["animegif", "Reaction GIFs straight from the source", { usage: "/animegif <reaction>", response: "GIF: {args} — sent." }],
    ["mangaupdates", "Latest chapter release feed", { response: "New chapters: {n:3-15} in the last hour. Hottest: \"{pick:Iron Garden ch. {n:}}\"." }],
    ["watchlist", "View your personal watchlist", { response: "{user}'s watchlist: {n:3-40} titles ({n:1-12} watching)." }],
    ["watchlist-add", "Add a show to your watchlist", { usage: "/watchlist-add <title>", response: "Added **{args}** to {user}'s watchlist." }],
    ["watchlist-remove", "Drop a show from your list", { usage: "/watchlist-remove <title>" }],
    ["voiceactor", "Filmography of a voice actor", { aliases: ["va"], usage: "/voiceactor <name>" }],
    ["animenews", "Headlines from the industry", { response: "Headline: \"{pick:Studio announces season 3, fandom ascends|Beloved manga hits 100M copies|Movie breaks opening weekend records}\"" }],
  ];
  animeRows.forEach(([n, d, o]) => anime(n, d, o));

  // -- Roleplay (20) ------------------------------------------------------------------
  const rp = push("roleplay");
  const rpRows: Array<[string, string, string]> = [
    ["hug", "Send a warm hug", "wraps **{target}** in a big warm hug"],
    ["cuddle", "Cuddle up with someone", "cuddles up next to **{target}**"],
    ["pat", "Gentle headpats", "gives **{target}** the gentlest headpats"],
    ["highfive", "Slap some skin", "launches a high-five at **{target}**"],
    ["poke", "Poke. That's it.", "pokes **{target}**... {n:1-30} times"],
    ["slap", "A dramatic, consensual slap", "slaps **{target}** with a {pick:trout|keyboard|foam sword}"],
    ["bonk", "Bonk someone to horni jail (SFW)", "bonks **{target}**. Go to chill jail."],
    ["boop", "Boop the snoot", "boops **{target}** right on the nose"],
    ["tickle", "Unleash tickle warfare", "tickles **{target}** mercilessly"],
    ["nuzzle", "Nuzzle up real close", "nuzzles **{target}** softly"],
    ["holdhands", "Hold hands because why not", "holds hands with **{target}**"],
    ["wave", "Say hi properly", "waves enthusiastically at **{target}**"],
    ["feed", "Feed someone a snack", "feeds **{target}** a {pick:cookie|ramen cup|pixel tart}"],
    ["comfort", "Comfort a friend having a day", "comforts **{target}** — it's going to be okay"],
    ["cheer", "Hype someone up", "cheers loudly for **{target}**"],
    ["dance", "Start a dance-off", "starts a dance battle with **{target}**"],
    ["stare", "Stare. Menacingly? Lovingly?", "stares at **{target}** for {n:3-60} seconds straight"],
    ["glare", "A withering glare", "glares at **{target}** with mod-level intensity"],
    ["fistbump", "Respect the bump", "fist-bumps **{target}**. Respect earned."],
    ["handshake", "Seal the deal in style", "shakes **{target}**'s hand. Deal sealed."],
  ];
  rpRows.forEach(([n, d, resp]) => rp(n, d, { usage: `/${n} [@member]`, response: `**{user}** ${resp}` }));

  // -- Text tools (35) ------------------------------------------------------------------
  const txt = push("text");
  const txtRows: Row[] = [
    ["reverse", "Flip text backwards", { response: "{args} reversed — mirror mode engaged." }],
    ["mock", "SpOnGeBoB mOcK anything", { response: "Mocked output ready for {user}." }],
    ["emojify", "Spell words in giant regional letters", { response: "Emojified: {args}" }],
    ["clapify", "Add claps between every word", { response: "Clapified: {args}" }],
    ["owofy", "OwO-ify your sentence", { response: "OwO'd: {args}" }],
    ["vaporwave", "ＦＵＬＬＷＩＤＴＨ text", { response: "Ｖａｐｏｒｉｚｅｄ： {args}" }],
    ["zalgo", "C̶o̷r̵r̸u̶p̷t̸ text beyond repair", { premium: true, response: "Z̶a̷l̶g̸o̷ rises: {args}" }],
    ["tiny", "ˢʰʳᶦⁿᵏ ᵗᵉˣᵗ to superscript", { response: "ˢʰʳᵘⁿᵏ: {args}" }],
    ["tableflip", "(╯°□°)╯︵ ┻━┻ + optional text", { response: "(╯°□°)╯︵ ┻━┻  {args}" }],
    ["fancy", "𝓒𝓾𝓻𝓈𝓲𝓋𝓮, 𝔤𝔬𝔱𝔥𝔦𝔠 and more styles", { response: "Styled {n:6-18} variants of: {args}" }],
    ["aesthetic", "s p a c e d  o u t  aesthetic", { response: "s  p  a  c  e  d   o  u  t : {args}" }],
    ["bubbles", "ⓒⓘⓡⓒⓛⓔ ⓛⓔⓣⓣⓔⓡⓢ", { response: "ⓑⓤⓑⓑⓛⓔⓓ: {args}" }],
    ["squaretext", "🅱🅻🅾🅲🅺 letters", { response: "Blocked: {args}" }],
    ["morse", "Encode text into Morse", { response: "Morse: {args} → {pick:…. . .-.. .-.. ---|.-.. --- --. ...}" }],
    ["morse-decode", "Decode Morse into text", {}],
    ["binary", "Encode text into binary", { response: "{args} → {n:64-128} bits of pure ones and zeros." }],
    ["binary-decode", "Decode binary into text", {}],
    ["hextext", "Encode text into hexadecimal", { response: "Hex dump generated for {args}." }],
    ["hex-decode", "Decode hexadecimal into text", {}],
    ["base64-encode", "Encode text into base64", { aliases: ["b64"], response: "Base64: {args} → {pick:aGVsbG8>d29ybGQ=|T1JCSVQ=}" }],
    ["base64-decode", "Decode base64 into text", { aliases: ["b64d"] }],
    ["rot13", "Shift letters 13 places", { response: "ROT13: {args} (apply twice to heal)" }],
    ["caesar", "Caesar cipher with any shift", { usage: "/caesar <shift> <text>" }],
    ["leet", "1|{4|<3 7}{1|<>{, 1337 edition", { aliases: ["1337"], response: "7r4n51473d: {args}" }],
    ["piglatin", "Igpay Atinlay orfay unssioncray", { response: "Igpay Atinlay: {args}" }],
    ["shuffle-text", "Randomly shuffle a sentence's words", { response: "Shuffled {args} — meaning: lost." }],
    ["shout", "CONVERT EVERYTHING TO CAPS", { response: "SHOUTED: {args}" }],
    ["titlecase", "Proper Title Case formatting", { response: "Title-cased: {args}" }],
    ["wordcount", "Words, sentences, reading time", { response: "{args}: **{n:4-400}** words, {n:1-40} sentences, ~{n:1-9} min read." }],
    ["charcount", "Character and byte counts", { response: "{args}: **{n:5-2000}** chars ({n:5-4000} bytes)." }],
    ["vowelcount", "Count vowels, consonants, ratio", { response: "Vowels: {n:5-500} · consonants: {n:5-800} · vibe ratio: {n:1-9}:{n:1-9}" }],
    ["palindrome", "Check if text reads the same backwards", { response: "\"{args}\" {pick:IS a palindrome. Respect.|is not a palindrome. Nice try.}" }],
    ["acronym", "Compress a phrase into an acronym", { response: "Acronym: {n:3-8} letters forged from \"{args}\"." }],
    ["stretch", "s t r e t c h letters", { response: "s t r e t c h e d : {args}" }],
    ["camelcase", "turnAnyTextCamelCase", { aliases: ["kebab", "snakecase"], response: "camelCased: {args}" }],
  ];
  txtRows.forEach(([n, d, o]) => txt(n, d, { usage: `/${n} <text>`, ...o }));

  // -- Image FX (20) ---------------------------------------------------------------------
  const img = push("image");
  const IMG_EFFECTS: Array<[string, string]> = [
    ["deepfry", "Nuke an image with saturation and JPEG artifacts"],
    ["blur", "Gaussian blur at any strength"],
    ["pixelate", "Chunk an image into mosaic blocks"],
    ["grayscale", "Strip all color, keep the mood"],
    ["invert", "Invert every channel for negative vibes"],
    ["sepia", "Instant 1890s photograph"],
    ["glitch", "Datamosh-style RGB slices"],
    ["swirl", "Vortex-warp the image center"],
    ["mirror", "Perfect bilateral symmetry"],
    ["rotate", "Rotate to any angle"],
    ["crop", "Auto-crop smart or manual"],
    ["circle", "Circular crop for avatars"],
    ["frame", "Add a themed frame border"],
    ["triggered", "The classic shaking red tag"],
    ["wasted", "GTA-style wasted treatment"],
    ["rainbow", "Animated pride gradient overlay"],
    ["magik", "Liquid content-aware chaos"],
    ["emboss", "Chisel the image into relief"],
    ["sharpen", "Crisp every edge"],
    ["brightness", "Blast or dim the lighting"],
  ];
  IMG_EFFECTS.forEach(([n, d]) =>
    img(n, d, {
      usage: `/${n} [@member|url]`,
      cooldown: 6,
      premium: ["glitch", "swirl", "magik", "rainbow", "triggered", "wasted"].includes(n),
      response: `Rendered \`${n}\` on **{target}**'s image in {n:120-2400}ms. Preview attached.`,
    })
  );

  // -- Admin (30) -------------------------------------------------------------------------
  const adm = push("admin");
  const admRows: Row[] = [
    ["setup", "Guided first-run configuration", { response: "Setup wizard opened for {user}: 6 steps, ~90 seconds." }],
    ["prefix", "Change the legacy text prefix", { usage: "/prefix <new>", response: "Prefix updated to \"{args}\"." }],
    ["config", "View or edit the full config", { usage: "/config [key] [value]", response: "Config for {server}: {n:18-42} keys set, {n:2-9} modules on." }],
    ["setlogs", "Route mod-logs to a channel", { usage: "/setlogs [#channel]", response: "Mod-log pipeline → {args}. All cases now recorded." }],
    ["setwelcome", "Enable welcome greeter", { usage: "/setwelcome [#channel]", response: "Welcomer armed in {args}." }],
    ["welcome-test", "Preview the welcome card", { response: "Preview rendered: \"Welcome **{target}** to {server} — member #{n:100-9999}\"" }],
    ["welcomemessage", "Edit the welcome message copy", { usage: "/welcomemessage <text>", response: "Welcome copy updated: \"{args}\"" }],
    ["setleave", "Announce member departures", { usage: "/setleave [#channel]" }],
    ["leavemessage", "Edit the goodbye message", { usage: "/leavemessage <text>", response: "Goodbye copy: \"{args}\"" }],
    ["autorole", "Auto-assign roles on join", { usage: "/autorole <@role>", response: "New members now auto-receive {args}." }],
    ["setmuterole", "Define the mute role", { usage: "/setmuterole <@role>" }],
    ["setstaffrole", "Define the staff role", { usage: "/setstaffrole <@role>" }],
    ["setdj", "Lock music behind a DJ role", { usage: "/setdj <@role>", response: "DJ gate set: only {args} can control the deck." }],
    ["language", "Set the bot's reply language", { usage: "/language <code>", response: "Language set to {args}. {n:340-400} strings reloaded." }],
    ["settimezone", "Default timezone for schedules", { usage: "/settimezone <zone>", response: "Timezone locked to {args}." }],
    ["module", "Toggle entire command modules", { usage: "/module <name> <on|off>", response: "Module \"{args}\" toggled. {n:8-40} commands affected." }],
    ["ignore-channel", "Stop the bot from reading a channel", { usage: "/ignore-channel [#channel]" }],
    ["unignore-channel", "Re-enable a channel", { usage: "/unignore-channel [#channel]" }],
    ["ignore-user", "Bot ignores one user entirely", { usage: "/ignore-user <@member>" }],
    ["command-toggle", "Enable/disable a single command", { usage: "/command-toggle <command>", response: "Command \"{args}\" toggled by {user}." }],
    ["alias-add", "Create a custom alias for any command", { usage: "/alias-add <alias> <command>", response: "Alias registered: {args}" }],
    ["alias-remove", "Delete a custom alias", { usage: "/alias-remove <alias>" }],
    ["announce", "Styled announcement to any channel", { usage: "/announce <#channel> <text>", permissions: ["Manage Server"], premium: false, response: "Announcement published: \"{args}\"" }],
    ["setcounter", "Live counter channel (members, boosts)", { usage: "/setcounter <type>" }],
    ["counter-remove", "Delete a counter channel", { usage: "/counter-remove <type>" }],
    ["serverbackup", "Snapshot roles, channels, settings", { premium: true, response: "Backup #{n:100-999} captured: {n:4-64} channels, {n:4-48} roles, {n:2-16} settings." }],
    ["serverrestore", "Restore a server snapshot", { premium: true, usage: "/serverrestore <id>", response: "Restoring backup #{n:100-999} — recreating structure..." }],
    ["exportconfig", "Download config as JSON", { response: "Config exported ({n:2-8}kb). Link valid 10 min." }],
    ["resetconfig", "Nuke config back to factory", { usage: "/resetconfig confirm", response: "Config reset complete. Pure factory vibes." }],
    ["dashboard", "Get your personal dashboard link", { response: "Control panel: orbit.gg/dash/{pick:x7qkd2|m9wzv4|k2nhd8} (expires in 10 min)" }],
  ];
  admRows.forEach(([n, d, o]) => adm(n, d, { permissions: ["Manage Server"], cooldown: 4, ...o }));

  // -- Security (20) -------------------------------------------------------------------------
  const sec = push("security");
  const secRows: Row[] = [
    ["antiraid", "Shield against coordinated join floods", { response: "Anti-raid {pick:ARMED|disarmed}: join rate capped at {n:5-20}/min, new accounts held for review." }],
    ["antinuke", "Stop mass channel/role deletion attempts", { response: "Anti-nuke {pick:online|offline}: destructive actions need 2-key approval." }],
    ["antibots", "Quarantine unverified bot joins", { response: "Antibots: unknown bots now land in quarantine automatically." }],
    ["antispam", "Heat-based spam suppression", { response: "Antispam tuned: {n:3-8} msgs/{n:2-5}s → timeout." }],
    ["antilink", "Strip links from non-staff", { response: "Antilink {pick:engaged|disabled} — {n:1-9} whitelisted domains." }],
    ["antiinvite", "Block other-server invite links", { response: "Invite filter on: {n:40-400} servers already blessed." }],
    ["antiscam", "Detect and delete phishing patterns", { response: "Scam signatures loaded: {n:400-2000} patterns. Last block: {n:2-40} min ago." }],
    ["verify", "Human verification gate on entry", { response: "Verification: {n:120-900} members passed this week, {n:2-30} failed." }],
    ["captcha", "Force a captcha before speaking", { response: "Captcha sent to **{target}** — {n:30-120}s to solve." }],
    ["wordfilter", "Master switch for the word filter", { response: "Filter: {n:4-80} blocked terms, {n:0-20} exceptions." }],
    ["filter-add", "Add a term to the filter", { usage: "/filter-add <word>", response: "\"{args}\" added to the filter vault." }],
    ["filter-remove", "Remove a term from the filter", { usage: "/filter-remove <word>" }],
    ["filter-list", "List filtered terms, spoilered", { response: "{n:4-80} terms filtered (spoiler-wrapped for eyes)." }],
    ["altwatch", "Flag suspicious new/alt accounts", { premium: true, response: "Altwatch: flagged {n:0-12} joins this week (min age: {n:3-30}d)." }],
    ["securitylog", "Dedicated security event feed", { usage: "/securitylog [#channel]" }],
    ["whitelist", "Whitelist trusted domains/invites", { usage: "/whitelist <add|remove> <entry>", response: "Whitelist updated: {args}" }],
    ["quarantine", "Isolate a member with zero access", { usage: "/quarantine <@member> [reason]", response: "**{target}** quarantined. Reason: {args}" }],
    ["unquarantine", "Release a member from isolation", { usage: "/unquarantine <@member>", response: "**{target}** released from quarantine." }],
    ["audit", "Scan for dangerous permission combos", { response: "Audit complete: {n:0-8} risky roles, {n:0-3} webhooks flagged." }],
    ["scan", "One-shot deep security scan", { premium: true, response: "Deep scan: {n:20-200} checks — risk score **{n:1-40}/100** ({pick:hardened|fair|exposed})." }],
  ];
  secRows.forEach(([n, d, o]) => sec(n, d, { permissions: ["Administrator"], cooldown: 10, ...o }));

  // -- Leveling (15) ---------------------------------------------------------------------------
  const lvl = push("leveling");
  const lvlRows: Row[] = [
    ["rank", "Your level card with progress", { aliases: ["level"], response: "{user}: Level **{n:1-80}** · {n:100-9900}/{n:1000-9999} XP · rank #{n:1-99}" }],
    ["leaderboard", "Server XP top 100", { aliases: ["lb"], response: "Leaderboard: #1 sits at level {n:40-99}." }],
    ["givexp", "Grant XP to a member", { usage: "/givexp <@member> <amount>", permissions: ["Manage Server"], response: "+**{n:50-1000} XP** → **{target}**" }],
    ["removexp", "Deduct XP from a member", { usage: "/removexp <@member> <amount>", permissions: ["Manage Server"] }],
    ["setlevel", "Hard-set a member's level", { usage: "/setlevel <@member> <level>", permissions: ["Manage Server"] }],
    ["resetlevel", "When someone needs a fresh start", { usage: "/resetlevel <@member>", permissions: ["Manage Server"], response: "**{target}**'s progress vaporized. Level 1 life." }],
    ["xpmultiplier", "Boost XP gain server-wide", { aliases: ["xpmult"], usage: "/xpmultiplier <value>", permissions: ["Manage Server"], response: "XP multiplier: x{n:1-5} for {n:1-48}h." }],
    ["xpcooldown", "Anti-grind cooldown between XP ticks", { usage: "/xpcooldown <seconds>", permissions: ["Manage Server"] }],
    ["levelchannel", "Where level-up pings land", { usage: "/levelchannel [#channel]", permissions: ["Manage Server"] }],
    ["levelmessage", "Customize the level-up message", { usage: "/levelmessage <text>", permissions: ["Manage Server"], response: "Level-up copy: \"{args}\"" }],
    ["noxprole", "Roles that can't gain XP", { usage: "/noxprole <@role>", permissions: ["Manage Server"] }],
    ["noxpchannel", "Channels with no XP gain", { usage: "/noxpchannel [#channel]", permissions: ["Manage Server"] }],
    ["reward-add", "Give a role at a level milestone", { usage: "/reward-add <level> <@role>", permissions: ["Manage Server"], response: "At level {n:5-60}, members now earn {args}." }],
    ["reward-remove", "Remove a level reward", { usage: "/reward-remove <level>", permissions: ["Manage Server"] }],
    ["rewards", "Browse all level rewards", { response: "{n:2-20} rewards armed from level {n:1-5} to {n:30-100}." }],
  ];
  lvlRows.forEach(([n, d, o]) => lvl(n, d, o));

  // -- Tickets (12) --------------------------------------------------------------------------------
  const tkt = push("tickets");
  const tktRows: Row[] = [
    ["ticket", "Open a new support ticket", { aliases: ["new"], usage: "/ticket <topic>", response: "Ticket #{n:1000-9999} opened by {user}: \"{args}\" — staff ETA {n:1-30} min." }],
    ["ticket-close", "Close the current ticket", { aliases: ["close"], response: "Ticket closed by {user}. Transcript generating..." }],
    ["ticket-rename", "Rename a ticket channel", { usage: "/ticket-rename <name>", permissions: ["Manage Messages"], response: "Ticket renamed to {args}." }],
    ["ticket-claim", "Claim a ticket as its handler", { permissions: ["Manage Messages"], response: "Ticket claimed by {user} — owned until closed." }],
    ["ticket-add", "Pull a member into the ticket", { usage: "/ticket-add <@member>", permissions: ["Manage Messages"], response: "**{target}** added to the ticket." }],
    ["ticket-remove", "Remove someone from the ticket", { usage: "/ticket-remove <@member>", permissions: ["Manage Messages"] }],
    ["transcript", "Export a full ticket transcript", { permissions: ["Manage Messages"], response: "Transcript exported ({n:40-4000} messages). Link valid 24h." }],
    ["panel", "Post the ticket creation panel", { permissions: ["Manage Server"], response: "Ticket panel deployed in this channel." }],
    ["support-role", "Role that gets pinged on new tickets", { usage: "/support-role <@role>", permissions: ["Manage Server"], response: "New tickets now ping {args}." }],
    ["autoclose", "Auto-close idle tickets", { usage: "/autoclose <hours>", permissions: ["Manage Server"], response: "Idle tickets auto-close after {args}h." }],
    ["ticket-list", "All open tickets with owners", { permissions: ["Manage Messages"], response: "Open tickets: {n:0-24} ({n:0-12} unclaimed)." }],
    ["ticket-stats", "Response times and volumes", { permissions: ["Manage Messages"], response: "This week: {n:10-200} tickets · avg first reply {n:2-45} min." }],
  ];
  tktRows.forEach(([n, d, o]) => tkt(n, d, o));

  // -- Giveaways (18) -----------------------------------------------------------------------------------
  const gw = push("giveaways");
  const gwRows: Row[] = [
    ["giveaway", "Start a prize giveaway", { aliases: ["gstart"], usage: "/giveaway <time> <winners> <prize>", response: "GIVEAWAY — \"{args}\" · {n:1-10} winner(s) · ends in {n:1-72}h. React to enter!" }],
    ["gend", "End a giveaway and pick winners", { usage: "/gend <id>", response: "Giveaway ended: {n:1-10} winner(s) drawn from {n:20-2000} entries." }],
    ["greroll", "Redraw a winner, no salt", { usage: "/greroll <id>", response: "Rerolled — new winner pinged. Old winner: {pick:vanished|didn't claim|was a bot}." }],
    ["gedit", "Edit prize, time or winner count", { usage: "/gedit <id>", response: "Giveaway updated live. {n:20-2000} entrants notified of nothing." }],
    ["gcancel", "Cancel without drawing", { aliases: ["gdelete"], usage: "/gcancel <id>", response: "Giveaway cancelled. The prize returns to the vault." }],
    ["glist", "All running giveaways", { response: "Active: {n:1-8} giveaways ({n:20-5000} total entries)." }],
    ["ginfo", "Deep stats on one giveaway", { usage: "/ginfo <id>", response: "Entries: {n:20-2000} · ends in {n:1-72}h · host: {user}" }],
    ["greq", "Require a role or level to enter", { aliases: ["gblacklist-role"], usage: "/greq <id> [role|level]", response: "Entry gate set: {args}" }],
    ["gblacklist", "Block a member from entering", { usage: "/gblacklist <@member>", response: "**{target}** can look but not touch." }],
    ["gwhitelist", "Only allow certain members", { usage: "/gwhitelist <@role>", response: "Giveaway locked to {args}." }],
    ["gping", "Ping a role when starting", { usage: "/gping <@role>" }],
    ["gdm", "DM winners automatically", { response: "Winner DMs {pick:enabled|disabled} — no more ghost winners." }],
    ["gbonus", "Bonus entries for boosters", { usage: "/gbonus <@role> <entries>", response: "{args} now counts extra." }],
    ["gtemplate", "Save/reuse giveaway presets", { usage: "/gtemplate <save|use> <name>", response: "Template {args} stored with {n:2-9} fields." }],
    ["gschedule", "Schedule a future giveaway", { usage: "/gschedule <when>", response: "Giveaway scheduled — fires in {n:1-168}h." }],
    ["gstats", "Giveaway analytics for the server", { response: "Lifetime: {n:20-500} giveaways, {n:1000-50000} entries, {n:20-500} happy winners." }],
    ["gembed", "Fully custom giveaway embed", { premium: true, usage: "/gembed <json|builder>", response: "Custom embed preview attached for {args}." }],
    ["gclaim", "Winners claim prizes manually", { response: "Claim window open ({n:1-48}h). {n:1-10} winner(s) pinged." }],
  ];
  gwRows.forEach(([n, d, o]) => gw(n, d, { permissions: ["Manage Events"], cooldown: 5, ...o }));

  // -- Materialize --------------------------------------------------------------------------------------
  const out: SeedCommand[] = rows.map((tuple) => {
    const [name, description, opts] = tuple;
    const category = tuple.category;
    const defUsage = `/${name}${/^(anime$|manga$|weather$|gif$|say$|tts$|color$|qr$|urban$|translate$)/.test(name) ? ` ${QUERY}` : ""}`;
    return {
      name,
      description,
      category,
      usage: opts?.usage ?? defUsage,
      aliases: opts?.aliases ?? [],
      permissions: opts?.permissions ?? [],
      cooldown: opts?.cooldown ?? 3,
      response: opts?.response ?? responseFor(category, name),
      premium: opts?.premium ?? false,
    };
  });

  const seen = new Set<string>();
  for (const c of out) {
    if (seen.has(c.name)) throw new Error(`Duplicate command name: ${c.name}`);
    seen.add(c.name);
  }
  if (out.length !== 400) throw new Error(`Expected 400 commands, got ${out.length}`);
  return out;
}

function fmt(s: string) {
  return s;
}

function responseFor(category: string, name: string): string {
  switch (category) {
    case "moderation":
      return `Case #{n:1000-9999} — \`/${name}\` executed on **{target}** by {user}. Reason: {args}`;
    case "utility":
      return `\`/${name}\` served for {user}: {args}`;
    case "fun":
      return `\`/${name}\`: {pick:delivered|deployed|dropped} for {user} — {args}`;
    case "games":
      return `Game \`/${name}\` started by {user}. Target: **{target}**. Good luck.`;
    case "economy":
      return `**{n:50-2000}** coins moved via \`/${name}\` for {user}.`;
    case "music":
      return `\`/${name}\` applied — the deck obeys {user}.`;
    case "anime":
      return `\`/${name}\` result for {user}: {args}`;
    case "roleplay":
      return `**{user}** uses \`/${name}\` on **{target}**`;
    case "text":
      return `Transformed via \`/${name}\`: {args}`;
    case "image":
      return `\`/${name}\` rendered in {n:120-2400}ms for {user}.`;
    case "admin":
      return `\`/${name}\` applied to {server} by {user}: {args}`;
    case "security":
      return `Security module \`/${name}\` engaged by {user}.`;
    case "leveling":
      return `\`/${name}\` synced — XP engine updated by {user}.`;
    case "tickets":
      return `Ticket system: \`/${name}\` handled by {user}.`;
    case "giveaways":
      return `Giveaway module: \`/${name}\` processed by {user}.`;
    default:
      return `\`/${name}\` executed by {user}.`;
  }
}

const CORE_COMMANDS = build();

function combine(): SeedCommand[] {
  const all = [...CORE_COMMANDS, ...PACK_COMMANDS];
  const seen = new Set<string>();
  for (const c of all) {
    if (seen.has(c.name)) throw new Error(`Duplicate command across core/packs: ${c.name}`);
    seen.add(c.name);
  }
  if (all.length !== 1000) throw new Error(`Expected 1000 commands total, got ${all.length}`);
  return all;
}

export const COMMAND_LIBRARY: SeedCommand[] = combine();

export function categoriesWithCounts(counts?: Record<string, number>) {
  return CATEGORY_ORDER.map((key) => ({
    key,
    ...CATEGORY_META[key],
    count: counts?.[key] ?? COMMAND_LIBRARY.filter((c) => c.category === key).length,
  }));
}
