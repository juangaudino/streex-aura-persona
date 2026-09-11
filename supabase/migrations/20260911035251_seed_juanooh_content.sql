-- Restore the current CV content from the repository's ES/EN source of truth.
-- Every insert is scoped to juanooh and guarded by a natural key so this
-- migration does not duplicate content if it is replayed in another target.

UPDATE public.profile_settings AS ps
SET
  name = 'Juan Gaudino',
  email = 'juangaudino@gmail.com',
  phone = '+1 (801) 651-8187',
  location = 'Salt Lake City, UT',
  linkedin = 'https://linkedin.com/in/juangaudino',
  cv_url = '/cv.pdf',
  photo_light_url = '/juan-light.png',
  photo_dark_url = '/juan-dark.png',
  hero_eyebrow_es = 'CV · 2026',
  hero_eyebrow_en = 'CV · 2026',
  hero_title_es = ARRAY['Planifico medios', 'que mueven', 'mercados.'],
  hero_title_en = ARRAY['I plan media', 'that moves', 'markets.'],
  hero_role_es = 'Media Planner · Estratega OOH & DOOH',
  hero_role_en = 'Media Planner · OOH & DOOH Strategist',
  hero_location_es = 'Salt Lake City, UT · Disponible para el mercado U.S.',
  hero_location_en = 'Salt Lake City, UT · Open to U.S. market opportunities',
  hero_cta_es = 'Descargar CV',
  hero_cta_en = 'Download CV',
  hero_cta_alt_es = 'Contactar',
  hero_cta_alt_en = 'Get in touch',
  about_eyebrow_es = 'Sobre mí',
  about_eyebrow_en = 'About',
  about_title_es = '15+ años conectando insights con resultados medibles.',
  about_title_en = '15+ years connecting insights to measurable results.',
  about_body_es = ARRAY[
    'Soy Juan Gaudino, media planner con más de 15 años gestionando campañas OOH y DOOH en mercados de Latinoamérica para marcas internacionales.',
    'Ahora basado en Utah, estoy expandiendo mi expertise hacia publicidad programática y analítica digital, con el foco puesto en aportar soluciones data-driven al mercado estadounidense.'
  ],
  about_body_en = ARRAY[
    'I''m Juan Gaudino, a media planner with over 15 years managing OOH and DOOH campaigns across Latin American markets for international brands.',
    'Now based in Utah, I''m expanding my expertise into programmatic advertising and digital analytics, focused on bringing fresh, data-driven solutions to the U.S. market.'
  ],
  about_stats = jsonb_build_array(
    jsonb_build_object('value', '15+', 'label_es', 'Años de experiencia', 'label_en', 'Years of experience'),
    jsonb_build_object('value', '10+', 'label_es', 'Planners liderados', 'label_en', 'Planners led'),
    jsonb_build_object('value', '4+', 'label_es', 'Mercados LATAM abiertos', 'label_en', 'LATAM markets opened')
  ),
  experience_eyebrow_es = 'Trayectoria',
  experience_eyebrow_en = 'Journey',
  experience_title_es = 'De LATAM a los Estados Unidos.',
  experience_title_en = 'From LATAM to the United States.',
  experience_lane_work_es = 'Experiencia',
  experience_lane_work_en = 'Experience',
  experience_lane_study_es = 'Educación',
  experience_lane_study_en = 'Education',
  experience_tag_work_es = 'Trabajo',
  experience_tag_work_en = 'Work',
  experience_tag_study_es = 'Estudio',
  experience_tag_study_en = 'Study',
  projects_eyebrow_es = 'Campañas seleccionadas',
  projects_eyebrow_en = 'Selected campaigns',
  projects_title_es = 'Verticales donde he ejecutado.',
  projects_title_en = 'Verticals I''ve executed in.',
  skills_eyebrow_es = 'Capacidades',
  skills_eyebrow_en = 'Capabilities',
  skills_title_es = 'Estrategia, datos y liderazgo.',
  skills_title_en = 'Strategy, data and leadership.',
  journey_eyebrow_es = 'Trayectoria geográfica',
  journey_eyebrow_en = 'Geographic journey',
  journey_title_es = 'De LATAM a Estados Unidos',
  journey_title_en = 'From LATAM to the U.S.',
  journey_body_es = 'Mercados donde planifiqué y activé campañas OOH/DOOH.',
  journey_body_en = 'Markets where I planned and activated OOH/DOOH campaigns.',
  contact_eyebrow_es = 'Hablemos',
  contact_eyebrow_en = 'Let''s talk',
  contact_title_es = '¿Un proyecto en mente? Conversemos.',
  contact_title_en = 'Got a project in mind? Let''s chat.',
  contact_sub_es = 'Respondo en menos de 48h. También puedes encontrarme aquí:',
  contact_sub_en = 'I reply within 48h. You can also find me here:'
WHERE ps.profile_id = (SELECT id FROM public.profiles WHERE slug = 'juanooh')
  AND ps.hero_title_es = '{}'::text[]
  AND ps.about_body_es = '{}'::text[];

INSERT INTO public.timeline_items (
  profile_id, kind, org, title_es, title_en, location,
  period_label_es, period_label_en, summary_es, summary_en, sort_order
)
SELECT p.id, v.kind::public.timeline_kind, v.org, v.title_es, v.title_en, v.location,
  v.period_es, v.period_en, v.summary_es, v.summary_en, v.sort_order
FROM public.profiles p
CROSS JOIN (VALUES
  ('study', 'Weber State University · Ogden, Utah', 'Entrepreneurship Certificate', 'Entrepreneurship Certificate', 'Ogden, Utah', '2026', '2026', 'Formación continua orientada a programmatic advertising, digital analytics y emprendimiento en el mercado estadounidense.', 'Continuing education focused on programmatic advertising, digital analytics and entrepreneurship in the U.S. market.', 4),
  ('work', 'LATCOM · Buenos Aires, Argentina', 'Media Planning Coordinator', 'Media Planning Coordinator', 'Buenos Aires, Argentina', 'May 2021 — Jul 2023', 'May 2021 — Jul 2023', 'Lideré un equipo de 10+ planners coordinando campañas OOH y DOOH multimercado. Diseñé estrategias para marcas internacionales en transit, malls, aeropuertos y vallas digitales, negociando contratos con proveedores y optimizando costos.', 'Led a team of 10+ planners coordinating multi-market OOH and DOOH campaigns. Designed strategies for top international brands across transit, malls, airports and digital billboards, negotiating vendor contracts and optimizing costs.', 3),
  ('work', 'LATCOM · Vicente López, Buenos Aires', 'Strategic Development Analyst — USA, LATAM & Europa', 'Strategic Development Analyst — USA, LATAM & Europe', 'Vicente López, Buenos Aires', 'Oct 2015 — Abr 2021', 'Oct 2015 — Apr 2021', 'Diseñé y ejecuté planes estratégicos OOH/DOOH para clientes en USA, LATAM y Europa. Expandí cobertura a 4+ nuevos mercados LATAM y entregué reportes analíticos y proyecciones económicas para soportar decisiones ejecutivas.', 'Designed and executed strategic OOH/DOOH plans for clients in the U.S., LATAM and Europe. Expanded coverage to 4+ new LATAM markets and delivered analytical reports and economic projections to support executive decisions.', 2),
  ('study', 'Universidad Dr. Rafael Belloso Chacín (URBE) · Venezuela', 'Licenciatura en Marketing y Publicidad', 'Bachelor''s Degree in Marketing & Advertising', 'Venezuela', '2006', '2006', 'Base académica en marketing, publicidad y estrategia de marca.', 'Academic foundation in marketing, advertising and brand strategy.', 1)
) AS v(kind, org, title_es, title_en, location, period_es, period_en, summary_es, summary_en, sort_order)
WHERE p.slug = 'juanooh'
  AND NOT EXISTS (
    SELECT 1 FROM public.timeline_items t
    WHERE t.profile_id = p.id AND t.org = v.org AND t.title_es = v.title_es
  );

INSERT INTO public.projects (profile_id, name_es, name_en, desc_es, desc_en, stack, sort_order)
SELECT p.id, v.name_es, v.name_en, v.desc_es, v.desc_en, v.stack, v.sort_order
FROM public.profiles p
CROSS JOIN (VALUES
  ('Transit Media', 'Transit Media', 'Campañas OOH en buses, metro y transporte público multi-ciudad.', 'OOH campaigns across buses, subway and public transport in multiple cities.', 'OOH · LATAM', 1),
  ('Malls & Retail', 'Malls & Retail', 'Activaciones DOOH en shoppings y high-traffic retail.', 'DOOH activations in shopping centers and high-traffic retail.', 'DOOH · Retail', 2),
  ('Airports', 'Airports', 'Planificación en aeropuertos clave de LATAM para marcas globales.', 'Planning across key LATAM airports for global brands.', 'OOH/DOOH · Travel', 3),
  ('Digital Billboards', 'Digital Billboards', 'Pantallas digitales en corredores premium con segmentación por daypart.', 'Digital screens in premium corridors with daypart targeting.', 'DOOH · Programmatic', 4)
) AS v(name_es, name_en, desc_es, desc_en, stack, sort_order)
WHERE p.slug = 'juanooh'
  AND NOT EXISTS (
    SELECT 1 FROM public.projects pr
    WHERE pr.profile_id = p.id AND pr.name_es = v.name_es
  );

INSERT INTO public.skills (profile_id, name, category, category_label_es, category_label_en, sort_order)
SELECT p.id, v.name, v.category, v.label_es, v.label_en, v.sort_order
FROM public.profiles p
CROSS JOIN (VALUES
  ('Media Planning', 'strategy', 'Estrategia', 'Strategy', 1),
  ('OOH / DOOH', 'strategy', 'Estrategia', 'Strategy', 2),
  ('Market Research', 'strategy', 'Estrategia', 'Strategy', 3),
  ('Vendor Negotiation', 'strategy', 'Estrategia', 'Strategy', 4),
  ('Regional Expansion', 'strategy', 'Estrategia', 'Strategy', 5),
  ('Brand Strategy', 'strategy', 'Estrategia', 'Strategy', 6),
  ('Programmatic Advertising', 'analytics', 'Analítica', 'Analytics', 7),
  ('Digital Analytics', 'analytics', 'Analítica', 'Analytics', 8),
  ('Reporting', 'analytics', 'Analítica', 'Analytics', 9),
  ('Economic Projections', 'analytics', 'Analítica', 'Analytics', 10),
  ('Campaign Performance', 'analytics', 'Analítica', 'Analytics', 11),
  ('Insights', 'analytics', 'Analítica', 'Analytics', 12),
  ('Team Leadership (10+)', 'leadership', 'Liderazgo', 'Leadership', 13),
  ('Client Relations', 'leadership', 'Liderazgo', 'Leadership', 14),
  ('Cross-market Coordination', 'leadership', 'Liderazgo', 'Leadership', 15),
  ('Vendor Partnerships', 'leadership', 'Liderazgo', 'Leadership', 16),
  ('Executive Reporting', 'leadership', 'Liderazgo', 'Leadership', 17),
  ('Bilingüe ES/EN', 'leadership', 'Liderazgo', 'Leadership', 18)
) AS v(name, category, label_es, label_en, sort_order)
WHERE p.slug = 'juanooh'
  AND NOT EXISTS (
    SELECT 1 FROM public.skills s
    WHERE s.profile_id = p.id AND s.name = v.name AND s.category = v.category
  );
