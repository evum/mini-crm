-- Fresh Supabase project only. Snapshot: 2026-11-05.
-- Requires managed auth schema and pgcrypto in extensions.
-- Optionally SET LOCAL crm.bootstrap_password after BEGIN (minimum 16 chars).
-- Do not apply this baseline to the existing populated project.
begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- Run as the database owner (Supabase migrations / SQL Editor).

create schema crm_private;
revoke all on schema crm_private from public, anon, authenticated;
grant usage on schema crm_private to authenticated;

create type public.app_role as enum ('dispatcher', 'executor');
create type public.task_status as enum
  ('new', 'in_progress', 'in_review', 'accepted', 'rework');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  full_name text not null check (length(btrim(full_name)) > 0),
  role public.app_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.objects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  address text not null check (length(btrim(address)) > 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  object_id uuid not null references public.objects(id) on delete restrict,
  title text not null check (length(btrim(title)) > 0),
  description text not null default '',
  assignee_id uuid not null references public.profiles(id) on delete restrict,
  status public.task_status not null default 'new',
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.task_status_history (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.tasks(id) on delete restrict,
  from_status public.task_status,
  to_status public.task_status not null,
  changed_by uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now(),
  comment text,
  constraint history_transition_check check (
    (from_status is null and to_status = 'new')
    or (from_status is not null and (
      (from_status = 'new' and to_status = 'in_progress')
      or (from_status = 'in_progress' and to_status = 'in_review')
      or (from_status = 'in_review' and to_status in ('accepted', 'rework'))
      or (from_status = 'rework' and to_status = 'in_progress')
    ))
  ),
  constraint rework_comment_required check (
    to_status <> 'rework' or (comment is not null and comment ~ '[^[:space:]]')
  )
);

create index tasks_object_active_idx on public.tasks(object_id) where deleted_at is null;
create index tasks_assignee_status_active_idx on public.tasks(assignee_id, status)
  where deleted_at is null;
create index task_status_history_task_time_idx
  on public.task_status_history(task_id, changed_at, id);

-- Snapshot from project fwrvrfsycytaftejwpju at 2026-11-05T15:39:27.444155+00:00.
-- Loaded before application triggers are installed so original audit timestamps
-- and IDs are preserved. Constraints and foreign keys remain enabled.
-- No passwords, password hashes, sessions or API keys are exported.
do $bootstrap$
declare
  v_password text := nullif(current_setting('crm.bootstrap_password', true), '');
begin
  if v_password is not null and length(v_password) < 16 then
    raise exception 'crm.bootstrap_password must contain at least 16 characters';
  end if;
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_anonymous
  )
  select '00000000-0000-0000-0000-000000000000'::uuid,
    u.id, u.aud, u.role, u.email,
    case when v_password is null then null
      else extensions.crypt(v_password, extensions.gen_salt('bf')) end,
    u.email_confirmed_at, '', '', '', '', u.raw_app_meta_data,
    u.raw_user_meta_data, u.created_at, u.updated_at, u.is_anonymous
  from jsonb_to_recordset($users$
[
  {
    "id": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "executor2@demo.minicrm.test",
    "created_at": "2026-11-05T13:09:41.851913+00:00",
    "updated_at": "2026-11-05T13:10:53.348793+00:00",
    "is_anonymous": false,
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ],
      "mini_crm_demo": true
    },
    "email_confirmed_at": "2026-11-05T13:09:41.851913+00:00",
    "raw_user_meta_data": {
      "full_name": "Сергей Волков"
    }
  },
  {
    "id": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "dispatcher2@demo.minicrm.test",
    "created_at": "2026-11-05T13:09:41.851913+00:00",
    "updated_at": "2026-11-05T13:10:51.352503+00:00",
    "is_anonymous": false,
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ],
      "mini_crm_demo": true
    },
    "email_confirmed_at": "2026-11-05T13:09:41.851913+00:00",
    "raw_user_meta_data": {
      "full_name": "Дмитрий Орлов"
    }
  },
  {
    "id": "44329d63-a3c0-4099-8648-8a5929c52860",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "dispatcher1@demo.minicrm.test",
    "created_at": "2026-11-05T13:09:41.851913+00:00",
    "updated_at": "2026-11-05T15:38:11.045434+00:00",
    "is_anonymous": false,
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ],
      "mini_crm_demo": true
    },
    "email_confirmed_at": "2026-11-05T13:09:41.851913+00:00",
    "raw_user_meta_data": {
      "full_name": "Анна Смирнова"
    }
  },
  {
    "id": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "executor1@demo.minicrm.test",
    "created_at": "2026-11-05T13:09:41.851913+00:00",
    "updated_at": "2026-11-05T14:37:23.730708+00:00",
    "is_anonymous": false,
    "raw_app_meta_data": {
      "provider": "email",
      "providers": [
        "email"
      ],
      "mini_crm_demo": true
    },
    "email_confirmed_at": "2026-11-05T13:09:41.851913+00:00",
    "raw_user_meta_data": {
      "full_name": "Алексей Петров"
    }
  }
]
$users$::jsonb)
    as u(id uuid, aud text, role text, email text, email_confirmed_at timestamptz,
      raw_app_meta_data jsonb, raw_user_meta_data jsonb,
      created_at timestamptz, updated_at timestamptz, is_anonymous boolean);
