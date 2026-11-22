# 엄배송 Supabase 설정

1. Supabase > Authentication > Sign In / Providers > Email 에서 "Confirm email" 을 끕니다.
2. SQL Editor 에 `setup.sql` 전체를 붙여 넣고 Run 합니다. 여러 번 실행해도 됩니다.
   - 예전 단일 테이블(`docs`)이 있으면 회원 정보를 `profiles` 로 옮긴 뒤 삭제합니다.
3. `seed.sql` 을 Run 하면 기본 상품 8개, 공지, 사이트 설정이 들어갑니다. **계정은 만들지 않습니다.**
4. 사이트에서 원하는 아이디로 회원가입한 뒤, SQL Editor 에서 관리자로 올립니다.

```sql
update public.profiles set role = 'admin' where login_id = '여기에_아이디';
```

## 예전 샘플 계정 정리 (이미 올려 둔 DB 가 있다면)

예전 `seed.sql` 은 `admin`, `buyer01~03` 계정을 공개된 비밀번호로 만들었습니다. 공개 전에 `cleanup-demo-accounts.sql` 을 실행해
샘플 구매자와 샘플 주문을 지우고, 관리자 비밀번호를 바꾸세요. 비밀번호는 이 저장소에 적지 않습니다.

## 테이블

| 구분 | 테이블 |
|---|---|
| 회원 | profiles |
| 상품 | products, product_images, product_options, option_choices, product_fields, product_details |
| 주문 | orders, order_items |
| 적립금 | wallets, wallet_log |
| 게시판 | notices, inquiries, inquiry_replies, reviews, product_qna, product_qna_replies, product_likes |
| 설정 | site_settings |

주문 접수, 입금 확인, 취소/환불, 적립금 조정, 상품 저장은 서버 함수(`place_order`, `admin_update_order`, `admin_wallet_adjust`, `admin_save_product`, `request_cancel`, `confirm_toss_payment`)로만 처리되고, 금액은 서버에서 다시 계산합니다.
