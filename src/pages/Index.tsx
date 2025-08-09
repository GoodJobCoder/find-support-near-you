import SupportSearch from "@/components/SupportSearch";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div>
      <header className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(var(--brand-1))] via-[hsl(var(--brand-3))] to-[hsl(var(--brand-2))] opacity-40" />
        {/* Decorative pink glows */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[hsl(var(--brand-1))] opacity-30 blur-3xl animate-pulse" />
        <div aria-hidden className="pointer-events-none absolute top-1/4 -right-20 h-80 w-80 rounded-full bg-[hsl(var(--brand-2))] opacity-25 blur-3xl animate-pulse" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-[hsl(var(--brand-3))] opacity-30 blur-3xl" />
        <div className="container relative z-10 flex min-h-screen flex-col items-center justify-center py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Find Cancer Support Near You
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover nearby support groups, treatment centers, counseling, and resources tailored to your journey.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-4xl w-full">
            <SupportSearch />
          </div>
          
          {/* Pharmacy Button */}
          <div className="mx-auto mt-6">
            <Button
              onClick={() => navigate("/pharmacy")}
              variant="outline"
              className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Find Pharmacies
            </Button>
          </div>
          
          {/* Footnote within background */}
          <div className="mx-auto mt-8 max-w-4xl">
            <article className="rounded-lg border border-border/70 bg-card/80 backdrop-blur-sm p-6 leading-relaxed text-sm text-muted-foreground">
              <p>
                This tool helps you quickly locate trusted cancer support organizations around you. Use your current location or search by city/postcode, then filter by category and distance.
              </p>
            </article>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Index;