end;
$bootstrap$;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at)
select i.id, i.user_id, i.provider_id, i.identity_data, i.provider, i.created_at, i.updated_at
from jsonb_to_recordset($identities$
[
  {
    "id": "4d7b83da-71bf-488a-a24b-096362d897ba",
    "user_id": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "provider": "email",
    "created_at": "2026-11-05T13:09:41.851913+00:00",
    "updated_at": "2026-11-05T13:09:41.851913+00:00",
    "provider_id": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "identity_data": {
      "sub": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
      "email": "executor2@demo.minicrm.test",
      "email_verified": true,
      "phone_verified": false
    }
  },
  {
    "id": "bb47f78a-4947-4a2a-8583-133675590e55",
    "user_id": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "provider": "email",
    "created_at": "2026-11-05T13:09:41.851913+00:00",
    "updated_at": "2026-11-05T13:09:41.851913+00:00",
    "provider_id": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "identity_data": {
      "sub": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
      "email": "executor1@demo.minicrm.test",
      "email_verified": true,
      "phone_verified": false
    }
  },
  {
    "id": "ddd9dff6-96d7-4d41-9f80-f5f64373637f",
    "user_id": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "provider": "email",
    "created_at": "2026-11-05T13:09:41.851913+00:00",
    "updated_at": "2026-11-05T13:09:41.851913+00:00",
    "provider_id": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "identity_data": {
      "sub": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
      "email": "dispatcher2@demo.minicrm.test",
      "email_verified": true,
      "phone_verified": false
    }
  },
  {
    "id": "fa582213-5676-4760-9586-7980615096c4",
    "user_id": "44329d63-a3c0-4099-8648-8a5929c52860",
    "provider": "email",
    "created_at": "2026-11-05T13:09:41.851913+00:00",
    "updated_at": "2026-11-05T13:09:41.851913+00:00",
    "provider_id": "44329d63-a3c0-4099-8648-8a5929c52860",
    "identity_data": {
      "sub": "44329d63-a3c0-4099-8648-8a5929c52860",
      "email": "dispatcher1@demo.minicrm.test",
      "email_verified": true,
      "phone_verified": false
    }
  }
]
$identities$::jsonb)
  as i(id uuid, user_id uuid, provider_id text, identity_data jsonb,
    provider text, created_at timestamptz, updated_at timestamptz);

