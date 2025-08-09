import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface TrialField {
  NCTId: string[];
  BriefTitle: string[];
  Condition: string[];
  LocationCity: string[];
  LocationCountry: string[];
  OverallStatus: string[];
  BriefSummary: string[];
}

export const TrialsSearch = () => {
  const { t } = useLanguage();
  const [q, setQ] = useState('');
  const [loc, setLoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TrialField[]>([]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const expr = encodeURIComponent(`${q} ${loc}`.trim());
      const fields = [
        'NCTId','BriefTitle','Condition','LocationCity','LocationCountry','OverallStatus','BriefSummary'
      ].join(',');
      const url = `https://clinicaltrials.gov/api/query/study_fields?expr=${expr}&fields=${fields}&min_rnk=1&max_rnk=20&fmt=json`;
      const res = await fetch(url);
      const data = await res.json();
      const arr = (data?.StudyFieldsResponse?.StudyFields || []) as TrialField[];
      setResults(arr);
    } catch (e: any) {
      setError(e?.message || t('shared.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
        <Input
          placeholder={t('trials.search_placeholder')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          required
        />
        <Input
          placeholder={t('trials.location_placeholder')}
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
        />
        <Button type="submit" disabled={loading}>{loading ? t('shared.loading') : t('trials.search')}</Button>
      </form>

      {error && <div className="text-destructive text-sm">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">{t('shared.no_results')}</p>
        )}
        {results.map((r, idx) => {
          const id = r.NCTId?.[0];
          const title = r.BriefTitle?.[0] || 'Untitled';
          const status = r.OverallStatus?.[0];
          const cond = (r.Condition || []).slice(0,2).join(', ');
          const city = r.LocationCity?.[0];
          const country = r.LocationCountry?.[0];
          const summary = (r.BriefSummary?.[0] || '').slice(0, 220);
          const link = id ? `https://clinicaltrials.gov/study/${id}` : undefined;
          return (
            <Card key={idx} className="p-4 flex flex-col">
              <h3 className="font-semibold leading-snug">{title}</h3>
              <div className="mt-1 text-xs text-muted-foreground">{t('trials.status')}: {status || '-'}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t('trials.conditions')}: {cond || '-'}</div>
              <div className="mt-1 text-xs text-muted-foreground">{[city, country].filter(Boolean).join(', ')}</div>
              <p className="mt-3 text-sm text-muted-foreground">{summary}...</p>
              {link && (
                <a className="mt-3 text-sm font-medium text-primary underline underline-offset-4" href={link} target="_blank" rel="noreferrer">
                  {t('trials.view_on_ctgov')}
                </a>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
