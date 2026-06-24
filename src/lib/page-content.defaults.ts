// Default content for editable pages, used as fallback if no override is saved.
export const PAGE_DEFAULTS = {
  home: {
    hero_title_line1: "JOURNEYS",
    hero_title_line2: "THAT CONNECT",
    hero_subtitle: "Curated safari experiences that immerse, inspire and leave a lasting impact.",
    hero_cta_primary: "Explore Journeys",
    hero_cta_secondary: "Plan With Us",
    hero_proof_text: "Trusted by travellers across 24 countries this season",
    hero_image_url: "",
  },
  about: {
    eyebrow: "The Baobab Collective",
    title_line1: "AUTHENTIC.",
    title_line2: "CONSCIOUS.",
    title_line3: "EXTRAORDINARY.",
    body: "We design journeys that connect you to the heart of Africa — its landscapes, wildlife, people and stories.",
    cta_label: "Learn more about us",
    image_left_url: "",
    image_right_url: "",
  },
  private_travel: {
    eyebrow: "Private Travel",
    title: "Designed entirely around you.",
    subtitle:
      "For travellers who want something truly bespoke — every camp, guide and moment shaped to your story.",
    success_title: "Request received",
    success_body:
      "A confirmation has been sent to your inbox. One of our journey designers will reach out within 48 hours.",
    submit_label: "Request my bespoke journey",
  },
} as const;

export type PageDefaults = typeof PAGE_DEFAULTS;
export type PageKey = keyof PageDefaults;

export function mergePageContent<K extends PageKey>(
  key: K,
  override: Record<string, any> | null | undefined,
): PageDefaults[K] {
  return { ...PAGE_DEFAULTS[key], ...(override ?? {}) } as PageDefaults[K];
}
