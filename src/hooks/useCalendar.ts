import { useState, useEffect } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  resourceId?: string;
  resourceName?: string;
  type: 'appointment' | 'reminder' | 'event';
  notes?: string;
}

const CALENDAR_KEY = 'cancer-support-calendar';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CALENDAR_KEY);
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading calendar events:', error);
      }
    }
  }, []);

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };
    const updated = [...events, newEvent];
    setEvents(updated);
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(updated));
  };

  const removeEvent = (eventId: string) => {
    const updated = events.filter(event => event.id !== eventId);
    setEvents(updated);
    localStorage.setItem(CALENDAR_KEY, JSON.stringify(updated));
  };

  const getUpcomingEvents = (days: number = 7) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= futureDate;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  return {
    events,
    addEvent,
    removeEvent,
    getUpcomingEvents,
    getEventsForDate
  };
}