-- Run once in a new Supabase project's SQL Editor, or with supabase db push.
begin;

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'agenda', 'feedback')),
  created_at timestamptz not null default now()
);
create table public.survey_periods (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 3 and 120),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_open boolean not null default false,
  survey_version text not null default '1.0' check (survey_version = '1.0'),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create unique index one_open_survey on public.survey_periods (is_open) where is_open;
create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.survey_periods(id),
  survey_version text not null check (survey_version = '1.0'),
  target_category text check (target_category in ('KMTSL secara umum', 'Pengurus KMTSL', 'BSO', 'Subbidang', 'Kegiatan atau layanan tertentu')),
  optional_comments text not null default '' check (length(optional_comments) <= 2000),
  consent_status boolean not null check (consent_status),
  dedupe_hash text not null check (dedupe_hash ~ '^[a-f0-9]{64}$'),
  status text not null default 'valid' check (status in ('valid', 'excluded')),
  created_at timestamptz not null default now(),
  unique (period_id, dedupe_hash)
);
create table public.survey_answers (
  response_id uuid not null references public.survey_responses(id) on delete cascade,
  question_id text not null,
  aspect text not null check (aspect in ('relasi', 'pendampingan', 'komunikasi', 'aspirasi', 'tata-kelola', 'sinergi', 'pengembangan', 'kebersamaan', 'sarana', 'jejaring')),
  rating smallint check (rating between 1 and 5),
  primary key (response_id, question_id),
  check (question_id = aspect || '_1' or question_id = aspect || '_2')
);
create index survey_response_period_status on public.survey_responses(period_id, status, target_category);
create index survey_answers_aspect on public.survey_answers(aspect, response_id);
create table public.private_feedback (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Keluhan', 'Aspirasi', 'Saran', 'Kebutuhan bantuan', 'Apresiasi', 'Lainnya')),
  subject text not null default '' check (length(subject) <= 160),
  message text not null check (length(message) between 10 and 6000),
  requested_follow_up text not null default '' check (length(requested_follow_up) <= 2000),
  identity_contact text not null default '' check (length(identity_contact) <= 200),
  consent_status boolean not null check (consent_status),
  status text not null default 'baru' check (status in ('baru', 'ditinjau', 'ditindaklanjuti', 'selesai')),
  internal_notes text not null default '' check (length(internal_notes) <= 4000),
  deletion_hash text not null check (deletion_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  retention_deadline timestamptz not null default (now() + interval '180 days')
);
create index feedback_created on public.private_feedback(created_at desc);
create index feedback_retention on public.private_feedback(retention_deadline);
create table public.agenda (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 3 and 180),
  description text not null default '' check (length(description) <= 3000),
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  location text not null check (length(location) between 1 and 250),
  organizer text not null default '' check (length(organizer) <= 180),
  status text not null default 'akan_datang' check (status in ('akan_datang', 'berlangsung', 'selesai', 'dibatalkan')),
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_datetime > start_datetime)
);
create index agenda_start on public.agenda(start_datetime);
create table public.rate_limits (
  key text primary key check (key ~ '^[a-f0-9]{64}$'),
  hits integer not null,
  expires_at timestamptz not null
);
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

-- All database access goes through the server's validated API. No public or
-- authenticated user (including a non-admin Supabase account) can read raw data.
alter table public.admin_users enable row level security;
alter table public.survey_periods enable row level security;
alter table public.survey_responses enable row level security;
alter table public.survey_answers enable row level security;
alter table public.private_feedback enable row level security;
alter table public.agenda enable row level security;
alter table public.rate_limits enable row level security;
alter table public.audit_log enable row level security;
revoke all on public.admin_users, public.survey_periods, public.survey_responses,
  public.survey_answers, public.private_feedback, public.agenda,
  public.rate_limits, public.audit_log from anon, authenticated;
grant all on public.admin_users, public.survey_periods, public.survey_responses,
  public.survey_answers, public.private_feedback, public.agenda,
  public.rate_limits, public.audit_log to service_role;

create function public.consume_rate_limit(p_key text, p_limit integer, p_seconds integer)
returns boolean language plpgsql set search_path = '' as $$
declare n integer;
begin
  if p_limit < 1 or p_seconds < 1 or p_seconds > 86400 then raise exception 'invalid_limit'; end if;
  insert into public.rate_limits(key, hits, expires_at) values(p_key, 1, now() + make_interval(secs => p_seconds))
  on conflict (key) do update set
    hits = case when public.rate_limits.expires_at <= now() then 1 else public.rate_limits.hits + 1 end,
    expires_at = case when public.rate_limits.expires_at <= now() then now() + make_interval(secs => p_seconds) else public.rate_limits.expires_at end
  returning hits into n;
  return n <= p_limit;
end $$;

