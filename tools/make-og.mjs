#!/usr/bin/env node
/* images/og.png (1200x630 공유 이미지)를 만듭니다. playwright 가 설치된 환경에서 실행: node tools/make-og.mjs */
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'images', 'og.png');
const html = `<body style="margin:0;width:1200px;height:630px;font-family:'Noto Sans KR','Apple SD Gothic Neo',sans-serif;background:linear-gradient(135deg,#eaf3ff,#efe6ff 55%,#ffe9dc);display:grid;place-items:center;position:relative;overflow:hidden">
<div style="position:absolute;width:520px;height:520px;border-radius:50%;background:#7fb8ff;filter:blur(90px);opacity:.5;left:-120px;top:-160px"></div>
<div style="position:absolute;width:460px;height:460px;border-radius:50%;background:#c4a2ff;filter:blur(90px);opacity:.5;right:-100px;bottom:-160px"></div>
<div style="position:relative;text-align:center;color:#1d1d1f">
<div style="font-size:30px;font-weight:700;letter-spacing:.2em;color:#0071e3">EOMBAESONG</div>
<div style="font-size:120px;font-weight:800;letter-spacing:-.04em;line-height:1.1;margin-top:14px;background:linear-gradient(100deg,#0071e3,#7b5cff 50%,#ff6a3d);-webkit-background-clip:text;color:transparent">엄배송</div>
<div style="font-size:46px;font-weight:700;margin-top:18px;letter-spacing:-.02em">쇼피 배대지 · 큐텐 배대지 · 해외배송대행</div>
<div style="font-size:28px;color:#6e6e73;margin-top:16px">주문번호만 보내면 배송등록 접수 끝</div></div></body>`;
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 630 } });
await pg.setContent(html); await pg.waitForTimeout(500); await pg.screenshot({ path: out }); await b.close(); console.log(out);
