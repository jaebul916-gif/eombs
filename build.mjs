#!/usr/bin/env node
/**
 * 엄배송 정적 사이트 빌드
 *   node build.mjs                     → https://jaebul916-gif.github.io/eombs/ 기준으로 생성
 *   SITE_URL=https://example.com/ node build.mjs   → 다른 주소 기준으로 생성
 *
 * 생성물: index.html, shopee/, qoo10/, pricing/, faq/, 404.html, robots.txt, sitemap.xml
 * 앱(js/, css/)은 그대로 쓰고, 검색 엔진이 바로 읽을 수 있는 본문/메타/JSON-LD 만 만들어 줍니다.
 * 요금표는 js/constants.js 의 기본 상품 데이터에서 읽어 오므로 두 곳이 어긋나지 않습니다.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = (process.env.SITE_URL || 'https://jaebul916-gif.github.io/eombs/').replace(/\/?$/, '/');
const BASE = new URL(SITE_URL).pathname;            // 예: /eombs/
const NAME = '엄배송';
const TODAY = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
const OG_IMAGE = SITE_URL + 'images/og.png';

/* ---------- 기본 상품 데이터 ---------- */
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/constants.js'), 'utf8') + ';this.D=DEFAULTS;this.O=REG_OPTS;', ctx);
const PRODUCTS = ctx.D.filter(p => !p.hidden);
const OPTS = ctx.O[0].choices;
const unitPrice = p => (p.sale > 0 && p.sale < p.price ? p.sale : p.price);
const won = n => Number(n).toLocaleString('ko-KR') + '원';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonld = o => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>';
const url = p => SITE_URL + p;

/* ---------- 공통 조각 ---------- */
const NAV = [['', '홈'], ['shopee/', '쇼피 배대지'], ['qoo10/', '큐텐 배대지'], ['pricing/', '요금표'], ['faq/', '자주 묻는 질문']];

function head({ title, description, path: p, type = 'website', extra = '' }) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url(p)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#0071e3">
<link rel="icon" href="${BASE}images/favicon.svg" type="image/svg+xml">
<meta property="og:site_name" content="${NAME}">
<meta property="og:locale" content="ko_KR">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url(p)}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${OG_IMAGE}">
${extra}`;
}

const FOOT = `<span>쇼피·큐텐 셀러를 위한 배송대행 서비스입니다.</span>
<span class="flinks"><a href="${BASE}shopee/">쇼피 배대지</a> · <a href="${BASE}qoo10/">큐텐 배대지</a> · <a href="${BASE}pricing/">요금표</a> · <a href="${BASE}faq/">FAQ</a> · <a href="${BASE}#terms">이용약관</a> · <a href="${BASE}#privacy">개인정보 처리방침</a> · <a href="${BASE}#refund">환불 규정</a></span>
<span class="demonote">웹앱 제작 포트폴리오용 데모 사이트입니다. 표시된 요금과 결제는 실제 서비스가 아닙니다.</span>`;

function shell({ meta, body, current }) {
  const links = NAV.map(([h, t]) => `<a href="${BASE}${h}"${h === current ? ' aria-current="page"' : ''}>${t}</a>`).join('\n    ');
  return `<!doctype html>
<html lang="ko">
<head>
${meta}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="${BASE}css/style.css">
<link rel="stylesheet" href="${BASE}css/static.css">
</head>
<body>
<div class="navband"><div class="navin gut wrap">
  <a class="brand" href="${BASE}">${NAME}</a>
  <nav class="links" aria-label="주요 메뉴">
    ${links}
  </nav>
  <div class="right"><a href="${BASE}#login">로그인</a> <a class="btn sm" href="${BASE}#services">신청하기</a></div>
