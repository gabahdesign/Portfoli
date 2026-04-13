-- =============================================================
-- IMPORTACIÓ DE DADES — descobreix.com/portfoli/
-- Executa aquest script al SQL Editor de Supabase
-- =============================================================

-- ─────────────────────────────────────────────
-- EMPRESES (Experiència Professional)
-- ─────────────────────────────────────────────
INSERT INTO public.companies (name, slug, sector, location, website, start_date, end_date, is_freelance)
VALUES
  ('EGM Comunicació Visual', 'egm-comunicacio-visual', 'Impressió i Disseny', 'Barcelona', NULL, '2022-01-01', NULL, false),
  ('Tabersa', 'tabersa', 'Impressió Industrial (Rotogravat)', 'El Prat de Llobregat', NULL, '2022-01-01', NULL, false),
  ('CSIC Cultura Cientifica', 'csic-cultura-cientifica', 'Disseny Grafic i Multimedia', 'Barcelona', 'https://www.csic.es', '2022-02-01', '2022-11-30', false),
  ('Yuhu Studio S.L.', 'yuhu-studio', 'Disseny Grafic', 'Barcelona', NULL, '2021-01-01', '2022-01-01', false),
  ('INA Disseny S.L.', 'ina-disseny', 'Disseny Grafic', 'Sant Boi de Llobregat', NULL, '2021-07-01', '2021-08-31', false),
  ('Invictus Comunicacion S.L.', 'invictus-comunicacion', 'Disseny Grafic / Publicitat', 'Sant Quirze del Valles', NULL, '2018-04-01', '2018-10-31', false),
  ('CEDESCA', 'cedesca', 'Disseny Grafic', 'Barcelona', NULL, '2015-01-01', '2016-12-31', false),
  ('Eix Copisteria', 'eix-copisteria', 'Pre-impressio Digital', 'Sant Boi de Llobregat', NULL, '2013-01-01', '2015-12-31', false)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────
-- CV: EXPERIENCIA PROFESSIONAL
-- ─────────────────────────────────────────────
INSERT INTO public.cv_sections (type, title, content, sort_order)
VALUES (
  'experiencia',
  '{"ca": "Experiencia Professional", "es": "Experiencia Profesional", "en": "Work Experience", "fr": "Experience Professionnelle"}',
  '[
    {"title": "Auxiliar de Taller", "place": "EGM Comunicacio Visual", "location": "Barcelona", "date_start": "2022", "date_end": null, "description": "Suport en produccio grafica i impressio de gran format."},
    {"title": "Auxiliar de Taller (Rotogravat)", "place": "Tabersa", "location": "El Prat de Llobregat", "date_start": "2022", "date_end": null, "description": "Tecnic en rotogravat industrial i control de qualitat d impressio."},
    {"title": "Dissenyador Grafic i Multimedia", "place": "CSIC Cultura Cientifica", "location": "Barcelona", "date_start": "Feb 2022", "date_end": "Nov 2022", "description": "Produccio de materials visuals per a comunicacio cientifica. Edicio de video, retoc fotografic i disseny editorial."},
    {"title": "Dissenyador Grafic", "place": "Yuhu Studio S.L.", "location": "Barcelona", "date_start": "2021", "date_end": "2022", "description": "Disseny d identitat visual, material publicitari i contingut per a xarxes socials."},
    {"title": "Dissenyador Grafic", "place": "INA Disseny S.L.", "location": "Sant Boi de Llobregat", "date_start": "Jul 2021", "date_end": "Ago 2021", "description": "Practiques en estudi de disseny grafic."},
    {"title": "Dissenyador Grafic", "place": "Invictus Comunicacion S.L.", "location": "Sant Quirze del Valles", "date_start": "Abr 2018", "date_end": "Oct 2018", "description": "Disseny de campanyes publicitaries i material corporatiu."},
    {"title": "Dissenyador Grafic", "place": "CEDESCA", "location": "Barcelona", "date_start": "2015", "date_end": "2016", "description": "Disseny editorial i produccio de material formatiu."},
    {"title": "Tecnic en Pre-impressio Digital", "place": "Eix Copisteria", "location": "Sant Boi de Llobregat", "date_start": "2013", "date_end": "2015", "description": "Preparacio d arxius per a impressio digital."}
  ]',
  1
);

-- ─────────────────────────────────────────────
-- CV: FORMACIO
-- ─────────────────────────────────────────────
INSERT INTO public.cv_sections (type, title, content, sort_order)
VALUES (
  'educacion',
  '{"ca": "Formacio", "es": "Formacion", "en": "Education", "fr": "Formation"}',
  '[
    {"title": "C.P. Tecnic en Ciberseguretat i Gestor de la IA", "place": "DiferentMent", "location": "Martorell", "date_start": "Proximament", "date_end": null},
    {"title": "C.P. Troquelat/Encunyacio [24CS04-25]", "place": "Escola Grafica Antoni Alguero - CIFO Hospitalet", "location": "L Hospitalet de Llobregat", "date_start": "2024", "date_end": "2025"},
    {"title": "C.P. Eines de Video i Animacio (Adobe)", "place": "CIFO Hospitalet", "location": "L Hospitalet de Llobregat", "date_start": "Jun 2021", "date_end": "Jul 2021"},
    {"title": "CFGS Disseny i Gestio de la Produccio Grafica", "place": "Institut Escola del Treball", "location": "Barcelona", "date_start": "2020", "date_end": "2021"},
    {"title": "Certificats Oficials Adobe (Ps, Ai, Id, Pr, Ae)", "place": "Escola Espai", "location": "Barcelona", "date_start": "2019", "date_end": "2021"},
    {"title": "CFGS Disseny i Edicio de Publicacions Multimedia", "place": "Salesians Sarria", "location": "Barcelona", "date_start": "2017", "date_end": "2019"},
    {"title": "CFGM Pre-impressio Digital", "place": "Salesians Sarria", "location": "Barcelona", "date_start": "2014", "date_end": "2016"}
  ]',
  2
);

-- ─────────────────────────────────────────────
-- CV: IDIOMES
-- ─────────────────────────────────────────────
INSERT INTO public.cv_sections (type, title, content, sort_order)
VALUES (
  'idiomas',
  '{"ca": "Idiomes", "es": "Idiomas", "en": "Languages", "fr": "Langues"}',
  '[
    {"name": "Catala", "level": "Natiu"},
    {"name": "Castellano", "level": "Natiu"},
    {"name": "English", "level": "Intermedi (B1)"},
    {"name": "Francais", "level": "Basic (A2)"}
  ]',
  3
);

-- ─────────────────────────────────────────────
-- CV: EINES I SOFTWARE
-- ─────────────────────────────────────────────
INSERT INTO public.cv_sections (type, title, content, sort_order)
VALUES (
  'habilidades',
  '{"ca": "Eines i Software", "es": "Herramientas y Software", "en": "Tools and Software", "fr": "Outils et Logiciels"}',
  '[
    {"name": "Adobe Creative Suite", "level": "Expert", "items": ["Photoshop", "Illustrator", "InDesign", "Premiere Pro", "After Effects"]},
    {"name": "Desenvolupament Web", "level": "Avançat", "items": ["HTML", "CSS", "JavaScript", "Next.js", "Supabase"]},
    {"name": "Intel·ligencia Artificial", "level": "Avançat", "items": ["Cursor", "ChatGPT", "Midjourney", "Claude"]},
    {"name": "Productivitat", "level": "Expert", "items": ["Notion", "Slack", "Trello", "Figma"]}
  ]',
  4
);
