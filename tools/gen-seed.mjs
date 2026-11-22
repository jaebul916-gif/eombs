#!/usr/bin/env node
/* js/constants.js 의 기본 상품으로 supabase/seed.sql 을 만듭니다. 계정과 비밀번호는 만들지 않습니다.
   사용법: node tools/gen-seed.mjs */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/constants.js'), 'utf8') + ';this.D=DEFAULTS;', ctx);
const q = v => "'" + String(v).replace(/'/g, "''") + "'";
let n = 0;
let o = `-- 엄배송 데모 데이터 (기본 상품, 공지, 사이트 설정)
-- setup.sql 을 먼저 실행한 뒤 SQL Editor 에서 실행하세요. 여러 번 실행해도 안전합니다.
-- 계정과 비밀번호는 만들지 않습니다. 관리자 만드는 법은 supabase/README.md 를 보세요.
-- 같은 id 의 상품은 이 파일 내용으로 덮어씁니다.

`;
for (const p of ctx.D) { const d = JSON.parse(JSON.stringify(p)); d.order = d.order || ++n; o += `select public._save_product(${q(JSON.stringify(d))}::jsonb);\n`; }
o += `
insert into public.notices (id,title,body,created_at) values
 ('n1','엄배송 오픈 안내','쇼피·큐텐 배송등록을 시작합니다. 주문번호와 송장 파일만 준비해 주세요.','2026-11-20T09:00:00Z'),
 ('n2','이용 시간 안내','접수 확인은 평일 10시~18시에 처리됩니다. 주말 접수는 다음 영업일에 확인합니다.','2026-11-21T09:00:00Z')
on conflict (id) do update set title = excluded.title, body = excluded.body;

insert into public.site_settings (key,value) values
 ('bank','국민은행'),('account','000000-00-000000'),('holder','엄배송'),('bizName','엄배송'),('tel',''),('hours','평일 10:00~18:00')
on conflict (key) do update set value = excluded.value;
`;
fs.writeFileSync(path.join(ROOT, 'supabase/seed.sql'), o);
console.log('supabase/seed.sql', o.split('\n').length, 'lines');