</div></div>
<div class="gut"><main class="wrap prose">
${body}
</main></div>
<footer class="foot"><div class="gut"><div class="wrap">${FOOT}</div></div></footer>
</body>
</html>
`;
}

const crumbs = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url(p) })),
});
const crumbHtml = (items) => `<nav class="crumbs" aria-label="경로"><a href="${BASE}">홈</a>${items.map(([n, p], i) => ` › ${i === items.length - 1 ? `<span aria-current="page">${esc(n)}</span>` : `<a href="${BASE}${p}">${esc(n)}</a>`}`).join('')}</nav>`;

const ORG = { '@type': 'Organization', '@id': SITE_URL + '#org', name: NAME, url: SITE_URL, logo: SITE_URL + 'images/favicon.svg' };
const SERVICE = (name, desc, p, extra = {}) => ({
  '@context': 'https://schema.org', '@type': 'Service', name, description: desc, url: url(p),
  serviceType: '해외배송대행', areaServed: { '@type': 'Country', name: 'KR' }, provider: { '@id': SITE_URL + '#org' }, ...extra,
});

function priceTable(list) {
  const rows = list.map(p => {
    const u = unitPrice(p);
    const disc = u < p.price;
    return `<tr><th scope="row"><a href="${BASE}#item-${p.id}">${esc(p.name)}</a><span class="small muted">${esc(p.desc)}</span></th><td class="num">${disc ? `<s>${won(p.price)}</s> ` : ''}<strong>${won(u)}</strong></td><td>${esc(p.unit)}</td></tr>`;
  }).join('\n');
  return `<div class="tablewrap"><table><thead><tr><th scope="col">서비스</th><th scope="col">요금</th><th scope="col">단위</th></tr></thead><tbody>
