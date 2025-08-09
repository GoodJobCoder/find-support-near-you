import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Locate } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type SearchMode = 'address' | 'zipcode' | 'city';

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  onSearch: () => void;
  onUseLocation: () => void;
  loading: boolean;
}

export function SearchInput({
  query,
  onQueryChange,
  mode,
  onModeChange,
  onSearch,
  onUseLocation,
  loading
}: SearchInputProps) {
  const { t } = useLanguage();

  const placeholders = {
    address: 'Enter address (e.g., 123 Main St)',
    zipcode: 'ZIP / Postcode (e.g., 10001)',
    city: 'City (e.g., Boston)'
  };

  const labels = {
    address: t('search.address'),
    zipcode: t('search.zipcode'),
    city: t('search.city')
  };

  return (
    <div className="grid gap-3 sm:grid-cols-[auto,1fr,auto]">
      <div className="w-full sm:w-44">
        <Select value={mode} onValueChange={onModeChange}>
          <SelectTrigger aria-label="Search by" className="w-full">
            <SelectValue placeholder="Search by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="address">{labels.address}</SelectItem>
            <SelectItem value="zipcode">{labels.zipcode}</SelectItem>
            <SelectItem value="city">{labels.city}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholders[mode]}
          aria-label={labels[mode]}
          className="pr-10"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading && query.trim()) {
              onSearch();
            }
          }}
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex gap-2">
        <Button
          size="default"
          disabled={loading || !query.trim()}
          onClick={onSearch}
        >
          {t('search.go')}
        </Button>
        <Button
          variant="secondary"
          disabled={loading}
          onClick={onUseLocation}
        >
          <Locate className="h-4 w-4" /> {t('search.location')}
        </Button>
      </div>
    </div>
  );
}