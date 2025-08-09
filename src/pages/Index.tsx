import SupportSearch from "@/components/SupportSearch";

const Index = () => {
  return (
    <>
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(var(--brand-1))] via-[hsl(var(--brand-3))] to-[hsl(var(--brand-2))] opacity-20" />
        <div className="container py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Find Cancer Support Near You
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover nearby support groups, treatment centers, counseling, and resources tailored to your journey.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-4xl">
            <SupportSearch />
          </div>
        </div>
      </header>

      <main className="container pb-20">
        <section className="mx-auto max-w-4xl">
          <article className="rounded-lg border border-border/70 bg-card/80 p-6 leading-relaxed text-sm text-muted-foreground">
            <p>
              This tool helps you quickly locate trusted cancer support organizations around you. Use your current location or search by city/postcode, then filter by category and distance.
            </p>
          </article>
        </section>
      </main>
    </>
  );
};

export default Index;