${rows}
</tbody></table></div>`;
}
const offerList = (list) => list.map(p => ({
  '@type': 'Offer', name: p.name, description: p.desc, price: String(unitPrice(p)), priceCurrency: 'KRW',
  url: url('pricing/'), itemOffered: { '@type': 'Service', name: p.name },
}));
const optTable = () => `<div class="tablewrap"><table><thead><tr><th scope="col">옵션</th><th scope="col">추가 요금</th></tr></thead><tbody>
${OPTS.map(o => `<tr><th scope="row">${esc(o.label)}</th><td class="num">${o.add ? '+' + won(o.add) : '없음'}</td></tr>`).join('\n')}
</tbody></table></div>`;

const STEPS = (market, mk) => `<ol class="steps">
<li><h3>서비스와 옵션 선택</h3><p class="muted">${market} 배송등록 또는 합배송등록을 고르고, 포장 옵션을 선택합니다.</p></li>
<li><h3>주문번호와 배송 정보 입력</h3><p class="muted">${mk} 주문번호, 택배 운송장 번호, 제품명과 수량을 입력합니다. 주문번호는 한 줄에 하나씩 적습니다.</p></li>
<li><h3>송장 파일 올리기</h3><p class="muted">마켓에서 받은 송장 PDF를 첨부합니다.</p></li>
<li><h3>입금 또는 적립금 결제</h3><p class="muted">무통장입금이나 적립금으로 결제합니다. 입금이 확인되면 접수가 시작됩니다.</p></li>
<li><h3>처리 상태 확인</h3><p class="muted">마이페이지에서 입금대기, 처리중, 완료 상태를 확인합니다.</p></li>
</ol>`;

const CTA = (label, href, sub = true) => `<p class="cta"><a class="btn" href="${BASE}${href}">${label}</a>${sub ? ` <a class="btn ghost" href="${BASE}pricing/">요금표 보기</a>` : ''}</p>`;
const RELATED = (cur) => `<h2>함께 보면 좋은 안내</h2><ul class="rel">${[['shopee/', '쇼피 배대지 안내'], ['qoo10/', '큐텐 배대지 안내'], ['pricing/', '해외배송대행 요금표'], ['faq/', '자주 묻는 질문']].filter(([h]) => h !== cur).map(([h, t]) => `<li><a href="${BASE}${h}">${t}</a></li>`).join('')}</ul>`;

/* ---------- 페이지: 홈(앱) ---------- */
const HOME_DESC = '쇼피 배대지·큐텐 배대지·해외배송대행을 한곳에서. 주문번호와 송장만 올리면 배송등록과 합배송 접수가 끝납니다. 건당 요금과 처리 상태를 바로 확인하세요.';
const HOME_TITLE = `${NAME} | 쇼피 배대지·큐텐 배대지·해외배송대행`;
const lowReg = Math.min(...PRODUCTS.filter(p => p.type === 'register').map(unitPrice));

const PRERENDER = `<section class="hero"><h1 class="big"><span class="grad">${NAME}.</span> <span>쇼피·큐텐 배송등록,<br>이렇게 간단하게.</span></h1>
<p class="lead">쇼피 배대지, 큐텐 배대지, 해외배송대행을 한곳에서. 주문번호만 적어 보내세요. 배송등록과 합배송 접수는 건당 ${won(lowReg)}부터 시작합니다.</p>
<div class="row"><a class="btn" href="#services">배송등록 신청하기</a><a class="btn ghost" href="#mypage">주문 조회</a></div></section>
<section class="seohome">
<article><h2>쇼피 배대지</h2><p class="muted">쇼피 주문번호를 입력하면 한 건씩 배송등록을 접수하고, 같은 구매자의 여러 주문은 합배송으로 묶어 접수합니다.</p><a class="lnk" href="${BASE}shopee/">쇼피 배대지 안내 보기</a></article>
<article><h2>큐텐 배대지</h2><p class="muted">큐텐(KSE) 주문번호를 입력해 배송등록을 접수합니다. 합배송도 같은 방식으로 신청할 수 있습니다.</p><a class="lnk" href="${BASE}qoo10/">큐텐 배대지 안내 보기</a></article>
<article><h2>해외배송대행 요금</h2><p class="muted">배송등록 ${won(lowReg)}부터, 합배송과 옵션별 추가 요금까지 한눈에 비교할 수 있습니다.</p><a class="lnk" href="${BASE}pricing/">요금표 보기</a></article>
</section>`;

function buildHome() {
  const meta = head({
    title: HOME_TITLE, description: HOME_DESC, path: '',
    extra: jsonld({ '@context': 'https://schema.org', '@graph': [
      { ...ORG, description: HOME_DESC },
      { '@type': 'WebSite', '@id': SITE_URL + '#site', url: SITE_URL, name: NAME, inLanguage: 'ko-KR', publisher: { '@id': SITE_URL + '#org' } },
      SERVICE('해외배송대행', HOME_DESC, ''),
    ] }),
  });
  let html = fs.readFileSync(path.join(ROOT, 'src/app.html'), 'utf8');
  html = html.replace('{{HEAD}}', meta).replace('{{PRERENDER}}', PRERENDER).replaceAll('{{BASE}}', BASE);
  return html;
}

/* ---------- 페이지: 쇼피 ---------- */
function buildShopee() {
  const p = 'shopee/';
  const list = PRODUCTS.filter(x => x.cat === 'shopee' && x.type === 'register');
  const title = '쇼피 배대지 | 쇼피 배송등록·합배송 접수 안내 – ' + NAME;
  const desc = `쇼피 배대지 ${NAME}: 쇼피 주문번호와 송장만 올리면 배송등록과 합배송 접수가 끝납니다. 건당 ${won(Math.min(...list.map(unitPrice)))}부터, 이용 방법과 요금을 안내합니다.`;
  const bc = [['쇼피 배대지', p]];
  const meta = head({ title, description: desc, path: p, extra: jsonld({ '@context': 'https://schema.org', '@graph': [
    SERVICE('쇼피 배대지(쇼피 배송등록)', desc, p, { hasOfferCatalog: { '@type': 'OfferCatalog', name: '쇼피 배송등록 요금', itemListElement: offerList(list) } }),
    crumbs([['홈', ''], ...bc]),
  ] }) });
  const body = `${crumbHtml(bc)}
