import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { actionLinks, type ActionLink } from "@/data/actionLinks";
import { ExternalLink } from "lucide-react";

const ITEMS_PER_PAGE = 9;

export function ActionLinks() {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, actionLinks.length));
  };
  const loadLess = () => {
    setVisibleCount((prev) => Math.max(ITEMS_PER_PAGE, prev - ITEMS_PER_PAGE));
  };

  const visibleLinks = actionLinks.slice(0, visibleCount);
  const hasMore = visibleCount < actionLinks.length;
  const canLoadLess = visibleCount > ITEMS_PER_PAGE;

  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'website';
    }
  };

  const getFaviconUrl = (url: string): string => {
    const domain = getDomainFromUrl(url);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  };

  return (
    <section className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">What can you do</h2>
        <p className="mt-2 text-muted-foreground">
          Connect with communities, find support, and take action
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleLinks.map((link: ActionLink) => (
          <Card key={link.id} className="p-4 hover:shadow-md transition-shadow">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col h-full group"
            >
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={getFaviconUrl(link.url)}
                  alt={`${link.title} favicon`}
                  className="w-8 h-8 rounded-sm flex-shrink-0"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to a generic icon if favicon fails
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/%3E%3C/svg%3E";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {link.title}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full mt-1">
                    {link.category}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">
                {link.description}
              </p>
            </a>
          </Card>
        ))}
      </div>

      {(hasMore || canLoadLess) && (
        <div className="flex items-center justify-center gap-3">
          {canLoadLess && (
            <Button onClick={loadLess} variant="outline" size="lg" aria-label="Load fewer items">
              Load Less
            </Button>
          )}
          {hasMore && (
            <Button onClick={loadMore} variant="outline" size="lg" aria-label="Load more items">
              Load More ({actionLinks.length - visibleCount} remaining)
            </Button>
          )}
        </div>
      )}
    </section>
  );
}