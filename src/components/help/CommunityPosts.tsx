import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';

interface PostItem {
  title: string;
  url: string;
  excerpt: string;
  source: string;
}

export const CommunityPosts = ({ query }: { query: string }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);

  useEffect(() => {
    const q = (query || '').trim();
    if (!q) { setPosts([]); return; }

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const enc = encodeURIComponent(`${q} clinical trials cancer`);
        const endpoints = [
          `https://www.reddit.com/r/cancer/search.json?q=${enc}&restrict_sr=1&sort=new&limit=10`,
          `https://www.reddit.com/search.json?q=${enc}&type=link&sort=new&limit=10`,
          `https://www.reddit.com/r/cancer/top.json?t=month&limit=10`,
        ];
        const fetchJson = async (url: string) => {
          const r = await fetch(url);
          if (!r.ok) throw new Error('Failed to fetch');
          return r.json();
        };
        const datasets = await Promise.allSettled(endpoints.map(fetchJson));
        const results: PostItem[] = [];
        const seen = new Set<string>();
        for (const ds of datasets) {
          if (ds.status === 'fulfilled') {
            const children = ds.value?.data?.children || [];
            children.forEach((child: any) => {
              const d = child.data || {};
              const id = d.id as string;
              if (!id || seen.has(id)) return;
              seen.add(id);
              const title = d.title || 'Post';
              const permalink = d.permalink ? `https://www.reddit.com${d.permalink}` : (d.url_overridden_by_dest || '');
              const text: string = d.selftext || '';
              const excerpt = ((text && text.length > 0 ? text : title) as string).slice(0, 240).replace(/\s+/g, ' ') + '...';
              const source = d.subreddit_name_prefixed || 'Reddit';
              results.push({ title, url: permalink, excerpt, source });
            });
          }
        }
        setPosts(results);
      } catch (e: any) {
        setError(t('shared.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [query]);

  return (
    <div className="space-y-4">
      {loading && <div className="text-sm text-muted-foreground">{t('shared.loading')}</div>}
      {error && <div className="text-destructive text-sm">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {posts.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">{t('shared.no_results')}</p>
        )}
        {posts.map((p, i) => (
          <Card key={i} className="p-4">
            <div className="text-xs text-muted-foreground">{p.source}</div>
            <a href={p.url} target="_blank" rel="noreferrer" className="mt-1 inline-block font-semibold hover:underline">
              {p.title}
            </a>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.excerpt}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