<h1>쇼피 배대지, 주문번호만 보내면 접수 끝</h1>
<p class="lead">${NAME}은 쇼피 셀러가 받은 주문을 빠르게 발송할 수 있도록 배송등록을 대신 접수하는 해외배송대행 서비스입니다.</p>
${CTA('쇼피 배송등록 신청하기', '#item-s-shopee')}
<h2>쇼피 배대지란?</h2>
<p>쇼피에서 주문이 들어오면 셀러는 주문번호와 송장 정보를 정확히 맞춰 배송을 등록해야 합니다. 쇼피 배대지는 이 접수 과정을 대신 처리해, 셀러가 상품 소싱과 판매에 집중할 수 있게 돕습니다.</p>
<h2>쇼피 배송등록 이용 방법</h2>
${STEPS('쇼피', '쇼피')}
<h2>쇼피 배송등록 서비스와 요금</h2>
${priceTable(list)}
<p class="small muted">옵션에 따라 건당 추가 요금이 붙을 수 있습니다. 자세한 내용은 <a href="${BASE}pricing/">해외배송대행 요금표</a>에서 확인하세요.</p>
<h2>쇼피 합배송이란?</h2>
<p>같은 구매자가 여러 상품을 주문했을 때 한 상자로 묶어 보내는 방식입니다. 포장을 합치면 배송 건수가 줄어 건당 요금도 달라집니다. 합배송 접수도 주문번호를 한 줄에 하나씩 입력하면 됩니다.</p>
<h2>신청 전에 확인하세요</h2>
<ul>
<li>입력한 주문번호의 개수와 수량이 맞아야 접수됩니다.</li>
<li>이미 접수한 주문번호는 중복으로 접수할 수 없습니다.</li>
<li>접수 후 처리 상태는 마이페이지에서 바로 확인할 수 있습니다.</li>
</ul>
${CTA('쇼피 배송등록 신청하기', '#item-s-shopee')}
${RELATED(p)}`;
  return shell({ meta, body, current: p });
}

/* ---------- 페이지: 큐텐 ---------- */
function buildQoo10() {
  const p = 'qoo10/';
  const list = PRODUCTS.filter(x => x.cat === 'qoo10' && x.type === 'register');
  const title = '큐텐 배대지 | 큐텐(KSE) 배송등록·합배송 접수 안내 – ' + NAME;
  const desc = `큐텐 배대지 ${NAME}: 큐텐(KSE) 주문번호와 송장만 올리면 배송등록과 합배송 접수가 끝납니다. 건당 ${won(Math.min(...list.map(unitPrice)))}부터, 이용 방법과 요금을 안내합니다.`;
  const bc = [['큐텐 배대지', p]];
  const meta = head({ title, description: desc, path: p, extra: jsonld({ '@context': 'https://schema.org', '@graph': [
    SERVICE('큐텐 배대지(큐텐 KSE 배송등록)', desc, p, { hasOfferCatalog: { '@type': 'OfferCatalog', name: '큐텐 배송등록 요금', itemListElement: offerList(list) } }),
    crumbs([['홈', ''], ...bc]),
  ] }) });
  const body = `${crumbHtml(bc)}
