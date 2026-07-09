
CREATE TABLE public.markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  year_from INTEGER,
  year_to INTEGER,
  note_es TEXT DEFAULT '',
  note_en TEXT DEFAULT '',
  is_home BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.markets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.markets TO authenticated;
GRANT ALL ON public.markets TO service_role;

ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view markets" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Admins can insert markets" ON public.markets FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update markets" ON public.markets FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete markets" ON public.markets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER markets_set_updated_at BEFORE UPDATE ON public.markets FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Journey section labels on profile_settings
ALTER TABLE public.profile_settings
  ADD COLUMN IF NOT EXISTS journey_eyebrow_es TEXT DEFAULT 'Journey',
  ADD COLUMN IF NOT EXISTS journey_eyebrow_en TEXT DEFAULT 'Journey',
  ADD COLUMN IF NOT EXISTS journey_title_es TEXT DEFAULT 'De LATAM a Estados Unidos',
  ADD COLUMN IF NOT EXISTS journey_title_en TEXT DEFAULT 'From LATAM to the U.S.',
  ADD COLUMN IF NOT EXISTS journey_body_es TEXT DEFAULT 'Mercados donde planifiqué y activé campañas OOH/DOOH.',
  ADD COLUMN IF NOT EXISTS journey_body_en TEXT DEFAULT 'Markets where I planned and activated OOH/DOOH campaigns.';

-- Seed a few markets so the section is meaningful on first render
INSERT INTO public.markets (city, country, country_code, lat, lng, year_from, is_home, sort_order) VALUES
  ('Buenos Aires', 'Argentina', 'AR', -34.6037, -58.3816, 2008, false, 10),
  ('São Paulo', 'Brasil', 'BR', -23.5505, -46.6333, 2012, false, 20),
  ('Ciudad de México', 'México', 'MX', 19.4326, -99.1332, 2014, false, 30),
  ('Bogotá', 'Colombia', 'CO', 4.7110, -74.0721, 2015, false, 40),
  ('Santiago', 'Chile', 'CL', -33.4489, -70.6693, 2016, false, 50),
  ('Lima', 'Perú', 'PE', -12.0464, -77.0428, 2017, false, 60),
  ('Salt Lake City', 'United States', 'US', 40.7608, -111.8910, 2023, true, 70);
