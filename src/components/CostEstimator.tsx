import { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Lightweight in-browser "model" trained from the Google Sheet
// It parses the CSV and builds a site -> phase cost map, plus simple NLP to parse queries

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/11R89HLUL7RdGW2TkvMnvZxTHX5bayJX_L78S87cTU5s/export?format=csv";

type PhaseKey = "initial" | "continuing" | "last";

interface SiteCosts {
  site: string;
  costs: Partial<Record<PhaseKey, number>>; // per-patient cost in USD (as provided)
}

interface Model {
  sites: SiteCosts[];
  siteIndex: Map<string, SiteCosts>;
  siteAliases: Map<string, string>; // alias(normalized) -> canonical site
  phaseAliases: Map<string, PhaseKey>;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMoney(val: unknown): number | null {
  if (val == null) return null;
  const raw = String(val);
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

function formatUSD(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: n >= 1000 ? 0 : 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(0)}`;
  }
}

function detectColumns(headers: string[]) {
  // Try to find flexible header names
  const find = (rx: RegExp) => headers.find((h) => rx.test(h.toLowerCase()));
  const siteKey = find(/site|cancer/);
  const initialKey = find(/initial/);
  const continuingKey = find(/continuing/);
  const lastKey = find(/last.*(life|year)|end.*life|terminal/);
  return { siteKey, initialKey, continuingKey, lastKey } as const;
}

function buildAliasesFromSites(sites: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const s of sites) {
    const norm = normalize(s);
    map.set(norm, s);

    // heuristic aliases
    const tokens = norm.split(" ");
    for (const tok of tokens) {
      if (tok.length >= 5) map.set(tok, s);
    }

    // specific common aliases
    if (/colorectal|colon|rect/i.test(s)) {
      map.set("colon", s);
      map.set("rectal", s);
      map.set("colorectal", s);
    }
    if (/uterine|endometr/i.test(s)) {
      map.set("uterine", s);
      map.set("endometrial", s);
    }
    if (/non.*hodgkin/i.test(s)) map.set("nhl", s);
    if (/hodgkin/i.test(s)) map.set("hodgkin", s);
    if (/head.*neck/i.test(s)) map.set("head and neck", s);
  }
  return map;
}

function makePhaseAliases(): Map<string, PhaseKey> {
  const m = new Map<string, PhaseKey>();
  const add = (keys: string[], v: PhaseKey) => keys.forEach((k) => m.set(k, v));
  add(
    [
      "initial",
      "first year",
      "newly diagnosed",
      "diagnosis",
      "active treatment",
      "treatment",
      "chemo",
      "radiation",
      "surgery",
    ],
    "initial"
  );
  add(["continuing", "maintenance", "long term", "follow up", "survivorship"], "continuing");
  add(
    [
      "last",
      "last year",
      "last year of life",
      "end of life",
      "terminal",
      "palliative",
      "hospice",
    ],
    "last"
  );
  return m;
}

function scoreSimilarity(a: string, b: string) {
  // simple token overlap
  const A = new Set(a.split(" "));
  const B = new Set(b.split(" "));
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.max(1, Math.min(A.size, B.size));
}

export default function CostEstimator() {
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<Model | null>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const { toast } = useToast();
  const trainedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(SHEET_CSV_URL);
        if (!res.ok) throw new Error(`Failed to fetch data (${res.status})`);
        const text = await res.text();
        // Clean preface rows so the header begins at "Cancer Site,..."
        const lines = text.split(/\r?\n/);
        const headerIdx = lines.findIndex((l) => /^Cancer Site,/i.test(l.trim()));
        const cleanText = headerIdx >= 0 ? lines.slice(headerIdx).join("\n") : text;

        const parsed = Papa.parse<Record<string, unknown>>(cleanText, {
          header: true,
          dynamicTyping: false,
          skipEmptyLines: true,
        });
        if (parsed.errors?.length) {
          // not fatal; proceed with parsed data
          // console.warn("CSV parse warnings", parsed.errors);
        }
        const rows = parsed.data.filter((r) => r && Object.keys(r).length > 0);
        if (!rows.length) throw new Error("No rows found in dataset");

        const headers = parsed.meta.fields ?? Object.keys(rows[0] ?? {});
        const { siteKey, initialKey, continuingKey, lastKey } = detectColumns(headers);
        if (!siteKey) throw new Error("Could not detect a 'site' column in sheet");
        if (!initialKey && !continuingKey && !lastKey)
          throw new Error("Could not detect phase cost columns (initial/continuing/last)");

        const aggregate = new Map<string, { count: number; sums: Partial<Record<PhaseKey, number>> }>();

        for (const r of rows) {
          const siteRaw = String(r[siteKey] ?? "").trim();
          if (!siteRaw) continue;
          const site = siteRaw.replace(/\s+/g, " ");

          const initialVal = initialKey ? parseMoney(r[initialKey]) : null;
          const continuingVal = continuingKey ? parseMoney(r[continuingKey]) : null;
          const lastVal = lastKey ? parseMoney(r[lastKey]) : null;

          if (initialVal == null && continuingVal == null && lastVal == null) continue;

          const item = aggregate.get(site) ?? { count: 0, sums: {} };
          item.count += 1;
          if (initialVal != null) item.sums.initial = (item.sums.initial ?? 0) + initialVal;
          if (continuingVal != null) item.sums.continuing = (item.sums.continuing ?? 0) + continuingVal;
          if (lastVal != null) item.sums.last = (item.sums.last ?? 0) + lastVal;
          aggregate.set(site, item);
        }

        const sites: SiteCosts[] = Array.from(aggregate.entries()).map(([site, { count, sums }]) => ({
          site,
          costs: {
            initial: sums.initial != null ? sums.initial / (count || 1) : undefined,
            continuing: sums.continuing != null ? sums.continuing / (count || 1) : undefined,
            last: sums.last != null ? sums.last / (count || 1) : undefined,
          },
        }));

        // Build aliases
        const siteAliases = buildAliasesFromSites(sites.map((s) => s.site));
        const phaseAliases = makePhaseAliases();
        const siteIndex = new Map<string, SiteCosts>(sites.map((s) => [s.site, s]));

        if (!cancelled) {
          setModel({ sites, siteIndex, siteAliases, phaseAliases });
          trainedRef.current = true;
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setLoading(false);
          toast({
            title: "Could not load cost data",
            description: e?.message || "Please try again later.",
            variant: "destructive",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  function findSiteFromQuery(q: string): string | null {
    if (!model) return null;
    const norm = normalize(q);

    // direct alias or contains
    for (const [aliasNorm, canonical] of model.siteAliases.entries()) {
      if (norm.includes(aliasNorm)) return canonical;
    }

    // fuzzy on full site names
    let best: { site: string; score: number } | null = null;
    for (const s of model.sites) {
      const sc = scoreSimilarity(norm, normalize(s.site));
      if (!best || sc > best.score) best = { site: s.site, score: sc };
    }
    return best && best.score > 0 ? best.site : null;
  }

  function findPhaseFromQuery(q: string): PhaseKey | null {
    if (!model) return null;
    const norm = normalize(q);
    for (const [alias, phase] of model.phaseAliases.entries()) {
      if (norm.includes(alias)) return phase;
    }
    // default guess if user mentions death/end
    if (/death|die|decease/i.test(q)) return "last";
    return null;
  }

  function estimate(q: string) {
    if (!model) return setAnswer("Model not loaded yet. Please wait a moment.");

    const site = findSiteFromQuery(q);
    const phase = findPhaseFromQuery(q);

    if (!site && !phase) {
      setAnswer(
        "Please mention a cancer site (e.g., breast, lung, colorectal) and optionally a phase (initial, continuing, last year of life)."
      );
      return;
    }

    const record = site ? model.siteIndex.get(site) : null;
    if (!record) {
      setAnswer("Sorry, I couldn't recognize the cancer site in your question.");
      return;
    }

    const parts: string[] = [];
    if (phase) {
      const val = record.costs[phase];
      if (val != null) {
        parts.push(`${formatUSD(val)} (${phase} phase)`);
      } else {
        parts.push(`No ${phase} phase cost found in dataset for ${record.site}`);
      }
    } else {
      // show available phases
      (Object.keys(record.costs) as PhaseKey[]).forEach((p) => {
        const v = record.costs[p];
        if (v != null) parts.push(`${formatUSD(v)} (${p})`);
      });
      if (!parts.length) parts.push("No phase costs found for this site in the dataset.");
    }

    const msg = `Estimated per-patient costs for ${record.site}${phase ? `, ${phase} phase` : ""}: ` + parts.join(
      "; "
    );

    const disclaimer =
      " Note: Estimates derived from the referenced Google Sheet; values appear to be in USD as provided (often 2010 dollars). This tool is informational only.";

    setAnswer(msg + disclaimer);
  }

  const suggestions = useMemo(() => {
    if (!model) return [] as string[];
    return model.sites
      .slice(0, 8)
      .map((s) => `What is the cost for ${s.site} in the initial phase?`);
  }, [model]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <header>
          <h2 className="text-xl font-semibold tracking-tight">Cancer care cost estimator</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Trains on the linked Google Sheet at runtime and estimates per-patient costs by cancer site and phase.
          </p>
        </header>

        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What is the average cost for breast cancer during initial treatment?"
            aria-label="Enter your question about cancer care costs"
          />
          <Button onClick={() => estimate(query)} disabled={loading}>
            {loading ? "Loading data..." : "Estimate"}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuery(s)}
                className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs hover:bg-muted"
                aria-label={`Use suggestion: ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {answer && (
          <div className="rounded-md border border-border bg-card/60 p-4 text-sm">
            <p>{answer}</p>
          </div>
        )}

        {!answer && !loading && (
          <div className="text-muted-foreground text-sm">
            Tip: mention a cancer site (e.g., breast, lung, colorectal) and phase (initial, continuing, last year of life).
          </div>
        )}
      </div>
    </Card>
  );
}
