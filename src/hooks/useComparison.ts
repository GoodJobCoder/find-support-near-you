import { useState, useEffect } from 'react';
import { Resource } from '@/data/resources';

const COMPARISON_KEY = 'cancer-support-comparison';

export function useComparison() {
  const [comparisonList, setComparisonList] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(COMPARISON_KEY);
    if (stored) {
      try {
        setComparisonList(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading comparison list:', error);
      }
    }
  }, []);

  const addToComparison = (resourceId: string) => {
    if (comparisonList.length >= 3) return false; // Max 3 resources
    
    const updated = [...comparisonList, resourceId];
    setComparisonList(updated);
    localStorage.setItem(COMPARISON_KEY, JSON.stringify(updated));
    return true;
  };

  const removeFromComparison = (resourceId: string) => {
    const updated = comparisonList.filter(id => id !== resourceId);
    setComparisonList(updated);
    localStorage.setItem(COMPARISON_KEY, JSON.stringify(updated));
  };

  const clearComparison = () => {
    setComparisonList([]);
    localStorage.removeItem(COMPARISON_KEY);
  };

  const isInComparison = (resourceId: string) => {
    return comparisonList.includes(resourceId);
  };

  return {
    comparisonList,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison
  };
}