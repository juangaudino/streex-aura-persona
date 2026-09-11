-- Profile content is delivered by the Worker only after a valid share-link
-- cookie. The browser's publishable key must not be able to enumerate it.
drop policy if exists "Public read profile" on public.profile_settings;
drop policy if exists "Public read timeline" on public.timeline_items;
drop policy if exists "Public read projects" on public.projects;
drop policy if exists "Public read skills" on public.skills;
drop policy if exists "Public read markets" on public.markets;

revoke select on public.profile_settings from anon;
revoke select on public.timeline_items from anon;
revoke select on public.projects from anon;
revoke select on public.skills from anon;
revoke select on public.markets from anon;
revoke all on public.profile_access_links from anon, authenticated;
