# 셀러포트 Supabase 설정

1. Supabase > Authentication > Sign In / Providers > Email 에서 "Confirm email" 을 끕니다.
2. Supabase > SQL Editor 에 `setup.sql` 전체를 붙여 넣고 Run 합니다. (여러 번 실행해도 됩니다.)
3. 사이트에서 아이디 `admin` 으로 회원가입합니다.
4. SQL Editor 에서 아래를 실행해 관리자로 승격합니다.

```sql
update public.docs
set data = jsonb_set(data, '{role}', '"admin"')
where coll = 'accounts' and id = 'admin';
```

5. 다시 로그인하면 관리자 메뉴가 보입니다. 관리자 > 상품 > "기본 상품 등록" 을 눌러 기본 상품을 넣습니다.
