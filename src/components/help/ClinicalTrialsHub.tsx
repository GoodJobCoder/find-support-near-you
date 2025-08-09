import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrialsSearch } from './TrialsSearch';
import { CommunityPosts } from './CommunityPosts';
import { VideosSection } from './VideosSection';

export const ClinicalTrialsHub = () => {
  const { t } = useLanguage();
  const [q, setQ] = useState('');
  const [submittedQ, setSubmittedQ] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQ(q.trim());
  };

  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">{t('trials.hub_title')}</h2>
        <p className="text-muted-foreground">{t('trials.hub_subtitle')}</p>
      </div>

      <form onSubmit={onSubmit} className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          placeholder={t('trials.search_placeholder')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="submit">{t('trials.search')}</Button>
      </form>

      <Tabs defaultValue="trials" className="w-full">
        <TabsList>
          <TabsTrigger value="trials">{t('trials.tab')}</TabsTrigger>
          <TabsTrigger value="community">{t('community.tab')}</TabsTrigger>
          <TabsTrigger value="videos">{t('videos.tab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="trials" className="mt-6">
          <TrialsSearch query={submittedQ} />
        </TabsContent>
        <TabsContent value="community" className="mt-6">
          <CommunityPosts query={submittedQ} />
        </TabsContent>
        <TabsContent value="videos" className="mt-6">
          <VideosSection query={submittedQ} />
        </TabsContent>
      </Tabs>
    </section>
  );
};
