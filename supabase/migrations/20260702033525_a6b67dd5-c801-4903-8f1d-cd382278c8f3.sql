
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.timeline_kind AS ENUM ('work', 'study');

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- claim_admin: only works if no admin exists yet
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _uid UUID := auth.uid();
BEGIN
  IF _uid IS NULL THEN RETURN FALSE; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN FALSE; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'admin');
  RETURN TRUE;
END $$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- profile_settings (singleton)
CREATE TABLE public.profile_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton BOOLEAN NOT NULL DEFAULT TRUE UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  cv_url TEXT NOT NULL DEFAULT '/cv.pdf',
  photo_light_url TEXT NOT NULL DEFAULT '',
  photo_dark_url TEXT NOT NULL DEFAULT '',
  hero_eyebrow_es TEXT NOT NULL DEFAULT '',
  hero_eyebrow_en TEXT NOT NULL DEFAULT '',
  hero_title_es TEXT[] NOT NULL DEFAULT '{}',
  hero_title_en TEXT[] NOT NULL DEFAULT '{}',
  hero_role_es TEXT NOT NULL DEFAULT '',
  hero_role_en TEXT NOT NULL DEFAULT '',
  hero_location_es TEXT NOT NULL DEFAULT '',
  hero_location_en TEXT NOT NULL DEFAULT '',
  about_eyebrow_es TEXT NOT NULL DEFAULT '',
  about_eyebrow_en TEXT NOT NULL DEFAULT '',
  about_title_es TEXT NOT NULL DEFAULT '',
  about_title_en TEXT NOT NULL DEFAULT '',
  about_body_es TEXT[] NOT NULL DEFAULT '{}',
  about_body_en TEXT[] NOT NULL DEFAULT '{}',
  about_stats JSONB NOT NULL DEFAULT '[]',
  contact_eyebrow_es TEXT NOT NULL DEFAULT '',
  contact_eyebrow_en TEXT NOT NULL DEFAULT '',
  contact_title_es TEXT NOT NULL DEFAULT '',
  contact_title_en TEXT NOT NULL DEFAULT '',
  contact_sub_es TEXT NOT NULL DEFAULT '',
  contact_sub_en TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_settings TO authenticated;
GRANT ALL ON public.profile_settings TO service_role;
ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read profile" ON public.profile_settings FOR SELECT USING (true);
CREATE POLICY "admin write profile ins" ON public.profile_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin write profile upd" ON public.profile_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin write profile del" ON public.profile_settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_profile_updated BEFORE UPDATE ON public.profile_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- timeline_items
CREATE TABLE public.timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind timeline_kind NOT NULL,
  title_es TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  org TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  start_date DATE,
  end_date DATE,
  period_label_es TEXT NOT NULL DEFAULT '',
  period_label_en TEXT NOT NULL DEFAULT '',
  summary_es TEXT NOT NULL DEFAULT '',
  summary_en TEXT NOT NULL DEFAULT '',
  bullets_es TEXT[] NOT NULL DEFAULT '{}',
  bullets_en TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.timeline_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.timeline_items TO authenticated;
GRANT ALL ON public.timeline_items TO service_role;
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read timeline" ON public.timeline_items FOR SELECT USING (true);
CREATE POLICY "admin ins timeline" ON public.timeline_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin upd timeline" ON public.timeline_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin del timeline" ON public.timeline_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_timeline_updated BEFORE UPDATE ON public.timeline_items FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es TEXT NOT NULL DEFAULT '',
  name_en TEXT NOT NULL DEFAULT '',
  desc_es TEXT NOT NULL DEFAULT '',
  desc_en TEXT NOT NULL DEFAULT '',
  stack TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "admin ins projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin upd projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin del projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'strategy',
  category_label_es TEXT NOT NULL DEFAULT '',
  category_label_en TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "admin ins skills" ON public.skills FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin upd skills" ON public.skills FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin del skills" ON public.skills FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
