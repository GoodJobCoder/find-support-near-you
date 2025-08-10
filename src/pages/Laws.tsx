import { useEffect, useMemo, useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ActionLinks } from "@/components/laws/ActionLinks";

const YOUTUBE_API_KEY = "AIzaSyBP30WdSGSW_05zyuMMjs34rWYy3ooLq2k"; // Provided by user

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt?: string;
  url: string;
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
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [bills, setBills] = useState<GovTrackBill[]>([]);
  const { toast } = useToast();

  useSEO({
    title: "Cancer Laws & Debate Videos | CareConnect",
    description: "Search cancer-related laws and watch debate videos from YouTube alongside recent US federal bills.",
    canonical: "/laws",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Cancer Laws & Debate Videos",
      description:
        "Search cancer-related laws and watch debate videos from YouTube alongside recent US federal bills.",
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
      const youtubeUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      youtubeUrl.searchParams.set("part", "snippet");
      youtubeUrl.searchParams.set("q", q);
      youtubeUrl.searchParams.set("type", "video");
      youtubeUrl.searchParams.set("maxResults", "12");
      youtubeUrl.searchParams.set("order", "relevance");
      youtubeUrl.searchParams.set("safeSearch", "strict");
      youtubeUrl.searchParams.set("key", YOUTUBE_API_KEY);

      const govTrackUrl = new URL("https://www.govtrack.us/api/v2/bill");
      govTrackUrl.searchParams.set("q", q);
      govTrackUrl.searchParams.set("sort", "-current_status_date");
      govTrackUrl.searchParams.set("limit", "15");

      const [youtubeRes, billsRes] = await Promise.all([
        fetch(youtubeUrl.toString()),
        fetch(govTrackUrl.toString()),
      ]);

      if (!youtubeRes.ok) throw new Error(`YouTube API error ${youtubeRes.status}`);
      if (!billsRes.ok) throw new Error(`Bills API error ${billsRes.status}`);

      const youtubeData = (await youtubeRes.json()) as {
        items?: Array<{
          id: { videoId: string };
          snippet: {
            title: string;
            thumbnails: { medium?: { url: string } };
            channelTitle: string;
            publishedAt?: string;
          };
        }>;
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

      setVideos(
        (youtubeData.items || []).map((item) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails?.medium?.url || "",
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }))
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

  const hasResults = useMemo(() => videos.length > 0 || bills.length > 0, [videos, bills]);

  return (
    <div>
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(var(--brand-1))] via-[hsl(var(--brand-3))] to-[hsl(var(--brand-2))] opacity-40" />
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[hsl(var(--brand-1))] opacity-30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[hsl(var(--brand-2))] opacity-25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-12 left-1/3 h-56 w-56 rounded-full bg-[hsl(var(--brand-3))] opacity-30 blur-3xl" />
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Cancer Laws & Debate Videos</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Search cancer-related laws and watch relevant YouTube videos. GovTrack provides recent federal bills.
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
            <h2 className="text-xl font-semibold">YouTube Videos</h2>
            {videos.length === 0 ? (
              <p className="text-muted-foreground text-sm mt-2">No videos found.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {videos.map((v) => (
                  <li key={v.id} className="rounded-md border border-border p-3">
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex gap-3"
                    >
                      <img
                        src={v.thumbnail}
                        alt={`YouTube video: ${v.title}`}
                        className="h-20 w-32 object-cover rounded"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <div className="font-medium hover:underline truncate">{v.title}</div>
                        <div className="text-muted-foreground text-xs mt-1">
                          {v.channelTitle}{v.publishedAt ? ` • ${new Date(v.publishedAt).toLocaleDateString()}` : ""}
                        </div>
                      </div>
                    </a>
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
              Videos provided by YouTube Data API; bills sourced from GovTrack.
            </p>
          </article>
        </section>

        {!hasResults && !loading && (
          <p className="text-muted-foreground text-sm">Try another term like "screening" or "tobacco".</p>
        )}

        <ActionLinks />
      </main>
    </div>
  );
};

export default Laws;
