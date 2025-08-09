import { Resource } from "@/data/resources";

/**
 * Returns only resources that Gemini classifies as cancer-related (Yes).
 * If no Gemini API key is found in localStorage (gemini_api_key), returns input as-is.
 * Supports Spanish language prompts when language is set to 'es'.
 */
export async function filterCancerResources(resources: Resource[], language: string = 'en'): Promise<Resource[]> {
  try {
    const apiKey = (localStorage.getItem("gemini_api_key") || "").trim();
    if (!apiKey) return resources; // No key -> do not filter to avoid hiding results

    const filtered: Resource[] = [];
    for (const r of resources) {
      const ok = await isCancerRelated(r, apiKey, language);
      if (ok) filtered.push(r);
    }
    return filtered;
  } catch (e) {
    // On any failure, return original resources to avoid breaking UX
    console.warn("AI filter error - returning unfiltered results", e);
    return resources;
  }
}

async function isCancerRelated(resource: Resource, apiKey: string, language: string = 'en'): Promise<boolean> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const prompts = {
    en: `You are a strict classifier. Answer with exactly "Yes" or "No".\n\nQuestion: Is the following location specifically related to cancer (e.g., oncology, cancer treatment, cancer support groups, cancer-focused nonprofits, radiation oncology, chemotherapy)? General hospitals, generic counseling, or transport services without explicit cancer focus should be "No".\n\nName: ${resource.name}\nCategory: ${resource.category}\nWebsite: ${resource.website || "unknown"}\nAddress: ${resource.address || ""}\nCity: ${resource.city || ""}\n\nAnswer with only Yes or No.`,
    es: `Eres un clasificador estricto. Responde exactamente con "Sí" o "No".\n\nPregunta: ¿Esta ubicación está específicamente relacionada con el cáncer (por ejemplo, oncología, tratamiento del cáncer, grupos de apoyo para el cáncer, organizaciones sin fines de lucro enfocadas en el cáncer, radio-oncología, quimioterapia)? Los hospitales generales, consejería genérica, o servicios de transporte sin enfoque explícito en el cáncer deberían ser "No".\n\nNombre: ${resource.name}\nCategoría: ${resource.category}\nSitio web: ${resource.website || "desconocido"}\nDirección: ${resource.address || ""}\nCiudad: ${resource.city || ""}\n\nResponde solo con Sí o No.`
  };

  const prompt = prompts[language as keyof typeof prompts] || prompts.en;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0,
          topP: 0,
          maxOutputTokens: 4,
        },
      }),
    });

    if (!res.ok) {
      console.warn("Gemini API HTTP error", res.status, await res.text());
      return true; // be permissive on failure
    }
    const data: any = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return true; // permissive on empty
    const ans = String(text).trim().toLowerCase();
    // Handle both English "yes" and Spanish "sí"
    return ans.startsWith("y") || ans.startsWith("s");
  } catch (err) {
    console.warn("Gemini API error", err);
    return true; // permissive on error
  }
}
