-- Keep the first-admin bootstrap atomic: at most one admin role can exist.
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_one_admin_idx
  ON public.user_roles (role)
  WHERE role = 'admin';

-- SECURITY DEFINER functions are explicit internal APIs, not public endpoints.
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.tg_set_updated_at() FROM PUBLIC;
DROP FUNCTION IF EXISTS public.claim_admin();

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
