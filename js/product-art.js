"use strict";
/* 기본 상품 대표 이미지 (직접 그린 SVG). 'img-상품id' 형태의 파일 id 로 불러옵니다. */
var ART={
  's-shopee':{bg:['#ffe27a','#ff9f43'],ink:'#7a2e0e',title:['쇼피','배송등록'],sub:'주문번호만 입력하면 접수 끝',icon:'plane'},
  's-shopee-bundle':{bg:['#ffe9b0','#ffb3d9'],ink:'#7a2e0e',title:['쇼피','합배송등록'],sub:'여러 상품을 한 상자로',icon:'boxes'},
  's-qoo10':{bg:['#8ff0f7','#3fb6e8'],ink:'#06385c',title:['큐텐','배송등록'],sub:'KSE 배송 접수',icon:'plane'},
  's-qoo10-bundle':{bg:['#d4fbe0','#8fb8ff'],ink:'#06385c',title:['큐텐','합배송등록'],sub:'여러 상품을 한 상자로',icon:'boxes'},
  's-domestic':{bg:['#e2ffb0','#9be28c'],ink:'#1f5a2a',title:['국내','택배 서비스'],sub:'국내 구간 발송 대행',icon:'truck'},
  's-storage':{bg:['#2bb7b0','#2a6fb5'],ink:'#ffffff',title:['물품','보관 서비스'],sub:'안전하게 보관해 드립니다',icon:'safe'},
  's-credit':{bg:['#2b3170','#171b45'],ink:'#ffd45e',title:['적립금','충전'],sub:'충전할수록 추가 적립',icon:'coins'},
  's-label':{bg:['#f4f4f6','#d9dbe3'],ink:'#2b2f3a',title:['송장','라벨지'],sub:'100×100 · 500매',icon:'label'}
};
function artIcon(k,ink){
  var f='fill="'+ink+'"',o='fill="none" stroke="'+ink+'" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"';
  if(k==='plane')return '<g opacity=".9"><path d="M60 150 L250 120 L360 40 L400 50 L340 130 L470 110 L490 135 L350 180 L300 270 L260 265 L270 190 L130 215 Z" '+f+'/><path d="M20 235 H110 M40 262 H150 M10 208 H70" '+o+'/></g>';
  if(k==='boxes')return '<g '+o+'><rect x="40" y="130" width="150" height="150" rx="10"/><path d="M40 190 H190 M115 130 V190"/><rect x="290" y="130" width="150" height="150" rx="10"/><path d="M290 190 H440 M365 130 V190"/><path d="M215 205 H265 M240 180 V230"/></g>';
  if(k==='truck')return '<g '+o+'><rect x="30" y="120" width="260" height="150" rx="10"/><path d="M290 160 H390 L450 215 V270 H290 Z"/><circle cx="110" cy="285" r="32" '+f+'/><circle cx="370" cy="285" r="32" '+f+'/></g>';
  if(k==='safe')return '<g '+o+'><rect x="60" y="90" width="360" height="220" rx="18"/><circle cx="260" cy="200" r="55"/><path d="M260 165 V235 M225 200 H295"/><path d="M110 310 V335 M370 310 V335"/></g>';
  if(k==='coins')return '<g '+o+'><circle cx="170" cy="210" r="95"/><circle cx="330" cy="160" r="75"/><path d="M130 175 L170 245 L210 175 M135 205 H205 M295 125 L330 195 L365 125 M298 155 H362"/></g>';
  return '<g '+o+'><rect x="90" y="50" width="300" height="300" rx="14"/><path d="M130 110 H350 M130 170 H300 M130 230 H350 M130 290 H260"/></g>';
}
function artSvg(pid){
  var a=ART[pid]||{bg:['#eceef3','#d4d8e2'],ink:'#2b2f3a',title:['엄배송',''],sub:'',icon:'label'};
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a.bg[0]+'"/><stop offset="1" stop-color="'+a.bg[1]+'"/></linearGradient></defs>'
   +'<rect width="600" height="600" fill="url(#g)"/>'
   +'<g transform="translate(60 40)">'+artIcon(a.icon,a.ink)+'</g>'
   +'<g font-family="Noto Sans KR,Apple SD Gothic Neo,Malgun Gothic,sans-serif" fill="'+a.ink+'" font-weight="800">'
   +'<text x="48" y="430" font-size="64">'+a.title[0]+'</text><text x="48" y="500" font-size="64">'+a.title[1]+'</text>'
   +'<text x="48" y="545" font-size="24" font-weight="500" opacity=".8">'+a.sub+'</text>'
   +'<text x="552" y="570" font-size="16" font-weight="700" text-anchor="end" opacity=".55" letter-spacing="2">EOMBAESONG</text></g></svg>';
}
function artUrl(id){var k=String(id).replace(/^img-/,'');return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(/^d-/.test(k)?sceneSvg(k):artSvg(k))}

