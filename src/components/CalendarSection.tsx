import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCalendar, CalendarEvent } from '@/hooks/useCalendar';
import { useLanguage } from '@/context/LanguageContext';
import { Resource } from '@/data/resources';

interface CalendarSectionProps {
  resources?: Resource[];
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ resources = [] }) => {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'appointment' as CalendarEvent['type'],
    resourceId: '',
    notes: ''
  });

  const { events, addEvent, removeEvent, getUpcomingEvents } = useCalendar();
  const { t } = useLanguage();

  const upcomingEvents = getUpcomingEvents(30); // Next 30 days

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    const selectedResource = resources.find(r => r.id === newEvent.resourceId);
    
    addEvent({
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      type: newEvent.type,
      resourceId: newEvent.resourceId || undefined,
      resourceName: selectedResource?.name,
      notes: newEvent.notes || undefined
    });

    setNewEvent({
      title: '',
      date: '',
      time: '',
      type: 'appointment',
      resourceId: '',
      notes: ''
    });
    setShowAddEvent(false);
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'appointment': return 'bg-blue-500';
      case 'reminder': return 'bg-yellow-500';
      case 'event': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatEventDateTime = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`);
    return eventDate.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          {t('myCalendar')}
        </h3>
        <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('addEvent')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('addNewEvent')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">{t('eventTitle')}</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder={t('enterEventTitle')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">{t('date')}</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">{t('time')}</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">{t('eventType')}</Label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value as CalendarEvent['type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment">{t('appointment')}</SelectItem>
                    <SelectItem value="reminder">{t('reminder')}</SelectItem>
                    <SelectItem value="event">{t('event')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {resources.length > 0 && (
                <div>
                  <Label htmlFor="resource">{t('relatedResource')} ({t('optional')})</Label>
                  <Select value={newEvent.resourceId} onValueChange={(value) => setNewEvent({ ...newEvent, resourceId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectResource')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('noResource')}</SelectItem>
                      {resources.map(resource => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="notes">{t('notes')} ({t('optional')})</Label>
                <Textarea
                  id="notes"
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  placeholder={t('addEventNotes')}
                  className="min-h-20"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddEvent} disabled={!newEvent.title || !newEvent.date || !newEvent.time}>
                  {t('addEvent')}
                </Button>
                <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Events */}
      <div className="space-y-3">
        {upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">{t('noUpcomingEvents')}</p>
              <p className="text-sm text-muted-foreground">{t('addFirstEvent')}</p>
            </CardContent>
          </Card>
        ) : (
          upcomingEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {t(event.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatEventDateTime(event.date, event.time)}
                      </div>
                      {event.resourceName && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.resourceName}
                        </div>
                      )}
                    </div>
                    
                    {event.notes && (
                      <p className="text-sm text-muted-foreground">{event.notes}</p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvent(event.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('calendarStats')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {events.filter(e => e.type === 'appointment').length}
                </div>
                <div className="text-xs text-muted-foreground">{t('appointments')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">
                  {events.filter(e => e.type === 'reminder').length}
                </div>
                <div className="text-xs text-muted-foreground">{t('reminders')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {events.filter(e => e.type === 'event').length}
                </div>
                <div className="text-xs text-muted-foreground">{t('events')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarSection;