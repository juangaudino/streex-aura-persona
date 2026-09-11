update public.profile_settings as ps
set
  cv_url = 'profile/juanooh/cv.pdf',
  photo_light_url = 'profile/juanooh/juan-light.png',
  photo_dark_url = 'profile/juanooh/juan-dark.png'
from public.profiles as p
where ps.profile_id = p.id
  and p.slug = 'juanooh';