insert into public.profiles select * from jsonb_populate_recordset(
  null::public.profiles, $profiles$
[
  {
    "id": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "role": "executor",
    "full_name": "Сергей Волков",
    "is_active": true,
    "created_at": "2026-11-05T13:09:41.851913+00:00"
  },
  {
    "id": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "role": "dispatcher",
    "full_name": "Дмитрий Орлов",
    "is_active": true,
    "created_at": "2026-11-05T13:09:41.851913+00:00"
  },
  {
    "id": "44329d63-a3c0-4099-8648-8a5929c52860",
    "role": "dispatcher",
    "full_name": "Анна Смирнова",
    "is_active": true,
    "created_at": "2026-11-05T13:09:41.851913+00:00"
  },
  {
    "id": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "role": "executor",
    "full_name": "Алексей Петров",
    "is_active": true,
    "created_at": "2026-11-05T13:09:41.851913+00:00"
  }
]
$profiles$::jsonb);
insert into public.objects select * from jsonb_populate_recordset(
  null::public.objects, $objects$
[
  {
    "id": "8e487cd0-349f-40f4-996f-c07f595e9b14",
    "name": "[Демо] Школа на Лесной",
    "address": "Химки, Лесная улица, 7",
    "created_at": "2026-11-05T13:09:41.909803+00:00",
    "created_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.909804+00:00"
  },
  {
    "id": "a28766bd-02c5-4d4d-98df-49160c7eb7a7",
    "name": "[Демо] ЖК «Северный квартал»",
    "address": "Москва, Северная улица, 18",
    "created_at": "2026-11-05T13:09:41.9089+00:00",
    "created_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.908931+00:00"
  },
  {
    "id": "f63757c6-1dd6-4b2c-a62b-a7347eef274a",
    "name": "[Демо] Складской комплекс «Восток»",
    "address": "Балашиха, Промышленная улица, 12",
    "created_at": "2026-11-05T13:09:41.910262+00:00",
    "created_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.910263+00:00"
  }
]
$objects$::jsonb);
insert into public.tasks select * from jsonb_populate_recordset(
  null::public.tasks, $tasks$
[
  {
    "id": "19758cdb-d3b4-4c83-91d8-ccfcd0a1ec61",
    "title": "Принять монтаж окон",
    "status": "accepted",
    "object_id": "a28766bd-02c5-4d4d-98df-49160c7eb7a7",
    "created_at": "2026-11-05T13:09:41.936203+00:00",
    "created_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.945224+00:00",
    "assignee_id": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "description": "Проверить геометрию рам, регулировку створок и монтажные швы в квартирах 21–28."
  },
  {
    "id": "20658076-1684-4480-b478-02b3d9e78775",
    "title": "Подготовить основание спортзала",
    "status": "in_progress",
    "object_id": "8e487cd0-349f-40f4-996f-c07f595e9b14",
    "created_at": "2026-11-05T13:09:41.945852+00:00",
    "created_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.947468+00:00",
    "assignee_id": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "description": "Проверить влажность стяжки, убрать перепады и подготовить основание под спортивное покрытие."
  },
  {
    "id": "3ed0761e-d05f-43b9-931c-61878a468938",
    "title": "Проверить разводку водоснабжения",
    "status": "accepted",
    "object_id": "8e487cd0-349f-40f4-996f-c07f595e9b14",
    "created_at": "2026-11-05T13:09:41.947935+00:00",
    "created_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.952109+00:00",
    "assignee_id": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "description": "Сверить трассы труб с проектом и провести опрессовку санузлов первого этажа."
  },
  {
    "id": "4958d83b-5402-4307-97e0-60ebbfe5e61c",
    "title": "Установить поручни лестницы",
    "status": "accepted",
    "object_id": "8e487cd0-349f-40f4-996f-c07f595e9b14",
    "created_at": "2026-11-05T13:09:41.952498+00:00",
    "created_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "deleted_at": null,
    "updated_at": "2026-11-05T14:38:33.572481+00:00",
    "assignee_id": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "description": "Смонтировать поручни на главной лестнице. Проверить высоту установки и надёжность креплений."
  },
  {
    "id": "8ca69c9c-a7a0-4386-8c93-f12ca77ed3a4",
    "title": "Проверить разметку парковки",
    "status": "new",
    "object_id": "f63757c6-1dd6-4b2c-a62b-a7347eef274a",
    "created_at": "2026-11-05T13:09:41.956068+00:00",
    "created_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.956107+00:00",
    "assignee_id": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "description": "Сверить расположение грузовых мест и пожарных проездов с генпланом перед нанесением разметки."
  },
  {
    "id": "906ef02c-6b60-4f22-a921-de5b88aae041",
    "title": "Смонтировать освещение подъезда",
    "status": "in_progress",
    "object_id": "a28766bd-02c5-4d4d-98df-49160c7eb7a7",
    "created_at": "2026-11-05T13:09:41.917353+00:00",
    "created_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.922612+00:00",
    "assignee_id": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "description": "Установить светильники и датчики движения на этажах 1–4. Проверить работу аварийного освещения."
  },
  {
    "id": "d576dc26-f1ab-4eb3-b88a-188fe944862a",
    "title": "Проверить гидроизоляцию кровли",
    "status": "in_review",
    "object_id": "a28766bd-02c5-4d4d-98df-49160c7eb7a7",
    "created_at": "2026-11-05T13:09:41.923681+00:00",
    "created_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.927699+00:00",
    "assignee_id": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "description": "Осмотреть примыкания к парапетам и воронкам. Выполнить контрольный пролив и подготовить результат для приёмки."
  },
  {
    "id": "ded738a1-9fa4-4be1-88cd-e801a57c558a",
    "title": "Проверить армирование перекрытия",
    "status": "new",
    "object_id": "a28766bd-02c5-4d4d-98df-49160c7eb7a7",
    "created_at": "2026-11-05T13:09:41.912521+00:00",
    "created_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.912926+00:00",
    "assignee_id": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "description": "Сверить диаметр и шаг арматуры на третьем этаже с рабочей документацией. Зафиксировать замечания до бетонирования."
  },
  {
    "id": "ecd6d4f3-63d9-47c3-ae01-8551dad85eda",
    "title": "Сдать монтаж вентиляции",
    "status": "in_review",
    "object_id": "f63757c6-1dd6-4b2c-a62b-a7347eef274a",
    "created_at": "2026-11-05T13:09:41.953253+00:00",
    "created_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.955635+00:00",
    "assignee_id": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "description": "Проверить крепления воздуховодов, направление потока и работу автоматики в складских секциях А и Б."
  },
  {
    "id": "f1dc0f6d-7f5b-4dc3-b7b7-b1946488d6b4",
    "title": "Устранить замечания по фасаду",
    "status": "rework",
    "object_id": "a28766bd-02c5-4d4d-98df-49160c7eb7a7",
    "created_at": "2026-11-05T13:09:41.928674+00:00",
    "created_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "deleted_at": null,
    "updated_at": "2026-11-05T13:09:41.935282+00:00",
    "assignee_id": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "description": "Проверить герметизацию межпанельных швов и крепление отливов на северной стороне здания."
  }
]
$tasks$::jsonb);
insert into public.task_status_history overriding system value
select * from jsonb_populate_recordset(
  null::public.task_status_history, $history$
[
  {
    "id": 53,
    "comment": null,
    "task_id": "ded738a1-9fa4-4be1-88cd-e801a57c558a",
    "to_status": "new",
    "changed_at": "2026-11-05T13:09:41.916057+00:00",
    "changed_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "from_status": null
  },
  {
    "id": 54,
    "comment": null,
    "task_id": "906ef02c-6b60-4f22-a921-de5b88aae041",
    "to_status": "new",
    "changed_at": "2026-11-05T13:09:41.917707+00:00",
    "changed_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "from_status": null
  },
  {
    "id": 55,
    "comment": "Приступил к выполнению задачи.",
    "task_id": "906ef02c-6b60-4f22-a921-de5b88aae041",
    "to_status": "in_progress",
    "changed_at": "2026-11-05T13:09:41.923018+00:00",
    "changed_by": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "from_status": "new"
  },
  {
    "id": 56,
    "comment": null,
    "task_id": "d576dc26-f1ab-4eb3-b88a-188fe944862a",
    "to_status": "new",
    "changed_at": "2026-11-05T13:09:41.924071+00:00",
    "changed_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "from_status": null
  },
  {
    "id": 57,
    "comment": "Приступил к выполнению задачи.",
    "task_id": "d576dc26-f1ab-4eb3-b88a-188fe944862a",
    "to_status": "in_progress",
    "changed_at": "2026-11-05T13:09:41.926008+00:00",
    "changed_by": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "from_status": "new"
  },
  {
    "id": 58,
    "comment": "Работы выполнены. Результат готов к проверке.",
    "task_id": "d576dc26-f1ab-4eb3-b88a-188fe944862a",
    "to_status": "in_review",
    "changed_at": "2026-11-05T13:09:41.928003+00:00",
    "changed_by": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "from_status": "in_progress"
  },
  {
    "id": 59,
    "comment": null,
    "task_id": "f1dc0f6d-7f5b-4dc3-b7b7-b1946488d6b4",
    "to_status": "new",
    "changed_at": "2026-11-05T13:09:41.92898+00:00",
    "changed_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "from_status": null
  },
  {
    "id": 60,
    "comment": "Приступил к выполнению задачи.",
    "task_id": "f1dc0f6d-7f5b-4dc3-b7b7-b1946488d6b4",
    "to_status": "in_progress",
    "changed_at": "2026-11-05T13:09:41.930663+00:00",
    "changed_by": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "from_status": "new"
  },
  {
    "id": 61,
    "comment": "Работы выполнены. Результат готов к проверке.",
    "task_id": "f1dc0f6d-7f5b-4dc3-b7b7-b1946488d6b4",
    "to_status": "in_review",
    "changed_at": "2026-11-05T13:09:41.932481+00:00",
    "changed_by": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "from_status": "in_progress"
  },
  {
    "id": 62,
    "comment": "На третьем этаже остались незагерметизированные швы. Исправить примыкания двух отливов и повторно предъявить участок.",
    "task_id": "f1dc0f6d-7f5b-4dc3-b7b7-b1946488d6b4",
    "to_status": "rework",
    "changed_at": "2026-11-05T13:09:41.935513+00:00",
    "changed_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "from_status": "in_review"
  },
  {
    "id": 63,
    "comment": null,
    "task_id": "19758cdb-d3b4-4c83-91d8-ccfcd0a1ec61",
    "to_status": "new",
    "changed_at": "2026-11-05T13:09:41.936485+00:00",
    "changed_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "from_status": null
  },
  {
    "id": 64,
    "comment": "Приступил к выполнению задачи.",
    "task_id": "19758cdb-d3b4-4c83-91d8-ccfcd0a1ec61",
    "to_status": "in_progress",
    "changed_at": "2026-11-05T13:09:41.938084+00:00",
    "changed_by": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "from_status": "new"
  },
  {
    "id": 65,
    "comment": "Работы выполнены. Результат готов к проверке.",
    "task_id": "19758cdb-d3b4-4c83-91d8-ccfcd0a1ec61",
    "to_status": "in_review",
    "changed_at": "2026-11-05T13:09:41.939451+00:00",
    "changed_by": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "from_status": "in_progress"
  },
  {
    "id": 66,
    "comment": "В квартире 24 створка задевает раму, в квартире 27 есть пропуск монтажной пены. Устранить оба замечания.",
    "task_id": "19758cdb-d3b4-4c83-91d8-ccfcd0a1ec61",
    "to_status": "rework",
    "changed_at": "2026-11-05T13:09:41.940945+00:00",
    "changed_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "from_status": "in_review"
  },
  {
    "id": 67,
    "comment": "Замечания приняты, приступил к исправлению.",
    "task_id": "19758cdb-d3b4-4c83-91d8-ccfcd0a1ec61",
    "to_status": "in_progress",
    "changed_at": "2026-11-05T13:09:41.942366+00:00",
    "changed_by": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "from_status": "rework"
  },
  {
    "id": 68,
    "comment": "Все замечания устранены. Прошу проверить повторно.",
    "task_id": "19758cdb-d3b4-4c83-91d8-ccfcd0a1ec61",
    "to_status": "in_review",
    "changed_at": "2026-11-05T13:09:41.94385+00:00",
    "changed_by": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "from_status": "in_progress"
  },
  {
    "id": 69,
    "comment": "Проверено. Работы приняты, замечаний нет.",
    "task_id": "19758cdb-d3b4-4c83-91d8-ccfcd0a1ec61",
    "to_status": "accepted",
    "changed_at": "2026-11-05T13:09:41.945343+00:00",
    "changed_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "from_status": "in_review"
  },
  {
    "id": 70,
    "comment": null,
    "task_id": "20658076-1684-4480-b478-02b3d9e78775",
    "to_status": "new",
    "changed_at": "2026-11-05T13:09:41.946145+00:00",
    "changed_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "from_status": null
  },
  {
    "id": 71,
    "comment": "Приступил к выполнению задачи.",
    "task_id": "20658076-1684-4480-b478-02b3d9e78775",
    "to_status": "in_progress",
    "changed_at": "2026-11-05T13:09:41.94758+00:00",
    "changed_by": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "from_status": "new"
  },
  {
    "id": 72,
    "comment": null,
    "task_id": "3ed0761e-d05f-43b9-931c-61878a468938",
    "to_status": "new",
    "changed_at": "2026-11-05T13:09:41.948073+00:00",
    "changed_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "from_status": null
  },
  {
    "id": 73,
    "comment": "Приступил к выполнению задачи.",
    "task_id": "3ed0761e-d05f-43b9-931c-61878a468938",
    "to_status": "in_progress",
    "changed_at": "2026-11-05T13:09:41.94945+00:00",
    "changed_by": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "from_status": "new"
  },
  {
    "id": 74,
    "comment": "Работы выполнены. Результат готов к проверке.",
    "task_id": "3ed0761e-d05f-43b9-931c-61878a468938",
    "to_status": "in_review",
    "changed_at": "2026-11-05T13:09:41.950867+00:00",
    "changed_by": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "from_status": "in_progress"
  },
  {
    "id": 75,
    "comment": "Проверено. Работы приняты, замечаний нет.",
    "task_id": "3ed0761e-d05f-43b9-931c-61878a468938",
    "to_status": "accepted",
    "changed_at": "2026-11-05T13:09:41.952223+00:00",
    "changed_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "from_status": "in_review"
  },
  {
    "id": 76,
    "comment": null,
    "task_id": "4958d83b-5402-4307-97e0-60ebbfe5e61c",
    "to_status": "new",
    "changed_at": "2026-11-05T13:09:41.952957+00:00",
    "changed_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "from_status": null
  },
  {
    "id": 77,
    "comment": null,
    "task_id": "ecd6d4f3-63d9-47c3-ae01-8551dad85eda",
    "to_status": "new",
    "changed_at": "2026-11-05T13:09:41.953395+00:00",
    "changed_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "from_status": null
  },
  {
    "id": 78,
    "comment": "Приступил к выполнению задачи.",
    "task_id": "ecd6d4f3-63d9-47c3-ae01-8551dad85eda",
    "to_status": "in_progress",
    "changed_at": "2026-11-05T13:09:41.954616+00:00",
    "changed_by": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "from_status": "new"
  },
  {
    "id": 79,
    "comment": "Работы выполнены. Результат готов к проверке.",
    "task_id": "ecd6d4f3-63d9-47c3-ae01-8551dad85eda",
    "to_status": "in_review",
    "changed_at": "2026-11-05T13:09:41.955737+00:00",
    "changed_by": "29c166ca-8e4f-414e-a486-f81f1733e5e1",
    "from_status": "in_progress"
  },
  {
    "id": 80,
    "comment": null,
    "task_id": "8ca69c9c-a7a0-4386-8c93-f12ca77ed3a4",
    "to_status": "new",
    "changed_at": "2026-11-05T13:09:41.956208+00:00",
    "changed_by": "3543cfae-36e7-42c3-afd0-692ff3525cc9",
    "from_status": null
  },
  {
    "id": 81,
    "comment": null,
    "task_id": "4958d83b-5402-4307-97e0-60ebbfe5e61c",
    "to_status": "in_progress",
    "changed_at": "2026-11-05T14:38:07.474018+00:00",
    "changed_by": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "from_status": "new"
  },
  {
    "id": 82,
    "comment": null,
    "task_id": "4958d83b-5402-4307-97e0-60ebbfe5e61c",
    "to_status": "in_review",
    "changed_at": "2026-11-05T14:38:10.421409+00:00",
    "changed_by": "ff666e17-c9ed-4ff4-ac15-5a7c9b307c2e",
    "from_status": "in_progress"
  },
  {
    "id": 83,
    "comment": null,
    "task_id": "4958d83b-5402-4307-97e0-60ebbfe5e61c",
    "to_status": "accepted",
    "changed_at": "2026-11-05T14:38:33.57264+00:00",
    "changed_by": "44329d63-a3c0-4099-8648-8a5929c52860",
    "from_status": "in_review"
  }
]
$history$::jsonb);
select setval(pg_get_serial_sequence('public.task_status_history','id'),
  greatest(coalesce((select max(id) from public.task_status_history), 0) + 1, 1), false);

