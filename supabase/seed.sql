-- ═══════════════════════════════════════════════
-- AMHARICAN — Seed Data
-- Run AFTER schema.sql
-- ═══════════════════════════════════════════════

-- ── UNITS ──────────────────────────────────────
insert into public.units (id, title_en, title_am, order_index, is_published) values
  ('11111111-0000-0000-0000-000000000001', 'Greetings',  'ሰላምታ',  1, true),
  ('11111111-0000-0000-0000-000000000002', 'Numbers',    'ቁጥሮች',  2, true),
  ('11111111-0000-0000-0000-000000000003', 'Family',     'ቤተሰብ',  3, true)
on conflict (id) do nothing;

-- ── LESSONS ────────────────────────────────────
insert into public.lessons (id, unit_id, title_en, title_am, order_index, xp_reward, is_published) values
  -- Unit 1: Greetings
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Basic Greetings',    'መሰረታዊ ሰላምታ', 1, 10, true),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Saying Goodbye',     'ሰላምታ መሰናበት',  2, 10, true),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Polite Expressions', 'ሥነ ቃል',        3, 15, true),
  -- Unit 2: Numbers
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000002', 'Numbers 1–5',        'ቁጥር 1-5',      1, 10, true),
  ('22222222-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000002', 'Numbers 6–10',       'ቁጥር 6-10',     2, 10, true),
  -- Unit 3: Family
  ('22222222-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000003', 'Immediate Family',   'ቤተሰብ',         1, 10, true),
  ('22222222-0000-0000-0000-000000000007', '11111111-0000-0000-0000-000000000003', 'Extended Family',    'ሩቅ ቤተሰብ',      2, 15, true)
on conflict (id) do nothing;

-- ── EXERCISES ──────────────────────────────────

-- Lesson 1: Basic Greetings
insert into public.exercises (lesson_id, type, prompt_am, prompt_en, romanization, options, correct_answer) values
  ('22222222-0000-0000-0000-000000000001', 'multiple_choice', 'ሰላም',         'Hello',     'Selam',
   '["Hello","Goodbye","Thank you","Please"]', 'Hello'),

  ('22222222-0000-0000-0000-000000000001', 'multiple_choice', 'አመሰግናለሁ',    'Thank you', 'Amesegnalehu',
   '["Sorry","Good morning","Thank you","Goodbye"]', 'Thank you'),

  ('22222222-0000-0000-0000-000000000001', 'multiple_choice', 'እንዴት ነህ?',   'How are you?', 'Indet neh?',
   '["What is your name?","How are you?","Where are you from?","Good night"]', 'How are you?'),

  ('22222222-0000-0000-0000-000000000001', 'word_match', 'ሰላም', 'Hello', 'Selam',
   '[{"am":"ሰላም","en":"Hello"},{"am":"አዎ","en":"Yes"},{"am":"አይ","en":"No"},{"am":"ደህና ሁን","en":"Goodbye"}]',
   'matched');

-- Lesson 2: Saying Goodbye
insert into public.exercises (lesson_id, type, prompt_am, prompt_en, romanization, options, correct_answer) values
  ('22222222-0000-0000-0000-000000000002', 'multiple_choice', 'ደህና ሁን',      'Goodbye',    'Dehna hun',
   '["Hello","See you","Goodbye","Good morning"]', 'Goodbye'),

  ('22222222-0000-0000-0000-000000000002', 'multiple_choice', 'ቸር ወዮልህ',    'Farewell',   'Cher weyolih',
   '["Good night","Farewell","Come back","Stay safe"]', 'Farewell'),

  ('22222222-0000-0000-0000-000000000002', 'listen_select', 'ሰላም', 'Hello', 'Selam',
   '["ሰላም","ደህና ሁን","አዎ","አይ"]', 'ሰላም');

-- Lesson 3: Polite Expressions
insert into public.exercises (lesson_id, type, prompt_am, prompt_en, romanization, options, correct_answer) values
  ('22222222-0000-0000-0000-000000000003', 'multiple_choice', 'ይቅርታ',        'Sorry / Excuse me', 'Yiqirta',
   '["Thank you","Please","Sorry / Excuse me","You''re welcome"]', 'Sorry / Excuse me'),

  ('22222222-0000-0000-0000-000000000003', 'multiple_choice', 'እባክህ',         'Please',     'Ibakih',
   '["Sorry","Please","Thank you","Yes"]', 'Please'),

  ('22222222-0000-0000-0000-000000000003', 'word_match', 'ይቅርታ', 'Sorry', 'Yiqirta',
   '[{"am":"ይቅርታ","en":"Sorry"},{"am":"እባክህ","en":"Please"},{"am":"አዎ","en":"Yes"},{"am":"አይ","en":"No"}]',
   'matched');

-- Lesson 4: Numbers 1–5
insert into public.exercises (lesson_id, type, prompt_am, prompt_en, romanization, options, correct_answer) values
  ('22222222-0000-0000-0000-000000000004', 'multiple_choice', 'አንድ',  'One',   'And',
   '["One","Two","Three","Four"]', 'One'),
  ('22222222-0000-0000-0000-000000000004', 'multiple_choice', 'ሁለት', 'Two',   'Hulet',
   '["One","Two","Three","Four"]', 'Two'),
  ('22222222-0000-0000-0000-000000000004', 'multiple_choice', 'ሦስት', 'Three', 'Sost',
   '["Two","Three","Four","Five"]', 'Three'),
  ('22222222-0000-0000-0000-000000000004', 'multiple_choice', 'አራት', 'Four',  'Arat',
   '["One","Three","Four","Five"]', 'Four'),
  ('22222222-0000-0000-0000-000000000004', 'word_match', 'አንድ', 'One', 'And',
   '[{"am":"አንድ","en":"One"},{"am":"ሁለት","en":"Two"},{"am":"ሦስት","en":"Three"},{"am":"አራት","en":"Four"}]',
   'matched');

