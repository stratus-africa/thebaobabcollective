# Plan — CMS, Admin Panel, Bookings & 5 New Pages

This is a large piece of work. I'll break it into clear phases so you can confirm before I build.

## Phase 1 — Auth & Admin Foundation
- Enable email/password + Google sign-in on Lovable Cloud
- `profiles` table (auto-created on signup) + `user_roles` table with `app_role` enum (`admin`, `editor`, `user`) and `has_role()` security-definer function
- Integration-managed `/_authenticated` gate
- `/auth` sign-in page
- `/admin` protected area, gated by `has_role(uid, 'admin')`
- Seed: first admin set via migration using your email (you'll provide it)

## Phase 2 — CMS (move content from `src/lib/content.ts` into DB)
New tables (all with RLS — public SELECT for published rows, admin write):
- `journey_categories` (slug, title, tagline, intro, hero_image, sort_order, published)
- `itineraries` (category_id FK, name, nights, description, highlights[], image, sort_order)
- `journal_articles` (slug, title, excerpt, image, date, read_time, category, content[], published)
- `lodges` (slug, name, location, description, gallery[], price_from, published)
- `destinations` (slug, name, region, description, image, featured_trips[], lat, lng, published)
- `testimonials` (name, location, quote, rating, image, published, sort_order)
- `faqs` (category enum: planning|conservation|logistics, question, answer, sort_order, published)
- `site_settings` (key/value for hero text, contact info, etc.)

Server functions (`*.functions.ts`) for public reads (admin client, published-only) and admin CRUD (auth + has_role check).

Home, Journeys, Journal pages refactored to load from DB instead of `content.ts`.

## Phase 3 — Admin Panel UI (`/admin/*`)
Sidebar layout with sections:
- Dashboard (counts: enquiries, bookings, subscribers)
- Journeys & Itineraries (CRUD)
- Journal Articles (CRUD with multi-paragraph editor)
- Lodges, Destinations, Testimonials, FAQs (CRUD)
- Enquiries inbox (list + mark read/archived)
- Bookings management (see Phase 4)
- Newsletter subscribers (list/export CSV)
- Site settings

Image uploads via Lovable Cloud storage bucket (`cms-media`, public read).

## Phase 4 — Tours Booking System
Tables:
- `bookings` (user_id, itinerary_id, travel_date, party_size, guest_name, guest_email, guest_phone, special_requests, total_estimate, status enum: pending|confirmed|cancelled|completed, created_at)
- `booking_notes` (admin-only notes per booking)

Flow:
- Each itinerary page gets a "Book this journey" button → booking form (date picker, party size, contact)
- Authenticated users: prefilled, booking attached to account, visible at `/my-bookings`
- Guests: can book with email; receive confirmation
- Admin: full bookings table with status updates, filtering, search

## Phase 5 — 5 New Public Pages
1. **`/lodges`** — gallery card grid from `lodges` table; each card → enquiry CTA (prefills contact form with lodge name)
2. **`/destinations`** — searchable grid (client filter by name/region); map-style layout using CSS grid + region badges; featured trip links
3. **`/testimonials`** — quote cards with star ratings, trust-bar (years / journeys / partners), CTA
4. **`/faq`** — shadcn Accordion grouped by category (Planning, Conservation, Logistics) with search filter
5. **`/private-travel`** — bespoke itinerary request form (destinations, dates, budget, party, interests, notes) → `private_travel_requests` table + confirmation email via Lovable Emails (requires email domain setup; I'll prompt you when ready)

Navbar updated with new links (grouped under a "Explore" mega menu on desktop to avoid clutter).

## Technical notes
- Stack: TanStack Start server functions for all CRUD, RLS-enforced, admin client only inside handlers
- Image storage: Supabase storage bucket `cms-media` (public read, admin write)
- Email confirmations: Lovable Emails (will trigger email-setup dialog when we reach Phase 5)
- Forms: react-hook-form + zod, consistent with existing contact form
- All admin mutations re-check `has_role(uid, 'admin')` server-side

## What I need from you
1. **Admin email** to seed as the first admin account
2. **Confirm scope** — this is ~3–4 substantial build turns. OK to proceed end-to-end, or want to start with Phase 1+2 only and review?
3. **Bookings depth** — simple inquiry-style (no payment, admin confirms manually) or do you want Stripe payment capture too?
