# 엄배송

쇼피·큐텐 배송대행(배대지) 웹앱 포트폴리오입니다. 정적 파일만으로 동작하고, 데이터는 Supabase를 씁니다.
실제 서비스가 아니라 **제작 포트폴리오용 데모**이며, 화면의 요금·결제는 실제와 무관합니다.

- 배포 주소: https://eombs.jaebul916.workers.dev/ (Cloudflare Workers 정적 배포, `main` 푸시 시 자동 빌드·배포)
  - 예전 GitHub Pages 주소(https://jaebul916-gif.github.io/eombs/)는 `/eombs/` 하위 경로라 링크·CSS 경로가 어긋나므로 더 이상 기준 주소로 쓰지 않습니다.

## 제공 기능

- 회원가입/로그인, 장바구니, 주문(옵션·입력 항목·송장 PDF 업로드), 결제, 마이페이지(주문 조회·취소 요청·1:1 문의)
- 결제: **토스페이먼츠 결제위젯(주문서형) v2 테스트 결제**, 무통장입금, 적립금(포인트)
- 관리자: 주문 입금 확인/환불, 회원·적립금, 공지, **상품 등록**(이미지 업로드, 옵션, 입력 항목, 텍스트·이미지 상세 페이지 편집)
- 상품 상세: 옵션, 구매평, Q&A, 찜
- 검색 노출용 정적 페이지: 쇼피 배대지, 큐텐 배대지, 요금표, FAQ

## 폴더 구조

| 경로 | 내용 |
|---|---|
| `build.mjs` | 정적 SEO 페이지, `sitemap.xml`, `robots.txt` 생성 (아래 참고) |
| `src/app.html` | 앱(루트 `index.html`)의 템플릿 |
| `index.html`, `shopee/`, `qoo10/`, `pricing/`, `faq/`, `404.html` | **build.mjs 가 만든 파일** (직접 고치지 마세요) |
| `css/style.css`, `css/static.css` | 앱 스타일, 정적 페이지 스타일 |
| `js/` | 앱 코드 (설정, 상수·기본 상품, 상태, Supabase 연결, 화면, 관리자, 이벤트, 시작) |
| `js/product-art.js` | 기본 상품 대표 이미지와 상세 일러스트(직접 그린 SVG) |
| `images/` | 파비콘, 공유 이미지(`og.png`) |
| `supabase/` | DB 설정 SQL과 안내 |
| `tools/` | 공유 이미지 생성, 시드 생성, 단일 파일 합치기 |

`js/` 파일은 `src/app.html` 에 적힌 순서대로 불러오며 전역 함수를 공유합니다. 순서를 바꾸지 마세요.

## 빌드

```bash
node build.mjs                      # https://eombs.jaebul916.workers.dev/ 기준
SITE_URL=https://example.com/ node build.mjs   # 다른 주소 기준
```

생성되는 것: 페이지별 고유 `<title>`, `description`, Open Graph, `canonical`, JSON-LD(Organization, WebSite, Service, OfferCatalog, FAQPage, BreadcrumbList), `robots.txt`, `sitemap.xml`.
요금표는 `js/constants.js` 의 기본 상품에서 읽어 오므로 상품을 바꾼 뒤에는 `node build.mjs` 를 다시 실행하세요. 결과 파일은 커밋합니다.

참고: 루트(`/`)로 배포되므로 `robots.txt`·`sitemap.xml` 이 도메인 루트에서 바로 읽힙니다. 주소를 바꾸면 `SITE_URL` 만 바꿔서 다시 빌드하세요(하위 경로 주소면 `BASE` 가 그 경로로 계산됩니다).

## 결제 (토스페이먼츠 테스트 결제)

장바구니의 결제수단에서 **토스페이먼츠**를 고르면 토스 결제위젯(결제수단 UI + 약관 동의 UI)이 렌더링됩니다.
결제 버튼을 누르면 주문이 `pending`/`pay='card'`로 먼저 생성되고, `requestPayment`로 결제창이 열립니다.
결제를 마치면 `successUrl`(`/?toss=success&oid=...`)로 돌아오고, `paymentKey`·`amount`를 Supabase RPC `confirm_toss_payment`로
검증(주문 소유자 확인 + 금액 일치)한 뒤 `status='paid'`, `payment_key` 저장, 메모에 `테스트 결제(토스페이먼츠) · 실제 청구 없음`을 남깁니다.

- 클라이언트 키: `js/config.js` 의 `TOSS_CFG.clientKey` — 토스 개발자센터 **문서용 공개 테스트 키**(`test_gck_docs_...`, 가입·계약 불필요, 실제 금액 청구 없음)
- 테스트 결제 흐름: 회원가입 → 장바구니 → 토스페이먼츠 선택 → 결제 → 토스 테스트 결제창에서 결제수단 선택(비밀번호 `000000`) → 마이페이지에서 **결제완료** 주문 확인
- 실결제로 바꾸려면 토스페이먼츠 전자결제 계약 후 `live_gck` 클라이언트 키를 넣고, 시크릿 키로 결제 승인 API를 호출하는 서버(Edge Function 등)를 붙여야 합니다. 시크릿 키는 절대 이 저장소에 넣지 마세요.

## 저장소 이름을 `eombs` 로 바꿀 때

1. GitHub 저장소 Settings > General 에서 이름을 `eombs` 로 변경합니다.
2. Pages 설정(`main` / root)은 그대로 유지됩니다. 주소는 `https://jaebul916-gif.github.io/eombs/` 로 바뀝니다.
3. Supabase 는 아이디/비밀번호 로그인만 쓰므로 주소 설정을 바꿀 필요가 없습니다.

## 로컬 실행

사이트가 `/eombs/` 아래에서 동작하도록 만들었으므로 같은 경로로 서빙합니다.

```bash
mkdir -p /tmp/srv && ln -sfn "$PWD" /tmp/srv/eombs
cd /tmp/srv && python3 -m http.server 8000     # http://localhost:8000/eombs/
```

## DB

`supabase/README.md` 를 보세요. 계정과 비밀번호는 저장소에 넣지 않습니다.
