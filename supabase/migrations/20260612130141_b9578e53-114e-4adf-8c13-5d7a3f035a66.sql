
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'customer');
CREATE TYPE public.faq_category AS ENUM ('planning', 'conservation', 'logistics');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'deposit_paid', 'paid_in_full', 'refunded');

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ AUTO-CREATE PROFILE + SEED ADMIN ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');

  IF lower(NEW.email) = 'hello@stratus.africa' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ JOURNEY CATEGORIES ============
CREATE TABLE public.journey_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  intro TEXT NOT NULL,
  hero_image TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.journey_categories TO anon, authenticated;
GRANT ALL ON public.journey_categories TO service_role;
ALTER TABLE public.journey_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view published categories" ON public.journey_categories FOR SELECT
  USING (published OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins manage categories" ON public.journey_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER journey_categories_updated_at BEFORE UPDATE ON public.journey_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ITINERARIES ============
CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.journey_categories(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  nights TEXT NOT NULL,
  description TEXT NOT NULL,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  image TEXT NOT NULL,
  price_from_usd INT,
  deposit_usd INT NOT NULL DEFAULT 500,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.itineraries TO anon, authenticated;
GRANT ALL ON public.itineraries TO service_role;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view published itineraries" ON public.itineraries FOR SELECT
  USING (published OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins manage itineraries" ON public.itineraries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER itineraries_updated_at BEFORE UPDATE ON public.itineraries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ JOURNAL ARTICLES ============
CREATE TABLE public.journal_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  image TEXT NOT NULL,
  date TEXT NOT NULL,
  read_time TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.journal_articles TO anon, authenticated;
GRANT ALL ON public.journal_articles TO service_role;
ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view published articles" ON public.journal_articles FOR SELECT
  USING (published OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins manage articles" ON public.journal_articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER journal_articles_updated_at BEFORE UPDATE ON public.journal_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ LODGES ============
CREATE TABLE public.lodges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  hero_image TEXT NOT NULL,
  gallery TEXT[] NOT NULL DEFAULT '{}',
  amenities TEXT[] NOT NULL DEFAULT '{}',
  price_from_usd INT,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lodges TO anon, authenticated;
GRANT ALL ON public.lodges TO service_role;
ALTER TABLE public.lodges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view published lodges" ON public.lodges FOR SELECT
  USING (published OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins manage lodges" ON public.lodges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER lodges_updated_at BEFORE UPDATE ON public.lodges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DESTINATIONS ============
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  featured_trips TEXT[] NOT NULL DEFAULT '{}',
  best_season TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.destinations TO anon, authenticated;
GRANT ALL ON public.destinations TO service_role;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view published destinations" ON public.destinations FOR SELECT
  USING (published OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins manage destinations" ON public.destinations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER destinations_updated_at BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TESTIMONIALS ============
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  quote TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  image TEXT,
  trip_taken TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view published testimonials" ON public.testimonials FOR SELECT
  USING (published OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ FAQS ============
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.faq_category NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view published faqs" ON public.faqs FOR SELECT
  USING (published OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE POLICY "Admins manage faqs" ON public.faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SITE SETTINGS ============
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE SET NULL,
  itinerary_name TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  travel_date DATE,
  party_size INT NOT NULL DEFAULT 2,
  special_requests TEXT,
  total_estimate_usd INT,
  deposit_usd INT NOT NULL DEFAULT 500,
  status public.booking_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.bookings TO anon, authenticated;
GRANT UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create a booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete bookings" ON public.bookings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BOOKING NOTES ============
CREATE TABLE public.booking_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.booking_notes TO authenticated;
GRANT ALL ON public.booking_notes TO service_role;
ALTER TABLE public.booking_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view booking notes" ON public.booking_notes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins add booking notes" ON public.booking_notes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete booking notes" ON public.booking_notes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ PRIVATE TRAVEL REQUESTS ============
CREATE TABLE public.private_travel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  destinations TEXT,
  travel_dates TEXT,
  party_size INT,
  budget_usd TEXT,
  interests TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.private_travel_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.private_travel_requests TO authenticated;
GRANT ALL ON public.private_travel_requests TO service_role;
ALTER TABLE public.private_travel_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit private travel request" ON public.private_travel_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view private travel requests" ON public.private_travel_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update private travel requests" ON public.private_travel_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete private travel requests" ON public.private_travel_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ UPDATE EXISTING ENQUIRIES & NEWSLETTER (give admins read) ============
GRANT SELECT, UPDATE, DELETE ON public.enquiries TO authenticated;
CREATE POLICY "Admins view enquiries" ON public.enquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update enquiries" ON public.enquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete enquiries" ON public.enquiries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';

GRANT SELECT, DELETE ON public.newsletter_subscribers TO authenticated;
CREATE POLICY "Admins view subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ SEED CONTENT ============
INSERT INTO public.journey_categories (slug, title, tagline, intro, hero_image, sort_order) VALUES
('adventure', 'Adventure', 'Wild landscapes. Untamed encounters.',
 'From the dunes of the Namib to the Okavango''s floodplains, our adventure journeys take you deep into Africa''s most untamed places — guided by experts who know the land like family.',
 '/src/assets/hero-baobab.jpg', 1),
('connection', 'Connection', 'Meaningful encounters with people and place.',
 'Slow journeys designed around the people, traditions and quiet rituals that make Africa unforgettable. Connect with communities, conservationists and the wild itself.',
 '/src/assets/gallery-1.jpg', 2),
('heritage', 'Heritage', 'Honouring the stories that shape Africa.',
 'Journey through living history — ancient rock art, sacred landscapes and the cultural threads that bind generations to the land.',
 '/src/assets/journal-baobab.jpg', 3),
('conservation', 'Conservation', 'Travel that gives back.',
 'Each of these journeys directly funds anti-poaching, rewilding and community programmes. Travel deeply, leave a legacy.',
 '/src/assets/elephant.jpg', 4);

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'wilderness-awakening', 'Wilderness Awakening', '7 nights',
  'Track wildlife on foot, glide through papyrus channels, and sleep under skies thick with stars.',
  ARRAY['Okavango Delta safari','Mokoro canoe expedition','Walking safaris with master guides'],
  '/src/assets/lodge-tent.jpg', 8500, 850, 1
FROM public.journey_categories WHERE slug='adventure';

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'dunes-and-desert', 'Dunes & Desert', '8 nights',
  'An odyssey through Namibia''s ancient deserts, where silence and scale rewrite the senses.',
  ARRAY['Sossusvlei sunrise','Skeleton Coast flight','Hot-air balloon over Namib'],
  '/src/assets/gallery-3.jpg', 9200, 920, 2
FROM public.journey_categories WHERE slug='adventure';

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'great-migration-chase', 'Great Migration Chase', '9 nights',
  'Follow the rhythm of the herds across the Serengeti and Maasai Mara at the height of the migration.',
  ARRAY['Mara river crossings','Private bush dinner','Hot air balloon at dawn'],
  '/src/assets/elephant.jpg', 12500, 1250, 3
FROM public.journey_categories WHERE slug='adventure';

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'safari-connection', 'Safari Connection', '5 nights',
  'Settle into a single intimate camp, sharing meals and stories with the people who call it home.',
  ARRAY['Village storytelling evening','Cook with a local chef','Private guided bush walks'],
  '/src/assets/gallery-2.jpg', 6500, 650, 1
FROM public.journey_categories WHERE slug='connection';

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'maasai-heartlands', 'Maasai Heartlands', '6 nights',
  'Live alongside the Maasai, learning the rhythms of cattle, land and the elders'' wisdom.',
  ARRAY['Stay with a Maasai family','Traditional beadwork workshop','Guided plains walk'],
  '/src/assets/gallery-4.jpg', 7200, 720, 2
FROM public.journey_categories WHERE slug='connection';

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'slow-safari-sanctuary', 'Slow Safari Sanctuary', '7 nights',
  'A gentler pace — long mornings, quiet bush, and time to truly arrive.',
  ARRAY['Yoga at sunrise','Forest bathing','Star bed sleep-outs'],
  '/src/assets/journal-lodge.jpg', 8800, 880, 3
FROM public.journey_categories WHERE slug='connection';

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'heritage-trails', 'Heritage Trails', '9 nights',
  'An immersive arc through Ethiopia''s spiritual and cultural heartlands.',
  ARRAY['Lalibela rock churches','Omo Valley ceremonies','Tea with elders'],
  '/src/assets/journal-baobab.jpg', 9800, 980, 1
FROM public.journey_categories WHERE slug='heritage';

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'kingdoms-of-the-south', 'Kingdoms of the South', '8 nights',
  'Follow the trade and storytelling routes that built southern Africa''s lost kingdoms.',
  ARRAY['Great Zimbabwe ruins','San rock art','Riverside heritage lodges'],
  '/src/assets/gallery-1.jpg', 8900, 890, 2
FROM public.journey_categories WHERE slug='heritage';

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'coastal-trade-winds', 'Coastal Trade Winds', '7 nights',
  'Discover the Swahili coast where Africa, Arabia and Asia meet across centuries.',
  ARRAY['Stone Town heritage walk','Swahili dhow sailing','Spice farm immersion'],
  '/src/assets/gallery-2.jpg', 7600, 760, 3
FROM public.journey_categories WHERE slug='heritage';

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'conservation-journey', 'Conservation Journey', '7 nights',
  'Spend a week with the conservationists protecting Africa''s most endangered species.',
  ARRAY['Rhino tracking on foot','Behind-the-scenes with rangers','Tree planting with community'],
  '/src/assets/elephant.jpg', 9500, 950, 1
FROM public.journey_categories WHERE slug='conservation';

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'rewilding-reserve', 'Rewilding Reserve', '6 nights',
  'Witness rewilding in motion at a reserve where every guest stay restores wild land.',
  ARRAY['Wildlife monitoring','Camera-trap study','Lodge funded by your stay'],
  '/src/assets/journal-lion.jpg', 8400, 840, 2
FROM public.journey_categories WHERE slug='conservation';

INSERT INTO public.itineraries (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
SELECT id, 'marine-sanctuary', 'Marine Sanctuary', '6 nights',
  'From reef to forest — an ocean-focused conservation safari on Africa''s eastern shores.',
  ARRAY['Coral restoration dive','Sea turtle release','Conservation researcher hosted'],
  '/src/assets/gallery-4.jpg', 7900, 790, 3
FROM public.journey_categories WHERE slug='conservation';

-- Journal articles
INSERT INTO public.journal_articles (slug, title, excerpt, image, date, read_time, category, content, sort_order) VALUES
('first-safari-guide', 'Where to go for your first safari',
 'Africa is vast and varied — here''s how to choose the right place to begin your safari story.',
 '/src/assets/journal-baobab.jpg', 'October 2024', '6 min read', 'Travel Guide',
 ARRAY[
   'There is no single ''right'' first safari. The best one is the one shaped around what stirs you — open plains alive with the migration, intimate forest walks with mountain gorillas, or the soft quiet of a mokoro in the Okavango at dawn.',
   'For first-time travellers we often recommend Kenya or Tanzania. Both reward you generously: classic Big Five game viewing, deep cultural heritage, and a wide range of lodges from elegantly understated to genuinely wild.',
   'If you crave space and silence, Botswana and Namibia offer landscapes so vast they reorder your sense of self. Choose Botswana for water-based safaris in the Delta, Namibia for the painterly dunes of Sossusvlei.',
   'Whatever you choose, give yourself time. Safari rewards stillness. Three nights in one camp will always outweigh a frantic loop of single-night stops. Let the land find you.'
 ], 1),
('slow-travel-magic', 'The magic of slow travel in Africa',
 'Why fewer destinations and longer stays unlock the deepest, most memorable safari moments.',
 '/src/assets/journal-lion.jpg', 'September 2024', '5 min read', 'Philosophy',
 ARRAY[
   'Slow travel isn''t a trend — it''s a return to the way safari was always meant to be experienced. The most extraordinary wildlife encounters rarely happen in the first hour. They happen on day three, when the bush begins to reveal itself to you.',
   'When you stay longer in one camp, the rhythms shift. You start to recognise individual elephants. You learn the call of the fish eagle. Your guide stops being a guide and becomes a friend.',
   'We design every journey with negative space — afternoons with nothing scheduled, mornings without an alarm. The magic is in what unfolds when you stop chasing it.',
   'Pack lightly. Walk often. Read by lantern. Eat slowly. Africa will do the rest.'
 ], 2),
('responsible-travel', 'Why responsible travel matters',
 'Every itinerary we craft is built around community, conservation and a lighter footprint.',
 '/src/assets/journal-lodge.jpg', 'August 2024', '7 min read', 'Conservation',
 ARRAY[
   'Tourism funds more than 80% of conservation work across many of Africa''s wildest landscapes. The choice of where you stay, who guides you, and how your money flows shapes whether wilderness survives.',
   'We only partner with lodges and operators that demonstrably reinvest in their communities and ecosystems. That means local ownership, fair employment, anti-poaching contributions and habitat restoration that we can name and verify.',
   'Responsible travel isn''t about giving up beauty or comfort. It''s about choosing the version of beauty that endures — because someone is protecting it long after you''ve flown home.',
   'Travel that connects, restores and gives back: that is the only kind of journey worth taking now.'
 ], 3);

-- Lodges
INSERT INTO public.lodges (slug, name, location, description, hero_image, gallery, amenities, price_from_usd, sort_order) VALUES
('baines-camp', 'Baines'' Camp', 'Okavango Delta, Botswana',
 'A floating sanctuary on the edge of the Boro River — five suites of canvas, brass and reclaimed timber, designed for guests who want to vanish into the water world of the Delta.',
 '/src/assets/lodge-tent.jpg',
 ARRAY['/src/assets/lodge-tent.jpg','/src/assets/gallery-1.jpg','/src/assets/gallery-3.jpg'],
 ARRAY['Private plunge pool','Star deck dining','Mokoro excursions','Spa pavilion'], 1450, 1),
('lemala-kuria-hills', 'Lemala Kuria Hills', 'Serengeti, Tanzania',
 'A perch on the granite kopjes of the northern Serengeti — perfectly positioned for the river crossings of the great migration.',
 '/src/assets/gallery-2.jpg',
 ARRAY['/src/assets/gallery-2.jpg','/src/assets/gallery-4.jpg','/src/assets/elephant.jpg'],
 ARRAY['Heated infinity pool','In-suite fireplace','Bush breakfasts','Private guide'], 980, 2),
('singita-sasakwa', 'Singita Sasakwa', 'Grumeti, Tanzania',
 'Edwardian elegance on a private 350,000-acre reserve. Game-viewing without another vehicle in sight.',
 '/src/assets/journal-lodge.jpg',
 ARRAY['/src/assets/journal-lodge.jpg','/src/assets/gallery-1.jpg','/src/assets/journal-lion.jpg'],
 ARRAY['Equestrian centre','Tennis court','Wine cellar','Private butler'], 2800, 3),
('damaraland-camp', 'Damaraland Camp', 'Damaraland, Namibia',
 'Community-owned and quietly extraordinary — tracking desert-adapted elephant across ochre valleys older than memory.',
 '/src/assets/gallery-3.jpg',
 ARRAY['/src/assets/gallery-3.jpg','/src/assets/hero-baobab.jpg','/src/assets/gallery-1.jpg'],
 ARRAY['Solar-powered','Community-owned','Stargazing deck','Rock-art walks'], 720, 4);

-- Destinations
INSERT INTO public.destinations (slug, name, region, country, description, image, featured_trips, best_season, sort_order) VALUES
('okavango-delta', 'Okavango Delta', 'Southern Africa', 'Botswana',
 'A vast inland wetland where waterways braid through wildlife-rich islands — best explored by mokoro at dawn.',
 '/src/assets/lodge-tent.jpg',
 ARRAY['Wilderness Awakening','Safari Connection'], 'May – October', 1),
('serengeti', 'Serengeti', 'East Africa', 'Tanzania',
 'The stage of the great migration — endless plains, kopjes and the world''s greatest concentration of large mammals.',
 '/src/assets/elephant.jpg',
 ARRAY['Great Migration Chase'], 'July – October', 2),
('namib-desert', 'Namib Desert', 'Southern Africa', 'Namibia',
 'Painterly dunes, ancient rock and the eerie quiet of the world''s oldest desert.',
 '/src/assets/gallery-3.jpg',
 ARRAY['Dunes & Desert'], 'April – October', 3),
('maasai-mara', 'Maasai Mara', 'East Africa', 'Kenya',
 'Big-cat country and the cultural heartland of the Maasai people.',
 '/src/assets/gallery-4.jpg',
 ARRAY['Maasai Heartlands','Great Migration Chase'], 'July – October', 4),
('zanzibar-coast', 'Zanzibar & Swahili Coast', 'East Africa', 'Tanzania',
 'White-sand beaches, spice-scented Stone Town and a thousand-year trading heritage.',
 '/src/assets/gallery-2.jpg',
 ARRAY['Coastal Trade Winds'], 'June – October', 5),
('ethiopian-highlands', 'Ethiopian Highlands', 'East Africa', 'Ethiopia',
 'Rock-hewn churches, the cradle of coffee and one of Africa''s most layered cultural landscapes.',
 '/src/assets/journal-baobab.jpg',
 ARRAY['Heritage Trails'], 'October – March', 6);

-- Testimonials
INSERT INTO public.testimonials (name, location, quote, rating, trip_taken, sort_order) VALUES
('Eleanor & James Whitcombe', 'London, UK',
 'The Baobab Collective designed the most extraordinary fortnight of our lives. Every detail — every guide, every meal under the stars — felt thought through with real love.', 5, 'Wilderness Awakening', 1),
('Priya Sharma', 'San Francisco, USA',
 'I asked for slow, soulful and meaningful. They delivered all three and somehow turned it into the deepest reset I''ve ever had.', 5, 'Slow Safari Sanctuary', 2),
('The Okonkwo Family', 'Lagos, Nigeria',
 'Travelling with three generations is no small feat. They built an itinerary that worked for our two-year-old AND our seventy-six-year-old grandmother. Magic.', 5, 'Maasai Heartlands', 3),
('David Caldwell', 'Sydney, Australia',
 'Rhino tracking on foot at sunrise — I''ll carry that hour with me forever. Faultless planning, exceptional guides.', 5, 'Conservation Journey', 4),
('Marie & Henri Laurent', 'Paris, France',
 'A masterclass in restraint and taste. Nothing showy — just the right place at the right time, every time.', 5, 'Dunes & Desert', 5),
('Ayesha Khan', 'Dubai, UAE',
 'They handled everything — visas, transfers, even a private chef for my husband''s birthday in the bush. Unforgettable.', 5, 'Great Migration Chase', 6);

-- FAQs
INSERT INTO public.faqs (category, question, answer, sort_order) VALUES
('planning', 'How far in advance should I book?',
 'We recommend 9–12 months for peak-season travel (July–October), and 6 months for shoulder seasons. The very best lodges and private guides do book out a year ahead.', 1),
('planning', 'How long should my safari be?',
 'A minimum of 7 nights lets you settle into the bush. 10–14 nights is the sweet spot for combining two or three regions without feeling rushed.', 2),
('planning', 'What is included in your itineraries?',
 'All accommodation, internal flights and transfers, guided activities, most meals, park fees, conservation levies, and 24/7 in-destination support. International flights are typically separate so you can use airline miles or preferred routings.', 3),
('planning', 'Can you accommodate dietary requirements and accessibility needs?',
 'Yes — every camp we work with handles dietary preferences thoughtfully. Accessibility varies by lodge; share your needs and we''ll suggest the right places.', 4),
('conservation', 'How does my trip support conservation?',
 'Every itinerary includes conservation levies and we partner only with lodges that demonstrably reinvest in habitat, wildlife and local communities. We publish an annual impact report for each guest.', 5),
('conservation', 'Are your operators ethical?',
 'We vet every partner on community ownership/employment, anti-poaching contributions, ecological footprint and animal welfare. We don''t work with anyone whose practices we couldn''t personally vouch for.', 6),
('conservation', 'Can I include a hands-on conservation experience?',
 'Absolutely. Our Conservation journeys include direct fieldwork — rhino tracking, camera-trap research, community planting days, marine restoration dives.', 7),
('logistics', 'What about flights and visas?',
 'We advise on the best international routing and handle every internal flight. We''ll send a full pre-trip pack including visa guidance for your nationality.', 8),
('logistics', 'Is travel insurance required?',
 'Yes — comprehensive travel insurance with medical evacuation is required. We can recommend trusted underwriters.', 9),
('logistics', 'What happens if something goes wrong on the ground?',
 'You''ll have a dedicated journey designer and a 24/7 in-destination concierge throughout your trip. Plans flex without you having to lift a finger.', 10),
('logistics', 'How do I pay?',
 'A refundable deposit secures your booking. The balance is due 60 days before travel. We accept card and bank transfer.', 11);

-- Site settings defaults
INSERT INTO public.site_settings (key, value) VALUES
('hero', '{"eyebrow":"Curated safari journeys","headline":"Africa, in its rarest light.","subhead":"Tailor-made expeditions designed around connection, conservation and the wild itself.","cta_label":"Begin your journey","cta_href":"/contact"}'::jsonb),
('contact', '{"email":"hello@baobabcollective.travel","phone":"+44 20 1234 5678","address":"London · Cape Town · Nairobi"}'::jsonb);
