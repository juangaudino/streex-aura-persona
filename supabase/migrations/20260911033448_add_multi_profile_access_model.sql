-- Introduce profile-scoped content without changing the current public read
-- behavior yet. Access lockdown and route changes are deployed separately.

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

CREATE POLICY "Admins write profiles" ON public.profiles
  FOR ALL TO authenticated
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)))
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.profile_access_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL DEFAULT '',
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  CONSTRAINT profile_access_links_token_hash_format CHECK (length(token_hash) = 64)
);

-- Share links are server-only records. The browser never receives this table
-- through PostgREST; the Worker validates a raw token and reads by hash.
GRANT ALL ON public.profile_access_links TO service_role;
ALTER TABLE public.profile_access_links ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profile_settings
  ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.timeline_items
  ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.projects
  ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.skills
  ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.markets
  ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX profile_settings_profile_id_key
  ON public.profile_settings(profile_id)
  WHERE profile_id IS NOT NULL;

DO $$
DECLARE
  primary_profile_id UUID;
BEGIN
  INSERT INTO public.profiles (slug, display_name)
  VALUES ('juanooh', 'Juan OOH')
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO primary_profile_id
  FROM public.profiles
  WHERE slug = 'juanooh';

  UPDATE public.profile_settings
  SET profile_id = primary_profile_id
  WHERE profile_id IS NULL;

  UPDATE public.timeline_items
  SET profile_id = primary_profile_id
  WHERE profile_id IS NULL;

  UPDATE public.projects
  SET profile_id = primary_profile_id
  WHERE profile_id IS NULL;

  UPDATE public.skills
  SET profile_id = primary_profile_id
  WHERE profile_id IS NULL;

  UPDATE public.markets
  SET profile_id = primary_profile_id
  WHERE profile_id IS NULL;
END;
$$;

CREATE INDEX timeline_items_profile_id_sort_order_idx
  ON public.timeline_items(profile_id, sort_order DESC);
CREATE INDEX projects_profile_id_sort_order_idx
  ON public.projects(profile_id, sort_order);
CREATE INDEX skills_profile_id_sort_order_idx
  ON public.skills(profile_id, sort_order);
CREATE INDEX markets_profile_id_sort_order_idx
  ON public.markets(profile_id, sort_order);
