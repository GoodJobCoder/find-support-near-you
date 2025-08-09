import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  is24Hours?: boolean;
}

interface AvailabilityStatusProps {
  hours?: BusinessHours;
  className?: string;
}

export default function AvailabilityStatus({ hours, className }: AvailabilityStatusProps) {
  const { t } = useLanguage();

  if (!hours) return null;

  const isCurrentlyOpen = () => {
    if (hours.is24Hours) return true;
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof BusinessHours;
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const todayHours = hours[currentDay];
    if (!todayHours || todayHours === 'Closed' || typeof todayHours === 'boolean') return false;
    
    // Parse hours like "9:00 AM - 5:00 PM"
    const timeMatch = todayHours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) return false;
    
    const [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = timeMatch;
    
    let startTime = parseInt(startHour) * 100 + parseInt(startMin);
    let endTime = parseInt(endHour) * 100 + parseInt(endMin);
    
    if (startPeriod.toUpperCase() === 'PM' && parseInt(startHour) !== 12) startTime += 1200;
    if (endPeriod.toUpperCase() === 'PM' && parseInt(endHour) !== 12) endTime += 1200;
    if (startPeriod.toUpperCase() === 'AM' && parseInt(startHour) === 12) startTime -= 1200;
    if (endPeriod.toUpperCase() === 'AM' && parseInt(endHour) === 12) endTime -= 1200;
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  const isOpen = isCurrentlyOpen();
  const is24Hours = hours.is24Hours;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      {is24Hours ? (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          {t('availability.open_24h')}
        </Badge>
      ) : (
        <Badge variant={isOpen ? "default" : "secondary"} className={isOpen ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
          {isOpen ? t('availability.open') : t('availability.closed')}
        </Badge>
      )}
    </div>
  );
}