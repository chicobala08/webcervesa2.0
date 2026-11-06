-- Taula per a les respostes anònimes de l'enquesta de l'entrada.
-- Enganxa-ho a Supabase > SQL Editor > New query i prem "Run".

create table if not exists public.intro_responses (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  lang text not null default 'ca' check (lang in ('ca','es','en','de','zh')),
  age_range text check (age_range in ('lt14','14-15','16-17','18-25','26-40','gt40')),
  role text check (role in ('alumne_montjuic','alumne_altre','professor','familia','altre')),
  found_via text check (found_via in ('classe','qr','amic','xarxes','altre')),
  guess_ingredients text check (guess_ingredients in ('2','4','7','10+','nsnc')),
  guess_yeast text check (guess_yeast in ('color','fermenta','amargor','nsnc')),
  guess_origin text check (guess_origin in ('200','1000','milers','nsnc')),
  guess_nonalcoholic text check (guess_nonalcoholic in ('si','no','nsnc')),
  interest_part text check (interest_part in ('historia','ciencia','ingredients','tot')),
  interest_discover text check (interest_discover in ('origen','fermentacio','recepta','curiositats')),
  interest_level text check (interest_level in ('inici','mitja','aprofundir')),
  wish text check (char_length(wish) <= 200)
);

-- Seguretat: la web només pot AFEGIR respostes. Ningú les pot llegir des de la web;
-- tu les veus a Supabase > Table Editor (i les pots exportar a CSV).
alter table public.intro_responses enable row level security;

drop policy if exists "La web pot afegir respostes" on public.intro_responses;
create policy "La web pot afegir respostes"
  on public.intro_responses for insert
  to anon
  with check (true);

revoke all on public.intro_responses from anon, authenticated;
grant insert on public.intro_responses to anon;
