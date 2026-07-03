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
  // NEW — homepage strip sections
  home_journeys: {
    eyebrow: "Curated Safari Journeys",
    title: "OUR JOURNEYS",
    body: "Thoughtfully curated experiences that celebrate adventure, connection and heritage.",
  },
  home_journal: {
    eyebrow: "Be Inspired",
    title_line1: "Stories.",
    title_line2: "Guidance.",
    title_line3: "Inspiration.",
    body: "Discover travel tips, destination guides and stories from the road less travelled.",
    cta_label: "Explore Our Journal",
  },
  home_instagram: {
    heading: "Follow Our Journeys",
    handle: "@thebaobabcollective",
    url: "https://instagram.com/thebaobabcollective",
  },
  top_bar: {
    text: "Curated Safari Journeys. Authentic Connections. Extraordinary Experiences.",
    enabled: true,
  },
  // NEW — dedicated pages
  contact: {
    eyebrow: "We'd love to hear from you",
    title_line1: "Let's Plan",
    title_line2: "Your Journey",
    body: "Tell us a little about who's travelling, when, and the kind of experience you're after. One of our journey designers will respond within 24 hours with first ideas and next steps.",
    form_title: "Share Your Vision",
    form_intro:
      "Open our detailed enquiry form — tell us who's travelling, when, your budget, and the experiences you're dreaming of. We'll respond within 24 hours.",
    form_cta: "Open Enquiry Form",
    email_label: "Email us",
    phone_label: "Call / WhatsApp",
    instagram_label: "Instagram",
    facebook_label: "Facebook",
    instagram_url: "https://instagram.com/thebaobabcollective",
    instagram_handle: "@thebaobabcollective",
    facebook_url: "https://facebook.com/thebaobabcollective",
    facebook_handle: "/thebaobabcollective",
  },
  // Landing page copy (only the intro / hero band on the listing pages)
  journeys_index: {
    eyebrow: "Curated Safari Journeys",
    title: "Our Journeys",
    subtitle: "Handpicked safari experiences that celebrate adventure, connection, heritage and conservation.",
  },
  destinations_index: {
    eyebrow: "The Continent",
    title: "Destinations",
    subtitle: "From the deltas of Botswana to the highlands of Ethiopia — explore where each journey could take you.",
  },
  lodges_index: {
    eyebrow: "Where you'll stay",
    title: "Partner Lodges",
    subtitle: "Every camp and lodge we work with has been walked, slept in, and chosen for soul as much as setting.",
  },
  adventures_index: {
    eyebrow: "Signature Adventures",
    title: "Wild Africa, Deeply Lived",
    subtitle: "Walking safaris, mokoro expeditions, desert traverses, gorilla treks and migration chases.",
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
