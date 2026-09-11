-- Keep profile administration explicit per operation so the policies do not
-- overlap on SELECT, and make the server-only link table visibly deny direct
-- browser access.

DROP POLICY IF EXISTS "Admins write profiles" ON public.profiles;

CREATE POLICY "Admins insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

CREATE POLICY "Admins update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)))
  WITH CHECK ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

CREATE POLICY "Admins delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING ((SELECT private.has_role((SELECT auth.uid()), 'admin'::public.app_role)));

CREATE POLICY "No direct access to profile links" ON public.profile_access_links
  FOR ALL TO anon, authenticated
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE INDEX profile_access_links_profile_id_idx
  ON public.profile_access_links(profile_id);
