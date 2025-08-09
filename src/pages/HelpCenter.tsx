import { useEffect } from "react";

const HelpCenter = () => {
  useEffect(() => {
    // Title
    const previousTitle = document.title;
    document.title = "Help Center | CareConnect";

    // Meta description
    const descContent =
      "Help Center for CareConnect: FAQs, contact, and guidance for finding cancer support resources near you.";
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    const prevDesc = metaDesc.getAttribute("content") || "";
    metaDesc.setAttribute("content", descContent);

    // Canonical tag
    const href = "/help";
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const prevCanonical = canonical?.href || "";
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", href);

    // FAQ JSON-LD
    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.id = "helpcenter-faq-jsonld";
    faqScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I find support resources near me?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Use the search on the home page to filter by location and category, then view details for directions and contact info.",
          },
        },
        {
          "@type": "Question",
          name: "Who can I contact for urgent help?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "If this is an emergency, call your local emergency number immediately. For urgent medical questions, contact your care team.",
          },
        },
      ],
    });
    document.head.appendChild(faqScript);

    return () => {
      document.title = previousTitle;
      if (metaDesc) metaDesc.setAttribute("content", prevDesc);
      if (canonical && prevCanonical) canonical.setAttribute("href", prevCanonical);
      const existingFaq = document.getElementById("helpcenter-faq-jsonld");
      if (existingFaq) existingFaq.remove();
    };
  }, []);

  return (
    <div>
      <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Find answers to common questions and learn how to get the most out of CareConnect when searching for cancer support resources.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Getting Started</h2>
            <p className="mt-2 text-muted-foreground">
              Use the search on the home page to enter your city or postcode. Apply filters like distance and category to refine results.
            </p>
          </article>

          <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Saving Favorites</h2>
            <p className="mt-2 text-muted-foreground">
              Tap the heart icon on any result to save it for quick access later in your favorites list.
            </p>
          </article>

          <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Contacting Providers</h2>
            <p className="mt-2 text-muted-foreground">
              Open a resource to view phone, website, and location details. Always verify hours and availability before visiting.
            </p>
          </article>

          <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Language Support</h2>
            <p className="mt-2 text-muted-foreground">
              Use the language selector to browse resources in your preferred language where available.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default HelpCenter;