<h1>큐텐 배대지, 큐텐(KSE) 배송등록을 간단하게</h1>
<p class="lead">${NAME}은 큐텐 셀러의 배송등록과 합배송 접수를 대신 처리하는 해외배송대행 서비스입니다.</p>
${CTA('큐텐 배송등록 신청하기', '#item-s-qoo10')}
<h2>큐텐 배대지란?</h2>
<p>큐텐에서 주문이 들어오면 셀러는 주문번호, 송장, 택배 정보를 맞춰 배송을 등록해야 합니다. 큐텐 배대지는 이 등록 과정을 대신 접수해, 실수와 누락을 줄이도록 돕습니다.</p>
<h2>큐텐(KSE) 배송등록 이용 방법</h2>
${STEPS('큐텐(KSE)', '큐텐')}
<h2>큐텐 배송등록 서비스와 요금</h2>
${priceTable(list)}
<p class="small muted">옵션에 따라 건당 추가 요금이 붙을 수 있습니다. 자세한 내용은 <a href="${BASE}pricing/">해외배송대행 요금표</a>에서 확인하세요.</p>
<h2>큐텐 합배송이란?</h2>
<p>같은 구매자의 큐텐 주문을 한 상자로 묶어 접수하는 방식입니다. 합배송을 쓰면 상자 수가 줄어 배송 건수가 단순해집니다.</p>
<h2>신청 전에 확인하세요</h2>
<ul>
<li>주문번호는 한 줄에 하나씩 정확히 입력해 주세요.</li>
<li>이미 접수한 주문번호는 중복으로 접수할 수 없습니다.</li>
<li>입금이 확인되면 접수가 시작되고, 진행 상태는 마이페이지에서 볼 수 있습니다.</li>
</ul>
${CTA('큐텐 배송등록 신청하기', '#item-s-qoo10')}
${RELATED(p)}`;
  return shell({ meta, body, current: p });
}

/* ---------- 페이지: 요금표 ---------- */
function buildPricing() {
  const p = 'pricing/';
  const title = '해외배송대행 요금표 | 쇼피·큐텐 배송등록 요금 – ' + NAME;
  const desc = `해외배송대행 요금표: 쇼피·큐텐 배송등록 ${won(lowReg)}부터, 합배송·국내 택배·물품 보관·옵션별 추가 요금까지 한눈에 확인하세요.`;
  const bc = [['요금표', p]];
  const meta = head({ title, description: desc, path: p, extra: jsonld({ '@context': 'https://schema.org', '@graph': [
    SERVICE('해외배송대행 요금', desc, p, { hasOfferCatalog: { '@type': 'OfferCatalog', name: `${NAME} 요금표`, itemListElement: offerList(PRODUCTS.filter(x => x.type !== 'credit')) } }),
    crumbs([['홈', ''], ...bc]),
  ] }) });
  const body = `${crumbHtml(bc)}
<h1>해외배송대행 요금표</h1>
<p class="lead">쇼피 배대지와 큐텐 배대지의 배송등록, 합배송, 부가 서비스 요금을 한곳에 모았습니다.</p>
<h2>서비스별 요금</h2>
${priceTable(PRODUCTS.filter(x => x.type !== 'credit'))}
<h2>배송등록 옵션별 추가 요금</h2>
<p>배송등록 신청 시 옵션을 고르면 건당 요금에 추가 요금이 더해집니다.</p>
${optTable()}
<h2>결제 방법과 적립금</h2>
<ul>
<li>결제는 무통장입금 또는 적립금(포인트)으로 할 수 있습니다.</li>
<li>적립금은 미리 충전해 두었다가 다음 주문부터 결제에 쓸 수 있습니다.</li>
<li>입금이 확인되면 접수가 시작됩니다.</li>
</ul>
<p class="demonote2">이 요금표는 웹앱 제작 포트폴리오용 데모 데이터입니다. 실제 서비스 요금이 아닙니다.</p>
${CTA('서비스 신청하기', '#services', false)}
${RELATED(p)}`;
  return shell({ meta, body, current: p });
}

/* ---------- 페이지: FAQ ---------- */
const FAQ = [
  ['쇼피 배대지는 어떤 서비스인가요?', `쇼피 셀러가 받은 주문의 배송등록을 대신 접수하는 서비스입니다. 주문번호와 송장 파일을 올리면 ${NAME}이 접수를 진행합니다.`],
  ['큐텐 배대지도 같은 방식인가요?', '네. 큐텐(KSE) 주문번호를 입력하고 송장 파일을 올리면 같은 흐름으로 접수됩니다. 합배송도 신청할 수 있습니다.'],
  ['해외배송대행 이용 절차가 궁금해요.', '서비스와 옵션을 고르고, 주문번호와 배송 정보를 입력한 뒤, 송장 파일을 올리고 결제하면 됩니다. 입금이 확인되면 접수가 시작되고 마이페이지에서 진행 상태를 볼 수 있습니다.'],
  ['합배송은 무엇인가요?', '같은 구매자의 여러 주문을 한 상자로 묶어 보내는 방식입니다. 합배송등록 서비스를 선택하고 주문번호를 한 줄에 하나씩 입력하세요.'],
  ['어떤 방법으로 결제하나요?', '무통장입금과 적립금(포인트)으로 결제할 수 있습니다. 적립금을 전액 사용하면 입금 없이 바로 접수됩니다.'],
  ['주문번호를 잘못 입력했어요.', '주문번호 개수와 수량이 다르면 신청 단계에서 안내가 나옵니다. 이미 접수한 번호는 중복 접수가 되지 않으니, 접수 후 수정이 필요하면 1:1 문의로 알려 주세요.'],
  ['처리 상태는 어디서 확인하나요?', '로그인 후 마이페이지에서 입금대기, 결제완료, 처리중, 완료 상태를 확인할 수 있습니다.'],
  ['주문을 취소하거나 환불받을 수 있나요?', '마이페이지에서 취소를 요청할 수 있습니다. 관리자가 확인하면 취소되고, 사용한 적립금은 환불됩니다. 자세한 기준은 환불 규정을 확인해 주세요.'],
  ['회원가입이 꼭 필요한가요?', '서비스 신청, 장바구니, 마이페이지는 로그인 후 이용할 수 있습니다. 아이디와 비밀번호만으로 가입할 수 있습니다.'],
];
function buildFaq() {
  const p = 'faq/';
  const title = '쇼피 배대지·큐텐 배대지 자주 묻는 질문 | 해외배송대행 FAQ – ' + NAME;
  const desc = '쇼피 배대지, 큐텐 배대지, 해외배송대행 이용 절차와 합배송, 결제, 취소·환불 등 자주 묻는 질문에 답해 드립니다.';
  const bc = [['자주 묻는 질문', p]];
  const meta = head({ title, description: desc, path: p, extra: jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    crumbs([['홈', ''], ...bc]),
  ] }) });
  const body = `${crumbHtml(bc)}