-- Lesson 5: Numbers 6–10
insert into public.exercises (lesson_id, type, prompt_am, prompt_en, romanization, options, correct_answer) values
  ('22222222-0000-0000-0000-000000000005', 'multiple_choice', 'አምስት', 'Five',  'Amist',
   '["Four","Five","Six","Seven"]', 'Five'),
  ('22222222-0000-0000-0000-000000000005', 'multiple_choice', 'ስድስት', 'Six',   'Sidist',
   '["Five","Six","Seven","Eight"]', 'Six'),
  ('22222222-0000-0000-0000-000000000005', 'multiple_choice', 'ሰባት',  'Seven', 'Sebat',
   '["Six","Seven","Eight","Nine"]', 'Seven'),
  ('22222222-0000-0000-0000-000000000005', 'multiple_choice', 'ስምንት', 'Eight', 'Simint',
   '["Seven","Eight","Nine","Ten"]', 'Eight'),
  ('22222222-0000-0000-0000-000000000005', 'word_match', 'ስድስት', 'Six', 'Sidist',
   '[{"am":"ስድስት","en":"Six"},{"am":"ሰባት","en":"Seven"},{"am":"ስምንት","en":"Eight"},{"am":"ዘጠኝ","en":"Nine"}]',
   'matched');

-- Lesson 6: Immediate Family
insert into public.exercises (lesson_id, type, prompt_am, prompt_en, romanization, options, correct_answer) values
  ('22222222-0000-0000-0000-000000000006', 'multiple_choice', 'እናት',  'Mother', 'Inat',
   '["Father","Mother","Sister","Brother"]', 'Mother'),
  ('22222222-0000-0000-0000-000000000006', 'multiple_choice', 'አባት',  'Father', 'Abat',
   '["Mother","Father","Son","Daughter"]', 'Father'),
  ('22222222-0000-0000-0000-000000000006', 'multiple_choice', 'ወንድም', 'Brother','Wendim',
   '["Sister","Mother","Brother","Father"]', 'Brother'),
  ('22222222-0000-0000-0000-000000000006', 'word_match', 'እናት', 'Mother', 'Inat',
   '[{"am":"እናት","en":"Mother"},{"am":"አባት","en":"Father"},{"am":"ወንድም","en":"Brother"},{"am":"እህት","en":"Sister"}]',
   'matched');

-- Lesson 7: Extended Family
insert into public.exercises (lesson_id, type, prompt_am, prompt_en, romanization, options, correct_answer) values
  ('22222222-0000-0000-0000-000000000007', 'multiple_choice', 'አያት',    'Grandparent', 'Ayat',
   '["Uncle","Grandparent","Cousin","Nephew"]', 'Grandparent'),
  ('22222222-0000-0000-0000-000000000007', 'multiple_choice', 'አጎት',    'Uncle',       'Agot',
   '["Uncle","Aunt","Grandparent","Cousin"]', 'Uncle'),
  ('22222222-0000-0000-0000-000000000007', 'word_match', 'አያት', 'Grandparent', 'Ayat',
   '[{"am":"አያት","en":"Grandparent"},{"am":"አጎት","en":"Uncle"},{"am":"አክስት","en":"Aunt"},{"am":"ልጅ","en":"Child"}]',
   'matched');

-- ── VOCABULARY ─────────────────────────────────
insert into public.vocabulary (word_am, word_en, romanization, topic_tag) values
  ('ሰላም',         'Hello',        'Selam',         'greetings'),
  ('ደህና ሁን',      'Goodbye',      'Dehna hun',     'greetings'),
  ('አመሰግናለሁ',    'Thank you',    'Amesegnalehu',  'greetings'),
  ('ይቅርታ',        'Sorry',        'Yiqirta',       'greetings'),
  ('እባክህ',         'Please',       'Ibakih',        'greetings'),
  ('አዎ',           'Yes',          'Awo',           'basics'),
  ('አይ',           'No',           'Ay',            'basics'),
  ('አንድ',          'One',          'And',           'numbers'),
  ('ሁለት',         'Two',          'Hulet',         'numbers'),
  ('ሦስት',         'Three',        'Sost',          'numbers'),
  ('አራት',         'Four',         'Arat',          'numbers'),
  ('አምስት',        'Five',         'Amist',         'numbers'),
  ('ስድስት',        'Six',          'Sidist',        'numbers'),
  ('ሰባት',         'Seven',        'Sebat',         'numbers'),
  ('ስምንት',        'Eight',        'Simint',        'numbers'),
  ('ዘጠኝ',         'Nine',         'Zetegn',        'numbers'),
  ('አስር',         'Ten',          'Asir',          'numbers'),
  ('እናት',         'Mother',       'Inat',          'family'),
  ('አባት',         'Father',       'Abat',          'family'),
  ('ወንድም',        'Brother',      'Wendim',        'family'),
  ('እህት',         'Sister',       'Ihit',          'family'),
  ('ልጅ',          'Child',        'Lij',           'family'),
  ('አያት',         'Grandparent',  'Ayat',          'family'),
  ('አጎት',         'Uncle',        'Agot',          'family'),
  ('አክስት',        'Aunt',         'Akist',         'family')
on conflict do nothing;
