import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<string, string>> = {
  en: {
    // Main page
    'main.heading': 'Find Cancer Support Near You',
    'main.subtitle': 'Discover nearby support groups, treatment centers, counseling, and resources tailored to your journey.',
    'main.footnote': 'This tool helps you quickly locate trusted cancer support organizations around you. Use your current location or search by city/postcode, then filter by category and distance.',
    
    // Search interface
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
    
    // Categories
    'category.support_group': 'Support Group',
    'category.treatment_center': 'Treatment Center',
    'category.counseling': 'Counseling',
    'category.financial_aid': 'Financial Aid',
    'category.hospice': 'Hospice',
    'category.transportation': 'Transportation',
    
    // Status messages
    'status.location_set': 'Location set. Showing results within {radius} km.',
    'status.loading_places': 'Loading nearby places...',
    'status.tip_location': 'Tip: set your location to see nearby resources.',
    'status.results_found': '{count} result{plural} found',
    'status.no_results': 'No resources within {radius} km. Try increasing the radius or searching in a different area.',
    'status.loading_google': 'Loading nearby places from Google Maps...',
    'status.results_appear': 'Results will appear here after you set a location.',
    
    // Resource details
    'resource.details': 'Location Details',
    'resource.back': 'Back',
    'resource.call': 'Call',
    'resource.website': 'Visit Website',
    'resource.maps': 'Open in Maps',
    'resource.chat': 'Chat about this location',
    'resource.distance': 'km away',
    'resource.disclaimer': 'Always verify hours and availability before visiting. Contact the organization directly for the most current information.',
    
    // Availability
    'availability.open': 'Open',
    'availability.closed': 'Closed',
    'availability.open_24h': 'Open 24 hours',
    'availability.hours': 'Hours',
    
    // Transportation
    'transportation.directions': 'Get Directions',
    'transportation.transit': 'Public Transit',
    'transportation.rideshare': 'Rideshare',
    
    // Favorites
    'favorites.empty': 'No favorites yet. Add resources to your favorites by clicking the heart icon.',
    'favorites.your': 'Your Favorites',
    'favorites.add': 'Add to favorites',
    'favorites.remove': 'Remove from favorites',
    
    // Emergency
    'emergency.title': 'Emergency Support',
    'emergency.description': 'If you\'re in crisis or need immediate support, these resources are available 24/7 or with extended hours.',
    'emergency.website': 'Website',
    
    // Help Center
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
    
    // Navigation
    'nav.home': 'Home',
    'nav.help': 'Help Center',
  },
  es: {
    // Main page
    'main.heading': 'Encuentra Apoyo Contra el Cáncer Cerca de Ti',
    'main.subtitle': 'Descubre grupos de apoyo cercanos, centros de tratamiento, consejería y recursos adaptados a tu viaje.',
    'main.footnote': 'Esta herramienta te ayuda a localizar rápidamente organizaciones de apoyo contra el cáncer de confianza cerca de ti. Usa tu ubicación actual o busca por ciudad/código postal, luego filtra por categoría y distancia.',
    
    // Search interface
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
    
    // Categories
    'category.support_group': 'Grupo de Apoyo',
    'category.treatment_center': 'Centro de Tratamiento',
    'category.counseling': 'Consejería',
    'category.financial_aid': 'Ayuda Financiera',
    'category.hospice': 'Hospicio',
    'category.transportation': 'Transporte',
    
    // Status messages
    'status.location_set': 'Ubicación establecida. Mostrando resultados dentro de {radius} km.',
    'status.loading_places': 'Cargando lugares cercanos...',
    'status.tip_location': 'Consejo: establece tu ubicación para ver recursos cercanos.',
    'status.results_found': '{count} resultado{plural} encontrado{plural}',
    'status.no_results': 'No hay recursos dentro de {radius} km. Intenta aumentar el radio o buscar en un área diferente.',
    'status.loading_google': 'Cargando lugares cercanos desde Google Maps...',
    'status.results_appear': 'Los resultados aparecerán aquí después de que establezcas una ubicación.',
    
    // Resource details
    'resource.details': 'Detalles de la Ubicación',
    'resource.back': 'Atrás',
    'resource.call': 'Llamar',
    'resource.website': 'Visitar Sitio Web',
    'resource.maps': 'Abrir en Mapas',
    'resource.chat': 'Chatear sobre esta ubicación',
    'resource.distance': 'km de distancia',
    'resource.disclaimer': 'Siempre verifica horarios y disponibilidad antes de visitar. Contacta la organización directamente para obtener la información más actualizada.',
    
    // Availability
    'availability.open': 'Abierto',
    'availability.closed': 'Cerrado',
    'availability.open_24h': 'Abierto 24 horas',
    'availability.hours': 'Horarios',
    
    // Transportation
    'transportation.directions': 'Obtener Direcciones',
    'transportation.transit': 'Transporte Público',
    'transportation.rideshare': 'Viaje Compartido',
    
    // Favorites
    'favorites.empty': 'Aún no hay favoritos. Agrega recursos a tus favoritos haciendo clic en el icono del corazón.',
    'favorites.your': 'Tus Favoritos',
    'favorites.add': 'Agregar a favoritos',
    'favorites.remove': 'Quitar de favoritos',
    
    // Emergency
    'emergency.title': 'Apoyo de Emergencia',
    'emergency.description': 'Si estás en crisis o necesitas apoyo inmediato, estos recursos están disponibles 24/7 o con horarios extendidos.',
    'emergency.website': 'Sitio Web',
    
    // Help Center
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
    
    // Navigation
    'nav.home': 'Inicio',
    'nav.help': 'Centro de Ayuda',
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