create function public.submit_survey(p_period uuid, p_ratings jsonb, p_target text, p_comments text, p_dedupe text)
returns uuid language plpgsql set search_path = '' as $$
declare period public.survey_periods; response_id uuid; k text; v jsonb; a text;
begin
  select * into period from public.survey_periods where id = p_period for share;
  if period.id is null or not period.is_open or now() < period.starts_at or now() >= period.ends_at then raise exception 'period_closed'; end if;
  if jsonb_typeof(p_ratings) <> 'object' or (select count(*) from jsonb_object_keys(p_ratings)) <> 20 then raise exception 'invalid_ratings'; end if;
  if not exists (select 1 from jsonb_each(p_ratings) where value <> 'null'::jsonb) then raise exception 'invalid_ratings'; end if;
  -- Validate the complete fixed question set in the database as well as the API.
  for k, v in select key, value from jsonb_each(p_ratings) loop
    a := regexp_replace(k, '_[12]$', '');
    if a not in ('relasi','pendampingan','komunikasi','aspirasi','tata-kelola','sinergi','pengembangan','kebersamaan','sarana','jejaring')
      or k not in (a || '_1', a || '_2') then raise exception 'invalid_question'; end if;
    if v <> 'null'::jsonb and (jsonb_typeof(v) <> 'number' or v::text not in ('1','2','3','4','5')) then raise exception 'invalid_rating'; end if;
  end loop;
  insert into public.survey_responses(period_id, survey_version, target_category, optional_comments, consent_status, dedupe_hash)
    values(period.id, period.survey_version, p_target, p_comments, true, p_dedupe) returning id into response_id;
  insert into public.survey_answers(response_id, question_id, aspect, rating)
    select response_id, key, regexp_replace(key, '_[12]$', ''), case when value = 'null'::jsonb then null else (value::text)::smallint end from jsonb_each(p_ratings);
  return response_id;
end $$;

create function public.survey_aggregate(p_period uuid, p_target text default null)
returns jsonb language sql stable set search_path = '' as $$
  with responses as (
    select id, created_at from public.survey_responses
    where period_id = p_period and status = 'valid' and (p_target is null or target_category = p_target)
  ), scores as (
    select a.aspect, count(distinct a.response_id) filter(where a.rating is not null) as respondents,
      count(a.rating) as valid_answers, count(*) filter(where a.rating is null) as na_answers,
      round(avg(a.rating), 2) as average,
      jsonb_build_array(count(*) filter(where rating=1),count(*) filter(where rating=2),count(*) filter(where rating=3),count(*) filter(where rating=4),count(*) filter(where rating=5)) as distribution
    from public.survey_answers a join responses r on r.id = a.response_id group by a.aspect
  ) select jsonb_build_object(
    'total', case when p_target is not null and (select count(*) from responses) < 5 then 0 else (select count(*) from responses) end,
    'updated_at', case when p_target is not null and (select count(*) from responses) < 5 then null else (select max(created_at) from responses) end,
    'minimum', 5,
    'aspects', coalesce((select jsonb_agg(jsonb_build_object(
      'aspect', aspect, 'suppressed', respondents < 5,
      'respondents', case when respondents >= 5 then respondents else 0 end,
      'valid_answers', case when respondents >= 5 then valid_answers else 0 end,
      'na_answers', case when respondents >= 5 then na_answers else 0 end,
      'average', case when respondents >= 5 then average else null end,
      'distribution', case when respondents >= 5 then distribution else '[0,0,0,0,0]'::jsonb end
    )) from scores), '[]'::jsonb)
  );
$$;

create function public.admin_survey_summary()
returns jsonb language sql stable set search_path = '' as $$
select jsonb_build_object(
  'received', (select count(*) from public.survey_responses),
  'valid', (select count(*) from public.survey_responses where status='valid'),
  'excluded', (select count(*) from public.survey_responses where status='excluded'),
  'latest', (select max(created_at) from public.survey_responses)
);
$$;

create function public.purge_expired_data()
returns void language plpgsql set search_path = '' as $$
begin
  delete from public.private_feedback where retention_deadline <= now();
  delete from public.rate_limits where expires_at <= now();
  delete from public.audit_log where created_at < now() - interval '365 days';
end $$;

revoke all on function public.consume_rate_limit(text, integer, integer),
  public.submit_survey(uuid, jsonb, text, text, text), public.survey_aggregate(uuid, text),
  public.admin_survey_summary(), public.purge_expired_data() from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer),
  public.submit_survey(uuid, jsonb, text, text, text), public.survey_aggregate(uuid, text),
  public.admin_survey_summary(), public.purge_expired_data() to service_role;

-- An unconfirmed draft, never returned by the public agenda endpoint.
insert into public.agenda(title, description, start_datetime, end_datetime, location, organizer, confirmed)
values ('Desak RAFIF–DEWA', 'Contoh agenda dari naskah. Verifikasi waktu, tempat, dan penyelenggara sebelum mengonfirmasi publikasi.',
  '2026-10-29T15:00:00+07:00', '2026-10-29T17:00:00+07:00', 'Selasar KMTSL', 'Rafif–Dewa', false);
-- Survey periods are intentionally not opened automatically.
commit;
