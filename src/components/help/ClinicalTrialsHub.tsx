import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrialsSearch } from './TrialsSearch';
import { CommunityPosts } from './CommunityPosts';
import { VideosSection } from './VideosSection';

export const ClinicalTrialsHub = () => {
  const { t } = useLanguage();
  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">{t('trials.hub_title')}</h2>
        <p className="text-muted-foreground">{t('trials.hub_subtitle')}</p>
      </div>
      <Tabs defaultValue="trials" className="w-full">
        <TabsList>
          <TabsTrigger value="trials">{t('trials.tab')}</TabsTrigger>
          <TabsTrigger value="community">{t('community.tab')}</TabsTrigger>
          <TabsTrigger value="videos">{t('videos.tab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="trials" className="mt-6">
          <TrialsSearch />
        </TabsContent>
        <TabsContent value="community" className="mt-6">
          <CommunityPosts />
        </TabsContent>
        <TabsContent value="videos" className="mt-6">
          <VideosSection />
        </TabsContent>
      </Tabs>
    </section>
  );
};
