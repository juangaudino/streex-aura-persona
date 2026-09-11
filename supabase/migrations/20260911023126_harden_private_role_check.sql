-- Keep the authorization helper out of the exposed public schema.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_role(UUID, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION private.has_role(UUID, public.app_role) TO authenticated;

-- Cache the auth/helper results once per statement instead of once per row.
ALTER POLICY "admin write profile ins" ON public.profile_settings
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));
ALTER POLICY "admin write profile upd" ON public.profile_settings
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)))
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));
ALTER POLICY "admin write profile del" ON public.profile_settings
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

ALTER POLICY "admin ins timeline" ON public.timeline_items
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));
ALTER POLICY "admin upd timeline" ON public.timeline_items
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)))
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));
ALTER POLICY "admin del timeline" ON public.timeline_items
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

ALTER POLICY "admin ins projects" ON public.projects
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));
ALTER POLICY "admin upd projects" ON public.projects
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)))
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));
ALTER POLICY "admin del projects" ON public.projects
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

ALTER POLICY "admin ins skills" ON public.skills
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));
ALTER POLICY "admin upd skills" ON public.skills
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)))
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));
ALTER POLICY "admin del skills" ON public.skills
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

ALTER POLICY "Admins can insert markets" ON public.markets
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));
ALTER POLICY "Admins can update markets" ON public.markets
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)))
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));
ALTER POLICY "Admins can delete markets" ON public.markets
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

ALTER POLICY "users see own roles" ON public.user_roles
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY "Admins read CV storage" ON storage.objects
  USING (
    bucket_id IN ('cv-attachments', 'cv-projects')
    AND (SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role))
  );
ALTER POLICY "Admins insert CV storage" ON storage.objects
  WITH CHECK (
    bucket_id IN ('cv-attachments', 'cv-projects')
    AND (SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role))
  );
ALTER POLICY "Admins update CV storage" ON storage.objects
  USING (
    bucket_id IN ('cv-attachments', 'cv-projects')
    AND (SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role))
  )
  WITH CHECK (
    bucket_id IN ('cv-attachments', 'cv-projects')
    AND (SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role))
  );
ALTER POLICY "Admins delete CV storage" ON storage.objects
  USING (
    bucket_id IN ('cv-attachments', 'cv-projects')
    AND (SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role))
  );

DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role);
