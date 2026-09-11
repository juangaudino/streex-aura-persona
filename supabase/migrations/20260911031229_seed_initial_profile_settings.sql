-- Keep the singleton content row available for the Admin editor on new projects.
-- Do not overwrite an existing profile or any migrated content.
INSERT INTO public.profile_settings (singleton, name)
SELECT TRUE, 'Juan Gaudino'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.profile_settings
  WHERE singleton = TRUE
);
