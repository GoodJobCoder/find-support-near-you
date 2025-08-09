import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { FirecrawlService } from '@/utils/FirecrawlService';

interface PostItem {
  title: string;
  url: string;
  excerpt: string;
  source: string;
}

export const CommunityPosts = () => {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState<string>(FirecrawlService.getApiKey() || '');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);

  const saveKey = () => {
    if (apiKey.trim()) FirecrawlService.saveApiKey(apiKey.trim());
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    setPosts([]);

    try {
      const q = encodeURIComponent(`${query} clinical trials cancer`);
      const sources = [
        { source: 'Reddit', url: `https://www.reddit.com/r/cancer/search/?q=${q}&restrict_sr=1&sort=new` },
        { source: 'Reddit', url: `https://www.reddit.com/search/?q=${q}&type=link&sort=new` },
        { source: 'Cancer Subreddit', url: `https://www.reddit.com/r/cancer/top/?t=month` },
      ];

      const results: PostItem[] = [];
      for (const s of sources) {
        const res = await FirecrawlService.crawlWebsite(s.url);
        if (res.success && res.data && (res.data as any).data) {
          const dataArr = (res.data as any).data as any[];
          dataArr.slice(0, 5).forEach((item: any) => {
            const title = item.metadata?.title || 'Post';
            const text = item.markdown || item.html || '';
            const excerpt = (text as string).slice(0, 240).replace(/\s+/g, ' ') + '...';
            results.push({ title, url: item.url || s.url, excerpt, source: s.source });
          });
        }
      }

      setPosts(results);
    } catch (e: any) {
      setError(e?.message || t('shared.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 grid gap-3 md:grid-cols-[1fr_auto] items-center">
        <div className="grid gap-2 md:grid-cols-2">
          <Input
            placeholder={t('community.api_key_placeholder')}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Button onClick={saveKey} variant="secondary">{t('community.save_key')}</Button>
        </div>
        <div className="grid gap-2 md:grid-cols-[1fr_auto] md:pl-4">
          <Input
            placeholder={t('community.query_placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={fetchPosts}>{loading ? t('shared.loading') : t('community.fetch')}</Button>
        </div>
      </Card>

      {error && (
        <div className="text-destructive text-sm">{error}</div>
      )}

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
