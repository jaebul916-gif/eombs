# 엄배송

쇼피·큐텐 배송대행(배대지) 웹앱 포트폴리오입니다. 정적 파일만으로 동작하고, 데이터는 Supabase를 씁니다.
실제 서비스가 아니라 **제작 포트폴리오용 데모**이며, 화면의 요금·결제는 실제와 무관합니다.

- 배포 주소: https://jaebul916-gif.github.io/eombs/ (GitHub Pages, `main` 브랜치 루트)

## 제공 기능

- 회원가입/로그인, 장바구니, 주문(옵션·입력 항목·송장 PDF 업로드), 적립금 결제, 마이페이지(주문 조회·취소 요청·1:1 문의)
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
node build.mjs                      # https://jaebul916-gif.github.io/eombs/ 기준
SITE_URL=https://example.com/ node build.mjs   # 다른 주소 기준
```

생성되는 것: 페이지별 고유 `<title>`, `description`, Open Graph, `canonical`, JSON-LD(Organization, WebSite, Service, OfferCatalog, FAQPage, BreadcrumbList), `robots.txt`, `sitemap.xml`.
요금표는 `js/constants.js` 의 기본 상품에서 읽어 오므로 상품을 바꾼 뒤에는 `node build.mjs` 를 다시 실행하세요. 결과 파일은 커밋합니다.

참고: 프로젝트 페이지(`github.io/eombs/`)에서는 `robots.txt` 가 도메인 루트가 아니어서 검색봇이 읽지 않을 수 있습니다. 그래서 `index,follow` 메타와 `sitemap.xml`(Search Console 에 직접 제출)로 보완합니다. 커스텀 도메인을 쓰면 `SITE_URL` 만 바꿔서 다시 빌드하세요.

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
