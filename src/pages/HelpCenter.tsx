import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const HelpCenter = () => {
  const { t } = useLanguage();
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
      <header className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(var(--brand-1))] via-[hsl(var(--brand-3))] to-[hsl(var(--brand-2))] opacity-40" />
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[hsl(var(--brand-1))] opacity-30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-[hsl(var(--brand-2))] opacity-25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-12 left-1/3 h-56 w-56 rounded-full bg-[hsl(var(--brand-3))] opacity-30 blur-3xl" />
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{t('help.title')}</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">{t('help.subtitle')}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <section className="grid gap-6 md:grid-cols-3">
          <article className="rounded-lg border border-border bg-card p-8 shadow-sm md:col-span-2 md:row-span-2">
            <h2 className="text-xl font-semibold">{t('help.getting_started')}</h2>
            <p className="mt-2 text-muted-foreground">
              {t('help.getting_started_text')}
            </p>
          </article>

          <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{t('help.saving_favorites')}</h2>
            <p className="mt-2 text-muted-foreground">
              {t('help.saving_favorites_text')}
            </p>
          </article>

          <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{t('help.contacting_providers')}</h2>
            <p className="mt-2 text-muted-foreground">
              {t('help.contacting_providers_text')}
            </p>
          </article>

          <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{t('help.language_support')}</h2>
            <p className="mt-2 text-muted-foreground">
              {t('help.language_support_text')}
            </p>
          </article>
        </section>
      </main>
    </div>
  );
};

export default HelpCenter;
