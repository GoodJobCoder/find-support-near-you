import { useEffect, useMemo, useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const CIVIC_API_KEY = "AIzaSyAzsz9MESplaBYwLXhkbXTmagk0ZRs5i2U"; // Provided by user

interface CivicDivision {
  name: string;
  ocdId: string;
}

interface GovTrackBill {
  id: number;
  title: string;
  display_number: string;
  link: string;
  current_status_label?: string;
}

const Laws = () => {
  const [q, setQ] = useState("cancer");
  const [loading, setLoading] = useState(false);
  const [divisions, setDivisions] = useState<CivicDivision[]>([]);
  const [bills, setBills] = useState<GovTrackBill[]>([]);
  const { toast } = useToast();

  useSEO({
    title: "Cancer Laws & Civic Info | CareConnect",
    description: "Search cancer-related laws and view relevant civic jurisdictions using Google Civics and federal bills.",
    canonical: "/laws",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Cancer Laws & Civic Info",
      description:
        "Search cancer-related laws and view relevant civic jurisdictions using Google Civics and federal bills.",
      potentialAction: {
        "@type": "SearchAction",
        target: "/laws?q={search_term}",
        "query-input": "required name=search_term",
      },
    },
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const civicsUrl = new URL("https://civicinfo.googleapis.com/civicinfo/v2/divisions");
      civicsUrl.searchParams.set("query", q);
      civicsUrl.searchParams.set("key", CIVIC_API_KEY);

      const govTrackUrl = new URL("https://www.govtrack.us/api/v2/bill");
      govTrackUrl.searchParams.set("q", q);
      govTrackUrl.searchParams.set("sort", "-current_status_date");
      govTrackUrl.searchParams.set("limit", "15");

      const [civicsRes, billsRes] = await Promise.all([
        fetch(civicsUrl.toString()),
        fetch(govTrackUrl.toString()),
      ]);

      if (!civicsRes.ok) throw new Error(`Civics API error ${civicsRes.status}`);
      if (!billsRes.ok) throw new Error(`Bills API error ${billsRes.status}`);

      const civicsData = (await civicsRes.json()) as {
        kind: string;
        results?: { name: string; ocdId: string }[];
      };
      const billsData = (await billsRes.json()) as {
        objects: Array<{
          id: number;
          title: string;
          display_number: string;
          congress: number;
          current_status_label?: string;
          link: string;
        }>;
      };

      setDivisions(
        (civicsData.results || []).map((d) => ({ name: d.name, ocdId: d.ocdId }))
      );

      setBills(
        (billsData.objects || []).map((b) => ({
          id: b.id,
          title: b.title,
          display_number: b.display_number,
          link: b.link,
          current_status_label: b.current_status_label,
        }))
      );
    } catch (e: any) {
      toast({
        title: "Search failed",
        description: e?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasResults = useMemo(() => divisions.length > 0 || bills.length > 0, [divisions, bills]);

  return (
    <div>
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(var(--brand-1))] via-[hsl(var(--brand-3))] to-[hsl(var(--brand-2))] opacity-40" />
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[hsl(var(--brand-1))] opacity-30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[hsl(var(--brand-2))] opacity-25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-12 left-1/3 h-56 w-56 rounded-full bg-[hsl(var(--brand-3))] opacity-30 blur-3xl" />
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Cancer Laws & Civic Info</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Search cancer-related laws and view relevant civic jurisdictions. Uses Google Civics for divisions and GovTrack for federal bills.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-8">
        <Card className="p-4">
          <div className="flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search laws (e.g., cancer, screening, chemo)"
              aria-label="Search cancer-related laws"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </Card>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Relevant Jurisdictions (Google Civics)</h2>
            {divisions.length === 0 ? (
              <p className="text-muted-foreground text-sm mt-2">No matching civic divisions.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {divisions.map((d) => (
                  <li key={d.ocdId} className="rounded-md border border-border p-3">
                    <div className="font-medium">{d.name}</div>
                    <div className="text-muted-foreground text-xs">{d.ocdId}</div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Recent US Federal Bills</h2>
            {bills.length === 0 ? (
              <p className="text-muted-foreground text-sm mt-2">No bills found.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {bills.map((b) => (
                  <li key={b.id} className="rounded-md border border-border p-3">
                    <a
                      href={b.link}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:underline"
                    >
                      {b.display_number}: {b.title}
                    </a>
                    {b.current_status_label && (
                      <div className="text-muted-foreground text-xs mt-1">{b.current_status_label}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-muted-foreground text-xs mt-4">
              Note: Google Civics API does not provide law text; bills sourced from GovTrack.
            </p>
          </article>
        </section>

        {!hasResults && !loading && (
          <p className="text-muted-foreground text-sm">Try another term like "screening" or "tobacco".</p>
        )}
      </main>
    </div>
  );
};

export default Laws;
