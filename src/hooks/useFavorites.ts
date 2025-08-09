import { useState, useEffect } from 'react';
import { Resource } from '@/data/resources';

const FAVORITES_KEY = 'cancer-support-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  const addFavorite = (resourceId: string) => {
    const updated = [...favorites, resourceId];
    setFavorites(updated);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  const removeFavorite = (resourceId: string) => {
    const updated = favorites.filter(id => id !== resourceId);
    setFavorites(updated);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  const toggleFavorite = (resourceId: string) => {
    if (favorites.includes(resourceId)) {
      removeFavorite(resourceId);
    } else {
      addFavorite(resourceId);
    }
  };

  const isFavorite = (resourceId: string) => favorites.includes(resourceId);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}