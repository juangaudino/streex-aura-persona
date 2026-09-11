-- Read-only verification for the independent Supabase destination.
-- Run this in the destination project's SQL Editor after applying migrations.

-- Expected public tables and row counts.
SELECT
  expected.table_name,
  actual.table_name IS NOT NULL AS exists_in_destination
FROM (VALUES
  ('profile_settings'),
  ('timeline_items'),
  ('projects'),
  ('skills'),
  ('markets'),
  ('user_roles')
) AS expected(table_name)
LEFT JOIN information_schema.tables AS actual
  ON actual.table_schema = 'public'
 AND actual.table_name = expected.table_name
ORDER BY expected.table_name;

SELECT 'profile_settings' AS table_name, count(*) AS row_count FROM public.profile_settings
UNION ALL
SELECT 'timeline_items', count(*) FROM public.timeline_items
UNION ALL
SELECT 'projects', count(*) FROM public.projects
UNION ALL
SELECT 'skills', count(*) FROM public.skills
UNION ALL
SELECT 'markets', count(*) FROM public.markets
UNION ALL
SELECT 'user_roles', count(*) FROM public.user_roles;

-- Storage must be private, limited to 25 MiB, and MIME-restricted.
SELECT
  expected.bucket_id,
  actual.id IS NOT NULL AS exists_in_destination,
  actual.public,
  actual.file_size_limit,
  actual.allowed_mime_types,
  actual.public = false AS is_private,
  actual.file_size_limit = 26214400 AS has_expected_size_limit
FROM (VALUES ('cv-attachments'), ('cv-projects')) AS expected(bucket_id)
LEFT JOIN storage.buckets AS actual ON actual.id = expected.bucket_id
ORDER BY expected.bucket_id;

-- RLS must be enabled on every exposed application table.
SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS force_rls
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'profile_settings',
    'timeline_items',
    'projects',
    'skills',
    'markets',
    'user_roles'
  )
ORDER BY c.relname;

-- Review policy names, roles, and predicates on application and Storage objects.
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE (schemaname = 'public' AND tablename IN (
  'profile_settings',
  'timeline_items',
  'projects',
  'skills',
  'markets',
  'user_roles'
))
OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY schemaname, tablename, policyname;

-- SECURITY DEFINER functions must not remain executable by PUBLIC.
SELECT
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS identity_arguments,
  p.prosecdef AS security_definer,
  has_function_privilege('public', p.oid, 'EXECUTE') AS public_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute
FROM pg_proc AS p
JOIN pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('has_role', 'tg_set_updated_at')
ORDER BY p.proname;

-- The insecure first-admin claim must not remain available on the destination.
SELECT NOT EXISTS (
  SELECT 1
  FROM pg_proc AS p
  JOIN pg_namespace AS n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'claim_admin'
) AS claim_admin_removed;
