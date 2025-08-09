import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

export interface AdvancedFilterOptions {
  ageGroup: string;
  cancerType: string;
  accessibility: string[];
  specialties: string[];
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterOptions;
  onFiltersChange: (filters: AdvancedFilterOptions) => void;
}

const ageGroups = ['All', 'Children & Teens', 'Young Adults (18-39)', 'Adults (40-64)', 'Seniors (65+)'];
const cancerTypes = ['All', 'Breast Cancer', 'Lung Cancer', 'Prostate Cancer', 'Colorectal Cancer', 'Blood Cancers', 'Brain Cancer', 'Other'];
const accessibilityOptions = ['Wheelchair Accessible', 'Hearing Impaired Support', 'Vision Impaired Support', 'Transportation Available'];
const specialtyOptions = ['LGBTQ+ Friendly', 'Spanish Speaking', 'Evening Hours', 'Weekend Hours', 'Virtual Options'];

export default function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const updateFilters = (key: keyof AdvancedFilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'accessibility' | 'specialties', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFilters(key, updated);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-dashed">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              Advanced Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Age Group</Label>
                <Select value={filters.ageGroup} onValueChange={(value) => updateFilters('ageGroup', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Cancer Type</Label>
                <Select value={filters.cancerType} onValueChange={(value) => updateFilters('cancerType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cancer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cancerTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Accessibility Features</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {accessibilityOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`accessibility-${option}`}
                        checked={filters.accessibility.includes(option)}
                        onCheckedChange={() => toggleArrayFilter('accessibility', option)}
                      />
                      <Label htmlFor={`accessibility-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Special Services</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {specialtyOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`specialty-${option}`}
                        checked={filters.specialties.includes(option)}
                        onCheckedChange={() => toggleArrayFilter('specialties', option)}
                      />
                      <Label htmlFor={`specialty-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}