-- These helpers bypass RLS to avoid policy recursion. Never expose crm_private
-- in the Data API settings. User identity always comes from the verified JWT.
create function crm_private.is_active()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_active);
$$;

create function crm_private.is_dispatcher()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p
    where p.id = auth.uid() and p.is_active and p.role = 'dispatcher');
$$;

create function crm_private.can_read_task(p_task_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select crm_private.is_active() and exists (
    select 1 from public.tasks t join public.objects o on o.id = t.object_id
    where t.id = p_task_id and t.deleted_at is null and o.deleted_at is null
      and (crm_private.is_dispatcher() or t.assignee_id = auth.uid())
  );
$$;

create function crm_private.can_read_object(p_object_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select crm_private.is_active() and exists (
    select 1 from public.objects o where o.id = p_object_id and o.deleted_at is null
      and (crm_private.is_dispatcher() or exists (
        select 1 from public.tasks t where t.object_id = o.id
          and t.deleted_at is null and t.assignee_id = auth.uid()
      ))
  );
$$;

create function crm_private.can_read_profile(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select crm_private.is_active() and (
    p_profile_id = auth.uid() or crm_private.is_dispatcher() or exists (
      select 1 from public.tasks t join public.objects o on o.id = t.object_id
      where t.assignee_id = auth.uid() and t.deleted_at is null and o.deleted_at is null
        and (t.created_by = p_profile_id or o.created_by = p_profile_id or exists (
          select 1 from public.task_status_history h
          where h.task_id = t.id and h.changed_by = p_profile_id
        ))
    )
  );
$$;

alter table public.profiles enable row level security;
alter table public.objects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_status_history enable row level security;

create policy profiles_read on public.profiles for select to authenticated
  using (crm_private.can_read_profile(id));
create policy objects_read on public.objects for select to authenticated
  using (crm_private.can_read_object(id));
create policy tasks_read on public.tasks for select to authenticated
  using (crm_private.can_read_task(id));
create policy history_read on public.task_status_history for select to authenticated
  using (crm_private.can_read_task(task_id));

revoke all on public.profiles, public.objects, public.tasks, public.task_status_history
  from public, anon, authenticated;
revoke all on sequence public.task_status_history_id_seq from public, anon, authenticated;
grant select on public.profiles, public.objects, public.tasks, public.task_status_history
  to authenticated;

create function crm_private.require_dispatcher()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not crm_private.is_dispatcher() then
    raise exception 'Active dispatcher required' using errcode = '42501';
  end if;
end;
$$;

create function crm_private.guard_object()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform crm_private.require_dispatcher();
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.created_at := clock_timestamp();
    new.deleted_at := null;
  else
    if old.deleted_at is not null then
      raise exception 'Object is deleted';
    end if;
    if row(new.id, new.created_by, new.created_at)
       is distinct from row(old.id, old.created_by, old.created_at) then
      raise exception 'Object identity and creation metadata are immutable';
    end if;
    if new.deleted_at is not null then
      new.deleted_at := clock_timestamp();
    end if;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

create trigger objects_guard before insert or update on public.objects
for each row execute function crm_private.guard_object();

create function crm_private.guard_task()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_comment text := nullif(btrim(current_setting('crm.status_comment', true)), '');
begin
  if tg_op = 'INSERT' then
    perform crm_private.require_dispatcher();
    if new.status <> 'new' then
      raise exception 'A task must start in new status';
    end if;
    new.created_by := auth.uid();
    new.created_at := clock_timestamp();
    new.deleted_at := null;
  else
    if old.deleted_at is not null then
      raise exception 'Task is deleted';
    end if;
    if row(new.id, new.created_by, new.created_at)
       is distinct from row(old.id, old.created_by, old.created_at) then
      raise exception 'Task identity and creation metadata are immutable';
    end if;
    if new.status is distinct from old.status then
      if row(new.object_id, new.title, new.description, new.assignee_id, new.deleted_at)
         is distinct from row(old.object_id, old.title, old.description, old.assignee_id, old.deleted_at) then
        raise exception 'Change status separately from task details';
      end if;
      if not crm_private.is_active() then
        raise exception 'Active user required' using errcode = '42501';
      end if;
      if (old.status = 'new' and new.status = 'in_progress')
         or (old.status = 'in_progress' and new.status = 'in_review')
         or (old.status = 'rework' and new.status = 'in_progress') then
        if old.assignee_id <> auth.uid() or not exists (
          select 1 from public.profiles p where p.id = auth.uid() and p.role = 'executor'
        ) then
          raise exception 'Assigned executor required' using errcode = '42501';
        end if;
      elsif old.status = 'in_review' and new.status in ('accepted', 'rework') then
        perform crm_private.require_dispatcher();
        if new.status = 'rework' and (v_comment is null or v_comment !~ '[^[:space:]]') then
          raise exception 'A rework comment is required' using errcode = '23514';
        end if;
      else
        raise exception 'Forbidden status transition: % -> %', old.status, new.status
          using errcode = '23514';
      end if;
    else
      perform crm_private.require_dispatcher();
    end if;
    if new.deleted_at is not null then
      new.deleted_at := clock_timestamp();
    end if;
  end if;

  if tg_op = 'INSERT' or new.assignee_id is distinct from old.assignee_id then
    -- Lock against a simultaneous role/activation change by an administrator.
    perform 1 from public.profiles p where p.id = new.assignee_id
      and p.is_active and p.role = 'executor' for share;
    if not found then
      raise exception 'Assignee must be an active executor' using errcode = '23514';
    end if;
  end if;
  if new.deleted_at is null then
    perform 1 from public.objects o where o.id = new.object_id
      and o.deleted_at is null for update;
    if not found then
      raise exception 'Active object required' using errcode = '23514';
    end if;
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

create trigger tasks_guard before insert or update on public.tasks
for each row execute function crm_private.guard_task();

create function crm_private.record_task_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.task_status_history(task_id, from_status, to_status, changed_by, changed_at)
    values (new.id, null, new.status, auth.uid(), clock_timestamp());
  elsif new.status is distinct from old.status then
    insert into public.task_status_history
      (task_id, from_status, to_status, changed_by, changed_at, comment)
    values (new.id, old.status, new.status, auth.uid(), clock_timestamp(),
      nullif(btrim(current_setting('crm.status_comment', true)), ''));
  end if;
  return new;
end;
$$;

create trigger tasks_record_status after insert or update on public.tasks
for each row execute function crm_private.record_task_status();

create function crm_private.reject_history_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'Status history is immutable' using errcode = '42501';
end;
$$;

create trigger history_immutable before update or delete on public.task_status_history
for each row execute function crm_private.reject_history_mutation();
create trigger history_no_truncate before truncate on public.task_status_history
for each statement execute function crm_private.reject_history_mutation();

-- All task RPCs lock parents before the task, in UUID order. A task that was
-- moved while acquiring the locks produces a retryable serialization error.
create function crm_private.lock_task(p_task_id uuid, p_target_object_id uuid default null)
returns public.tasks language plpgsql security definer set search_path = '' as $$
declare
  v_object_id uuid;
  v_task public.tasks;
begin
  if not crm_private.can_read_task(p_task_id) then
    raise exception 'Task not found or access denied' using errcode = '42501';
  end if;
  select object_id into v_object_id from public.tasks where id = p_task_id;
  perform 1 from public.objects
    where id in (v_object_id, p_target_object_id) order by id for update;
  select * into v_task from public.tasks where id = p_task_id for update;
  if v_task.object_id is distinct from v_object_id then
    raise exception 'Task moved concurrently; retry' using errcode = '40001';
  end if;
  if not crm_private.can_read_task(p_task_id) then
    raise exception 'Task not found or access denied' using errcode = '42501';
  end if;
  return v_task;
end;
$$;

create function public.create_object(p_name text, p_address text)
returns public.objects language plpgsql security definer set search_path = '' as $$
declare v_object public.objects;
begin
  perform crm_private.require_dispatcher();
  insert into public.objects(name, address, created_by)
    values (p_name, p_address, auth.uid()) returning * into v_object;
  return v_object;
end;
$$;

create function public.update_object(p_object_id uuid, p_name text, p_address text)
returns public.objects language plpgsql security definer set search_path = '' as $$
declare v_object public.objects;
begin
  perform crm_private.require_dispatcher();
  update public.objects set name = p_name, address = p_address
    where id = p_object_id and deleted_at is null returning * into v_object;
  if not found then raise exception 'Object not found'; end if;
  return v_object;
end;
$$;

create function public.delete_object(p_object_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform crm_private.require_dispatcher();
  perform 1 from public.objects where id = p_object_id and deleted_at is null for update;
  if not found then raise exception 'Object not found'; end if;
  update public.tasks set deleted_at = clock_timestamp()
    where object_id = p_object_id and deleted_at is null;
  update public.objects set deleted_at = clock_timestamp() where id = p_object_id;
end;
$$;

create function public.create_task(
  p_object_id uuid, p_title text, p_description text, p_assignee_id uuid
)
returns public.tasks language plpgsql security definer set search_path = '' as $$
declare v_task public.tasks;
begin
  perform crm_private.require_dispatcher();
  perform 1 from public.objects where id = p_object_id and deleted_at is null for update;
  if not found then raise exception 'Active object required'; end if;
  insert into public.tasks(object_id, title, description, assignee_id, created_by)
    values (p_object_id, p_title, p_description, p_assignee_id, auth.uid())
    returning * into v_task;
  return v_task;
end;
$$;

-- Full replacement of editable fields. Status and creation metadata are excluded.
create function public.update_task(
  p_task_id uuid, p_object_id uuid, p_title text, p_description text, p_assignee_id uuid
)
returns public.tasks language plpgsql security definer set search_path = '' as $$
declare v_task public.tasks;
begin
  perform crm_private.require_dispatcher();
  perform crm_private.lock_task(p_task_id, p_object_id);
  update public.tasks set object_id = p_object_id, title = p_title,
    description = p_description, assignee_id = p_assignee_id
    where id = p_task_id returning * into v_task;
  return v_task;
end;
$$;

create function public.delete_task(p_task_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform crm_private.require_dispatcher();
  perform crm_private.lock_task(p_task_id);
  update public.tasks set deleted_at = clock_timestamp() where id = p_task_id;
end;
$$;

create function public.change_task_status(
  p_task_id uuid, p_expected_status public.task_status,
  p_new_status public.task_status, p_comment text default null
)
returns public.tasks language plpgsql security definer set search_path = '' as $$
declare v_task public.tasks;
begin
  v_task := crm_private.lock_task(p_task_id);
  if p_expected_status is null or v_task.status <> p_expected_status then
    raise exception 'Task status changed; refresh and retry' using errcode = '40001';
  end if;
  if p_new_status is null or p_new_status = v_task.status then
    raise exception 'A different target status is required' using errcode = '23514';
  end if;
  perform set_config('crm.status_comment', coalesce(p_comment, ''), true);
  update public.tasks set status = p_new_status where id = p_task_id returning * into v_task;
  perform set_config('crm.status_comment', '', true);
  return v_task;
end;
$$;

-- PostgreSQL grants EXECUTE to PUBLIC by default; explicitly close every function.
revoke all on all functions in schema crm_private from public, anon, authenticated;
grant execute on function crm_private.is_active(), crm_private.is_dispatcher(),
  crm_private.can_read_task(uuid), crm_private.can_read_object(uuid),
  crm_private.can_read_profile(uuid) to authenticated;

revoke all on function public.create_object(text, text),
  public.update_object(uuid, text, text), public.delete_object(uuid),
  public.create_task(uuid, text, text, uuid),
  public.update_task(uuid, uuid, text, text, uuid), public.delete_task(uuid),
  public.change_task_status(uuid, public.task_status, public.task_status, text)
  from public, anon, authenticated;
grant execute on function public.create_object(text, text),
  public.update_object(uuid, text, text), public.delete_object(uuid),
  public.create_task(uuid, text, text, uuid),
  public.update_task(uuid, uuid, text, text, uuid), public.delete_task(uuid),
  public.change_task_status(uuid, public.task_status, public.task_status, text)
  to authenticated;

create index objects_created_by_idx on public.objects(created_by);
create index tasks_created_by_idx on public.tasks(created_by);
create index task_status_history_changed_by_idx on public.task_status_history(changed_by);

-- All read endpoints use the caller's RLS policies, including nested queries.
create function public.get_current_profile()
returns public.profiles language plpgsql stable security invoker set search_path = '' as $$
declare v_profile public.profiles;
begin
  select * into v_profile from public.profiles where id = auth.uid() and is_active;
  if not found then
    raise exception 'Active profile required' using errcode = '42501';
  end if;
  return v_profile;
end;
$$;

create function crm_private.validate_page(p_limit integer, p_offset integer)
returns void language plpgsql immutable security invoker set search_path = '' as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 100
     or p_offset is null or p_offset < 0 then
    raise exception 'limit must be 1..100 and offset must be nonnegative' using errcode = '22023';
  end if;
end;
$$;

create function crm_private.task_counts(p_object_id uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'total', count(*),
    'new', count(*) filter (where status = 'new'),
    'in_progress', count(*) filter (where status = 'in_progress'),
    'in_review', count(*) filter (where status = 'in_review'),
    'accepted', count(*) filter (where status = 'accepted'),
    'rework', count(*) filter (where status = 'rework')
  ) from public.tasks where object_id = p_object_id and deleted_at is null;
$$;

create function public.list_executors(
  p_search text default null, p_limit integer default 50, p_offset integer default 0
)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_profile public.profiles; v_result jsonb;
begin
  v_profile := public.get_current_profile();
  if v_profile.role <> 'dispatcher' then
    raise exception 'Dispatcher required' using errcode = '42501';
  end if;
  perform crm_private.validate_page(p_limit, p_offset);
  with filtered as materialized (
    select id, full_name from public.profiles
    where role = 'executor' and is_active
      and strpos(lower(full_name), lower(btrim(coalesce(p_search, '')))) > 0
  ), page as (
    select * from filtered order by full_name, id limit p_limit offset p_offset
  )
  select jsonb_build_object('items', coalesce((select jsonb_agg(to_jsonb(p) order by p.full_name, p.id)
    from page p), '[]'::jsonb), 'total', (select count(*) from filtered),
    'limit', p_limit, 'offset', p_offset) into v_result;
  return v_result;
end;
$$;

create function public.list_objects(
  p_search text default null, p_limit integer default 50, p_offset integer default 0
)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_result jsonb;
begin
  perform public.get_current_profile();
  perform crm_private.validate_page(p_limit, p_offset);
  with filtered as materialized (
    select * from public.objects where deleted_at is null
      and (strpos(lower(name), lower(btrim(coalesce(p_search, '')))) > 0
        or strpos(lower(address), lower(btrim(coalesce(p_search, '')))) > 0)
  ), page as (
    select * from filtered order by created_at desc, id desc limit p_limit offset p_offset
  )
  select jsonb_build_object('items', coalesce((select jsonb_agg(
    to_jsonb(p) || jsonb_build_object('task_counts', crm_private.task_counts(p.id))
    order by p.created_at desc, p.id desc) from page p), '[]'::jsonb),
    'total', (select count(*) from filtered), 'limit', p_limit, 'offset', p_offset) into v_result;
  return v_result;
end;
$$;

create function public.list_tasks(
  p_object_id uuid default null, p_status public.task_status default null,
  p_assignee_id uuid default null, p_search text default null,
  p_limit integer default 50, p_offset integer default 0
)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_result jsonb;
begin
  perform public.get_current_profile();
  perform crm_private.validate_page(p_limit, p_offset);
  with filtered as materialized (
    select t.* from public.tasks t where t.deleted_at is null
      and (p_object_id is null or t.object_id = p_object_id)
      and (p_status is null or t.status = p_status)
      and (p_assignee_id is null or t.assignee_id = p_assignee_id)
      and (strpos(lower(t.title), lower(btrim(coalesce(p_search, '')))) > 0
        or strpos(lower(t.description), lower(btrim(coalesce(p_search, '')))) > 0)
  ), page as (
    select * from filtered order by created_at desc, id desc limit p_limit offset p_offset
  )
  select jsonb_build_object('items', coalesce((select jsonb_agg(
    to_jsonb(p) || jsonb_build_object('object_name', o.name,
      'assignee_name', a.full_name, 'author_name', author.full_name)
    order by p.created_at desc, p.id desc)
    from page p join public.objects o on o.id = p.object_id
    left join public.profiles a on a.id = p.assignee_id
    left join public.profiles author on author.id = p.created_by), '[]'::jsonb),
    'total', (select count(*) from filtered), 'limit', p_limit, 'offset', p_offset) into v_result;
  return v_result;
end;
$$;

create function public.list_my_tasks(
  p_status public.task_status default null, p_object_id uuid default null,
  p_search text default null, p_limit integer default 50, p_offset integer default 0
)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_profile public.profiles;
begin
  v_profile := public.get_current_profile();
  if v_profile.role <> 'executor' then
    raise exception 'Executor required' using errcode = '42501';
  end if;
  return public.list_tasks(p_object_id, p_status, v_profile.id, p_search, p_limit, p_offset);
end;
$$;

create function public.get_task_actions(p_task_id uuid)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_profile public.profiles; v_task public.tasks; v_transitions jsonb := '[]'::jsonb;
begin
  v_profile := public.get_current_profile();
  select * into v_task from public.tasks where id = p_task_id and deleted_at is null;
  if not found then
    raise exception 'Task not found or access denied' using errcode = '42501';
  end if;
  if v_profile.role = 'executor' and v_task.assignee_id = v_profile.id then
    if v_task.status in ('new', 'rework') then
      v_transitions := jsonb_build_array(jsonb_build_object('action', 'start',
        'target_status', 'in_progress', 'comment_required', false));
    elsif v_task.status = 'in_progress' then
      v_transitions := jsonb_build_array(jsonb_build_object('action', 'submit',
        'target_status', 'in_review', 'comment_required', false));
    end if;
  elsif v_profile.role = 'dispatcher' and v_task.status = 'in_review' then
    v_transitions := jsonb_build_array(
      jsonb_build_object('action', 'accept', 'target_status', 'accepted', 'comment_required', false),
      jsonb_build_object('action', 'return', 'target_status', 'rework', 'comment_required', true));
  end if;
  return jsonb_build_object('can_edit', v_profile.role = 'dispatcher',
    'can_delete', v_profile.role = 'dispatcher', 'expected_status', v_task.status,
    'transitions', v_transitions);
end;
$$;

create function public.list_task_history(
  p_task_id uuid, p_limit integer default 50, p_offset integer default 0
)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_result jsonb;
begin
  perform public.get_current_profile();
  perform crm_private.validate_page(p_limit, p_offset);
  if not exists(select 1 from public.tasks where id = p_task_id and deleted_at is null) then
    raise exception 'Task not found or access denied' using errcode = '42501';
  end if;
  with filtered as materialized (
    select * from public.task_status_history where task_id = p_task_id
  ), page as (
    select * from filtered order by changed_at, id limit p_limit offset p_offset
  )
  select jsonb_build_object('items', coalesce((select jsonb_agg(
    to_jsonb(p) || jsonb_build_object('changed_by_name', a.full_name)
    order by p.changed_at, p.id) from page p
    left join public.profiles a on a.id = p.changed_by), '[]'::jsonb),
    'total', (select count(*) from filtered), 'limit', p_limit, 'offset', p_offset) into v_result;
  return v_result;
end;
$$;

create function public.get_object_details(p_object_id uuid)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_profile public.profiles; v_object public.objects;
begin
  v_profile := public.get_current_profile();
  select * into v_object from public.objects where id = p_object_id and deleted_at is null;
  if not found then
    raise exception 'Object not found or access denied' using errcode = '42501';
  end if;
  return jsonb_build_object('object', to_jsonb(v_object),
    'task_counts', crm_private.task_counts(p_object_id),
    'permissions', jsonb_build_object('can_edit', v_profile.role = 'dispatcher',
      'can_delete', v_profile.role = 'dispatcher', 'can_create_task', v_profile.role = 'dispatcher'),
    'tasks', public.list_tasks(p_object_id));
end;
$$;

create function public.get_task_details(p_task_id uuid)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare v_task public.tasks; v_result jsonb;
begin
  perform public.get_current_profile();
  select * into v_task from public.tasks where id = p_task_id and deleted_at is null;
  if not found then
    raise exception 'Task not found or access denied' using errcode = '42501';
  end if;
  select jsonb_build_object('task', to_jsonb(v_task),
    'object', jsonb_build_object('id', o.id, 'name', o.name, 'address', o.address),
    'assignee', jsonb_build_object('id', a.id, 'full_name', a.full_name),
    'author', jsonb_build_object('id', author.id, 'full_name', author.full_name),
    'actions', public.get_task_actions(p_task_id),
    'history', public.list_task_history(p_task_id)) into v_result
  from public.objects o
  left join public.profiles a on a.id = v_task.assignee_id
  left join public.profiles author on author.id = v_task.created_by
  where o.id = v_task.object_id;
  return v_result;
end;
$$;

revoke all on function crm_private.validate_page(integer, integer),
  crm_private.task_counts(uuid), public.get_current_profile(),
  public.list_executors(text, integer, integer), public.list_objects(text, integer, integer),
  public.list_tasks(uuid, public.task_status, uuid, text, integer, integer),
  public.list_my_tasks(public.task_status, uuid, text, integer, integer),
  public.get_task_actions(uuid), public.list_task_history(uuid, integer, integer),
  public.get_object_details(uuid), public.get_task_details(uuid)
  from public, anon, authenticated;
grant execute on function crm_private.validate_page(integer, integer),
  crm_private.task_counts(uuid), public.get_current_profile(),
  public.list_executors(text, integer, integer), public.list_objects(text, integer, integer),
  public.list_tasks(uuid, public.task_status, uuid, text, integer, integer),
  public.list_my_tasks(public.task_status, uuid, text, integer, integer),
  public.get_task_actions(uuid), public.list_task_history(uuid, integer, integer),
  public.get_object_details(uuid), public.get_task_details(uuid)
  to authenticated;

notify pgrst, 'reload schema';

commit;
