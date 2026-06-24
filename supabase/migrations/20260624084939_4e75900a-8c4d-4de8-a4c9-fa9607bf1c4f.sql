
-- 1. Adventures page CMS table (single row)
CREATE TABLE public.adventures_page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE,
  hero JSONB NOT NULL DEFAULT '{}'::jsonb,
  philosophy JSONB NOT NULL DEFAULT '{}'::jsonb,
  cta JSONB NOT NULL DEFAULT '{}'::jsonb,
  terrains JSONB NOT NULL DEFAULT '[]'::jsonb,
  styles JSONB NOT NULL DEFAULT '[]'::jsonb,
  signatures JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

GRANT SELECT ON public.adventures_page_blocks TO anon, authenticated;
GRANT ALL ON public.adventures_page_blocks TO service_role;

ALTER TABLE public.adventures_page_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Adventures page is publicly readable"
  ON public.adventures_page_blocks FOR SELECT
  USING (true);

CREATE POLICY "Admins manage adventures page"
  ON public.adventures_page_blocks FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_adventures_page_updated
  BEFORE UPDATE ON public.adventures_page_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 2. Planning Guide requests table
CREATE TABLE public.planning_guide_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  travelling_party TEXT,
  earliest_date TEXT,
  interests TEXT[] NOT NULL DEFAULT '{}',
  message TEXT,
  pdf_url TEXT,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.planning_guide_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.planning_guide_requests TO authenticated;
GRANT ALL ON public.planning_guide_requests TO service_role;

ALTER TABLE public.planning_guide_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can request the planning guide"
  ON public.planning_guide_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read planning guide requests"
  ON public.planning_guide_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update planning guide requests"
  ON public.planning_guide_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_planning_guide_requests_created ON public.planning_guide_requests (created_at DESC);
CREATE INDEX idx_planning_guide_requests_email ON public.planning_guide_requests (email);


-- 3. Seed signature adventure itineraries (so /itineraries/$slug resolves)
WITH adv AS (
  SELECT id FROM public.journey_categories WHERE slug = 'adventure' LIMIT 1
)
INSERT INTO public.itineraries
  (category_id, slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order, published)
SELECT
  (SELECT id FROM adv), slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order, true
FROM (VALUES
  ('okavango-on-foot', 'Okavango on Foot', '8 nights',
   'A walking safari camp deep in a private concession. Days on foot, afternoons in the mokoro, nights under canvas with the Delta humming all around.',
   ARRAY['Daily walking safaris','Mokoro at sunrise','Tracker apprenticeship','Star-bed sleep-out'],
   'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80',
   12500, 2500, 100),
  ('namib-traverse', 'Namib Traverse', '10 nights',
   'From the apricot dunes of Sossusvlei to the wreck-strewn Skeleton Coast — a self-flown adventure across the world''s oldest desert.',
   ARRAY['Dawn climb at Big Daddy','Private bush flights','Desert-adapted lion tracking','Hot-air balloon'],
   'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=80',
   14800, 3000, 101),
  ('virunga-gorilla-trek', 'Virunga Gorilla Trek', '7 nights',
   'Two gorilla permits, golden monkey tracking and a Bwindi forest immersion — the most moving wildlife encounter on earth.',
   ARRAY['Twin gorilla treks','Golden monkeys','Forest community visit','Lake Kivu finale'],
   'https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1600&q=80',
   16200, 3500, 102),
  ('lower-zambezi-by-canoe', 'Lower Zambezi by Canoe', '6 nights',
   'Paddle the Zambezi alongside elephants drinking at the bank, sleeping on river islands with only the hippos for neighbours.',
   ARRAY['Three-day canoe traverse','Walking with a senior guide','Island fly-camp','Tiger fishing'],
   'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80',
   9800, 2000, 103),
  ('ethiopian-highlands-expedition', 'Ethiopian Highlands Expedition', '11 nights',
   'Trek the Simien escarpments with gelada baboons, then descend into the Danakil — sulphur lakes, salt flats and active volcanoes.',
   ARRAY['Simien trek','Erta Ale crater rim','Lalibela churches','Danakil salt caravans'],
   'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80',
   13500, 2800, 104)
) AS s(slug, name, nights, description, highlights, image, price_from_usd, deposit_usd, sort_order)
ON CONFLICT (slug) DO NOTHING;


