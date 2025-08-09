import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/context/LanguageContext';

const CATEGORIES = ['All', 'Support Group', 'Treatment Center', 'Counseling', 'Financial Aid', 'Hospice', 'Transportation'] as const;

type Category = typeof CATEGORIES[number];

interface SearchFiltersProps {
  category: Category;
  onCategoryChange: (category: Category) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
}

export function SearchFilters({
  category,
  onCategoryChange,
  radius,
  onRadiusChange
}: SearchFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('search.category')}</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">{t('search.all')}</SelectItem>
            {CATEGORIES.slice(1).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label className="text-sm font-medium">
          {t('search.radius')}: {radius} km
        </Label>
        <Slider
          value={[radius]}
          min={5}
          max={100}
          step={5}
          onValueChange={(value) => onRadiusChange(value[0])}
          className="w-full"
        />
      </div>
    </div>
  );
}