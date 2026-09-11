-- `singleton` is retained temporarily for compatibility with older clients.
-- Profile-specific uniqueness is now enforced by profile_id instead.
ALTER TABLE public.profile_settings
  DROP CONSTRAINT IF EXISTS profile_settings_singleton_key;
