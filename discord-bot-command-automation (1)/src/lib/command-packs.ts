// ---------------------------------------------------------------------------
// ORBIT auto-mind v2 — expansion packs.
// Sixteen additional intelligence surfaces (600 commands) generated with
// pack compression: crypto, stocks, coder, devops, streamer, cards, bestiary,
// space, radio, wellness, language, memes, math, science, ai, news.
// ---------------------------------------------------------------------------

import type { SeedCommand } from "./command-data";

type Opts = Partial<Pick<SeedCommand, "usage" | "aliases" | "permissions" | "cooldown" | "response" | "premium">>;

const TEXT = "<text>";
const TARGET_USAGE = "[@member]";

function fallback(category: string, name: string): string {
  const map: Record<string, string> = {
    crypto: `Market core: \`/${name}\` resolved for {user} — data fused from {n:3-12} exchanges.`,
    stocks: `Tape read: \`/${name}\` for {user} — latency {n:12-80}ms.`,
    coder: `\`/${name}\` done in {n:1-9}ms for {user}.`,
    devops: `Ops plane: \`/${name}\` executed by {user} — exit code 0.`,
    streamer: `Stream ops: \`/${name}\` fired by {user}. Chat noticed.`,
    cards: `\`/${name}\` dealt for {user}.`,
    bestiary: `\`/${name}\` resolved in the wild for {user}.`,
    space: `Telemetry: \`/${name}\` beamed down for {user}.`,
    radio: `\`/${name}\` now streaming into voice for {user}.`,
    wellness: `\`/${name}\` logged for {user}. Be kind to yourself.`,
    language: `\`/${name}\` looked up for {user}: {args}`,
    memes: `Meme \`/${name}\` rendered for {user}: "{args}"`,
    math: `\`/${name}\` computed exactly: {args}`,
    science: `\`/${name}\` retrieved from the archive for {user}.`,
    ai: `Model answered \`/${name}\` for {user} in {n:400-3000} tokens.`,
    news: `\`/${name}\` briefing compiled for {user} from {n:3-40} sources.`,
  };
  return map[category] ?? `\`/${name}\` executed by {user}.`;
}

