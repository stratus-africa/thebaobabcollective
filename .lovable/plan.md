
## 1. User Invite Flow (Settings → Users tab)

- New server fn `inviteUser` in `src/lib/users-admin.functions.ts`:
  - Admin-only (`assertAdmin`).
  - Input: `{ email, role: "admin" | "customer" }`.
  - Calls `supabaseAdmin.auth.admin.inviteUserByEmail(email, { redirectTo: <site>/auth })`.
  - On success, upserts the chosen role into `user_roles` for the new user id.
- UI: add an "Invite user" card above the users table with email input + role select + Send invite button. Shows toast on success/failure and refreshes the list.
- Invite emails use the existing Lovable Auth email pipeline (already configured); no extra email setup required.

## 2. Convert Settings into Vertical Tabs

Refactor `src/routes/_authenticated/admin/settings.tsx`:
- Replace the stacked cards with shadcn `Tabs` configured vertically (left rail of triggers, right pane of content), 3 tabs: **Branding**, **Contact**, **Users**.
- Each existing card body moves into its tab pane unchanged.
- Layout: `grid grid-cols-[200px_1fr]` on `md+`, stacked on mobile.

## 3. Site Logo — Local Upload

- Create a new public storage bucket `site-media` (public read so the logo loads anonymously on every page).
- New server fn `uploadSiteAsset` (admin-only) that mirrors `adminUploadImage` but writes to `site-media` and returns the public URL.
- In the Branding tab, replace the "Logo URL" text input with an image picker (file chooser + preview + clear) that uploads via `uploadSiteAsset` and stores the resulting public URL in `site_settings.branding.logoUrl`. Keep an optional "Paste URL" fallback.

## 4. Local Media Uploads Across CMS (Pages, Journeys, Destinations, Lodges, Adventures)

- The CMS already uploads images to the `journal-images` bucket via `adminUploadImage` for fields typed `image` in `content.$table.tsx` and on the Pages editor. Adventures still uses a plain URL input.
- Changes:
  - Update `src/routes/_authenticated/admin/adventures.tsx` to use the same uploader component (file picker + preview) for the Adventure image instead of a URL input.
  - Audit `content.$table.tsx` field configs for `pages`, `journey_categories`, `destinations`, `lodges`, `itineraries`, `journal_articles` and ensure every hero/image field is typed `image` so they all route through the uploader. Add any missing image fields (e.g. gallery arrays) as `image`-typed.
  - Rename the storage bucket usage to `site-media` (public) for new uploads so URLs are stable, public, and don't rely on long-lived signed URLs. Existing signed URLs continue to work; no migration of old rows needed.

## 5. Detail-Page CTA Verification

- "Read more" on Journal cards, "View Lodge" on Lodges cards, and "Explore Journey" on Journeys cards are already wired to `/journal/$slug`, `/lodges/$slug`, and `/journeys/$slug`. If a card doesn't navigate, the cause is a row whose `slug` is empty/duplicate.
- Add a small guard:
  - In each listing (`journal.tsx`, `lodges.tsx`, `journeys.tsx`), skip/disable cards with missing slugs and log a console warning so authors can fix the row.
  - In the corresponding `$slug` route's `notFoundComponent`, show a clear "This item no longer exists" message with a link back to the list (lodges already has this; replicate for journal and journeys).
- No router/link changes required beyond that — the routes exist and the params are correct.

## Technical Notes

- Storage: `supabase--storage_create_bucket` with `name: "site-media", public: true`. Add a `storage.objects` RLS policy allowing public SELECT on that bucket and authenticated INSERT/UPDATE/DELETE.
- `inviteUserByEmail` requires the service role key (already available server-side). Redirect URL derived from `request` origin so it works on preview, custom domain, and published.
- Role assignment after invite: insert into `user_roles` keyed on the new user's id returned from the admin API.
- Vertical tabs use the existing shadcn `Tabs` primitive with `orientation="vertical"` and custom `TabsList` flex-col styling.
- Logo display: `Navbar`, `Footer`, and `EnquireDialog` already consume `useSiteSettings()` — once Branding saves the new public URL, they update automatically.
- No schema changes needed.

## Files Touched

- Create: bucket `site-media` + storage RLS migration.
- Edit: `src/lib/users-admin.functions.ts` (inviteUser), `src/lib/admin.functions.ts` or new `site-media.functions.ts` (uploadSiteAsset).
- Edit: `src/routes/_authenticated/admin/settings.tsx` (vertical tabs + invite UI + logo uploader).
- Edit: `src/routes/_authenticated/admin/adventures.tsx` (image uploader).
- Edit: `src/routes/_authenticated/admin/content.$table.tsx` (ensure all media fields are image-typed; switch new uploads to `site-media`).
- Edit: `src/routes/journal.tsx`, `src/routes/lodges.tsx`, `src/routes/journeys.tsx` (slug guards) and add `notFoundComponent` to `journal.$slug.tsx` / `journeys.$slug.tsx` if missing.
