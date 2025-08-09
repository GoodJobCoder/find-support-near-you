import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export const VideosSection = () => {
  const { t } = useLanguage();
  const [q, setQ] = useState('');

  const ytSearch = (base: string) => `${base}${encodeURIComponent(q || 'cancer clinical trials')}`;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          placeholder={t('trials.search_placeholder')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex gap-2">
          <Button asChild>
            <a href={ytSearch('https://www.youtube.com/results?search_query=')} target="_blank" rel="noreferrer">
              {t('videos.search')} YouTube
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a href={ytSearch('https://www.youtube.com/@NCIgov/search?query=')} target="_blank" rel="noreferrer">
              NCI
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold">National Cancer Institute</h3>
          <p className="text-sm text-muted-foreground mt-1">Trusted clinical trial education videos.</p>
          <a className="mt-2 inline-block text-primary underline underline-offset-4" href="https://www.youtube.com/@NCIgov/videos" target="_blank" rel="noreferrer">Open Channel</a>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Cancer Research UK</h3>
          <p className="text-sm text-muted-foreground mt-1">Explainers and patient stories on trials.</p>
          <a className="mt-2 inline-block text-primary underline underline-offset-4" href="https://www.youtube.com/@cancerresearchuk/videos" target="_blank" rel="noreferrer">Open Channel</a>
        </Card>
      </div>
    </div>
  );
};
