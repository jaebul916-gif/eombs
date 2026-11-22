-- ============================================================
-- 엄배송 카카오 로그인 지원 (setup.sql 실행 후 SQL Editor 에서 한 번 실행)
--  - 카카오로 처음 로그인하면 auth.users 에 행이 생기고, 이 트리거가 profiles 를 자동으로 만듭니다.
--  - 닉네임은 카카오가 준 이름, 없으면 '카카오회원'. 이메일은 사용하지 않으므로 없어도 됩니다.
--  - login_id 는 'kk' + 사용자 UUID 앞 14자리 (규칙 ^[a-z0-9_-]{4,20}$ 만족, 중복 없음)
--  - 여러 번 실행해도 안전합니다. 비밀번호/서비스 키는 필요 없습니다.
-- ============================================================
create or replace function public.handle_kakao_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_name text;
begin
  if coalesce(new.raw_app_meta_data->>'provider', '') <> 'kakao' then
    return new;
  end if;
  v_name := left(coalesce(
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'nickname'), ''),
    nullif(trim(new.raw_user_meta_data->>'preferred_username'), ''),
    nullif(trim(new.raw_user_meta_data->>'user_name'), ''),
    '카카오회원'), 30);
  insert into public.profiles (id, login_id, name, phone, role)
  values (new.id, 'kk' || substr(replace(new.id::text, '-', ''), 1, 14), v_name, '', 'buyer')
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_kakao_user on auth.users;
create trigger on_auth_kakao_user after insert on auth.users
  for each row execute function public.handle_kakao_user();

-- 트리거를 만들기 전에 이미 카카오로 로그인해 본 계정이 있으면 프로필을 채워 줍니다.
insert into public.profiles (id, login_id, name, phone, role)
select u.id, 'kk' || substr(replace(u.id::text, '-', ''), 1, 14),
       left(coalesce(nullif(trim(u.raw_user_meta_data->>'name'), ''), nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
                     nullif(trim(u.raw_user_meta_data->>'nickname'), ''), '카카오회원'), 30), '', 'buyer'
from auth.users u
where coalesce(u.raw_app_meta_data->>'provider', '') = 'kakao'
  and not exists (select 1 from public.profiles p where p.id = u.id)
on conflict do nothing;
