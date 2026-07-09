## 1. Admin Sidebar Restructure (`src/routes/_authenticated/admin/route.tsx`)

**Pages section** — collapse the current three "Pages · Home / About / Contact" groups plus "Pages · Landings" into **three sidebar entries** that open new hub pages:

- `Pages → Home` → `/admin/pages-hub/home`
- `Pages → About` → `/admin/pages-hub/about`
- `Pages → Contact` → `/admin/pages/contact` (single editor, no hub needed)

Remove: Home—Hero, Adventures, Destinations, Lodges, Journal, Instagram, Top Bar, About—Hero, Mission, Values, Team, and the entire "Pages · Landings" group (Lodges Landing, Adventures Landing, Adventure Detail, Lodge Detail, Footer) as flat sidebar links — they become tabs inside the hubs / Settings.

**Management section** — rename:
- Adventures → **Manage Adventures**
- Lodges → **Manage Lodges**
- Destinations → **Manage Destinations**

**System / Settings** — Footer moves out of the sidebar and becomes a tab inside Settings (see §3).

## 2. New Page Hub Route (`src/routes/_authenticated/admin/pages-hub.$section.tsx`)

One route file handling `home` and `about` sections. Renders horizontal tabs; each tab body mounts the existing per-page editor from `pages.$page.tsx` (extracted into a shared `<PageEditor pageKey=... />` component).

**Home tabs** (in order):
1. Home Hero → `home`
2. Adventures → `home_adventures` + sub-tabs `adventures_index` (Landing) + `detail_journey` (Detail)
3. Destinations → `home_destinations` + sub-tab `destinations_index` if it exists, else just `home_destinations` + "Destination Landing" placeholder
4. Lodges → `home_lodges` + sub-tabs `lodges_index` (Landing) + `detail_lodge` (Detail)
5. Journal → `home_journal`
6. Instagram → `home_instagram`

**About tabs**: About Hero (`about`), Mission (`about_mission`), Values (`about_values`), Team (`about_team`).

The current `/admin/pages/$page` editor route stays intact so deep links keep working. The hub simply re-uses the same editor component.

## 3. Settings — Footer Tab (`src/routes/_authenticated/admin/settings.tsx`)

Add a **Footer** tab that reuses the same `PageEditorLink` pattern already used for Sign-in / 404, pointing at `/admin/pages/footer`.

## 4. Enquiry Form Fix (`src/components/site/EnquireForm.tsx`)

- Remove default `adults: "2"` and `children: "0"` from `EMPTY_DRAFT` (set both to `""`).
- Drop the unused Draft fields that never render as inputs: `destination`, `travel_dates`, `adults`, `children`, `budget`, `trip_type`, `accommodation_style`, `experiences`. Keep only `name`, `email`, `phone`, `message`, `subscribe`.
- Update the `submit()` payload to stop sending the removed fields (pass empty strings/undefined where the server function requires them).
- Email + phone are already `required` and validated — confirm validation runs on submit and inline errors render (already wired via `validateField` / `blurValidate`). Keep the existing success state.
- Fix the misleading "Phone (required)" label → just "Phone number".

## 5. Verification

- `bunx tsgo --noEmit` to confirm the new route + edited files typecheck.
- Load `/admin` and click through Pages → Home / About to verify tabs mount the correct editors.
- Submit `/contact` form with missing email/phone to confirm inline errors, then with valid data to confirm success state.

No backend / schema changes. All work is admin UI + one shared frontend form.
