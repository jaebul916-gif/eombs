-- 셀러포트 Supabase 설정 SQL
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여 넣고 Run 을 누르세요. 여러 번 실행해도 안전합니다.

-- 1) 문서 저장 테이블 (컬렉션/문서 구조)
create table if not exists public.docs (
  coll text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  uid uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  primary key (coll, id)
);
create index if not exists docs_uid_idx on public.docs (uid);
create index if not exists docs_data_uid_idx on public.docs ((data->>'uid')) where coll = 'inquiries';

alter table public.docs enable row level security;

-- 2) 권한 확인 함수
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.docs
    where coll = 'accounts' and uid = auth.uid() and data->>'role' = 'admin')
$$;

create or replace function public.owns_acct(a text) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.docs
    where coll = 'accounts' and id = a and uid = auth.uid())
$$;

create or replace function public.owns_inquiry(q text) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.docs
    where coll = 'inquiries' and id = q and uid = auth.uid())
$$;

-- 3) 행 단위 보안 규칙
drop policy if exists docs_select on public.docs;
create policy docs_select on public.docs for select to anon, authenticated using (
  coll in ('products','notices','settings','reviews','pqa','likes','qreplies')
  or public.is_admin()
  or (coll = 'accounts' and uid = auth.uid())
  or (coll in ('orders','fulfil','wallet') and public.owns_acct(id))
  or (coll = 'inquiries' and uid = auth.uid())
  or (coll = 'replies' and public.owns_inquiry(id))
);

drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert to authenticated with check (
  public.is_admin()
  or (coll = 'accounts' and uid = auth.uid() and data->>'role' = 'buyer'
      and id ~ '^[a-z0-9_-]{4,20}$' and (auth.jwt()->>'email') = id || '@sellerport.app')
  or (coll = 'orders' and public.owns_acct(id) and uid = auth.uid())
  or (coll in ('inquiries','reviews','pqa','likes') and uid = auth.uid())
);

drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update to authenticated using (
  public.is_admin()
  or (coll = 'accounts' and uid = auth.uid())
  or (coll = 'orders' and public.owns_acct(id))
  or (coll in ('inquiries','reviews','pqa','likes') and uid = auth.uid())
) with check (
  public.is_admin()
  or (coll = 'accounts' and uid = auth.uid())
  or (coll = 'orders' and public.owns_acct(id))
  or (coll in ('inquiries','reviews','pqa','likes') and uid = auth.uid())
);

drop policy if exists docs_delete on public.docs;
create policy docs_delete on public.docs for delete to authenticated using (
  public.is_admin()
  or (coll in ('inquiries','reviews','pqa','likes') and uid = auth.uid())
);

-- 4) 일반 회원이 등급(role)이나 소유자(uid)를 바꾸지 못하게 막기
create or replace function public.docs_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    new.updated_at := now();
    return new;
  end if;
  if tg_op = 'UPDATE' then
    if new.uid is distinct from old.uid or new.coll <> old.coll or new.id <> old.id then
      raise exception 'not allowed';
    end if;
    if new.coll = 'accounts' and (new.data->>'role') is distinct from (old.data->>'role') then
      raise exception 'not allowed';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists docs_guard_trg on public.docs;
create trigger docs_guard_trg before insert or update on public.docs
  for each row execute function public.docs_guard();

-- 5) API 접근 권한 (테이블/함수)
revoke all on public.docs from anon, authenticated;
grant select on public.docs to anon, authenticated;
grant insert, update, delete on public.docs to authenticated;
revoke all on function public.is_admin() from public;
revoke all on function public.owns_acct(text) from public;
revoke all on function public.owns_inquiry(text) from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.owns_acct(text) to anon, authenticated;
grant execute on function public.owns_inquiry(text) to anon, authenticated;

-- 6) 실시간 갱신
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; when undefined_object then null; end $$;

-- 7) 업로드 저장소 (이미지, PDF)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', true, 20971520,
  array['image/png','image/jpeg','image/webp','image/gif','application/pdf'])
on conflict (id) do update set public = true, file_size_limit = 20971520,
  allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif','application/pdf'];

drop policy if exists uploads_insert on storage.objects;
create policy uploads_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads');
drop policy if exists uploads_delete on storage.objects;
create policy uploads_delete on storage.objects for delete to authenticated
  using (bucket_id = 'uploads' and public.is_admin());