function title(s: string) {
  return s
    .split("-")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function buildPacks(): SeedCommand[] {
  const rows: Array<[string, string, (Opts | undefined)?] & { category: string }> = [];
  const add = (category: string) => (name: string, description: string, opts?: Opts) => {
    const r = [name, description, opts] as [string, string, (Opts | undefined)?] & { category: string };
    r.category = category;
    rows.push(r);
  };
  /** Pack helper: many commands from one item list + templates. */
  const pack = (
    category: string,
    prefix: string,
    items: string[],
    descT: (label: string) => string,
    respT: (label: string) => string,
    extra?: Opts & { usageT?: string }
  ) => {
    items.forEach((it) => {
      const full = `${prefix}${it}`;
      const { usageT, ...rest } = extra ?? {};
      const r = [full, descT(title(it)), {
        response: respT(title(it)),
        cooldown: rest.cooldown ?? 4,
        premium: rest.premium ?? false,
        usage: rest.usage ?? (usageT ? usageT.replaceAll("_", full) : `/${full}`),
        ...rest,
      }] as [string, string, (Opts | undefined)?] & { category: string };
      r.category = category;
      rows.push(r);
    });
  };

  // ============================ CRYPTO (45) =================================
  pack("crypto", "price-", ["bitcoin","ethereum","solana","dogecoin","cardano","ripple","polkadot","avalanche","chainlink","polygon","litecoin","uniswap","cosmos","near","aptos","arbitrum","optimism"],
    (l) => `Live ${l} price, 24h delta and spark`,
    (l) => `**${l}**: ${"$"}{n:200-65000} ({pick:+|-}{n:0-18}.{n:0-9}%) 24h · vol ${"$"}{n:1-90}B — for {user}`);
  const cry = add("crypto");
  cry("gas", "Current network gas with slow/normal/fast tiers", { response: "Gas now: {n:2-90} gwei (fast: {n:10-160}) — {pick:send it|wait 20 min|avoid mainnet}." });
  cry("fear-greed", "Fear & Greed index reading", { response: "Fear & Greed: **{n:1-99}/100** — {pick:extreme fear|fear|neutral|greed|extreme greed}. {pick:Buy the blood?|Tops are in?|Sideways energy.}" });
  cry("market-cap", "Total crypto market capitalization", { response: "Total market cap: ${n:1-4}.{n:10-99}T ({pick:+|-}{n:0-6}.{n:0-9}% today)." });
  cry("btc-dominance", "Bitcoin dominance vs alts", { response: "BTC dominance: {n:38-64}% — {pick:alt season loading|alts bleeding|king holds the throne}." });
  cry("trending-coins", "What degens are aping right now", { response: "Trending: {pick:MOONCATZ|PEPE2|DOGWIFSOCKS|BORGIR|HYPERLION} +{n:40-900}% (NFA, obviously)." });
  cry("top-gainers", "Biggest 24h winners", { response: "Top gainer: {pick:LUNAR|AXLE|FROGE|NEBULA} +{n:20-400}% in 24h." });
  cry("top-losers", "Biggest 24h casualties", { response: "RIP {pick:HODL|BRICK|COPE|VAPOR}: -{n:20-96}% today. A moment of silence." });
  cry("ath-check", "Distance from all-time high", { usage: "/ath-check <coin>", response: "{args} sits {n:5-95}% below ATH. {pick:Recovery arc|New floor era|Zoom out}." });
  cry("atl-check", "Distance from all-time low", { usage: "/atl-check <coin>" });
  cry("convert-crypto", "Convert between coins and fiat", { usage: "/convert-crypto <amount> <from> <to>", response: "{args} ≈ {n:1-9000} at current rates (spread {n:0-2}.{n:0-9}%)." });
  cry("stake-calc", "Project staking rewards over time", { usage: "/stake-calc <amount> <apy%>" });
  cry("apr-calc", "APY/APR converter with compounding", { usage: "/apr-calc <rate>" });
  cry("dca-calc", "Dollar-cost-average backtest", { usage: "/dca-calc <coin> <weekly>", response: "DCA {args}: {n:12-900} buys → {pick:+|-}{n:5-300}% vs lump sum." });
  cry("mining-calc", "Mining profitability estimate", { usage: "/mining-calc <hashrate>" });
  cry("rug-check", "Heuristic scan for scam contracts", { usage: "/rug-check <contract>", response: "Rug scan {args}: liquidity {pick:locked|UNLOCKED|thin}, mint fn {pick:revoked|ACTIVE}, risk **{n:1-98}/100**." });
  cry("nft-floor", "Floor price for a collection", { usage: "/nft-floor <collection>", response: "{args} floor: {n:1-90}.{n:0-9} ETH ({pick:+|-}{n:0-30}%). Listings: {n:50-4000}." });
  cry("nft-rarity", "Rank a token inside its collection", { usage: "/nft-rarity <collection> <id>", premium: true });
  cry("defi-tvl", "Total value locked across DeFi", { response: "DeFi TVL: ${n:40-160}B across {n:100-900} protocols." });
  cry("bridge-fees", "Cheapest bridge routes right now", { usage: "/bridge-fees <from> <to>" });
  cry("gas-alarm", "Alert when gas drops below target", { usage: "/gas-alarm <gwei>", response: "Alarm armed: ping when gas < {args} gwei. Sleep well, anon." });
  cry("whale-alert", "Latest giant on-chain moves", { premium: true, response: "Whale moved {n:100-50000} ETH to {pick:Binance|Coinbase|cold storage|unknown} {n:2-58}m ago." });
  cry("halving", "Countdown to the next BTC halving", { response: "Halving in {n:30-1200} days, block {n:100000-999999}. History says: {pick:up only|crab|chaos}." });
  cry("airdrop-check", "Check wallet for unclaimed airdrops", { usage: "/airdrop-check <address>", response: "{args}: {pick:3 unclaimed drops worth ~$900|nothing but dust|you missed the snapshot, gg}." });
  cry("memecoin-scan", "Vitals on any memecoin", { usage: "/memecoin-scan <ticker>", response: "{args}: holders {n:100-900000} · top 10 hold {n:5-80}% · vibe {pick:unhinged|wholesome|terminal}." });
  cry("pump-alarm", "Alert on sudden vertical moves", { usage: "/pump-alarm <coin> <%>" });
  cry("dump-alarm", "Alert on sudden crashes", { usage: "/dump-alarm <coin> <%>" });
  cry("exchange-rates", "Price spread across exchanges", { usage: "/exchange-rates <coin>" });
  cry("satoshi-convert", "Sats ↔ fiat quick math", { usage: "/satoshi-convert <amount>" });

  // ============================ STOCKS (35) =================================
  pack("stocks", "quote-", ["aapl","msft","nvda","tsla","amzn","meta","googl","amd","spy","qqq"],
    (l) => `Realtime-ish quote for ${l.toUpperCase()}`,
    (l) => `**${l.toUpperCase()}**: ${"$"}{n:80-3200} ({pick:+|-}{n:0-9}.{n:0-9}%) · vol {n:1-90}M — for {user}`);
  const stk = add("stocks");
  stk("quote", "Quote any ticker by symbol", { usage: "/quote <ticker>", response: "{args}: ${n:5-3800} ({pick:+|-}{n:0-9}.{n:0-9}%) · cap ${n:1-3200}B." });
  stk("market-today", "Index snapshot for the session", { response: "S&P {pick:+|-}{n:0-2}.{n:0-9}% · Nasdaq {pick:+|-}{n:0-3}.{n:0-9}% · VIX {n:12-38}." });
  stk("premarket", "Top premarket movers", { response: "Premarket: futures {pick:up|down|flat}, {pick:NVDA|TSLA|AMD|MSFT} leading ({pick:+|-}{n:1-8}%)." });
  stk("afterhours", "After-hours action", {});
  stk("stock-watch", "Watch a ticker with target alerts", { usage: "/stock-watch <ticker> <target>" });
  stk("earnings", "Upcoming earnings calendar", { response: "This week: {n:3-40} companies report. Spotlight: {pick:NVDA|MSFT|AVGO|COST} on {pick:Tue|Wed|Thu}." });
  stk("dividends", "Dividend calendar and yields", { usage: "/dividends [ticker]", response: "{args}: yield {n:0-6}.{n:0-9}%, next ex-date in {n:3-58} days." });
  stk("ipo-calendar", "Upcoming IPO pipeline", { response: "IPO watch: {n:2-14} filings this month. Hype meter: {pick:POLARIS|STRATUS|KERNEL}." });
  stk("sector-heat", "Sector performance heat strip", { response: "Hottest sector: {pick:semis|energy|healthcare|financials} ({pick:+|-}{n:0-3}.{n:0-9}%). Coldest: {pick:REITs|utilities|staples}." });
  stk("movers", "Biggest movers by volume", {});
  stk("short-interest", "Most shorted tickers", { response: "Short interest leader: {pick:BYND|CVNA|SMR} at {n:20-60}% of float. Squeeze alert: {pick:loud|deafening}." });
  stk("options-flow", "Unusual options activity", { premium: true, response: "Flow: {n:2-900}k {pick:calls|puts} swept on {pick:SPY|NVDA|TSLA} {pick:weeklies|0DTE|LEAPs}." });
  stk("insider-activity", "Recent insider buys and sells", {});
  stk("pe-calc", "P/E and valuation quick check", { usage: "/pe-calc <ticker>", response: "{args}: P/E {n:8-90}, sector avg {n:10-40} — {pick:rich|fair|discount bin}." });
  stk("yield-calc", "Bond/dividend yield math", { usage: "/yield-calc <price> <payout>" });
  stk("position-size", "Position sizing by risk %", { usage: "/position-size <account> <risk%>" });
  stk("risk-reward", "R:R sanity check for a setup", { usage: "/risk-reward <entry> <stop> <target>", response: "Setup: R:R = 1:{n:1-8} — {pick:cook|careful|donating}." });
  stk("backtest", "Toy backtest of a simple strategy", { usage: "/backtest <ticker> <strategy>", premium: true, response: "Backtest {args}: {pick:+|-}{n:4-400}% over {n:6-120} months, max DD {n:2-60}%." });
  stk("paper-trade", "Practice trade with fake money", { usage: "/paper-trade <buy|sell> <ticker>", response: "Paper {args} filled at market. P&L tracking armed for {user}." });
  stk("dividend-calc", "Project dividend income", { usage: "/dividend-calc <shares> <ticker>" });
  stk("heatmap", "Full-market heatmap snapshot", { premium: true });
  stk("earnings-whisper", "Whisper numbers vs consensus", { usage: "/earnings-whisper <ticker>" });
  stk("analyst-ratings", "Street ratings summary", { usage: "/analyst-ratings <ticker>", response: "{args}: {n:1-40} buy · {n:0-20} hold · {n:0-9} sell. PT ${n:50-3000}." });
  stk("stock-split", "Upcoming and historical splits", { usage: "/stock-split <ticker>" });
  stk("circuit-breaker", "How close we are to halt levels", { response: "Level 1 halt at -7% (currently {pick:+|-}{n:0-3}%). Probably fine." });

  // ============================ CODER (55) ==================================
  const cod = add("coder");
  cod("regex", "Test a regex against sample text", { usage: "/regex <pattern> <text>", response: "Pattern matched {n:0-40} times in {n:5-500} chars — groups captured: {n:0-9}." });
  cod("regex-explain", "Plain-English regex breakdown", { usage: "/regex-explain <pattern>", response: "Decoded: {args} → {n:2-18} tokens ({n:0-4} capture groups, {pick:greedy|lazy} quantifiers)." });
  cod("json-format", "Pretty-print JSON", { usage: "/json-format <json>", response: "Formatted: {n:1-400} keys, depth {n:1-12}, valid JSON." });
  cod("json-validate", "Validate JSON and locate errors", { usage: "/json-validate <json>", response: "{args}? Verdict: {pick:valid — chef's kiss|invalid at line {n:1-99}: unexpected something}." });
  cod("json-minify", "Crush JSON to one line", {});
  cod("yaml-to-json", "YAML → JSON converter", { usage: "/yaml-to-json <yaml>" });
  cod("xml-to-json", "XML → JSON converter", { usage: "/xml-to-json <xml>" });
  cod("csv-to-json", "CSV → JSON converter", { usage: "/csv-to-json <csv>" });
  cod("jwt-decode", "Inspect a JWT without verifying", { usage: "/jwt-decode <token>", response: "Payload: sub={n:1000-9999}, exp in {n:1-72}h, alg {pick:HS256|RS256|EdDSA}." });
  cod("jwt-sign", "Mint a dev JWT locally", { usage: "/jwt-sign <payload> <secret>", premium: true });
  cod("uuid", "Generate UUIDs (v4/v7)", { usage: "/uuid [count]", response: "`{pick:9f2c|47ba|e01d}-{n:1000-9999}-{n:1000-9999}-...` — fresh UUID for {user}." });
  cod("nanoid", "Generate compact nanoids", { response: "`{pick:V1StGXR8|k2Pd9QwL|Xo3zJb7m}` — nanoid served." });
  cod("ulid", "Generate sortable ULIDs", {});
  cod("password-gen", "Strong password generator", { usage: "/password-gen [length]", response: "Password ({n:16-40} chars, {n:2-8} symbols) created — DM'd to {user}. Never posted here." });
  cod("passphrase", "Diceware-style memorable passphrase", { response: "Passphrase: {pick:coral-ember|velvet-orbit|tungsten|maple}-{pick:quasar|harbor|signal}-{n:100-999}" });
  cod("hash-gen", "MD5/SHA hashes of any text", { usage: "/hash-gen <algo> <text>", response: "sha256({args}) = `{pick:3a7bd3E|9c41b0fF}c{n:100-999}…` (truncated)." });
  cod("hmac-sign", "HMAC-sign a payload", { usage: "/hmac-sign <secret> <payload>", premium: true });
  cod("epoch", "Unix time ⇄ human time", { usage: "/epoch [ts]", response: "Now: {n:1700000000-1899999999} → {pick:Tuesday|Wednesday|Friday} {n:1-28}, {n:1-12}:00 UTC." });
  cod("cron-explain", "Explain a cron expression", { usage: "/cron-explain <expr>", response: "`{args}` → runs {pick:every weekday at 09:00|hourly at :15|daily at midnight|Mondays 03:30}." });
  cod("cron-next", "Next N runtimes for a cron", { usage: "/cron-next <expr>", response: "Next runs: {n:1-59}m, {n:1-23}h from now (×{n:3-5} listed)." });
  cod("diff-text", "Unified diff between two texts", { usage: "/diff-text <a> <b>", response: "Diff: +{n:1-40} -{n:0-30} lines across {n:1-12} hunks." });
  cod("minify-js", "Estimate JS minification", { usage: "/minify-js <code>", response: "Minified {args}: {n:200-9000} → {n:100-4000} bytes ({n:20-80}% smaller)." });
  cod("minify-css", "Estimate CSS minification", {});
  cod("beautify-code", "Beautify mangled code", { usage: "/beautify-code <code>" });
  cod("sql-format", "Format SQL with your dialect", { usage: "/sql-format <sql>", response: "Formatted as {pick:PostgreSQL|MySQL|SQLite}: {n:1-40} clauses aligned." });
  cod("md-preview", "Render markdown to text preview", { usage: "/md-preview <md>" });
  cod("md-table", "Build a markdown table from rows", { usage: "/md-table <csv rows>", response: "Table built: {n:2-12} rows × {n:2-8} cols, pipes aligned." });
  cod("lorem", "Lorem ipsum by word/paragraph", { usage: "/lorem <n> [words|paras]", response: "Lorem ipsum dolor sit amet… ({args} generated)" });
  cod("fake-data", "Realistic fake user record", { response: "{pick:Ada Byrne|Kaito Mori|Ines Salas|Noor Hadid} — {pick:ada|kaito|ines|noor}@example.dev, {pick:Lisbon|Osaka|Lagos|Oslo}." });
  cod("color-palette", "Generate a harmonic palette", { response: "Palette: {pick:#5865F2 #8B95FF #0D0F17 #E7EAFF|#0EA5E9 #38E0D4 #06202A #F0FBFF|#F59E0B #F43F5E #1C1207 #FFF7E6}" });
  cod("css-gradient", "CSS for a gradient by stops", { usage: "/css-gradient <colors...>", response: "`linear-gradient(135deg, {n:0-360}deg-ish, {args})` — copy-ready." });
  cod("box-shadow-gen", "Layered box-shadow recipe", { response: "`box-shadow: 0 {n:2-30}px {n:10-80}px rgba(0,0,0,.{n:2-6}), 0 2px 8px rgba(0,0,0,.3);`" });
  cod("flex-guide", "Flexbox cheat for a layout goal", { usage: "/flex-guide <goal>", response: "For \"{args}\": `display:flex; justify-content:{pick:center|space-between}; align-items:center; gap:1rem;`" });
  cod("grid-guide", "Grid cheat for a layout goal", { usage: "/grid-guide <goal>" });
  cod("git-commands", "Find the git incantation you need", { usage: "/git-commands <goal>", response: "\"{args}\" → `git {pick:rebase -i HEAD~3|stash push -m wip|reset --soft HEAD^|cherry-pick abc123|reflog}`" });
  cod("git-undo", "How to un-break what you broke", { usage: "/git-undo <situation>", response: "Breathe: `git {pick:reset --soft HEAD~1|restore --staged .|commit --amend|revert HEAD}` fixes {args}." });
  cod("chmod-calc", "chmod octal ↔ rwx", { usage: "/chmod-calc <perms>", response: "{args} → {pick:755 rwxr-xr-x|644 rw-r--r--|700 rwx------|600 rw-------}" });
  cod("tar-help", "tar flags that actually work", { usage: "/tar-help <task>", response: "For {args}: `tar -{pick:xvf|cvf|xzvf|czvf} archive.tar.gz`" });
  cod("http-codes", "What that status code means", { usage: "/http-codes <code>", response: "{args}: {pick:418 I'm a teapot — obviously|502 upstream is having a day|304 — nothing moved|429 — slow down, champ}." });
  cod("mime-types", "Extension → MIME type", { usage: "/mime-types <ext>", response: "{args} → {pick:application/json|image/webp|text/markdown|audio/mpeg}" });
  cod("case-convert", "camel/snake/kebab/pascal switch", { usage: "/case-convert <style> <text>", response: "{args} converted — clipboard ready." });
  cod("slugify", "URL slug from any title", { usage: "/slugify <text>", response: "Slug: `{pick:the-quick-brown-fox|hello-world-2026|untitled-draft}`" });
  cod("url-encode", "Percent-encode a string", { usage: "/url-encode <text>" });
  cod("url-decode", "Decode a percent-encoded string", { usage: "/url-decode <text>" });
  cod("qr-wifi", "QR payload for Wi-Fi join", { usage: "/qr-wifi <ssid> <password>", premium: true });
  cod("luhn-check", "Validate card number checksums (test data)", { usage: "/luhn-check <digits>", response: "{args}: {pick:passes|catastrophically fails} Luhn." });
  cod("iban-check", "Validate an IBAN structure", { usage: "/iban-check <iban>" });
  cod("semver-bump", "Next semver for major/minor/patch", { usage: "/semver-bump <version> <part>", response: "{args} → next version locked and tagged." });
  cod("license-picker", "Pick an open-source license", { usage: "/license-picker <needs>", response: "For \"{args}\": {pick:MIT — ship it|Apache-2.0 — patents covered|GPL-3.0 — share alike|BSD-3 — quiet and calm}." });
  cod("regex-sheet", "The 12 regexes you'll ever need", { response: "Email, URL, slug, IPv4, hex color, semver… sheet delivered to {user}." });
  cod("html-entities", "Encode/decode HTML entities", { usage: "/html-entities <text>" });
  cod("unicode-lookup", "Find a character by name", { usage: "/unicode-lookup <name>", response: "{args} → U+{n:2000-9999} ({pick:arrows|math|box drawing|dingbats}, block)." });
  cod("char-info", "Codepoint anatomy of a character", { usage: "/char-info <char>" });
  cod("line-sort", "Sort text lines five ways", { usage: "/line-sort <lines>", response: "Sorted {n:2-400} lines ({pick:asc|desc|natural|length|shuffle})." });
  cod("dedupe-lines", "Remove duplicate lines fast", { usage: "/dedupe-lines <text>", response: "Kept {n:2-400}, dropped {n:0-120} dupes." });

  // ============================ DEVOPS (45) =================================
  const ops = add("devops");
  ops("deploy", "Ship a build to an environment", { usage: "/deploy <env> <tag>", response: "Deploying `{args}` → {pick:blue/green swap complete|canary at 5%|rolling 3/12 pods}. Pipeline #{n:1000-9999}." });
  ops("rollback", "Instant rollback to last healthy", { response: "Rolled back to previous release. MTTR: {n:20-400}s. Nobody saw anything." });
  ops("redeploy", "Re-run the last deploy", {});
  ops("status-page", "Publish incident to status page", { usage: "/status-page <message>", response: "Status page updated: \"{args}\" — subscribers notified." });
  ops("healthcheck", "Run all service health probes", { response: "Probes: {n:12-60}/{n:12-60} green · p99 {n:40-300}ms · 0 dead canaries." });
  ops("host-uptime", "Uptime for a host", { usage: "/host-uptime <host>", response: "{args}: {n:99}.{n:0-9}% over 30d ({n:0-3} blips)." });
  ops("logs-tail", "Tail structured logs", { usage: "/logs-tail <service>", response: "Tailing {args}: [{n:10-59}:{n:10-59}] INFO ready · [{n:10-59}:{n:10-59}] WARN retry {n:1-5} · (stream paused)" });
  ops("metrics-now", "Live CPU/mem/req dashboard", { usage: "/metrics-now <service>", response: "{args}: cpu {n:2-95}% · mem {n:100-8000}Mi · rps {n:10-9000}." });
  ops("scale", "Scale replicas up/down", { usage: "/scale <service> <n>", permissions: ["Manage Server"], response: "Scaled {args} — HPA appeased." });
  ops("restart-app", "Rolling restart a service", { usage: "/restart-app <service>", permissions: ["Manage Server"], response: "Rolling restart: {n:2-24} pods cycled, zero dropped connections." });
  ops("drain-node", "Drain a node for maintenance", { usage: "/drain-node <node>", permissions: ["Manage Server"] });
  ops("cordon-node", "Mark node unschedulable", { usage: "/cordon-node <node>", permissions: ["Manage Server"] });
  ops("secrets-rotate", "Rotate environment secrets", { premium: true, permissions: ["Administrator"], response: "Rotated {n:3-40} secrets across {n:2-12} services. Old values cremated." });
  ops("cert-check", "TLS cert validity for a domain", { usage: "/cert-check <domain>", response: "{args}: expires in {n:1-300} days, chain {pick:valid|mildly suspicious}." });
  ops("ssl-expiry", "All certs nearing expiry", { response: "Cert watch: {n:0-4} certs expire within 30 days." });
  ops("dns-lookup", "Resolve any record type", { usage: "/dns-lookup <domain> [type]", response: "{args} → {n:1-8} records ({pick:A|AAAA|CNAME|MX} shown)." });
  ops("whois-lookup", "Domain registration intel", { usage: "/whois-lookup <domain>", response: "{args}: registered {n:1-25}y ago via {pick:Cloudflare|Namecheap|Porkbun}, renews in {n:10-360}d." });
  ops("ping-host", "ICMP-style reachability check", { usage: "/ping-host <host>", response: "{args}: {n:8-90}ms avg, {n:0-2}% loss ({pick:healthy|flappy|vertical})." });
  ops("port-check", "Is that port open?", { usage: "/port-check <host> <port>" });
  ops("site-check", "Full page availability snapshot", { usage: "/site-check <url>", response: "{args}: HTTP {pick:200|204|301} in {n:80-2400}ms from {n:3-9} regions." });
  ops("webhook-test", "Fire a test payload", { usage: "/webhook-test <url>", response: "Test event delivered → {pick:200 OK|408 timeout|502 gateway shrug}." });
  ops("ci-run", "Trigger a CI workflow", { usage: "/ci-run <workflow>", response: "Workflow `{args}` queued — ETA {n:1-25} min. Watching." });
  ops("ci-status", "Pipeline board for main", { response: "main: build {pick:passing|flaky} · tests {n:400-4000} ✓ · {n:0-6} flakes quarantined." });
  ops("build-time", "Build duration trends", { response: "Builds: {n:2-40}m median ({pick:improving|degrading|cursed} trend)." });
  ops("artifact-size", "Bundle/artifact size report", { response: "Bundle: {n:100-4000}kb gzip ({pick:+|-}{n:0-30}kb vs last week). Budget: {pick:met|blown}." });
  ops("release-notes", "Draft notes from merged PRs", { response: "{n:3-40} PRs summarized: {n:1-20} features, {n:0-12} fixes, {n:0-3} breaking. Notes drafted." });
  ops("changelog-gen", "Conventional-commit changelog", {});
  ops("version-bump", "Bump + tag a release", { usage: "/version-bump <part>", permissions: ["Manage Server"], response: "Tagged v{n:1-9}.{n:0-30}.{n:0-99} — release CI spinning." });
  ops("env-audit", "Diff env vars across environments", { premium: true, response: "Env audit: {n:0-8} missing in prod, {n:0-4} stale in staging, {n:0-2} suspicious." });
  ops("docker-size", "Image layer breakdown", { usage: "/docker-size <image>", response: "{args}: {n:50-1800}MB over {n:5-40} layers. Chunkiest: {pick:node_modules|that one COPY . layer|ffmpeg}." });
  ops("k8s-pods", "Live pod board", { response: "{n:4-60}/{n:4-60} running · {n:0-3} crashlooping ({pick:oom-killed|imagepullblunder|config typo})." });
  ops("k8s-logs", "Stream pod logs", { usage: "/k8s-logs <pod>" });
  ops("bucket-size", "Object storage usage", { response: "Buckets: {n:1-90} TB total, heaviest: {pick:backups|media|that-never-cleaned-temp} ({n:100-9000}GB)." });
  ops("db-size", "Database size and growth", { response: "Postgres: {n:1-900}GB · +{n:0-40}GB/wk · biggest table: {pick:events|messages|audit_log}." });
  ops("cache-purge", "Purge CDN/Redis caches", { usage: "/cache-purge <scope>", permissions: ["Manage Server"], response: "Purged `{args}` — {n:10-9000} keys evicted." });
  ops("load-test", "Spawn a quick load test", { premium: true, usage: "/load-test <url> <rps>", response: "Load test {args}: held {n:100-50000} rps for {n:30-600}s, p99 {n:50-4000}ms — {pick:unbothered|sweating|face-down}." });
  ops("incident-new", "Open an incident channel", { usage: "/incident-new <sev> <title>", permissions: ["Manage Messages"], response: "INCIDENT {pick:SEV1|SEV2|SEV3} opened: \"{args}\" — commander assigned, updates every {n:5-30}m." });
  ops("incident-close", "Resolve and write postmortem stub", { response: "Incident resolved after {n:10-400}m. Postmortem drafted with {n:2-9} action items." });
  ops("oncall-now", "Who holds the pager", { response: "On-call: {pick:@infra-fox|@night-shift-nia|@pager-pat} (hands over in {n:1-48}h)." });
  ops("runbook", "Fetch the runbook for a service", { usage: "/runbook <service>" });
  ops("cost-report", "Cloud spend breakdown", { premium: true, response: "Spend this month: ${n:100-90000} ({pick:compute|egress|db|cursed NAT gateway} leads) — {pick:+|-}{n:1-40}% MoM." });
  ops("latency-map", "p99 by region", { response: "p99: us-east {n:20-120}ms · eu {n:30-160}ms · apac {n:60-400}ms." });
  ops("region-ping", "Round-trip to a cloud region", { usage: "/region-ping <region>" });
  ops("slo-report", "Error-budget burn this month", { response: "SLO: {n:99}.{n:0-9}% target — budget burn {n:2-140}%, status: {pick:chill|eyes on it|pager energy}." });
  ops("ssh-fingerprint", "Fingerprint out-of-band", { usage: "/ssh-fingerprint <host>", response: "{args}: SHA256:{pick:aB3f9K|Qz88mL|p0oW2s}… (verify out-of-band!) " });

  // ============================ STREAMER (40) ===============================
  const stm = add("streamer");
  stm("shoutout", "Shout out a fellow creator", { usage: "/shoutout <@user>", response: "FOLLOW **{target}** — absolute legend energy, brought to you by {user}." });
  stm("clip", "Clip the last 30 seconds", { response: "Clipped it: `{pick:ClutchOrKick|NoScopeNia|ChairDiff}` — {n:10-400} views already." });
  stm("stream-uptime", "How long we've been live", { response: "Live for {n:0-9}h {n:10-59}m — {n:100-9000} watching." });
  stm("followage", "How long someone followed", { usage: "/followage [@member]", response: "**{target}** followed {n:1-999} days ago. Certified {pick:day-one|veteran|new blood}." });
  stm("subcount", "Current subscriber count", { response: "{n:10-9000} subs strong — {n:0-99} gifted today." });
  stm("subage", "Someone's sub tenure", { usage: "/subage [@member]" });
  stm("viewer-record", "All-time viewer peak", { response: "Peak: {n:100-90000} during \"{pick:the 24h marathon|lag-switch scandal|charity finale}\"." });
  stm("title-set", "Update the stream title", { usage: "/title-set <title>", permissions: ["Manage Messages"], response: "Title → \"{args}\". Let's farm." });
  stm("game-set", "Update the stream category", { usage: "/game-set <game>", permissions: ["Manage Messages"] });
  stm("raid-go", "Send the raid out in style", { usage: "/raid-go <target>", response: "RAIDING **{args}** with {n:10-9000} viewers. Be weird, be kind." });
  stm("raid-in", "Incoming raid protocol", { response: "RAID INBOUND: {n:10-9000} from {pick:a wholesome gremlin crew|the void|speedrun central}. Mods, helmets on." });
  stm("lurk", "Announce a quiet lurk", { response: "{user} fades into lurk mode. Silent support mode: on." });
  stm("unlurk", "Back from lurking", { response: "{user} returns from the shadows. Chat rejoices politely." });
  stm("brb", "AFK with a timer", { response: "{user} went {pick:full goblin (food)|touch grass|water break} — brb in ~{n:2-20}m." });
  stm("imback", "Announce your return", { response: "{user} has returned. The content resumes." });
  stm("hype-train", "Hype train status", { response: "HYPE TRAIN level {n:1-10} at {n:10-99}% — {n:0-99} passengers aboard." });
  stm("emote-stats", "Most spammed emotes", { response: "Top emote: {pick:KEKW|sadgeWave|poggiesSpin} ×{n:100-99999} today." });
  stm("top-chatters", "This stream's chattiest", { response: "Chattiest: top 1 typed {n:100-9000} messages. Fingers resting: no." });
  stm("first", "Claim today's FIRST", { response: "**{user}** claims FIRST. The ceremony is brief but meaningful." });
  stm("song-request", "Request a song to queue", { usage: "/song-request <query>", response: "SR added: \"{args}\" — #{n:1-40} in line." });
  stm("sr-skip", "Skip current SR", { permissions: ["Manage Messages"] });
  stm("sr-list", "View the SR queue", {});
  stm("chat-giveaway", "Keyword giveaway for chat", { usage: "/chat-giveaway <prize>", response: "Type the keyword to enter: \"{args}\" — {n:10-900} entered already." });
  stm("predictions", "Open a channel-points prediction", { usage: "/predictions <question>", response: "Prediction live: \"{args}\" — {pick:YES leads|NO leads|dead even} with {n:100-99999} points in." });
  stm("pts", "Check your channel points", { response: "{user}: {n:100-999999} channel points. Rank #{n:1-999}." });
  stm("pts-top", "Channel points leaderboard", {});
  stm("pts-gamble", "Wager points on the wheel", { usage: "/pts-gamble <amount>", response: "{pick:JACKPOT|Bankrupt|Close one|Ouch} — {user} now at {n:0-999999} pts." });
  stm("pts-roulette", "All-in points spin", { usage: "/pts-roulette [amount]" });
  stm("overlay-link", "Get overlay/browser-source links", { response: "Overlays shipped to {user}'s DMs (alerts, chat, goals)." });
  stm("alerts-test", "Trigger a test alert", { permissions: ["Manage Messages"], response: "Test alert fired: {pick:follow|sub|raid|donation} — OBS {pick:caught it|blinked}." });
  stm("mod-comment", "Highlight a message in chat", { usage: "/mod-comment <text>", permissions: ["Manage Messages"], response: "MOD NOTE: {args}" });
  stm("clip-of-day", "Community clip champion", { response: "Clip of the day: \"{pick:the chair save|pixel-perfect dodge|chat's fault}\" — {n:100-9999} votes." });
  stm("vod-search", "Search past broadcasts", { usage: "/vod-search <query>" });
  stm("stream-schedule", "Weekly stream calendar", { response: "This week: {pick:Tue/Thu/Sat 19:00 UTC|Mon/Wed/Fri speedgrind|Surprise Sunday chaos}." });
  stm("stream-countdown", "Countdown to next stream", { response: "Next stream in {n:1-72}h {n:0-59}m. Hydrate accordingly." });
  stm("charity-goal", "Charathon progress", { response: "Charity: ${n:100-50000} of ${n:1000-100000} — stretch goal {pick:hat pie|24h stream|shave the beard} {pick:LOCKED|UNLOCKED}." });
  stm("live-announce", "Post the go-live card", { permissions: ["Manage Messages"], response: "GOING LIVE card posted everywhere. Discord ping included (the legal kind)." });
  stm("merch-plug", "Drop the merch link tastefully", { response: "Merch drop: {n:1-20} items, starting at ${n:10-60}. {pick:The hoodie slaps|Stickers bleed colour|Limited stock fr}." });
  stm("hot-mic", "Rescue clip of an accidental live mic", { response: "Hot mic moment clipped for review ({n:2-40}s). Cringe rating: {n:1-10}/10. Deleted on request." });
  stm("discord-plug", "Auto-plug this very server", { response: "You're literally already inside it, {user}. But here's the invite anyway." });

  // ============================ CARDS (40) ==================================
  pack("cards", "tarot-", ["fool","magician","high-priestess","empress","emperor","hierophant","lovers","chariot","strength","hermit","wheel-of-fortune","justice","hanged-man","death","temperance","devil","tower","star","moon","sun","judgement","world"],
    (l) => `Meaning of The ${l === "Wheel-of-fortune" ? "Wheel of Fortune" : l} arcana`,
    (l) => `The ${l} — {pick:upright|reversed}: {pick:new beginnings demand nerve|patience beats force today|a door you ignored is open|the joke's on fate, not you}. Read for {user}.`);
  const crd = add("cards");
  crd("tarot-draw", "Single-card daily draw", { response: "{user} draws: **{pick:The Star|The Tower|The Fool|The Sun|The Hermit}** ({pick:upright|reversed}). {pick:Trust the weird pull.|Change is not optional.|Clarity, finally.|Take the nap first.}" });
  crd("three-card", "Past / present / future spread", { response: "Past: {pick:Hermit|Chariot|Moon} · Present: {pick:Star|Tower|Lovers} · Future: {pick:Sun|World|Judgement}. Spicy arc, {user}." });
  crd("celtic-cross", "Full ten-card deep read", { premium: true });
  crd("daily-card", "Your card of the day", {});
  crd("deck-new", "Fresh shuffled 52", { response: "Deck unboxed, jokers {pick:in|out}, riffled ×{n:3-9}." });
  crd("deck-shuffle", "Riffle the current shoe", {});
  crd("card-draw", "Draw from the shoe", { response: "{user} draws the **{pick:A|K|Q|J|10|7|3} of {pick:spades|hearts|clubs|diamonds}**." });
  crd("card-cut", "Cut the deck", {});
  crd("card-peek", "Peek at the top card", { response: "Shh — top card is the {pick:A|K|Q|J|9|2} of {pick:hearts|spades|clubs|diamonds}." });
  crd("uno-draw", "Draw in Uno and pray", { response: "{user} draws: {pick:+4. Tragicomedy.|reverse — chaos pivot|wild. The room holds its breath|blue 7. boring, safe}" });
  crd("uno-stack", "House-rule stacking duel", { usage: "/uno-stack <@member>" });
  crd("war-duel", "Higher card takes the pot", { usage: "/war-duel <@member>", response: "{user} shows {pick:A|K|Q|J|10}, **{target}** shows {pick:A|K|Q|J|9}. {pick:Bloodless victory.|WAR declared.}" });
  crd("poker-hand", "Deal a 5-card hand, ranked", { response: "Dealt: {pick:royal flush (screenshot it)|full house|two pair|ace high, cry quietly}." });
  crd("hearts-pass", "Pass three in Hearts", {});
  crd("magic-trick", "The bot performs a trick", { response: "Pick a card. Any card. ... It's the {pick:7 of clubs|queen of hearts|ace of spades}. {user} is speechless." });
  crd("sleight", "Practice a sleight, get tips", { response: "Sleight rep: {pick:double lift|pinky break|top palm} ×{n:5-50}. {pick:Angles clean.|Mirror says no.|Butter tomorrow.}" });
  crd("flourish", "Rate a cardistry move", { response: "{pick:Charlier|Sybil|Revolution cut}: difficulty {n:1-10}/10, drip {n:1-10}/10." });
  crd("card-tower", "Build the tallest tower", { response: "Tower reached {n:2-30} stories before {pick:a sneeze|gravity remembered|hubris} struck." });

  // ============================ BESTIARY (55) ===============================
  pack("bestiary", "dex-", ["voidmare","emberwhelp","frostjaw","thornling","gleamfox","mudskip","zephyrbat","ironboar","silkmoth","dunecrawler","sparkmite","coralisk","bramblehorn","ashwing","pebblepup","stormray","mossyak","cinderowl","driftfin","gravelurk","bloomdeer","nightjaw","quartzling","rippletoad","smokepanther","sunpetal","tundrawolf","umbrafish","voltgeist","dunesnare","glimmerfin","hollowstag","jetwing","kelpie","lumenmoth","marrowolf","nebulisk","obsidillo","plumefrog","riotbeetle"],
    (l) => `Wilddex entry for ${l}`,
    (l) => `**${l}** — {pick:shadow|ember|frost|bloom|storm} type · habitat: {pick:server archives|the void marsh|raid channels|voice-chat canyon} · temperament: {pick:skittish|loyal|chaotic|sleepy}.`);
  const bst = add("bestiary");
  bst("catch", "Throw an orb at a wild spawn", { response: "Wild {pick:voidmare|gleamfox|mudskip|sparkmite} appeared! Throw… {pick:critical catch!|it broke free|fled immediately|it caught YOU}." });
  bst("pokedex", "Look up any creature by name", { usage: "/pokedex <creature>", aliases: ["dex"] });
  bst("pet-box", "View your stored creatures", { response: "{user}'s box: {n:2-300} stored · showcase {pick:voidmare|stormray|kelpie}." });
  bst("release-pet", "Release one back to the wild", { usage: "/release-pet <creature>", response: "{args} returns to the wild. It looks back once. You're fine. Everyone's fine." });
  bst("rename-pet", "Give a creature a nickname", { usage: "/rename-pet <old> <new>" });
  bst("feed-pet", "Feed berries, gain trust", { usage: "/feed-pet <creature>", response: "{args} devours the {pick:sitrus|charti|liechi} berry. Trust +{n:1-10}." });
  bst("train-pet", "Training session for XP", { usage: "/train-pet <creature>", response: "{args} trains hard: +{n:10-900} XP, learns {pick:Void Gallop|Static Purr|Bramble Charge}." });
  bst("battle-pet", "PvP creature battle", { usage: "/battle-pet <@member>", response: "{user}'s {pick:voidmare|gleamfox} used {pick:Void Gallop|Moon Nibble} — **{target}**'s {pick:mudskip|kelpie} {pick:fainted|held on|dodged stylishly}!" });
  bst("evolve", "Evolve an eligible creature", { usage: "/evolve <creature>", response: "{args} is evolving! ...became **{pick:Mega-{args}|Radiant {args}|Elder {args}}**. Chills." });
  bst("hatch", "Hatch a mystery egg", { response: "Egg hatches into… **{pick:shiny pebblepup! RARE|sparkmite|mudskip|another gravelurk}**!" });
  bst("incubate", "Speed up egg hatch", {});
  bst("safari", "Timed wild-encounter run", { response: "Safari started: {n:3-12} encounters, {n:1-4} orbs. Rare spawn rate {n:1-9}%. Go {user}!" });
  bst("trade-pet", "Propose a creature trade", { usage: "/trade-pet <@member> <creature>" });
  bst("pet-stats", "Full IV/EV readout", { usage: "/pet-stats <creature>", response: "{args}: ATK {n:1-31} DEF {n:1-31} SPD {n:1-31} — nature: {pick:brave|jolly|sassy|literal menace}." });
  bst("dream-team", "Auto-build your best 6", { response: "Dream team: {pick:voidmare|stormray|kelpie|gleamfox|frostjaw|sunpetal}. Synergy score {n:60-99}." });

  // ============================ SPACE (35) ==================================
  pack("space", "planet-", ["mercury","venus","mars","jupiter","saturn","uranus","neptune","earth","pluto"],
    (l) => `${l} briefing: size, orbit, fun fact`,
    (l) => `**${l}**: {pick:rocky|gas giant|ice giant|dwarf} · day length {n:10-9999}h · fun fact: {pick:rains metal sideways|could float in a bathtub|is aggressively beige|still a planet in our hearts}.`);
  pack("space", "moon-", ["io","europa","ganymede","callisto","titan","enceladus"],
    (l) => `Profile of the moon ${l}`,
    (l) => `**${l}**: {pick:volcanic pizza world|subsurface ocean candidate|bigger than Mercury|geyser machine}. Status: {pick:studied|dreamed-about}.`);
  const spc = add("space");
  spc("apod", "Astronomy picture of the day", { response: "APOD: \"{pick:The Pelican Nebula|Saturn's Hexagon|A Transit of Io}\" — jaw officially dropped." });
  spc("iss-track", "Where the ISS is right now", { response: "ISS over {pick:the Pacific|Madagascar|the Atlantic|your childhood home|Patagonia} at {n:27000-28000} km/h." });
  spc("next-launch", "Upcoming rocket launches", { response: "Next: {pick:Falcon 9|Starship|Electron|H3} in {n:1-120}h — {pick:Starlink batch|crewed|moon cargo|mystery payload}." });
  spc("launch-alert", "Subscribe to launch pings", { usage: "/launch-alert [agency]" });
  spc("spacex-latest", "Latest SpaceX mission debrief", {});
  spc("starship-watch", "Starship prototype tracker", { response: "Ship {n:20-99}: {pick:static fire ✓|stacked|awaiting FAA paperwork|doing a spin}." });
  spc("mars-weather", "Elysium Planitia forecast", { response: "Mars: high -{n:10-40}°C, low -{n:60-110}°C, wind {n:2-40} m/s. Pack literally everything." });
  spc("exoplanet", "Random confirmed exoplanet", { response: "Kepler-{n:100-4000}{pick:b|c|d}: {pick:hot Jupiter|super-Earth|mini-Neptune}, {n:2-900} light-years away, {pick:tidally roasted|potentially soggy}." });
  spc("asteroid-watch", "Near-Earth objects this week", { response: "{n:1-12} NEOs this week — biggest {n:10-900}m passing at {n:1-20} lunar distances. All miss. Probably." });
  spc("neo-feed", "Live NEO feed", {});
  spc("solar-flare", "Current solar activity", { response: "Sun: {pick:quiet|grumpy|X-class drama} — flare class {pick:A|B|C|M|X}{n:1-9}. Radio blackouts: {pick:none|polar|brief}." });
  spc("aurora-watch", "Aurora forecast by latitude", { response: "Kp index {n:1-9} — aurora visible down to {n:40-70}° latitude tonight. Cameras up." });
  spc("moon-phase", "Tonight's lunar phase", { response: "Moon: {pick:waxing gibbous|full|new|waning crescent} ({n:1-100}% lit). {pick:Werewolf shift: soon|Great telescope night}." });
  spc("next-eclipse", "Upcoming eclipses worldwide", { response: "Next {pick:total solar|annular|lunar} eclipse: {n:30-800} days, path crosses {pick:the Andes|SE Asia|your dreams}." });
  spc("star-chart", "Tonight's sky for your location", { usage: "/star-chart <city>" });
  spc("night-sky", "What's up tonight", { response: "Tonight: {pick:Jupiter near the moon|ISS pass at dusk|meteor shower peak|Saturn's rings open wide}." });
  spc("sat-pass", "Visible satellite passes", { usage: "/sat-pass <city>" });
  spc("lightyear-calc", "Light-year ⇄ km converter", { usage: "/lightyear-calc <n>" });
  spc("blackhole-fact", "A terrifyingly fun singularity fact", { response: "{pick:Spaghettification is the technical term and scientists love it|Time stops at the event horizon, socially awkward|Stellar black holes can spin at ~light speed}." });
  spc("voyager-status", "Voyager 1/2 deep-space vitals", { response: "Voyager 1: {n:160-170} AU out, {n:22-23}h radio one-way, running on {pick:spite and plutonium|1977 code}." });

  // ============================ RADIO (25) ==================================
  pack("radio", "radio-", ["lofi","synthwave","phonk","jazz","classical","ambient","techno","house","dnb","trap","reggaeton","kpop","jpop","metal","punk","blues","country","rnb","gospel","salsa","bossanova","vaporwave","chiptune","citypop","hardstyle"],
    (l) => `24/7 ${l} station in voice`,
    (l) => `Tuned to **${l} FM** — now playing \"{pick:Midnight Compiler|Neon Rain|Sunset Grid|Vinyl Heart|Chrome Tide}\". {user} controls the dial.`,
    { cooldown: 8 });

  // ============================ WELLNESS (25) ===============================
  const wel = add("wellness");
  wel("breathe", "Guided box-breathing round", { response: "In 4… hold 4… out 4… hold 4. ×{n:3-8} rounds, {user}. Shoulders down." });
  wel("meditate", "Short guided reset", { usage: "/meditate [minutes]", response: "{n:2-20}-minute session queued. Notifications can wait; you can't." });
  wel("water-check", "Log a glass of water", { response: "{user} logged glass #{n:1-12} today. Kidneys send thanks." });
  wel("posture-ping", "Instant posture intervention", { response: "Unfold, {user}. Screen at eye level. Spine: not a croissant." });
  wel("eye-rest", "20-20-20 rule timer", { response: "Look at something 20ft away for 20s. Starting now, {user}." });
  wel("stretch-reminder", "Desk stretch circuit", { response: "Circuit: neck rolls ×{n:4-10}, shoulder shrugs ×{n:6-15}, wrist circles ×{n:6-12}." });
  wel("pomodoro", "Start a focus cycle", { usage: "/pomodoro [work] [break]", response: "Pomodoro: {n:20-50}m deep work armed. Discord goes quiet. Ship something." });
  wel("focus-timer", "Custom focus timer", { usage: "/focus-timer <minutes>" });
  wel("sleep-calc", "Bedtime by sleep cycles", { usage: "/sleep-calc <wake time>", response: "For {args} wake: sleep at {pick:22:45|23:15|00:15} for clean 90-min cycles." });
  wel("wake-calc", "Best wake times from now", { response: "Sleep now → wake at +{n:5-9}h {n:0-59}m ({n:4-6} full cycles)." });
  wel("gratitude", "Bank one good thing", { usage: "/gratitude <thing>", response: "Noted in the good-things ledger: \"{args}\" — entry #{n:1-999} for {user}." });
  wel("affirm", "A no-cheese affirmation", { response: "{pick:You shipped yesterday. You can ship today.|Rest is a feature, not a bug.|Your worst PR was still a PR.|Hydration is a personality now.}" });
  wel("mood-log", "Today's mood, quantified", { usage: "/mood-log <1-10> [note]", response: "Logged {args}. Trend: {pick:climbing|flat|needs a walk and a snack}." });
  wel("mood-stats", "Your mood trendline", {});
  wel("journal-prompt", "A prompt worth writing on", { response: "Prompt: {pick:What would you do with 10% more courage?|Describe today as a tweet to your future self.|What drained you that nobody noticed?}" });
  wel("habit-add", "Track a new habit", { usage: "/habit-add <habit>", response: "Habit armed: \"{args}\" — daily ping, zero shame, streaks enabled." });
  wel("habit-done", "Check off today's habit", { usage: "/habit-done <habit>" });
  wel("habit-list", "All tracked habits", {});
  wel("streaks", "Your active streak board", { response: "Streaks: coding {n:2-300}d · water {n:1-60}d · touching grass {n:0-12}d." });
  wel("screen-time", "Confess your screen time", { response: "{user}: {n:2-16}h today. {pick:The sun misses you|Respectable|Simply digital}." });
  wel("brain-break", "Two-minute mental palate cleanser", { response: "Break quest: {pick:name 5 blue things near you|humsync to your pulse|stare outside, find a bird}." });
  wel("walk-ping", "The bot demands a walk", { response: "Walk protocol: {n:5-30} minutes, no podcasts, eyes up. Go." });
  wel("stand-up", "Stand reminder that isn't annoying", { response: "On your feet, {user}. 60 seconds. The chair will survive the separation." });
  wel("bmi-calc", "BMI quick math (grain of salt)", { usage: "/bmi-calc <kg> <cm>" });
  wel("water-goal", "Set daily hydration target", { usage: "/water-goal <glasses>", response: "Goal: {args} glasses/day. The plants are jealous." });

  // ============================ LANGUAGE (30) ===============================
  const lng = add("language");
  lng("wordoftheday", "A word to weaponize today", { aliases: ["wotd"], response: "**{pick:petrichor|ultracrepidarian|susurrus|defenestration}** — {pick:smell of rain on dust|opinions beyond knowledge|a soft whispering|throwing things out windows}." });
  lng("thesaurus", "Synonym storm for a word", { usage: "/thesaurus <word>", response: "{args} ≈ {pick:luminous, radiant, lambent|swift, fleet, alacritous|calm, placid, halcyon}." });
  lng("synonym", "Closest synonyms", { usage: "/synonym <word>" });
  lng("antonym", "Closest antonyms", { usage: "/antonym <word>" });
  lng("rhyme", "Perfect rhymes", { usage: "/rhyme <word>", response: "{args} rhymes with: {pick:flow, glow, undertow|bright, ignite, satellite|stone, alone, backbone}." });
  lng("near-rhyme", "Slant rhymes for real poets", { usage: "/near-rhyme <word>" });
  lng("syllables", "Count syllables of anything", { usage: "/syllables <text>", response: "\"{args}\": {n:1-12} syllables — {pick:haiku legal|haiku war crime}." });
  lng("homophone", "Words that sound identical", { usage: "/homophone <word>", response: "{args} ≈ sounds-like: {pick:flour/flower|knight/night|cite/site/sight}." });
  lng("etymology", "Where that word came from", { usage: "/etymology <word>", response: "{args} ← {pick:Latin via grumpy monks|Greek sailors|Old Norse raiders|a 1611 typo that stuck}." });
  lng("sentence-use", "Example sentence for a word", { usage: "/sentence-use <word>", response: "\"{args}\" in the wild: {pick:The committee's ultracrepidarian hour began at nine.|Her susurrus carried across the archive.|He left via defenestration, metaphorically.}" });
  lng("define", "Real dictionary definition", { usage: "/define <word>", response: "{args}: ({pick:noun|verb|adjective}) {pick:a soft whispering sound|one who acts beyond their knowledge|the scent of rain on dry earth}." });
  lng("spellcheck", "Fix your typos mercilessly", { usage: "/spellcheck <text>", response: "{n:0-6} fixes applied to {args}. \"{pick:definitely|separate|occurrence}\" can no longer hurt you." });
  lng("spellbee", "Spelling bee duel mode", { usage: "/spellbee <@member>", response: "Round 1: {pick:onychophagia|susurrus|bourgeoisie}. **{target}** sweats. {user} smiles." });
  lng("vocab-quiz", "Vocabulary gauntlet", { response: "Quiz: \"halcyon\" means? A) {pick:calm|metallic|ancient} B) {pick:stormy|golden|calm} — 15s, {user}." });
  lng("word-chain", "Chain game off your last letter", { usage: "/word-chain <word>", response: "\"{args}\" ends in... bot answers **{pick:ember|riddle|nectar}**. Your move." });
  lng("idiom", "Idiom + what it actually means", { response: "Idiom: \"{pick:beat around the bush|bite the bullet|cut corners}\" — origin: {pick:hunting, literally|battlefield surgery|carpentry}." });
  lng("proverb", "Ancient wisdom deluxe", { response: "{pick:The best time to plant a tree was 20 years ago. The second best is now.|A smooth sea never made a skilled sailor.|Measure twice, deploy once.}" });
  lng("tongue-twister", "Destroy your own mouth", { response: "Try: \"{pick:Six sleek swans swam swiftly southwards|Red lorry, yellow lorry, thrice|She sells seashells at hyperspeed}\" — attempts: {n:1-9}." });
  lng("pun", "A pun of variable legality", { response: "{pick:I used to be a banker, but I lost interest.|Time flies like an arrow; fruit flies like a banana.|I'm reading a book about mazes — I got lost in it.}" });
  lng("haiku-gen", "Instant five-seven-five", { response: "{pick:deploy on friday|the li build goes green|prod and i, at peace} — a haiku for {user}." });
  lng("limerick", "Five lines of chaos, rhymed", { response: "There once was a mod from {pick:the queue|south queue}… (rest withheld for public safety)." });
  lng("name-meaning", "Origin of a first name", { usage: "/name-meaning <name>", response: "{args}: {pick:bearer of light|little fire|defender of stacks} — roots: {pick:Greek|Norse|Arabic|Japanese}." });
  lng("detect-language", "Identify a text's language", { usage: "/detect-language <text>", response: "\"{args}\" is {pick:Portuguese (92%)|Japanese (99%)|cursive Elvish (probably)}." });
  lng("romanize", "Non-Latin script → Latin", { usage: "/romanize <text>" });
  lng("transliterate", "Script-to-script conversion", { usage: "/transliterate <from> <to> <text>" });
  lng("fingerspell", "ASL fingerspelling guide", { usage: "/fingerspell <word>", response: "Fingerspelling {args}: {n:2-12} letters signed at {n:1-3}/s. Practice video attached." });
  lng("braille", "Text → braille cells", { usage: "/braille <text>" });
  lng("nato-spell", "Spell it like aviation", { usage: "/nato-spell <text>", response: "{args} → {pick:Alfa Bravo Charlie|November Oscar Tango|Sierra Hotel India Papa}…" });
  lng("word-roots", "Greek/Latin root trainer", { response: "Root \"{pick:photo|chrono|dem|hydro}\" = {pick:light|time|people|water}. 3 examples served." });
  lng("solve-anagram", "Unscramble any jumble", { usage: "/solve-anagram <letters>", response: "{args} unscrambles to: {pick:LISTEN / SILENT / ENLIST|TEASER / RETEAS / RESEAT}." });

  // ============================ MEMES (35) ==================================
  pack("memes", "", ["drake","distracted-bf","two-buttons","panik-kalm","expanding-brain","change-my-mind","mock-meme","gru-plan","this-is-fine","doge","stonks","not-stonks","shocked-face","success-kid","bad-luck","one-does-not","squint-fry","batman-slap","disaster-girl","roll-safe","hide-the-pain","ancient-aliens","always-has-been","waiting-skeleton","trade-offer","buff-doge","crying-cat","yelling-cat","left-exit","bike-fall","clown-makeup","side-eye","npc-face","gigachad","touch-grass"],
    (l) => `Caption the ${l} template`,
    (l) => `**${l}** meme rendered: \"{args}\" — posted for {user}. Ratio pending.`,
    { usageT: "/_ <top text>" });

  // ============================ MATH (45) ===================================
  const mth = add("math");
  mth("prime", "Primality test, instantly", { usage: "/prime <n>", response: "{args} is {pick:PRIME — a lone wolf|composite ({n:2-999} × {n:2-999})|1, which is neither, fight me}." });
  mth("primes-range", "List primes in a range", { usage: "/primes-range <a> <b>", response: "{n:2-900} primes between {args}." });
  mth("fibonacci", "Nth Fibonacci number", { usage: "/fibonacci <n>", response: "fib({args}) = {n:100-99999} (computed in {n:1-9}ms, no recursion trauma)." });
  mth("factorial", "n! for the brave", { usage: "/factorial <n>", response: "{args}! ≈ {n:1000-99999}… ({pick:120 digits|still finite|do not paste in chat})^." });
  mth("gcd", "Greatest common divisor", { usage: "/gcd <a> <b>", response: "gcd({args}) = {n:1-99}." });
  mth("lcm", "Least common multiple", { usage: "/lcm <a> <b>" });
  mth("quadratic", "Solve ax²+bx+c=0", { usage: "/quadratic <a> <b> <c>", response: "Roots: {pick:x = 2 and x = -3|x = 0.5 ± 1.3i (complex, classy)|x = 4 (double root)}." });
  mth("linear-solve", "Solve a linear equation", { usage: "/linear-solve <eq>", response: "{args} → x = {n:-9-99}." });
  mth("cubic-solve", "Third-degree solver", { usage: "/cubic-solve <coeffs>" });
  mth("matrix-add", "A+B for matrices", { usage: "/matrix-add <A> <B>" });
  mth("matrix-mul", "A×B for matrices", { usage: "/matrix-mul <A> <B>", response: "Product computed ({n:2-9}×{n:2-9}). Determinant: {n:-99-999}." });
  mth("determinant", "det(A) with steps", { usage: "/determinant <A>" });
  mth("matrix-inverse", "Invertible? Inverse found", { usage: "/matrix-inverse <A>", response: "{pick:Inverse exists and it's pretty|singular matrix, no inverse — det=0}." });
  mth("vector-dot", "Dot product", { usage: "/vector-dot <u> <v>", response: "u·v = {n:-99-999} → {pick:orthogonal! perpendicular vibes|acute angle|wildly parallel}." });
  mth("vector-cross", "Cross product", { usage: "/vector-cross <u> <v>" });
  mth("mean", "Average of a series", { usage: "/mean <numbers>", response: "mean({args}) = {n:1-999}.{n:0-99}." });
  mth("median", "Middle value of a series", { usage: "/median <numbers>" });
  mth("mode", "Most frequent value", { usage: "/mode <numbers>" });
  mth("stdev", "Standard deviation", { usage: "/stdev <numbers>", response: "σ = {n:1-99}.{n:0-99} — {pick:tight cluster|absolute spread goblin}." });
  mth("variance", "Variance of a series", { usage: "/variance <numbers>" });
  mth("percentile", "Which percentile is x?", { usage: "/percentile <data> <x>", response: "{args} → p{n:1-99}." });
  mth("zscore", "How weird is that value", { usage: "/zscore <x> <mean> <sd>", response: "z = {pick:+|-}{n:0-4}.{n:0-9} — {pick:totally normal|suspicious|statistically feral}." });
  mth("correlation", "r between two series", { usage: "/correlation <x..> <y..>", response: "r = {pick:+|-}0.{n:10-99}: {pick:strong|meh|nonexistent} (causation: not included)." });
  mth("regression", "Least-squares line", { usage: "/regression <points>", response: "y = {n:0-9}.{n:0-9}x {pick:+|-} {n:0-99} — R² = 0.{n:30-99}." });
  mth("comb", "n choose k", { usage: "/comb <n> <k>", response: "C({args}) = {n:10-99999} ways." });
  mth("perm", "nPk, order matters", { usage: "/perm <n> <k>" });
  mth("binomial", "Binomial coefficient style probs", { usage: "/binomial <n> <p> <k>" });
  mth("prob-bin", "P(exactly k successes)", { usage: "/prob-bin <n> <p> <k>", response: "P = {n:1-99}%. Vegas is sweating." });
  mth("percent-change", "Old → new % change", { usage: "/percent-change <old> <new>", response: "{args} → {pick:+|-}{n:1-400}%." });
  mth("compound", "Compound interest projector", { usage: "/compound <P> <r%> <years>", response: "{args} → {n:1000-99999} after all that patience." });
  mth("simple-interest", "I = Prt", { usage: "/simple-interest <P> <r> <t>" });
  mth("tip-split", "Bill ÷ friends + tip", { usage: "/tip-split <bill> <people> [tip%]", response: "Each pays {n:5-400} ({n:10-25}% tip included). Friend who \"forgot wallet\": detected." });
  mth("trig-table", "sin/cos/tan for an angle", { usage: "/trig-table <deg>", response: "{args}° → sin {n:0-1}.{n:0-9}, cos {n:0-1}.{n:0-9}." });
  mth("log-calc", "log base anything", { usage: "/log-calc <base> <x>", response: "log({args}) = {n:0-9}.{n:0-99}." });
  mth("exp-calc", "e^x and friends", { usage: "/exp-calc <x>" });
  mth("root-calc", "Nth root", { usage: "/root-calc <n> <x>", response: "√[{args}] = {n:1-99}.{n:0-999}." });
  mth("base-convert", "Binary/oct/dec/hex switch", { usage: "/base-convert <num> <from> <to>", response: "{args} → {pick:0xFF2A|0b101101|0o754} etc." });
  mth("roman", "Number → Roman numeral", { usage: "/roman <n>", response: "{args} → {pick:MMXXVI|CDXLIV|DCCCXC}." });
  mth("from-roman", "Roman numeral → number", { usage: "/from-roman <numeral>" });
  mth("frac-simplify", "Reduce a fraction", { usage: "/frac-simplify <a/b>", response: "{args} → {n:1-99}/{n:1-99}." });
  mth("ratio-simplify", "Cleanest a:b form", { usage: "/ratio-simplify <a:b>" });
  mth("golden-ratio", "φ-cut a length", { usage: "/golden-ratio <length>", response: "φ split: {n:1-99}.{n:0-9} / {n:1-99}.{n:0-9}. Aesthetically mandatory." });
  mth("pi-digits", "π to your chosen cruelty", { usage: "/pi-digits <n>", response: "π({args} digits) starts 3.{n:1000-9999}… — computed fresh, no caching, respect." });
  mth("collatz", "Hailstone sequence steps", { usage: "/collatz <n>", response: "{args} hits 1 in {n:5-999} steps, peaking at {n:100-99999}. Conjecture: alive." });
  mth("perfect-num", "Is it a perfect number", { usage: "/perfect-num <n>", response: "{args}: {pick:PERFECT — divisors sum exactly|abundant|deficient, like my sleep}." });

  // ============================ SCIENCE (35) ================================
  pack("science", "element-", ["hydrogen","helium","lithium","beryllium","boron","carbon","nitrogen","oxygen","fluorine","neon","sodium","magnesium","aluminum","silicon","phosphorus","sulfur","chlorine","argon","potassium","calcium","iron","copper","silver","tin","iodine","gold","mercury","lead","platinum","uranium"],
    (l) => `Atomic profile of ${l}`,
    (l) => `**${l}**: #{n:1-92} · {pick:reactive drama queen|noble and aloof|backbone of everything|explodes near water} · uses: {pick:batteries|lasers|bones|semiconductors|coins|.}`);
  const sci = add("science");
  sci("mole-calc", "Moles ↔ grams ↔ particles", { usage: "/mole-calc <grams> <molar mass>", response: "{args} → {n:1-9}.{n:0-9} mol ≈ {n:1-9}.{n:0-9}×10²³ particles. Avogadro nods." });
  sci("ph-scale", "Where that substance lands on pH", { usage: "/ph-scale <substance>", response: "{args} sits at pH {n:0-14}.{n:0-9} — {pick:basically acid rain|pure-ish|soap-adjacent}." });
  sci("half-life", "Radioactive decay over time", { usage: "/half-life <isotope> <years>", response: "{args}: {n:1-99}% remains — {n:2-9} half-lives deep." });
  sci("constants", "Physics constants reference sheet", { response: "c = 299,792,458 m/s · G = 6.674e-11 · h = 6.626e-34 · π = 3.14159… (the classics)." });
  sci("lab-safety", "Protocol before someone gets hurt", { response: "Rule #{n:1-42}: {pick:goggles before curiosity|label everything, always|the fume hood is not optional|no licking the science}." });

  // ============================ AI (30) =====================================
  const ai = add("ai");
  ai("ask", "Ask the model anything", { usage: "/ask <question>", response: "On \"{args}\": {pick:short answer — yes, with caveats|three schools of thought exist|it depends, and here's the dependency|the honest answer is boring: measure it}." });
  ai("summarize", "TL;DR any wall of text", { usage: "/summarize <text>", response: "TL;DR ({n:1-6} bullets): {args} → mostly {pick:actionable|fluff with one crown jewel|a meeting that should have been this summary}." });
  ai("rewrite", "Same meaning, new clothes", { usage: "/rewrite <text>", response: "Rewritten ({pick:crisper|warmer|45% fewer adjectives}): \"{args}\" — improved." });
  ai("expand-text", "Turn bullets into prose", { usage: "/expand-text <bullets>" });
  ai("eli5", "Explain like I'm five", { usage: "/eli5 <topic>", response: "ELI5 {args}: imagine {pick:a lemonade stand|Lego instructions|pizza-sharing math}… and that's basically it." });
  ai("explain-code", "Walkthrough of code you pasted", { usage: "/explain-code <code>", response: "Your code: {n:2-60} lines, does {pick:input validation|async orchestration|3 crimes against naming|regex sorcery}. Full trace posted." });
  ai("code-review", "Brutal but fair code review", { premium: true, usage: "/code-review <code>", response: "Review ({n:1-12} findings): {pick:naming crimes|missing error path|O(n²) hiding in a loop|surprisingly clean} — details threaded." });
  ai("fix-bugs", "Patch suggestions inline", { usage: "/fix-bugs <code>", response: "Found {n:1-7} likely bugs: {pick:off-by-one|unawaited promise|null route|mutating props like a villain}. Patches attached." });
  ai("gen-readme", "README from your repo desc", { usage: "/gen-readme <about>", response: "README drafted: badges, install, usage, API table, license — {args} edition." });
  ai("gen-commit", "Commit message that passes review", { usage: "/gen-commit <diff summary>", response: "`{pick:fix(auth): guard expired refresh tokens|feat(queue): add dead-letter retry|chore(deps): bump the scary ones}`" });
  ai("gen-tests", "Test cases for a function", { usage: "/gen-tests <signature>", response: "{n:3-12} tests generated: edge cases include {pick:null|empty|unicode chaos|negative zero}." });
  ai("smart-regex", "Describe it, get the regex", { usage: "/smart-regex <description>", response: "For \"{args}\": `/{pick:^\\w+([.-]?\\w+)*@|\\b\\d{3}-\\d{4}\\b|^\\/?[a-z0-9-]+\\$}/{pick:gm|gi}` — tested mentally." });
  ai("imagine", "Prompt-to-image (premium GPU)", { premium: true, usage: "/imagine <prompt>", response: "Rendering \"{args}\" — seeds {n:1000-9999}, steps 30. ETA {n:5-40}s." });
  ai("prompt-helper", "Make your prompt actually work", { usage: "/prompt-helper <draft>", response: "Upgraded prompt ({n:1-9} tweaks): added {pick:constraints|examples|format spec|tone rails}. Cost halved, quality doubled." });
  ai("tone-shift", "Professional ↔ unhinged dial", { usage: "/tone-shift <tone> <text>", response: "Tone shifted to \"{args}\" — HR status: {pick:safe|sweating|summoned}." });
  ai("paraphrase", "Say it differently, keep the spine", { usage: "/paraphrase <text>" });
  ai("brainstorm", "Idea storm on a theme", { usage: "/brainstorm <topic>", response: "{n:5-15} ideas for \"{args}\": best one involves {pick:a leaderboard and spite|scheduled chaos|gamified chores|bots judging bots}." });
  ai("outline", "Structure for docs/talks", { usage: "/outline <topic>" });
  ai("email-draft", "Email you should have sent", { usage: "/email-draft <context>", response: "Draft ready ({pick:firm|friendly|Frank?): greeting, 1 ask, 1 deadline, 0 walls of text." });
  ai("post-draft", "Social post in your voice", { usage: "/post-draft <context>", response: "Draft: hook → punchline → CTA, {n:100-280} chars. Ratio risk: {pick:low|spicy}." });
  ai("reply-draft", "Craft the perfect reply", { usage: "/reply-draft <context>" });
  ai("meeting-notes", "Notes from pasted transcript", { usage: "/meeting-notes <transcript>", response: "Notes: {n:2-9} decisions, {n:1-7} action items, {n:0-4} loops to close. Actual meeting value: {n:1-10}/10." });
  ai("decide", "Structured pick between options", { usage: "/decide <options>", response: "Weighted matrix says: {pick:option 1, confidently|option 2, by a hair|flip a coin, the options are twins}." });
  ai("pros-cons", "Balanced tradeoff table", { usage: "/pros-cons <topic>", response: "On {args}: {n:2-6} pros, {n:2-6} cons, verdict: {pick:ship it|prototype first|touch grass instead}." });
  ai("swot", "Full SWOT breakdown", { usage: "/swot <topic>" });
  ai("rubber-duck", "Talk it out, bot quacks back", { usage: "/rubber-duck <problem>", response: "Quack. So \"{args}\"… have you tried {pick:restarting it with feeling|printing the thing you swore you printed|explaining it again, but slower}? Quack." });
  ai("explain-manager", "Translate tech into manager", { usage: "/explain-manager <topic>", response: "Manager-speak: \"{args}\" → {pick:buying speed with future cleanup|risk we can schedule|the engine smoke is decorative|ROI-flavored words inserted}." });
  ai("jargon-buster", "Decode acronym soup", { usage: "/jargon-buster <text>", response: "Decoded: {n:1-12} acronyms, worst offender: {pick:K8s-adjacent synergies|AI-powered AI|serverless servers}." });
  ai("summarize-thread", "Channel history → digest", { usage: "/summarize-thread [hours]", premium: true, response: "Last {n:1-24}h in one breath: {n:2-40} topics, drama level {n:1-10}, best take: {pick:surprise consensus|well-sourced chaos}." });
  ai("sentiment-scan", "Vibe analysis of a text", { usage: "/sentiment-scan <text>", response: "Sentiment: {n:1-99}% {pick:positive|neutral|passive-aggressive|pure cope}. Confidence: {pick:high|existential}." });

  // ============================ NEWS (25) ===================================
  const nws = add("news");
  nws("headlines", "Top stories right now", { response: "Top {n:3-5}: {pick:chip breakthrough shrinks servers again|space agency teases crewed lunar return|a very large billion-dollar something happened}." });
  nws("breaking", "Alerts from the last hour", { response: "Breaking ({n:2-58}m ago): {pick:major deploy goes weirdly well|internet cable finds new way to break|markets decide feelings matter}." });
  nws("world-news", "Global desk digest", {});
  nws("tech-news", "Silicon and software", { response: "Tech: {pick:new model drops, benchmarks scream|framework 9.0 promises calmness|artisanal RSS makes comeback}." });
  nws("science-news", "Peer-reviewed plot twists", { response: "Science: {pick:material superconducts at slightly less silly temps|octopus dreams filmed|battery density jumps 40%}." });
  nws("gaming-news", "Patches, releases, drama", { response: "Gaming: {pick:patch 6.9 nerfs your main, obviously|indie hit sells a million in a weekend|source 3 when?}." });
  nws("sports-news", "Scores and storylines", { response: "Sports: {pick:underdog arc continues|trade rumor mill overheats|record broken by absolute unit}." });
  nws("business-news", "Markets, mergers, money", {});
  nws("crypto-news", "Chain-side headlines", { response: "Crypto: {pick:ETF inflows hit new high|protocol upgrade cuts fees 90%|influencer learns what liquidity means}." });
  nws("space-news", "Launches and discoveries", {});
  nws("dev-news", "For people who ship", { response: "Dev: {pick:Node 26 lands|PostgreSQL gets even more smug|someone rewrote it in Rust again, and it's great}." });
  nws("ai-news", "Model drops and papers", { response: "AI: {pick:new open model eats benchmarks|agents now schedule your meetings poorly|context windows measured in libraries}." });
  nws("security-news", "CVEs and breach watch", { response: "Sec: {pick:critical lib vulnerability — patch now|honeypot catches botnet family photo|npm package with 40M downloads learns about 2FA}." });
  nws("market-news", "Street-level tape", {});
  nws("region-news", "Focus on a region", { usage: "/region-news <region>", response: "{args}: {n:3-9} stories — top: {pick:infrastructure milestone|election season arithmetic|festival breaks records}." });
  nws("news-search", "Search the wire", { usage: "/news-search <query>", response: "\"{args}\": {n:3-4000} results. Top source: {pick:Reuters|AP|a very confident blog}." });
  nws("daily-digest", "Your morning five", { response: "Digest: 2 world · 1 tech · 1 science · 1 wildcard. Ready in {n:10-60}s reads each." });
  nws("weekly-digest", "The week, compressed", {});
  nws("fact-check", "Verify a claim quickly", { usage: "/fact-check <claim>", response: "Claim \"{args}\": rated **{pick:TRUE|MOSTLY TRUE|MIXED|NEEDS CONTEXT|FALSE}** — {n:2-8} sources cited." });
  nws("headline-quiz", "Guess the real headline", { response: "Which is real? A) {pick:Local council bans meetings after 9pm}|UPS drivers unionize by JavaScript|C) {pick:Goat elected honorary mayor again}. Vote below!" });
  nws("source-compare", "Same story, two outlets", { usage: "/source-compare <topic>", response: "{args}: outlet A leads with {pick:data|drama}, outlet B with {pick:context|outrage}. Reality: somewhere in the footnotes." });
  nws("archive-search", "This day in headlines", { usage: "/archive-search <date>" });
  nws("press-summary", "Longread → 5 bullets", { usage: "/press-summary <url>", response: "Compressed: {n:3-7} bullets, {n:0-2} ads survived. Reading time saved: {n:4-20} min." });
  nws("trending-topics", "What the internet argues about", { response: "Trending: {pick:#ShipItFriday|#TouchGrassChallenge|#PromptGolf|#DeployAndPray} — {n:1-900}k posts." });
  nws("news-brief", "60-second world brief", { response: "In 60s: markets {pick:up|down|confused}, science {pick:won|did a thing}, sports {pick:chaos|also chaos}, weather {pick:exists}." });

  // -- materialize ------------------------------------------------------------------
  const out: SeedCommand[] = rows.map((tuple) => {
    const [name, description, opts] = tuple;
    const category = tuple.category;
    return {
      name,
      description,
      category,
      usage: opts?.usage ?? `/${name}${/ask|imagine|summarize|rewrite|define|quote$/.test(name) ? ` ${TEXT}` : ""}`,
      aliases: opts?.aliases ?? [],
      permissions: opts?.permissions ?? [],
      cooldown: opts?.cooldown ?? 5,
      response: opts?.response ?? fallback(category, name),
      premium: opts?.premium ?? false,
    };
  });

  const seen = new Set<string>();
  for (const c of out) {
    if (seen.has(c.name)) throw new Error(`Pack duplicate command name: ${c.name}`);
    seen.add(c.name);
  }
  if (out.length !== 600) throw new Error(`Expected 600 pack commands, got ${out.length}`);
  return out;
}

export const PACK_COMMANDS = buildPacks();
