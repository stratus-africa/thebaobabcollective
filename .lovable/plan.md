
## Plan

### 1. "Plan with us" Enquiry CTA — contact info + prefill
- In `EnquireDialog`, add a header strip above the form showing:
  - Phone number (placeholder until you confirm — please share the number to display)
  - Email: info@thebaobabcollective.co.uk (mailto link)
- Extend `EnquireForm` / `EnquireDialog` props to accept an optional `prefill` object:
  - `{ interest?: string; destination?: string; subject?: string; message?: string }`
- When opening the dialog from a lodge / journey / destination detail page, pass the item's name so the message + interest fields are pre-populated (e.g. "I'd like to plan a trip to {Lodge Name}").

### 2. Breadcrumbs on detail pages
- Use existing `src/components/ui/breadcrumb.tsx`.
- Add a small `<Breadcrumbs />` block at the top of each detail page below the navbar:
  - Lodges: Home › Lodges › {Lodge Name}
  - Journeys: Home › Journeys › {Journey Name}
  - Destinations: Home › Destinations › {Destination Name}
- Files: `src/routes/lodges.$slug.tsx`, `src/routes/journeys.$slug.tsx`, `src/routes/destinations.$slug.tsx`.

### 3. Image lightbox for galleries
- Create `src/components/site/Lightbox.tsx`:
  - Built on shadcn `Dialog`, full-screen image, next/prev arrows, ESC + arrow-key support, caption under image, image counter (e.g. 3 / 8).
  - Props: `images: { src: string; caption?: string }[]`, `open`, `onOpenChange`, `index`, `onIndexChange`.
- Replace gallery grid `<img>`s on the 3 detail pages with clickable thumbnails that open the lightbox at the right index.

### 4. JSON-LD structured data
Add via the route `head().scripts` array as `application/ld+json`:
- **Lodge detail** → `LodgingBusiness` schema (name, description, image, address if available, amenityFeature from amenities list) + `BreadcrumbList`.
- **Journey detail** → `TouristTrip` schema (name, description, image, itinerary as `itemListElement`) + `BreadcrumbList`.
- **Destination detail** → `TouristDestination` schema (name, description, image, touristType, includesAttraction from activities) + `BreadcrumbList`.

### Files to change / create
- create `src/components/site/Lightbox.tsx`
- edit `src/components/site/EnquireDialog.tsx` (contact header + prefill pass-through)
- edit `src/components/site/EnquireForm.tsx` (accept `prefill` prop)
- edit `src/routes/lodges.$slug.tsx`, `src/routes/journeys.$slug.tsx`, `src/routes/destinations.$slug.tsx` (breadcrumbs, lightbox wiring, JSON-LD, prefilled EnquireDialog)

### One question before I build
What phone number should I show in the enquiry modal header (alongside info@thebaobabcollective.co.uk)?
