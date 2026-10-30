-- Baby Adel · shared sync between phones
-- Already run on 30 Oct 2026. Kept for reference — do not run again (it would fail: the tables exist).
-- Safe to run once. It only creates new things inside the baby-adel project.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.family_secret (id int primary key default 1 check (id = 1), code_hash text not null);
create table private.failed_attempts (at timestamptz not null default now());

create table private.kv (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default clock_timestamp()
);
create table private.blobs (
  id text primary key,
  kind text not null check (kind in ('photo','file')),
  meta jsonb not null default '{}',
  thumb text,
  nchunks int not null default 0,
  deleted boolean not null default false,
  updated_at timestamptz not null default clock_timestamp()
);
create table private.blob_chunks (
  id text not null references private.blobs(id) on delete cascade,
  idx int not null,
  data text not null,
  primary key (id, idx)
);
create index on private.kv (updated_at);
create index on private.blobs (updated_at);

-- The family code, stored only as a scrambled (bcrypt) hash
insert into private.family_secret (id, code_hash)
values (1, extensions.crypt('CHANGE-ME', extensions.gen_salt('bf', 10)));

create or replace function private.check_code(p_code text) returns void
language plpgsql security definer set search_path = '' as $$
declare ok boolean;
begin
  if (select count(*) from private.failed_attempts where at > now() - interval '15 minutes') >= 30 then
    raise exception 'too_many_attempts' using errcode = 'P0001';
  end if;
  select (code_hash = extensions.crypt(coalesce(p_code,''), code_hash)) into ok from private.family_secret where id = 1;
  if not coalesce(ok, false) then
    insert into private.failed_attempts default values;
    delete from private.failed_attempts where at < now() - interval '1 day';
    raise exception 'wrong_code' using errcode = 'P0001';
  end if;
end $$;

create or replace function public.fam_check(p_code text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin perform private.check_code(p_code); return true; end $$;

create or replace function public.fam_pull(p_code text, p_since timestamptz default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare t timestamptz := clock_timestamp();
begin
  perform private.check_code(p_code);
  return jsonb_build_object(
    'now', t,
    'kv', coalesce((select jsonb_agg(jsonb_build_object('key', key, 'value', value, 'at', updated_at))
                    from private.kv where p_since is null or updated_at > p_since), '[]'::jsonb),
    'blobs', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'kind', kind, 'meta', meta, 'thumb', thumb,
                       'nchunks', nchunks, 'deleted', deleted, 'at', updated_at))
                    from private.blobs where (p_since is null and not deleted) or updated_at > p_since), '[]'::jsonb));
end $$;

create or replace function public.fam_put(p_code text, p_key text, p_value jsonb) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare t timestamptz := clock_timestamp();
begin
  perform private.check_code(p_code);
  if length(p_key) > 80 or pg_column_size(p_value) > 2000000 then raise exception 'too_big'; end if;
  insert into private.kv(key, value, updated_at) values (p_key, p_value, t)
  on conflict (key) do update set value = excluded.value, updated_at = t;
  return t;
end $$;

create or replace function public.fam_blob_begin(p_code text, p_id text, p_kind text, p_meta jsonb, p_thumb text, p_nchunks int) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.check_code(p_code);
  if length(p_id) > 64 or p_nchunks > 200 or length(coalesce(p_thumb,'')) > 400000 then raise exception 'too_big'; end if;
  delete from private.blob_chunks where id = p_id;
  insert into private.blobs(id, kind, meta, thumb, nchunks, deleted, updated_at)
  values (p_id, p_kind, coalesce(p_meta,'{}'), p_thumb, p_nchunks, true, clock_timestamp())
  on conflict (id) do update set kind = excluded.kind, meta = excluded.meta, thumb = excluded.thumb,
    nchunks = excluded.nchunks, deleted = true, updated_at = clock_timestamp();
end $$;

create or replace function public.fam_blob_chunk(p_code text, p_id text, p_idx int, p_data text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.check_code(p_code);
  if length(p_data) > 1500000 then raise exception 'too_big'; end if;
  insert into private.blob_chunks(id, idx, data) values (p_id, p_idx, p_data)
  on conflict (id, idx) do update set data = excluded.data;
end $$;

create or replace function public.fam_blob_finish(p_code text, p_id text) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare t timestamptz := clock_timestamp(); n int; have int;
begin
  perform private.check_code(p_code);
  select nchunks into n from private.blobs where id = p_id;
  select count(*) into have from private.blob_chunks where id = p_id;
  if n is null or have <> n then raise exception 'incomplete'; end if;
  update private.blobs set deleted = false, updated_at = t where id = p_id;
  return t;
end $$;

create or replace function public.fam_blob_meta(p_code text, p_id text, p_meta jsonb) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare t timestamptz := clock_timestamp();
begin
  perform private.check_code(p_code);
  update private.blobs set meta = p_meta, updated_at = t where id = p_id and not deleted;
  return t;
end $$;

create or replace function public.fam_blob_delete(p_code text, p_id text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.check_code(p_code);
  delete from private.blob_chunks where id = p_id;
  insert into private.blobs(id, kind, deleted, thumb, nchunks, updated_at) values (p_id, 'photo', true, null, 0, clock_timestamp())
  on conflict (id) do update set deleted = true, thumb = null, nchunks = 0, updated_at = clock_timestamp();
end $$;

create or replace function public.fam_blob_get(p_code text, p_id text, p_idx int) returns text
language plpgsql security definer set search_path = '' as $$
begin
  perform private.check_code(p_code);
  return (select data from private.blob_chunks where id = p_id and idx = p_idx);
end $$;

revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function public.fam_check(text), public.fam_pull(text, timestamptz), public.fam_put(text, text, jsonb),
  public.fam_blob_begin(text, text, text, jsonb, text, int), public.fam_blob_chunk(text, text, int, text),
  public.fam_blob_finish(text, text), public.fam_blob_meta(text, text, jsonb), public.fam_blob_delete(text, text),
  public.fam_blob_get(text, text, int) from public;
grant execute on function public.fam_check(text), public.fam_pull(text, timestamptz), public.fam_put(text, text, jsonb),
  public.fam_blob_begin(text, text, text, jsonb, text, int), public.fam_blob_chunk(text, text, int, text),
  public.fam_blob_finish(text, text), public.fam_blob_meta(text, text, jsonb), public.fam_blob_delete(text, text),
  public.fam_blob_get(text, text, int) to anon, authenticated;

select 'Baby Adel sync is ready ❤️' as result;
