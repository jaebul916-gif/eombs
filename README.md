# 셀러포트

쇼피·큐텐 배송대행 사이트. 정적 파일만으로 동작하며 GitHub Pages 에서 서비스합니다. 데이터는 Supabase 를 씁니다.

## 폴더 구조

| 경로 | 내용 |
|---|---|
| `index.html` | 뼈대 (헤더, 푸터, 스크립트 로딩 순서) |
| `css/style.css` | 모든 스타일 |
| `js/config.js` | Supabase 주소와 공개 키 |
| `js/util.js`, `constants.js`, `state.js` | 공통 도구, 상수와 기본 상품, 앱 상태 |
| `js/product-art.js` | 기본 상품 대표 이미지(직접 그린 SVG) |
| `js/supabase.js` | Supabase 연결 (테이블 읽기/쓰기, 파일 업로드) |
| `js/cart-helpers.js` | 옵션, 입력 항목, 금액 계산과 검증 |
| `js/pages-shop.js` | 홈, 서비스, 장바구니, 상품 상세, 결제창 화면 |
| `js/pages-account.js` | 로그인, 마이페이지, 약관, 공지 화면 |
| `js/admin.js` | 관리자 화면 (주문, 회원, 상품 편집기, 공지, 설정) |
| `js/render.js` | 렌더링과 주소(해시) 라우팅 |
| `js/auth.js` | 실시간 구독, 로그인, 회원가입 |
| `js/orders.js` | 장바구니 담기, 주문 처리 |
| `js/events.js` | 클릭, 입력 이벤트 처리 |
| `js/boot.js` | 시작 처리 |
| `supabase/` | DB 설정 SQL (`setup.sql`, `seed.sql`) 과 안내 |
| `tools/build-single.py` | 파일 하나로 합치는 도구 |

스크립트는 `index.html` 에 적힌 순서대로 불러오며 서로 전역 함수를 공유합니다. 순서를 바꾸지 마세요.

## 로컬 실행

`python3 -m http.server` 후 http://localhost:8000 을 엽니다.

## 한 파일로 합치기

`python3 tools/build-single.py` 를 실행하면 `dist/single.html` 이 만들어집니다.
