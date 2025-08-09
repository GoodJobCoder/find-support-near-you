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
    
    // Phase 3 translations
    searchForResources: "Search for cancer support resources",
    favorites: "Favorites",
    compareResources: "Compare Resources",
    myCalendar: "My Calendar",
    callNow: "Call Now",
    visitWebsite: "Visit Website",
    viewDetails: "View Details",
    askAbout: "Ask About",
    kmAway: "km away",
    review: "review",
    reviews: "reviews",
    addReview: "Add Review",
    writeReview: "Write a Review for",
    rating: "Rating",
    comment: "Comment",
    optional: "optional",
    shareExperience: "Share your experience...",
    submitReview: "Submit Review",
    cancel: "Cancel",
    noReviews: "No reviews yet. Be the first to share your experience!",
    helpful: "Helpful",
    noResourcesSelected: "No resources selected for comparison",
    selectResourcesToCompare: "Select up to 3 resources from the search results to compare them side by side",
    clearAll: "Clear All",
    addMoreResources: "Add more resources to compare",
    remaining: "remaining",
    addEvent: "Add Event",
    addNewEvent: "Add New Event",
    eventTitle: "Event Title",
    enterEventTitle: "Enter event title",
    date: "Date",
    time: "Time",
    eventType: "Event Type",
    appointment: "Appointment",
    reminder: "Reminder",
    event: "Event",
    relatedResource: "Related Resource",
    selectResource: "Select a resource",
    noResource: "No resource",
    notes: "Notes",
    addEventNotes: "Add notes for this event",
    noUpcomingEvents: "No upcoming events",
    addFirstEvent: "Click 'Add Event' to schedule your first appointment or reminder",
    calendarStats: "Calendar Statistics",
    appointments: "Appointments",
    reminders: "Reminders",
    events: "Events",
    availability: "Availability"
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
    
    // Phase 3 translations
    searchForResources: "Buscar recursos de apoyo contra el cáncer",
    favorites: "Favoritos",
    compareResources: "Comparar recursos",
    myCalendar: "Mi calendario",
    callNow: "Llamar ahora",
    visitWebsite: "Visitar sitio web",
    viewDetails: "Ver detalles",
    askAbout: "Preguntar sobre",
    kmAway: "km de distancia",
    review: "reseña",
    reviews: "reseñas",
    addReview: "Agregar reseña",
    writeReview: "Escribir una reseña para",
    rating: "Calificación",
    comment: "Comentario",
    optional: "opcional",
    shareExperience: "Comparte tu experiencia...",
    submitReview: "Enviar reseña",
    cancel: "Cancelar",
    noReviews: "Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!",
    helpful: "Útil",
    noResourcesSelected: "No hay recursos seleccionados para comparar",
    selectResourcesToCompare: "Selecciona hasta 3 recursos de los resultados de búsqueda para compararlos lado a lado",
    clearAll: "Limpiar todo",
    addMoreResources: "Agregar más recursos para comparar",
    remaining: "restantes",
    addEvent: "Agregar evento",
    addNewEvent: "Agregar nuevo evento",
    eventTitle: "Título del evento",
    enterEventTitle: "Ingresa el título del evento",
    date: "Fecha",
    time: "Hora",
    eventType: "Tipo de evento",
    appointment: "Cita",
    reminder: "Recordatorio",
    event: "Evento",
    relatedResource: "Recurso relacionado",
    selectResource: "Seleccionar un recurso",
    noResource: "Sin recurso",
    notes: "Notas",
    addEventNotes: "Agregar notas para este evento",
    noUpcomingEvents: "No hay eventos próximos",
    addFirstEvent: "Haz clic en 'Agregar evento' para programar tu primera cita o recordatorio",
    calendarStats: "Estadísticas del calendario",
    appointments: "Citas",
    reminders: "Recordatorios",
    events: "Eventos",
    availability: "Disponibilidad"
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
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: string) => translations.en[key] || key
    };
  }
  return context;
}