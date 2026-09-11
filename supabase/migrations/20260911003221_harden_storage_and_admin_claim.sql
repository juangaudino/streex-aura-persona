-- Keep the first-admin bootstrap atomic: at most one admin role can exist.
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_one_admin_idx
  ON public.user_roles (role)
  WHERE role = 'admin';

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _inserted INTEGER;
BEGIN
  IF _uid IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'admin')
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS _inserted = ROW_COUNT;
  RETURN _inserted = 1;
END;
$$;

-- SECURITY DEFINER functions are explicit internal APIs, not public endpoints.
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.claim_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.tg_set_updated_at() FROM PUBLIC;

-- The application uses signed URLs, so the buckets must remain private.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('cv-attachments', 'cv-attachments', FALSE),
  ('cv-projects', 'cv-projects', FALSE)
ON CONFLICT (id) DO UPDATE SET public = FALSE;

DROP POLICY IF EXISTS "public read cv-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public read attachments" ON storage.objects;
DROP POLICY IF EXISTS "admin insert cv-attachments" ON storage.objects;
DROP POLICY IF EXISTS "admin update cv-attachments" ON storage.objects;
DROP POLICY IF EXISTS "admin delete cv-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins update attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete attachments" ON storage.objects;

CREATE POLICY "Admins read CV storage"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id IN ('cv-attachments', 'cv-projects')
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins insert CV storage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('cv-attachments', 'cv-projects')
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins update CV storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('cv-attachments', 'cv-projects')
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    bucket_id IN ('cv-attachments', 'cv-projects')
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins delete CV storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('cv-attachments', 'cv-projects')
    AND public.has_role(auth.uid(), 'admin')
  );
