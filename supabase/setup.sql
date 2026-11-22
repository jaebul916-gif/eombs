-- 엄배송 Supabase 스키마 v2 (테이블 분리 + 권한 규칙 + 서버 함수)
-- SQL Editor 에 전체를 붙여 넣고 Run 하세요. 여러 번 실행해도 안전합니다.
-- 주의: 예전 단일 테이블(docs)은 회원 정보를 profiles 로 옮긴 뒤 삭제됩니다.

-- ============ 1) 테이블 ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  login_id text not null unique check (login_id ~ '^[a-z0-9_-]{4,20}$'),
  name text not null check (length(trim(name)) > 0),
  phone text not null default '',
  role text not null default 'buyer' check (role in ('buyer','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  cat text not null default 'etc' check (cat in ('shopee','qoo10','etc')),
  type text not null default 'goods' check (type in ('register','domestic','storage','credit','goods')),
  name text not null,
  description text not null default '',
  price integer not null default 0 check (price >= 0),
  sale integer not null default 0 check (sale >= 0),
  credit integer not null default 0 check (credit >= 0),
  unit text not null default '건',
  point_rate numeric not null default 0 check (point_rate >= 0),
  min_qty integer not null default 0 check (min_qty >= 0),
  max_qty integer not null default 0 check (max_qty >= 0),
  best boolean not null default false,
  soldout boolean not null default false,
  hidden boolean not null default false,
  need_addr boolean not null default false,
  hide_qty boolean not null default false,
  custom_fields boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_images (
  product_id text not null references public.products(id) on delete cascade,
  pos integer not null,
  file_id text not null,
  primary key (product_id, pos)
);

create table if not exists public.product_options (
  product_id text not null references public.products(id) on delete cascade,
  id text not null,
  pos integer not null,
  name text not null,
  required boolean not null default true,
  placeholder text not null default '',
  primary key (product_id, id)
);

create table if not exists public.option_choices (
  product_id text not null,
  opt_id text not null,
  pos integer not null,
  label text not null,
  add_price integer not null default 0,
  primary key (product_id, opt_id, pos),
  foreign key (product_id, opt_id) references public.product_options(product_id, id) on delete cascade
);

create table if not exists public.product_fields (
  product_id text not null references public.products(id) on delete cascade,
  id text not null,
  pos integer not null,
  label text not null,
  type text not null default 'text' check (type in ('text','textarea','lines','number','select','radio','checkbox','file')),
  required boolean not null default false,
  stage text not null default '' check (stage in ('','order')),
  unique_val boolean not null default false,
  match_qty boolean not null default false,
  placeholder text not null default '',
  help text not null default '',
  choices text[] not null default '{}',
  primary key (product_id, id)
);

create table if not exists public.product_details (
  product_id text not null references public.products(id) on delete cascade,
  pos integer not null,
  kind text not null check (kind in ('h','p','note','img')),
  body text not null default '',
  file_id text not null default '',
  primary key (product_id, pos)
);

create table if not exists public.orders (
  id text primary key,
  no text not null unique,
  user_id uuid not null references public.profiles(id),
  pay text not null check (pay in ('bank','points')),
  depositor text not null default '',
  contact_name text not null,
  contact_phone text not null,
  contact_addr text not null default '',
  total integer not null check (total >= 0),
  points_used integer not null default 0 check (points_used >= 0),
  status text not null default 'pending' check (status in ('pending','paid','working','done','canceled')),
  memo text not null default '',
  paid_at timestamptz,
  cancel_requested boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

create table if not exists public.order_items (
  order_id text not null references public.orders(id) on delete cascade,
  pos integer not null,
  product_id text references public.products(id) on delete set null,
  name text not null,
  type text not null,
  qty integer not null check (qty >= 1),
  price integer not null check (price >= 0),
  credit integer not null default 0,
  options_text text[] not null default '{}',
  details jsonb not null default '[]'::jsonb,
  refs text[] not null default '{}',
  primary key (order_id, pos)
);

create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_log (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null,
  reason text not null default '',
  at timestamptz not null default now()
);
create index if not exists wallet_log_user_idx on public.wallet_log (user_id, at desc);

create table if not exists public.notices (
  id text primary key default replace(gen_random_uuid()::text, '-', ''),
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null default ''
);

create table if not exists public.inquiries (
  id text primary key default replace(gen_random_uuid()::text, '-', ''),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiry_replies (
  inquiry_id text primary key references public.inquiries(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key default replace(gen_random_uuid()::text, '-', ''),
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  author_name text not null default '',
  rating integer not null check (rating between 1 and 5),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_qna (
  id text primary key default replace(gen_random_uuid()::text, '-', ''),
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  author_name text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_qna_replies (
  qna_id text primary key references public.product_qna(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_likes (
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  primary key (product_id, user_id)
);

-- ============ 2) 예전 docs 테이블에서 회원 옮기기 후 삭제 ============
do $$
begin
  if to_regclass('public.docs') is not null then
    insert into public.profiles (id, login_id, name, phone, role)
    select d.uid, d.id, coalesce(nullif(trim(d.data->>'name'), ''), d.id), coalesce(d.data->>'phone', ''),
           case when d.data->>'role' = 'admin' then 'admin' else 'buyer' end
    from public.docs d
    where d.coll = 'accounts' and d.uid is not null and d.id ~ '^[a-z0-9_-]{4,20}$'
      and exists (select 1 from auth.users u where u.id = d.uid)
    on conflict do nothing;
    drop table public.docs cascade;
  end if;
end $$;

-- ============ 3) 권한 확인 함수 ============
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create or replace function public.has_bought(pid text) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.orders o join public.order_items i on i.order_id = o.id
    where o.user_id = auth.uid() and o.status <> 'canceled' and i.product_id = pid)
$$;

create or replace function public.owns_inquiry(q text) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.inquiries where id = q and user_id = auth.uid())
$$;

create or replace function public.product_visible(pid text) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.products p where p.id = pid and (not p.hidden or public.is_admin()))
$$;

-- ============ 4) 행 단위 보안 (RLS) ============
do $$
declare t text;
begin
  foreach t in array array['profiles','products','product_images','product_options','option_choices','product_fields',
    'product_details','orders','order_items','wallets','wallet_log','notices','site_settings','inquiries',
    'inquiry_replies','reviews','product_qna','product_qna_replies','product_likes'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- profiles
drop policy if exists p_sel on public.profiles;
create policy p_sel on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists p_ins on public.profiles;
create policy p_ins on public.profiles for insert to authenticated with check (
  public.is_admin() or (id = auth.uid() and role = 'buyer' and (auth.jwt()->>'email') = login_id || '@sellerport.app'));
drop policy if exists p_upd on public.profiles;
create policy p_upd on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
drop policy if exists p_del on public.profiles;
create policy p_del on public.profiles for delete to authenticated using (public.is_admin());

-- 상품과 하위 테이블: 누구나 읽기(숨김 상품은 관리자만), 쓰기는 관리자
do $$
declare t text;
begin
  foreach t in array array['product_images','product_options','option_choices','product_fields','product_details'] loop
    execute format('drop policy if exists %I on public.%I', t||'_sel', t);
    execute format('create policy %I on public.%I for select to anon, authenticated using (public.product_visible(product_id))', t||'_sel', t);
    execute format('drop policy if exists %I on public.%I', t||'_adm', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t||'_adm', t);
  end loop;
end $$;
drop policy if exists products_sel on public.products;
create policy products_sel on public.products for select to anon, authenticated using (not hidden or public.is_admin());
drop policy if exists products_adm on public.products;
create policy products_adm on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 공지, 설정: 누구나 읽기, 관리자만 쓰기
drop policy if exists notices_sel on public.notices;
create policy notices_sel on public.notices for select to anon, authenticated using (true);
drop policy if exists notices_adm on public.notices;
create policy notices_adm on public.notices for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists settings_sel on public.site_settings;
create policy settings_sel on public.site_settings for select to anon, authenticated using (true);
drop policy if exists settings_adm on public.site_settings;
create policy settings_adm on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 주문, 적립금: 본인/관리자 읽기, 쓰기는 서버 함수로만(관리자는 직접 수정 가능)
drop policy if exists orders_sel on public.orders;
create policy orders_sel on public.orders for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists orders_adm on public.orders;
create policy orders_adm on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists items_sel on public.order_items;
create policy items_sel on public.order_items for select to authenticated using (
  public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists items_adm on public.order_items;
create policy items_adm on public.order_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists wallets_sel on public.wallets;
create policy wallets_sel on public.wallets for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists wlog_sel on public.wallet_log;
create policy wlog_sel on public.wallet_log for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- 1:1 문의
drop policy if exists inq_sel on public.inquiries;
create policy inq_sel on public.inquiries for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists inq_ins on public.inquiries;
create policy inq_ins on public.inquiries for insert to authenticated with check (user_id = auth.uid());
drop policy if exists inq_del on public.inquiries;
create policy inq_del on public.inquiries for delete to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists inqr_sel on public.inquiry_replies;
create policy inqr_sel on public.inquiry_replies for select to authenticated using (public.is_admin() or public.owns_inquiry(inquiry_id));
drop policy if exists inqr_adm on public.inquiry_replies;
create policy inqr_adm on public.inquiry_replies for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 구매평(구매한 사람만 작성), 상품 Q&A, 찜
drop policy if exists rev_sel on public.reviews;
create policy rev_sel on public.reviews for select to anon, authenticated using (true);
drop policy if exists rev_ins on public.reviews;
create policy rev_ins on public.reviews for insert to authenticated with check (user_id = auth.uid() and public.has_bought(product_id));
drop policy if exists rev_del on public.reviews;
create policy rev_del on public.reviews for delete to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists qna_sel on public.product_qna;
create policy qna_sel on public.product_qna for select to anon, authenticated using (true);
drop policy if exists qna_ins on public.product_qna;
create policy qna_ins on public.product_qna for insert to authenticated with check (user_id = auth.uid());
drop policy if exists qna_del on public.product_qna;
create policy qna_del on public.product_qna for delete to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists qnar_sel on public.product_qna_replies;
create policy qnar_sel on public.product_qna_replies for select to anon, authenticated using (true);
drop policy if exists qnar_adm on public.product_qna_replies;
create policy qnar_adm on public.product_qna_replies for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists likes_sel on public.product_likes;
create policy likes_sel on public.product_likes for select to anon, authenticated using (true);
drop policy if exists likes_ins on public.product_likes;
create policy likes_ins on public.product_likes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists likes_del on public.product_likes;
create policy likes_del on public.product_likes for delete to authenticated using (user_id = auth.uid());

-- 일반 회원이 등급/아이디를 바꾸지 못하게 막기
create or replace function public.profiles_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and auth.uid() is not null and not public.is_admin() then
    if new.id <> old.id or new.login_id <> old.login_id or new.role <> old.role then
      raise exception 'not allowed';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard_trg on public.profiles;
create trigger profiles_guard_trg before update on public.profiles for each row execute function public.profiles_guard();

-- 테이블 권한 (실제 허용 범위는 위의 RLS 가 정함)
grant select on public.products, public.product_images, public.product_options, public.option_choices,
  public.product_fields, public.product_details, public.notices, public.site_settings,
  public.reviews, public.product_qna, public.product_qna_replies, public.product_likes to anon;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on public.profiles, public.products, public.product_images, public.product_options,
  public.option_choices, public.product_fields, public.product_details, public.notices, public.site_settings,
  public.orders, public.order_items, public.inquiries, public.inquiry_replies, public.reviews, public.product_qna,
  public.product_qna_replies, public.product_likes to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ============ 5) 서버 함수 ============
create or replace function public.wallet_add(p_user uuid, p_delta integer, p_reason text, p_strict boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_bal integer;
begin
  insert into public.wallets (user_id) values (p_user) on conflict do nothing;
  select balance into v_bal from public.wallets where user_id = p_user for update;
  if v_bal + p_delta < 0 then
    if p_strict then raise exception '잔액보다 많이 차감할 수 없습니다'; end if;
    p_delta := -v_bal;
  end if;
  if p_delta = 0 then return; end if;
  update public.wallets set balance = balance + p_delta, updated_at = now() where user_id = p_user;
  insert into public.wallet_log (user_id, delta, reason) values (p_user, p_delta, p_reason);
end $$;

create or replace function public.eff_fields(p_pid text)
returns table (fid text, label text, ftype text, required boolean, stage text, unique_val boolean, match_qty boolean, choices text[])
language sql stable security definer set search_path = public as $$
  select f.id, f.label, f.type, f.required, f.stage, f.unique_val, f.match_qty, f.choices
  from public.product_fields f join public.products p on p.id = f.product_id
  where f.product_id = p_pid and p.custom_fields
  union all
  select 'f1', case p.type when 'register' then '마켓 주문번호' when 'domestic' then '택배 정보' when 'storage' then '보관 요청' else '요청 메모' end,
         case p.type when 'register' then 'lines' when 'domestic' then 'textarea' when 'storage' then 'textarea' else 'text' end,
         p.type in ('register','domestic','storage'), '', p.type = 'register', p.type = 'register', '{}'::text[]
  from public.products p
  where p.id = p_pid and not p.custom_fields and p.type <> 'credit'
$$;

create or replace function public.apply_credit(p_order text, p_sign integer)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype; i record;
begin
  select * into o from public.orders where id = p_order;
  for i in select * from public.order_items where order_id = p_order and credit > 0 loop
    perform public.wallet_add(o.user_id, p_sign * i.credit * i.qty,
      case when p_sign > 0 then '적립금 충전 ' else '충전 취소 ' end || o.no, false);
  end loop;
end $$;

create or replace function public.place_order(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  it jsonb; pr public.products%rowtype; ch public.option_choices%rowtype; op public.product_options%rowtype; f record;
  v_qty integer; v_unit integer; v_total integer := 0; v_pts integer := 0; v_bal integer := 0;
  v_oid text; v_no text; v_pos integer := 0; v_items jsonb := '[]'::jsonb; v_det jsonb; v_refs text[]; v_opts text[];
  v_val text; v_lines text[]; v_seen text[]; v_need_addr boolean := false; v_name text; v_phone text; v_addr text;
  v_pay text; v_status text; x text; v_credit integer; n integer;
begin
  if v_uid is null then raise exception '로그인이 필요합니다'; end if;
  if not exists (select 1 from public.profiles where id = v_uid) then raise exception '회원 정보가 없습니다'; end if;
  if jsonb_typeof(p->'items') is distinct from 'array' or jsonb_array_length(p->'items') = 0 then
    raise exception '주문할 상품이 없습니다'; end if;
  v_name := trim(coalesce(p->'contact'->>'name', '')); v_phone := trim(coalesce(p->'contact'->>'phone', ''));
  v_addr := trim(coalesce(p->'contact'->>'addr', ''));
  if v_name = '' or v_phone = '' then raise exception '이름과 연락처를 입력해 주세요'; end if;

  select coalesce(array_agg(r), '{}') into v_seen
  from public.orders o join public.order_items i on i.order_id = o.id, unnest(i.refs) r
  where o.user_id = v_uid and o.status <> 'canceled';

  for it in select * from jsonb_array_elements(p->'items') loop
    select * into pr from public.products where id = it->>'pid';
    if not found or pr.hidden or pr.soldout then raise exception '주문할 수 없는 상품이 있습니다'; end if;
    v_qty := coalesce((it->>'qty')::integer, 1);
    if v_qty < 1 or v_qty > 999 then raise exception '수량이 올바르지 않습니다'; end if;
    if pr.min_qty > 0 and v_qty < pr.min_qty then raise exception '%: 최소 주문 수량은 %입니다', pr.name, pr.min_qty; end if;
    if pr.max_qty > 0 and v_qty > pr.max_qty then raise exception '%: 최대 주문 수량은 %입니다', pr.name, pr.max_qty; end if;
    v_unit := case when pr.sale > 0 and pr.sale < pr.price then pr.sale else pr.price end;
    v_opts := '{}';
    for op in select * from public.product_options where product_id = pr.id order by pos loop
      x := it->'opts'->>op.id;
      if x is null or x = '' then
        if op.required then raise exception '%: % 옵션을 선택해 주세요', pr.name, op.name; end if;
      else
        select * into ch from public.option_choices where product_id = pr.id and opt_id = op.id and pos = x::integer;
        if not found then raise exception '%: 선택한 옵션이 올바르지 않습니다', pr.name; end if;
        v_unit := v_unit + ch.add_price;
        v_opts := v_opts || (op.name || ': ' || ch.label);
      end if;
    end loop;
    v_det := '[]'::jsonb; v_refs := '{}';
    for f in select * from public.eff_fields(pr.id) loop
      v_val := trim(coalesce(it->'inputs'->>f.fid, ''));
      if v_val = '' then
        if f.required then raise exception '%: % 항목을 입력해 주세요', pr.name, f.label; end if;
        continue;
      end if;
      if f.ftype = 'number' and v_val !~ '^-?[0-9]+(\.[0-9]+)?$' then raise exception '%은(는) 숫자로 입력해 주세요', f.label; end if;
      if f.ftype in ('select','radio') and cardinality(f.choices) > 0 and not (v_val = any (f.choices)) then
        raise exception '% 항목의 선택값이 올바르지 않습니다', f.label; end if;
      if f.ftype = 'file' then
        if v_val !~ '^u[0-9a-f]{24}$' then raise exception '% 파일이 올바르지 않습니다', f.label; end if;
        v_det := v_det || jsonb_build_object('k', f.label, 'v', '첨부 파일', 'file', v_val);
      else
        if f.ftype = 'checkbox' then v_val := '예'; end if;
        v_det := v_det || jsonb_build_object('k', f.label, 'v', v_val);
      end if;
      if f.ftype = 'lines' then
        select coalesce(array_agg(trim(l)), '{}') into v_lines from unnest(string_to_array(replace(v_val, E'\r', ''), E'\n')) l where trim(l) <> '';
        if f.match_qty and cardinality(v_lines) <> v_qty then
          raise exception '%: %개가 입력되었고 수량은 %입니다', f.label, cardinality(v_lines), v_qty; end if;
        if f.unique_val or f.match_qty then
          foreach x in array v_lines loop
            if x = any (v_seen) then raise exception '이미 접수했거나 중복 입력된 번호가 있습니다: %', x; end if;
            v_seen := v_seen || x; v_refs := v_refs || x;
          end loop;
        end if;
      elsif f.unique_val then
        if v_val = any (v_seen) then raise exception '이미 접수했거나 중복 입력된 번호가 있습니다: %', v_val; end if;
        v_seen := v_seen || v_val; v_refs := v_refs || v_val;
      end if;
    end loop;
    v_credit := case when pr.type = 'credit' then case when pr.credit > 0 then pr.credit else pr.price end else 0 end;
    if pr.need_addr or pr.type = 'goods' then v_need_addr := true; end if;
    v_total := v_total + v_unit * v_qty;
    v_items := v_items || jsonb_build_object('pid', pr.id, 'name', pr.name, 'type', pr.type, 'qty', v_qty, 'price', v_unit,
      'credit', v_credit, 'opts', to_jsonb(v_opts), 'details', v_det, 'refs', to_jsonb(v_refs));
  end loop;
  if v_need_addr and v_addr = '' then raise exception '물품을 받을 배송지 주소를 입력해 주세요'; end if;

  insert into public.wallets (user_id) values (v_uid) on conflict do nothing;
  select balance into v_bal from public.wallets where user_id = v_uid for update;
  if v_bal >= 1000 then v_pts := least(greatest(coalesce((p->>'pts')::integer, 0), 0), v_bal, v_total); end if;
  v_pay := case when v_pts >= v_total then 'points' else 'bank' end;
  v_status := case when v_pay = 'points' then 'paid' else 'pending' end;

  v_oid := 'o' || substr(md5(random()::text || clock_timestamp()::text), 1, 12);
  loop
    v_no := 'EB' || to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDD') || '-' || lpad((1000 + floor(random() * 9000))::integer::text, 4, '0');
    exit when not exists (select 1 from public.orders where no = v_no);
  end loop;
  insert into public.orders (id, no, user_id, pay, depositor, contact_name, contact_phone, contact_addr, total, points_used, status, paid_at)
  values (v_oid, v_no, v_uid, v_pay,
    case when v_pay = 'bank' then coalesce(nullif(trim(p->>'depositor'), ''), v_name) else '' end,
    v_name, v_phone, v_addr, v_total, v_pts, v_status, case when v_status = 'paid' then now() end);
  for it in select * from jsonb_array_elements(v_items) loop
    v_pos := v_pos + 1;
    insert into public.order_items (order_id, pos, product_id, name, type, qty, price, credit, options_text, details, refs)
    values (v_oid, v_pos, it->>'pid', it->>'name', it->>'type', (it->>'qty')::integer, (it->>'price')::integer,
      (it->>'credit')::integer, coalesce(array(select jsonb_array_elements_text(it->'opts')), '{}'),
      it->'details', coalesce(array(select jsonb_array_elements_text(it->'refs')), '{}'));
  end loop;
  if v_pts > 0 then perform public.wallet_add(v_uid, -v_pts, '주문 ' || v_no || ' 포인트 사용', true); end if;
  if v_status = 'paid' then perform public.apply_credit(v_oid, 1); end if;
  return jsonb_build_object('id', v_oid, 'no', v_no, 'total', v_total, 'pay', v_pay, 'status', v_status);
end $$;

create or replace function public.request_cancel(p_order text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.orders set cancel_requested = true
  where id = p_order and user_id = auth.uid() and status in ('pending','paid');
  if not found then raise exception '취소를 요청할 수 없는 주문입니다'; end if;
end $$;

create or replace function public.admin_update_order(p_order text, p_status text, p_memo text) returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders%rowtype; v_refund integer;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  if p_status not in ('pending','paid','working','done','canceled') then raise exception '상태가 올바르지 않습니다'; end if;
  select * into o from public.orders where id = p_order for update;
  if not found then raise exception '주문을 찾을 수 없습니다'; end if;
  if o.status = 'canceled' and p_status <> 'canceled' then raise exception '취소된 주문은 되돌릴 수 없습니다'; end if;
  if o.status <> 'pending' and p_status = 'pending' then raise exception '입금대기로 되돌릴 수 없습니다'; end if;
  if o.status = 'pending' and p_status in ('paid','working','done') then
    update public.orders set paid_at = now() where id = p_order;
    perform public.apply_credit(p_order, 1);
  end if;
  if o.status <> 'canceled' and p_status = 'canceled' then
    if o.status = 'pending' then v_refund := o.points_used;
    else v_refund := o.total; perform public.apply_credit(p_order, -1); end if;
    if v_refund > 0 then perform public.wallet_add(o.user_id, v_refund, '주문 ' || o.no || ' 취소 환불', false); end if;
  end if;
  update public.orders set status = p_status, memo = coalesce(p_memo, ''),
    cancel_requested = case when p_status = 'canceled' then false else cancel_requested end
  where id = p_order;
end $$;

create or replace function public.admin_wallet_adjust(p_login text, p_delta integer, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
declare v_user uuid;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select id into v_user from public.profiles where login_id = p_login;
  if v_user is null then raise exception '회원을 찾을 수 없습니다'; end if;
  perform public.wallet_add(v_user, p_delta, coalesce(nullif(p_reason, ''), '관리자 조정'), true);
end $$;

create or replace function public._save_product(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_id text := p->>'id'; g jsonb; c jsonb; n integer; m integer;
begin
  if v_id is null or v_id = '' then raise exception '상품 id 가 필요합니다'; end if;
  insert into public.products (id, cat, type, name, description, price, sale, credit, unit, point_rate, min_qty, max_qty,
    best, soldout, hidden, need_addr, hide_qty, custom_fields, sort)
  values (v_id, coalesce(p->>'cat', 'etc'), coalesce(p->>'type', 'goods'), coalesce(p->>'name', ''), coalesce(p->>'desc', ''),
    coalesce((p->>'price')::integer, 0), coalesce((p->>'sale')::integer, 0), coalesce((p->>'credit')::integer, 0),
    coalesce(nullif(p->>'unit', ''), '건'), coalesce((p->>'pointRate')::numeric, 0), coalesce((p->>'minQty')::integer, 0),
    coalesce((p->>'maxQty')::integer, 0), coalesce((p->>'best')::boolean, false), coalesce((p->>'soldout')::boolean, false),
    coalesce((p->>'hidden')::boolean, false), coalesce((p->>'needAddr')::boolean, false), coalesce((p->>'hideQty')::boolean, false),
    coalesce(jsonb_typeof(p->'fields') = 'array', false), coalesce((p->>'order')::integer, 0))
  on conflict (id) do update set cat = excluded.cat, type = excluded.type, name = excluded.name, description = excluded.description,
    price = excluded.price, sale = excluded.sale, credit = excluded.credit, unit = excluded.unit, point_rate = excluded.point_rate,
    min_qty = excluded.min_qty, max_qty = excluded.max_qty, best = excluded.best, soldout = excluded.soldout, hidden = excluded.hidden,
    need_addr = excluded.need_addr, hide_qty = excluded.hide_qty, custom_fields = excluded.custom_fields, sort = excluded.sort;
  delete from public.product_images where product_id = v_id;
  delete from public.option_choices where product_id = v_id;
  delete from public.product_options where product_id = v_id;
  delete from public.product_fields where product_id = v_id;
  delete from public.product_details where product_id = v_id;
  n := 0;
  if jsonb_typeof(p->'images') = 'array' then
    for g in select * from jsonb_array_elements(p->'images') loop
      n := n + 1; insert into public.product_images values (v_id, n, g #>> '{}');
    end loop;
  end if;
  n := 0;
  if jsonb_typeof(p->'options') = 'array' then
    for g in select * from jsonb_array_elements(p->'options') loop
      n := n + 1;
      insert into public.product_options values (v_id, coalesce(g->>'id', 'g' || n), n, coalesce(g->>'name', ''),
        coalesce((g->>'required')::boolean, true), coalesce(g->>'placeholder', ''));
      m := 0;
      for c in select * from jsonb_array_elements(coalesce(g->'choices', '[]'::jsonb)) loop
        insert into public.option_choices values (v_id, coalesce(g->>'id', 'g' || n), m, coalesce(c->>'label', ''), coalesce((c->>'add')::integer, 0));
        m := m + 1;
      end loop;
    end loop;
  end if;
  n := 0;
  if jsonb_typeof(p->'fields') = 'array' then
    for g in select * from jsonb_array_elements(p->'fields') loop
      n := n + 1;
      insert into public.product_fields values (v_id, coalesce(g->>'id', 'f' || n), n, coalesce(g->>'label', ''),
        coalesce(g->>'type', 'text'), coalesce((g->>'required')::boolean, false), coalesce(g->>'stage', ''),
        coalesce((g->>'unique')::boolean, false), coalesce((g->>'matchQty')::boolean, false),
        coalesce(g->>'placeholder', ''), coalesce(g->>'help', ''),
        coalesce(array(select jsonb_array_elements_text(coalesce(g->'options', '[]'::jsonb))), '{}'));
    end loop;
  end if;
  n := 0;
  if jsonb_typeof(p->'detail') = 'array' then
    for g in select * from jsonb_array_elements(p->'detail') loop
      n := n + 1;
      insert into public.product_details values (v_id, n, coalesce(g->>'t', 'p'), coalesce(g->>'text', ''), coalesce(g->>'img', ''));
    end loop;
  end if;
end $$;

create or replace function public.admin_save_product(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  perform public._save_product(p);
end $$;

-- 함수 실행 권한
revoke all on function public.wallet_add(uuid, integer, text, boolean) from public, anon, authenticated;
revoke all on function public.apply_credit(text, integer) from public, anon, authenticated;
revoke all on function public._save_product(jsonb) from public, anon, authenticated;
revoke all on function public.eff_fields(text) from public, anon, authenticated;
revoke all on function public.place_order(jsonb) from public, anon;
revoke all on function public.request_cancel(text) from public, anon;
revoke all on function public.admin_update_order(text, text, text) from public, anon;
revoke all on function public.admin_wallet_adjust(text, integer, text) from public, anon;
revoke all on function public.admin_save_product(jsonb) from public, anon;
grant execute on function public.place_order(jsonb), public.request_cancel(text), public.admin_update_order(text, text, text),
  public.admin_wallet_adjust(text, integer, text), public.admin_save_product(jsonb) to authenticated;
grant execute on function public.is_admin(), public.has_bought(text), public.owns_inquiry(text), public.product_visible(text) to anon, authenticated;

-- ============ 6) 실시간 갱신 ============
do $$
declare t text;
begin
  foreach t in array array['products','product_images','product_options','option_choices','product_fields','product_details',
    'orders','order_items','wallets','wallet_log','notices','site_settings','inquiries','inquiry_replies','reviews',
    'product_qna','product_qna_replies','product_likes','profiles'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null; when undefined_object then null; end;
  end loop;
end $$;

-- ============ 7) 업로드 저장소 (이미지, PDF) ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', true, 20971520, array['image/png','image/jpeg','image/webp','image/gif','application/pdf'])
on conflict (id) do update set public = true, file_size_limit = 20971520,
  allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif','application/pdf'];
drop policy if exists uploads_insert on storage.objects;
create policy uploads_insert on storage.objects for insert to authenticated with check (bucket_id = 'uploads');
drop policy if exists uploads_delete on storage.objects;
create policy uploads_delete on storage.objects for delete to authenticated using (bucket_id = 'uploads' and public.is_admin());
