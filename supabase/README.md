# 엄배송 Supabase 설정 (테이블 분리 버전)

1. Supabase > Authentication > Sign In / Providers > Email 에서 "Confirm email" 을 끕니다.
2. SQL Editor 에 `setup.sql` 전체를 붙여 넣고 Run 합니다. 여러 번 실행해도 됩니다.
   - 예전 단일 테이블(`docs`)이 있으면 회원 정보를 `profiles` 로 옮긴 뒤 삭제합니다.
3. SQL Editor 에 `seed.sql` 을 붙여 넣고 Run 하면 샘플 계정, 상품, 주문, 공지, 문의, 구매평이 들어갑니다.
   - 샘플 계정: admin / admin1234, buyer01~03 / buyer1234 (공개 전에 비밀번호를 바꾸세요)
4. 샘플 없이 시작하려면 사이트에서 `admin` 으로 가입한 뒤 아래를 실행해 관리자로 승격합니다.

```sql
update public.profiles set role = 'admin' where login_id = 'admin';
```

## 테이블

| 구분 | 테이블 |
|---|---|
| 회원 | profiles |
| 상품 | products, product_images, product_options, option_choices, product_fields, product_details |
| 주문 | orders, order_items |
| 적립금 | wallets, wallet_log |
| 게시판 | notices, inquiries, inquiry_replies, reviews, product_qna, product_qna_replies, product_likes |
| 설정 | site_settings |

주문 접수, 입금 확인, 취소/환불, 적립금 조정, 상품 저장은 서버 함수(place_order, admin_update_order, admin_wallet_adjust, admin_save_product, request_cancel)로만 처리됩니다. 금액은 서버에서 다시 계산합니다.
