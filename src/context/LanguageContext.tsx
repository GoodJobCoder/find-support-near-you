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
    'help.title': 'Help Center',
    'help.subtitle': 'Find answers to common questions and learn how to get the most out of CareConnect when searching for cancer support resources.',
    'help.getting_started': 'Getting Started',
    'help.getting_started_text': 'Use the search on the home page to enter your city or postcode. Apply filters like distance and category to refine results.',
    'help.saving_favorites': 'Saving Favorites',
    'help.saving_favorites_text': 'Tap the heart icon on any result to save it for quick access later in your favorites list.',
    'help.contacting_providers': 'Contacting Providers',
    'help.contacting_providers_text': 'Open a resource to view phone, website, and location details. Always verify hours and availability before visiting.',
    'help.language_support': 'Language Support',
    'help.language_support_text': 'Use the language selector to browse resources in your preferred language where available.',
    'nav.home': 'Home',
    'nav.help': 'Help Center',
    'nav.settings': 'Settings',
    'nav.signin': 'Sign In',
    'nav.signout': 'Sign Out',
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
    'help.title': 'Centro de Ayuda',
    'help.subtitle': 'Encuentra respuestas a preguntas comunes y aprende cómo aprovechar al máximo CareConnect al buscar recursos de apoyo contra el cáncer.',
    'help.getting_started': 'Comenzando',
    'help.getting_started_text': 'Usa la búsqueda en la página principal para ingresar tu ciudad o código postal. Aplica filtros como distancia y categoría para refinar los resultados.',
    'help.saving_favorites': 'Guardar Favoritos',
    'help.saving_favorites_text': 'Toca el ícono del corazón en cualquier resultado para guardarlo para acceso rápido en tu lista de favoritos.',
    'help.contacting_providers': 'Contactar Proveedores',
    'help.contacting_providers_text': 'Abre un recurso para ver teléfono, sitio web y detalles de ubicación. Siempre verifica horarios y disponibilidad antes de visitar.',
    'help.language_support': 'Soporte de Idiomas',
    'help.language_support_text': 'Usa el selector de idioma para navegar recursos en tu idioma preferido donde esté disponible.',
    'nav.home': 'Inicio',
    'nav.help': 'Centro de Ayuda',
    'nav.settings': 'Configuración',
    'nav.signin': 'Iniciar sesión',
    'nav.signout': 'Cerrar sesión',
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
    // Fallback for when context is not available
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: string) => translations.en[key] || key
    };
  }
  return context;
}