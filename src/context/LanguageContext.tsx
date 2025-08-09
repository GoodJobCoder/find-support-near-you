import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<string, string>> = {
  en: {
    'search.resources': 'Search Resources',
    'search.favorites': 'Favorites',
    'search.emergency': 'Emergency Support',
    'search.nearby': 'Search nearby support',
    'search.address': 'Address',
    'search.zipcode': 'ZIP code',
    'search.city': 'City',
    'search.category': 'Category',
    'search.radius': 'Search radius',
    'search.all': 'All',
    'search.location': 'Use my location',
    'search.go': 'Go',
    'availability.open': 'Open',
    'availability.closed': 'Closed',
    'availability.open_24h': 'Open 24 hours',
    'availability.hours': 'Hours',
    'transportation.directions': 'Get Directions',
    'transportation.transit': 'Public Transit',
    'transportation.rideshare': 'Rideshare',
    'resource.call': 'Call',
    'resource.website': 'Visit Website',
    'resource.maps': 'Open in Maps',
    'resource.chat': 'Chat about this location',
    'resource.distance': 'km away',
    'favorites.empty': 'No favorites yet. Add resources to your favorites by clicking the heart icon.',
    'favorites.your': 'Your Favorites',
  },
  es: {
    'search.resources': 'Buscar Recursos',
    'search.favorites': 'Favoritos',
    'search.emergency': 'Apoyo de Emergencia',
    'search.nearby': 'Buscar apoyo cercano',
    'search.address': 'Dirección',
    'search.zipcode': 'Código postal',
    'search.city': 'Ciudad',
    'search.category': 'Categoría',
    'search.radius': 'Radio de búsqueda',
    'search.all': 'Todos',
    'search.location': 'Usar mi ubicación',
    'search.go': 'Ir',
    'availability.open': 'Abierto',
    'availability.closed': 'Cerrado',
    'availability.open_24h': 'Abierto 24 horas',
    'availability.hours': 'Horarios',
    'transportation.directions': 'Obtener Direcciones',
    'transportation.transit': 'Transporte Público',
    'transportation.rideshare': 'Viaje Compartido',
    'resource.call': 'Llamar',
    'resource.website': 'Visitar Sitio Web',
    'resource.maps': 'Abrir en Mapas',
    'resource.chat': 'Chatear sobre esta ubicación',
    'resource.distance': 'km de distancia',
    'favorites.empty': 'Aún no hay favoritos. Agrega recursos a tus favoritos haciendo clic en el icono del corazón.',
    'favorites.your': 'Tus Favoritos',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem('cancer-support-language');
    return stored || 'en';
  });

  useEffect(() => {
    localStorage.setItem('cancer-support-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}