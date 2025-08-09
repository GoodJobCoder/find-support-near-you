import React from "react";
import { Resource } from "@/data/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe, ExternalLink, MessageSquare } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { useNavigate } from "react-router-dom";

export default function ResourceDetails({ resource }: { resource: Resource & { distance?: number } }) {
  const { openWith } = useChat();
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold leading-tight">{resource.name}</h3>
          <div className="mt-1 text-sm text-muted-foreground">
            {resource.city}{resource.state ? `, ${resource.state}` : ""} · {resource.country}
          </div>
        </div>
        <Badge>{resource.category}</Badge>
      </div>

      {resource.address && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {resource.address}, {resource.city}{resource.state ? `, ${resource.state}` : ""}
          </span>
        </div>
      )}

      {typeof (resource as any).distance === "number" && (
        <div className="text-sm text-muted-foreground">
          {(resource as any).distance.toFixed(1)} km away
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          size="sm"
          onClick={() => {
            openWith({
              resource: {
                id: (resource as any).id,
                name: resource.name,
                category: String((resource as any).category ?? ""),
                address: resource.address,
                city: resource.city,
                state: (resource as any).state,
                country: resource.country,
                phone: (resource as any).phone,
                website: (resource as any).website,
                lat: (resource as any).lat,
                lng: (resource as any).lng,
              },
            });
            navigate("/");
          }}
        >
          <span className="inline-flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Chat about this location
          </span>
        </Button>
        {resource.phone && (
          <Button asChild variant="secondary" size="sm">
            <a href={`tel:${resource.phone}`} className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" /> Call
            </a>
          </Button>
        )}
        {resource.website && (
          <Button asChild size="sm">
            <a href={resource.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
              <Globe className="h-4 w-4" /> Visit Website
            </a>
          </Button>
        )}
        <Button asChild variant="outline" size="sm">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.name + ", " + resource.address + ", " + resource.city)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            Open in Maps <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="rounded-md border p-3 text-sm text-muted-foreground">
        Tip: Information may change. Please contact the organization to confirm details.
      </div>
    </div>
  );
}
