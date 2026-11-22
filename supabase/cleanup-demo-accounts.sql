-- 예전 샘플 계정(buyer01~03)과 그 계정의 샘플 주문·문의·구매평 등을 삭제합니다.
-- 샘플 비밀번호가 공개되어 있었으므로 공개 전에 한 번 실행하세요.
delete from public.orders where user_id in (select id from public.profiles where login_id in ('buyer01','buyer02','buyer03'));
delete from auth.users where email in ('buyer01@sellerport.app','buyer02@sellerport.app','buyer03@sellerport.app');

-- 관리자(admin) 비밀번호도 샘플 값이었다면 아래의 '새비밀번호' 부분만 바꿔서 실행하세요.
-- (이 파일을 저장소에 올릴 때는 실제 비밀번호를 적지 마세요)
-- update auth.users set encrypted_password = extensions.crypt('새비밀번호', extensions.gen_salt('bf')), updated_at = now()
--  where email = 'admin@sellerport.app';
