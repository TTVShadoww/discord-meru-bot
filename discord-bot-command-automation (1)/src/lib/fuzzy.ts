// Lightweight fuzzy matcher: subsequence matching with bonuses for prefix hits
// and word-boundary hits. Returns [score, command] sorted best-first.

export interface FuzzyItem {
  name: string;
  description: string;
  category: string;
  aliases?: string[];
}

export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (!q) return 0;
  if (t === q) return 1000;
  if (t.startsWith(q)) return 500 - (t.length - q.length);
  if (t.includes(q)) return 250 - t.indexOf(q);

  // subsequence walk
  let score = 0;
  let ti = 0;
  let streak = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    let found = -1;
    for (let j = ti; j < t.length; j++) {
      if (t[j] === ch) {
        found = j;
        break;
      }
    }
    if (found === -1) return 0;
    streak = found === ti ? streak + 1 : 0;
    score += 8 + streak * 4;
    if (found === 0 || t[found - 1] === "-" || t[found - 1] === " " || t[found - 1] === "/") score += 12;
    ti = found + 1;
  }
  return Math.max(0, score - Math.floor((t.length - q.length) / 3));
}

export function fuzzyRank<T extends FuzzyItem>(query: string, items: T[], limit = 10): T[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return items
    .map((item) => {
      const nameScore = fuzzyScore(q, item.name) * 2;
      const aliasScore = (item.aliases ?? []).reduce((best, a) => Math.max(best, fuzzyScore(q, a) * 1.8), 0);
      const catScore = fuzzyScore(q, item.category) * 0.8;
      const descScore = fuzzyScore(q, item.description) * 0.5;
      return { item, score: Math.max(nameScore, aliasScore, catScore, descScore) };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);
}

/** Natural-language → command intent. Returns best guess + confidence 0..1. */
export function interpret(query: string, items: FuzzyItem[]): { command: FuzzyItem; confidence: number } | null {
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let best: { item: FuzzyItem; score: number } | null = null;
  for (const item of items) {
    const haystack = `${item.name} ${item.category} ${item.description}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (item.name === w) score += 60;
      else if (item.name.includes(w)) score += 28;
      else if (haystack.includes(w)) score += 10;
    }
    // phrase-level bonus
    const phraseScore = fuzzyScore(query.slice(0, 20), item.description);
    score += phraseScore * 0.2;
    if (!best || score > best.score) best = { item, score };
  }
  if (!best || best.score < 14) return null;
  const confidence = Math.min(0.97, best.score / 100);
  return { command: best.item, confidence };
}