-- 4. Seed adventures_page_blocks with initial content
INSERT INTO public.adventures_page_blocks (hero, philosophy, cta, terrains, styles, signatures)
VALUES (
  jsonb_build_object(
    'eyebrow','Adventures',
    'headline','Wild Africa, deeply lived.',
    'subhead','Walking safaris, mokoro mornings, gorilla treks, desert traverses. The adventures we build are slow, private and shaped by the people who know the land best.'
  ),
  jsonb_build_object(
    'eyebrow','The Philosophy',
    'body','Adventure isn''t a checklist. It''s the long walk that turns into a discovery, the silence that holds you on a riverbank, the elder who lets you sit with the fire. We craft the conditions — Africa does the rest.'
  ),
  jsonb_build_object(
    'eyebrow','Begin',
    'headline','Your adventure, our craft.',
    'body','Share your dates, your dreams and the shape of your travelling party. We''ll respond within 24 hours with a first sketch.',
    'buttonLabel','Request Your Adventure'
  ),
  '[
    {"icon":"Mountain","label":"Mountain & Highlands","note":"Rwenzori, Atlas, Drakensberg"},
    {"icon":"Waves","label":"Delta & Waterways","note":"Okavango, Zambezi, Bangweulu"},
    {"icon":"Sun","label":"Desert & Dunes","note":"Namib, Kalahari, Danakil"},
    {"icon":"Footprints","label":"Bush & Savannah","note":"Serengeti, Mara, Luangwa"},
    {"icon":"Tent","label":"Remote Wilderness","note":"Selous, Kafue, Mahale"},
    {"icon":"Waves","label":"Coastal & Marine","note":"Bazaruto, Quirimbas, Zanzibar"}
  ]'::jsonb,
  '[
    {"icon":"Footprints","title":"Walking Safaris","body":"Track wildlife on foot with master guides — the original safari, on its truest terms."},
    {"icon":"Binoculars","title":"Big Game Expeditions","body":"Private vehicles, off-road permissions and the patience to wait for the moment."},
    {"icon":"Waves","title":"Water Safaris","body":"Mokoro, dhow and houseboat — quiet, low-impact ways into Africa''s wettest wildernesses."},
    {"icon":"Plane","title":"Fly-Camping & Bush Sleep-outs","body":"Stars overhead, lantern light, the call of a distant lion. The wildest night of your life."},
    {"icon":"Mountain","title":"Trekking & Climbs","body":"Gorilla and chimp treks, Kilimanjaro, Mount Kenya, volcano scrambles in the Virungas."},
    {"icon":"Compass","title":"Expedition Routes","body":"Multi-country traverses for travellers who want the journey to be the destination."}
  ]'::jsonb,
  '[
    {"slug":"okavango-on-foot","name":"Okavango on Foot","region":"Botswana","terrain":"Delta & Waterways","nights":"8 nights","difficulty":"Moderate","image":"https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80","description":"A walking safari camp deep in a private concession. Days on foot, afternoons in the mokoro, nights under canvas with the Delta humming all around.","highlights":["Daily walking safaris","Mokoro at sunrise","Tracker apprenticeship","Star-bed sleep-out"]},
    {"slug":"namib-traverse","name":"Namib Traverse","region":"Namibia","terrain":"Desert & Dunes","nights":"10 nights","difficulty":"Active","image":"https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=80","description":"From the apricot dunes of Sossusvlei to the wreck-strewn Skeleton Coast — a self-flown adventure across the world''s oldest desert.","highlights":["Dawn climb at Big Daddy","Private bush flights","Desert-adapted lion tracking","Hot-air balloon"]},
    {"slug":"great-migration-chase","name":"Great Migration Chase","region":"Tanzania & Kenya","terrain":"Bush & Savannah","nights":"9 nights","difficulty":"Easy","image":"https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1600&q=80","description":"Follow the herds across the Mara and Serengeti in private mobile camps positioned exactly where the crossings unfold.","highlights":["Mara River crossings","Private mobile camps","Hot-air balloon at dawn","Maasai guides"]},
    {"slug":"virunga-gorilla-trek","name":"Virunga Gorilla Trek","region":"Rwanda & Uganda","terrain":"Mountain & Highlands","nights":"7 nights","difficulty":"Challenging","image":"https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1600&q=80","description":"Two gorilla permits, golden monkey tracking and a Bwindi forest immersion — the most moving wildlife encounter on earth.","highlights":["Twin gorilla treks","Golden monkeys","Forest community visit","Lake Kivu finale"]},
    {"slug":"lower-zambezi-by-canoe","name":"Lower Zambezi by Canoe","region":"Zambia","terrain":"Delta & Waterways","nights":"6 nights","difficulty":"Active","image":"https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80","description":"Paddle the Zambezi alongside elephants drinking at the bank, sleeping on river islands with only the hippos for neighbours.","highlights":["Three-day canoe traverse","Walking with a senior guide","Island fly-camp","Tiger fishing"]},
    {"slug":"ethiopian-highlands-expedition","name":"Ethiopian Highlands Expedition","region":"Ethiopia","terrain":"Mountain & Highlands","nights":"11 nights","difficulty":"Challenging","image":"https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80","description":"Trek the Simien escarpments with gelada baboons, then descend into the Danakil — sulphur lakes, salt flats and active volcanoes.","highlights":["Simien trek","Erta Ale crater rim","Lalibela churches","Danakil salt caravans"]}
  ]'::jsonb
)
ON CONFLICT (singleton) DO NOTHING;
