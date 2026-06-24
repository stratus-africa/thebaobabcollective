# /adventures: Filters, CMS, Prefilled Enquire, Planning Guide

Four tightly scoped additions to the Adventures page.

## 1. Search & filters (Region / Terrain / Difficulty)

Add a sticky filter bar above the Signature Adventures grid with:
- Text search (matches name + description)
- Region dropdown (Botswana, Namibia, Tanzania & Kenya, Rwanda & Uganda, Zambia, Ethiopia, …)
- Terrain dropdown (Delta, Desert, Savannah, Forest, Mountain, Coastal)
- Difficulty dropdown (Easy, Moderate, Active, Challenging)
- "Clear all" pill, and a result count ("Showing 4 of 6 adventures").

Filters live in URL search params (`?region=…&terrain=…&difficulty=…&q=…`) using TanStack `validateSearch` + `fallback()` so links stay shareable and refreshable. Empty/no-match state shows a "No adventures match" panel with a Clear-filters action and a "Design your own" link to `/private-travel`.

## 2. Signature adventures → itinerary detail pages

Each signature card gets a stable `slug` (e.g. `okavango-on-foot`) and:
- A "View itinerary" button → `/itineraries/$slug`
- An "Enquire" button → `/itineraries/$slug` with `hash="enquire"` and `search={{ itinerary: '<name>' }}`

`/itineraries/$slug` already loads itinerary detail; it'll read the optional `itinerary` search param and prefill the Enquire form's destination field (falls back to the itinerary's own name when the param is absent). Signature itineraries that don't yet exist in the `itineraries` table are seeded via migration so the detail route resolves them.

## 3. Admin CMS editor for the Adventures page

New DB table `adventures_page_blocks` (single source of truth for the page) storing four section arrays as JSONB, plus editable hero/intro/CTA copy. Tables already have admin/editor RLS; new table follows the same pattern.

Sections editable from `/admin/adventures`:
- **Page copy**: hero eyebrow, headline, subhead, philosophy statement, CTA copy
- **Terrain tiles**: label, note, icon name
- **Adventure styles**: title, body, icon name
- **Signature itineraries**: slug, name, region, nights, difficulty, image URL, description, highlights[]

Admin UI uses existing shadcn Card/Input/Textarea patterns from `admin/content.$table.tsx`, with add/remove row controls per section and a single "Save" per section. Public `/adventures` reads via a public server fn (publishable-key client + anon SELECT policy); falls back to current hardcoded defaults if no row exists, so the page never blanks.

A new "Adventures" link is added to the admin sidebar.

## 4. Planning Guide request form + PDF email

New `planning_guide_requests` table (name, email, travelling_party, interests[], earliest_date, message, created_at) with admin-only read, anon insert (rate-limit via simple unique-on-email-per-24h trigger).

New `/adventures` section "Request the Planning Guide" with form (name, email, travel window, interests checkboxes, optional message). On submit:
1. Insert row via public server fn.
2. Generate a branded PDF on the server using `@react-pdf/renderer` (Stratus / Baobab branding, sections: how we plan, when to go, sample budgets, packing, conservation note, contact).
3. Send two emails through the existing Lovable Emails infra:
   - To requester: app-email template `planning-guide-delivery` with the PDF link (PDF stored in a public Supabase Storage bucket `planning-guides`, signed URL valid 30 days). Attachments aren't supported by Lovable Emails per platform rules, so the email links to the PDF.
   - To `hello@stratus.africa`: app-email template `planning-guide-notification` with the requester's details.
4. Show success state with inline download link.

Admin view `/admin/planning-guide` lists requests + CSV export.

## Technical details

### Files
- `src/routes/adventures.tsx` — refactored to consume CMS data + render filters + add planning-guide section. Filters use `validateSearch` + `useSearch` + `useNavigate` (function-form search updates).
- `src/lib/adventures.functions.ts` — `getAdventuresPage()` (public, publishable-key client), `upsertAdventuresPage()` (admin).
- `src/lib/planning-guide.functions.ts` — `requestPlanningGuide()` (public, generates PDF + enqueues emails), admin-only `listPlanningGuideRequests()`.
- `src/lib/email-templates/planning-guide-delivery.tsx` + `planning-guide-notification.tsx` (React Email).
- `src/lib/pdf/planning-guide.tsx` — `@react-pdf/renderer` document.
- `src/routes/_authenticated/admin/adventures.tsx` — section editors.
- `src/routes/_authenticated/admin/planning-guide.tsx` — request inbox.
- `src/routes/itineraries.$slug.tsx` — read `?itinerary=` and prefill Enquire form.
- Admin sidebar gets 2 new entries.

### Database
- `adventures_page_blocks (id PK, hero JSONB, philosophy JSONB, cta JSONB, terrains JSONB[], styles JSONB[], signatures JSONB[], updated_at, updated_by)` — single row, RLS: SELECT anon/auth; INSERT/UPDATE admin only.
- `planning_guide_requests (id, name, email, travelling_party, interests TEXT[], earliest_date, message, pdf_url, created_at)` — RLS: INSERT anon (with simple per-email rate guard); SELECT admin only.
- Storage bucket `planning-guides` (public read).
- Seed `adventures_page_blocks` row with current hardcoded content.
- Seed `itineraries` rows for the six signature adventures so `/itineraries/$slug` resolves.

### Infra
- If Lovable Emails domain is not yet configured, I'll prompt the user to set it up before wiring the planning-guide sends — the form still saves to DB in the meantime.
- PDF generated server-side per request, uploaded to Storage, signed URL returned + embedded in email.

## Deliverable order
1. Migrations (tables, RLS, storage bucket, itinerary seeds).
2. Server fns + CMS data layer.
3. Refactor `/adventures` to use CMS data + filters + linked signatures + planning-guide form.
4. Itinerary detail prefill.
5. Admin editors + sidebar links.
6. Planning-guide PDF + email templates + wiring.