<h1>쇼피 배대지·큐텐 배대지 자주 묻는 질문</h1>
<p class="lead">해외배송대행 이용 전에 많이 물어보시는 내용을 모았습니다.</p>
<h2>이용 안내</h2>
<div class="faq">
${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n')}
</div>
${CTA('서비스 신청하기', '#services')}
${RELATED(p)}`;
  return shell({ meta, body, current: p });
}

/* ---------- 404, robots, sitemap ---------- */
function build404() {
  const meta = head({ title: '페이지를 찾을 수 없습니다 – ' + NAME, description: '요청하신 페이지를 찾을 수 없습니다.', path: '404.html' }).replace('index,follow', 'noindex');
  const body = `<h1>페이지를 찾을 수 없습니다</h1><p class="lead">주소가 바뀌었거나 없는 페이지입니다.</p><p class="cta"><a class="btn" href="${BASE}">홈으로 가기</a></p>${RELATED('')}`;
  return shell({ meta, body, current: '' });
}
const PAGES = [['', '1.0', 'weekly'], ['shopee/', '0.9', 'monthly'], ['qoo10/', '0.9', 'monthly'], ['pricing/', '0.8', 'monthly'], ['faq/', '0.7', 'monthly']];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(([p, pr, cf]) => `  <url><loc>${url(p)}</loc><lastmod>${TODAY}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`;
const robots = `User-agent: *
Allow: /

Sitemap: ${url('sitemap.xml')}
`;

/* ---------- 쓰기 ---------- */
function write(rel, content) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
  console.log('  ', rel);
}
console.log(`빌드: ${SITE_URL} (base ${BASE})`);
write('index.html', buildHome());
write('shopee/index.html', buildShopee());
write('qoo10/index.html', buildQoo10());
write('pricing/index.html', buildPricing());
write('faq/index.html', buildFaq());
write('404.html', build404());
write('robots.txt', robots);
write('sitemap.xml', sitemap);
