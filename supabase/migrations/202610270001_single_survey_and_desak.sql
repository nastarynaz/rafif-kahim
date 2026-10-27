begin;

-- Keep existing responses intact; the public application now uses one survey.
update public.survey_periods set is_open = false
where id <> '52b78f32-5357-4c4e-a051-1e1e7b0c1000' and is_open;

insert into public.survey_periods(id, title, starts_at, ends_at, is_open, survey_version)
values ('52b78f32-5357-4c4e-a051-1e1e7b0c1000', 'Survei 1.0',
  '2026-01-01T00:00:00+07:00', '2100-01-01T00:00:00+07:00', true, '1.0')
on conflict (id) do nothing;

-- Publish the existing campaign event requested by the site owner.
update public.agenda
set confirmed = true,
    description = 'Ruang dialog bersama Rafif–Dewa untuk mendengarkan aspirasi dan membahas arah KMTSL.',
    updated_at = now()
where title = 'Desak RAFIF–DEWA'
  and start_datetime = '2026-10-29T15:00:00+07:00'
  and status <> 'dibatalkan'
  and not confirmed;

commit;