/* ---------- 상세 페이지용 배송 일러스트 (1200x520, 직접 그린 SVG) ---------- */
var SC_FONT='Noto Sans KR,Apple SD Gothic Neo,Malgun Gothic,sans-serif';
function scT(x,y,t,sz,w,fill,anc,op){return '<text x="'+x+'" y="'+y+'" font-size="'+sz+'" font-weight="'+(w||700)+'" fill="'+fill+'" text-anchor="'+(anc||'start')+'"'+(op?' opacity="'+op+'"':'')+'>'+t+'</text>'}
function scBox(x,y,w,h,c,d){return '<g><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="10" fill="'+c+'"/><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+(h*.28)+'" rx="10" fill="'+d+'" opacity=".35"/><rect x="'+(x+w/2-w*.09)+'" y="'+y+'" width="'+(w*.18)+'" height="'+h+'" fill="#fff" opacity=".55"/></g>'}
function scPlane(x,y,s,c,r){return '<g transform="translate('+x+' '+y+') rotate('+(r||0)+') scale('+s+')"><path d="M-120 20 L40 0 L110 -70 L140 -62 L100 -4 L190 -16 L204 2 L104 28 L70 100 L40 96 L48 38 L-60 54 Z" fill="'+c+'"/></g>'}
function scCard(x,y,w,h,f){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="26" fill="'+(f||'#fff')+'" opacity=".92"/>'}
function scSky(a,b){return '<defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient></defs><rect width="1200" height="520" fill="url(#s)"/>'}
var SCENES={
 'd-flow':function(){var st=[['주문번호 입력','마켓 주문번호와 택배 정보를 적어요'],['송장 PDF 올리기','마켓 송장 파일을 첨부해요'],['입금 · 적립금 결제','입금이 확인되면 접수 시작'],['접수 후 발송','포장해서 발송하고 상태를 알려요']];
  var ic=[function(x){return '<rect x="'+(x-38)+'" y="150" width="76" height="96" rx="10" fill="#fff" stroke="#0071e3" stroke-width="7"/><path d="M'+(x-22)+' 180 H'+(x+22)+' M'+(x-22)+' 202 H'+(x+22)+' M'+(x-22)+' 224 H'+(x+6)+'" stroke="#0071e3" stroke-width="7" stroke-linecap="round"/>'},
   function(x){return '<rect x="'+(x-38)+'" y="150" width="76" height="96" rx="10" fill="#fff" stroke="#7b5cff" stroke-width="7"/>'+scT(x,208,'PDF',24,800,'#7b5cff','middle')+'<path d="M'+x+' 140 V112 M'+(x-14)+' 126 L'+x+' 110 L'+(x+14)+' 126" stroke="#7b5cff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'},
   function(x){return '<circle cx="'+x+'" cy="198" r="50" fill="#ffd45e" stroke="#e0a100" stroke-width="7"/>'+scT(x,214,'₩',48,800,'#8a5a00','middle')},
   function(x){return scBox(x-48,166,96,80,'#ffb066','#c0561a')+scPlane(x+40,150,.26,'#0071e3',-10)}];
  var o='<defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eaf3ff"/><stop offset="1" stop-color="#f3e9ff"/></linearGradient></defs><rect width="1200" height="520" fill="url(#s)"/>'+scT(600,70,'접수는 이렇게 진행돼요',38,800,'#1d1d1f','middle');
  st.forEach(function(s,i){var x=40+i*290,cx=x+125;o+=scCard(x,100,250,350)+'<circle cx="'+(x+34)+'" cy="138" r="18" fill="#0071e3"/>'+scT(x+34,145,i+1,20,800,'#fff','middle')+ic[i](cx)+scT(cx,310,s[0],25,800,'#1d1d1f','middle')+scT(cx,346,s[1],16,500,'#6e6e73','middle');
   if(i<3)o+='<path d="M'+(x+256)+' 275 h26" stroke="#0071e3" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 10"/>'});
  return o},
 'd-route-shopee':function(){return scRoute('#ffe27a','#ff9f43','#7a2e0e','SGP','싱가포르 · 쇼피')},
 'd-route-qoo10':function(){return scRoute('#8ff0f7','#3fb6e8','#06385c','NRT','일본 · 큐텐')},
 'd-bundle':function(){return scSky('#ffe9b0','#ffb3d9')+scT(600,70,'여러 주문을 한 상자로',40,800,'#7a2e0e','middle')
  +scBox(90,170,130,130,'#ff9f43','#c0561a')+scBox(250,230,110,110,'#5cc8ff','#1a6aa0')+scBox(120,340,120,110,'#9b8cff','#4b3fb0')
  +'<path d="M400 300 H560" stroke="#7a2e0e" stroke-width="8" stroke-linecap="round" stroke-dasharray="4 16"/><path d="M548 280 L580 300 L548 320" fill="none" stroke="#7a2e0e" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'
  +scBox(650,150,330,310,'#e8a05a','#9a5a1f')+scT(815,352,'합배송',48,800,'#fff','middle')+scT(815,396,'한 번에 포장해서 발송',20,600,'#fff','middle','.9')+scT(1090,150,'건수 ↓',26,800,'#7a2e0e','middle')+scT(1090,190,'배송 단순화',18,600,'#7a2e0e','middle')},
 'd-packing':function(){var ch=[['박스교체','+300원'],['사은품 추가','+300원'],['마스크팩 추가','+500원'],['대형포장','+500원']];
  var o=scSky('#e2f0ff','#f5eaff')+scT(70,86,'포장 옵션도 골라요',40,800,'#1d1d1f')+scT(70,126,'필요한 만큼만 추가하세요',20,500,'#6e6e73')
   +scBox(90,190,300,250,'#e8a05a','#9a5a1f');
  for(var i=0;i<6;i++)o+='<circle cx="'+(130+i*45)+'" cy="'+(220+(i%2)*18)+'" r="20" fill="#fff" opacity=".7"/>';
  ch.forEach(function(c,i){var x=500+(i%2)*330,y=180+Math.floor(i/2)*140;o+=scCard(x,y,300,110)+scT(x+26,y+52,c[0],26,800,'#1d1d1f')+scT(x+26,y+88,c[1],22,700,'#0071e3')});
  return o},
 'd-truck':function(){return scSky('#e2ffb0','#9be28c')+scT(600,76,'국내 구간 택배 발송 대행',38,800,'#1f5a2a','middle')
  +'<rect y="400" width="1200" height="120" fill="#4a8f4a" opacity=".35"/><path d="M0 440 H1200" stroke="#1f5a2a" stroke-width="6" stroke-dasharray="40 30"/>'
  +'<g transform="translate(380 250)"><rect width="280" height="150" rx="14" fill="#fff"/><path d="M280 40 H370 L430 100 V150 H280 Z" fill="#ffb066"/><path d="M300 56 H358 L396 98 H300 Z" fill="#cfeeff"/><circle cx="90" cy="156" r="32" fill="#1d1d1f"/><circle cx="350" cy="156" r="32" fill="#1d1d1f"/><circle cx="90" cy="156" r="12" fill="#ddd"/><circle cx="350" cy="156" r="12" fill="#ddd"/>'+scT(140,86,'엄배송',40,800,'#1f5a2a','middle')+'</g>'
  +'<g><path d="M130 300 a40 40 0 1 1 .1 0 L130 350 Z" fill="#ff5a4d"/><circle cx="130" cy="262" r="14" fill="#fff"/></g>'+scT(130,392,'보내는 곳',22,800,'#1f5a2a','middle')
  +'<g><path d="M1050 300 a40 40 0 1 1 .1 0 L1050 350 Z" fill="#0071e3"/><circle cx="1050" cy="262" r="14" fill="#fff"/></g>'+scT(1050,392,'받는 곳',22,800,'#1f5a2a','middle')},
 'd-warehouse':function(){var o=scSky('#2bb7b0','#2a6fb5')+scT(70,86,'안전하게 보관해요',42,800,'#fff')+scT(70,128,'입고 확인 후 기간 동안 보관합니다',20,500,'#fff',null,'.85');
  [0,1,2].forEach(function(r){var y=170+r*105;o+='<rect x="70" y="'+(y+80)+'" width="760" height="12" rx="6" fill="#fff" opacity=".8"/>';
   [0,1,2,3,4].forEach(function(c){if((r+c)%4!==3)o+=scBox(100+c*140,y+14,110,66,['#ffb066','#ffd45e','#9b8cff','#ff8fa3','#7fe0c4'][(r*2+c)%5],'#333')})});
  o+='<rect x="900" y="150" width="240" height="270" rx="26" fill="#fff"/><rect x="900" y="150" width="240" height="64" rx="26" fill="#ff5a4d"/>'+scT(1020,196,'1달',34,800,'#fff','middle')+scT(1020,320,'30',96,800,'#1d1d1f','middle')+scT(1020,370,'일 보관',22,600,'#6e6e73','middle');
  return o},
 'd-wallet':function(){var o=scSky('#2b3170','#171b45')+scT(70,86,'적립금을 미리 충전하세요',40,800,'#ffd45e')+scT(70,126,'다음 주문부터 결제에 바로 사용해요',20,500,'#fff',null,'.8');
  [0,1,2,3,4].forEach(function(i){o+='<ellipse cx="260" cy="'+(400-i*34)+'" rx="120" ry="30" fill="#ffd45e" stroke="#e0a100" stroke-width="6"/>'});
  o+=scT(260,300,'₩',60,800,'#8a5a00','middle')+'<path d="M470 360 L640 250 L760 310 L930 170" fill="none" stroke="#7fe0c4" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M900 160 L940 164 L930 204" fill="none" stroke="#7fe0c4" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>'
   +scCard(470,380,230,80)+scT(585,432,'10,000원',30,800,'#171b45','middle')+scCard(730,380,230,80)+scT(845,432,'결제에 사용',26,800,'#171b45','middle');
  return o},
 'd-label':function(){var o=scSky('#f4f4f6','#d9dbe3')+scT(70,86,'바코드 프린터용 감열 라벨지',38,800,'#2b2f3a')+scT(70,126,'100×100mm · 500매',22,500,'#6e6e73')
  +'<rect x="150" y="170" width="380" height="300" rx="22" fill="#fff" stroke="#2b2f3a" stroke-width="6"/><path d="M180 232 H500" stroke="#2b2f3a" stroke-width="6"/>'+scT(180,214,'SAMPLE',22,800,'#6e6e73')+scT(180,296,'ICN → SGP',44,800,'#2b2f3a');
  for(var i=0;i<34;i++)o+='<rect x="'+(180+i*9.4)+'" y="330" width="'+((i%3)+3)+'" height="90" fill="#2b2f3a"/>';
  o+='<g transform="translate(640 200)"><ellipse cx="300" cy="260" rx="260" ry="50" fill="#2b2f3a" opacity=".12"/><rect x="40" y="40" width="440" height="190" rx="95" fill="#fff" stroke="#2b2f3a" stroke-width="6"/><circle cx="135" cy="135" r="62" fill="#e9eaf0" stroke="#2b2f3a" stroke-width="6"/><circle cx="135" cy="135" r="22" fill="#fff" stroke="#2b2f3a" stroke-width="6"/><path d="M200 135 H470" stroke="#2b2f3a" stroke-width="6" stroke-dasharray="10 12"/></g>';
  return o}
};
function scRoute(a,b,ink,code,lab){
  return scSky(a,b)+scT(70,86,'한국에서 해외 구매자까지',40,800,ink)+scT(70,126,lab+' 배송등록을 대신 접수해요',20,500,ink,null,'.8')
   +'<circle cx="260" cy="430" r="150" fill="#fff" opacity=".18"/><circle cx="980" cy="400" r="190" fill="#fff" opacity=".14"/><circle cx="640" cy="470" r="110" fill="#fff" opacity=".12"/>'
   +'<path d="M170 400 Q600 20 1030 350" fill="none" stroke="'+ink+'" stroke-width="7" stroke-linecap="round" stroke-dasharray="3 18"/>'
   +'<circle cx="170" cy="400" r="22" fill="'+ink+'"/><circle cx="170" cy="400" r="9" fill="#fff"/>'+scT(170,456,'ICN 서울',24,800,ink,'middle')
   +'<circle cx="1030" cy="350" r="22" fill="#ff5a4d"/><circle cx="1030" cy="350" r="9" fill="#fff"/>'+scT(1030,406,code,26,800,ink,'middle')
   +scPlane(600,175,.9,ink,12)
}
function sceneSvg(id){var f=SCENES[id];return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 520"><g font-family="'+SC_FONT+'">'+(f?f():scSky('#eceef3','#d4d8e2'))+'</g></svg>'}
