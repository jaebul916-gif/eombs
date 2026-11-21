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
  var a=ART[pid]||{bg:['#eceef3','#d4d8e2'],ink:'#2b2f3a',title:['셀러포트',''],sub:'',icon:'label'};
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a.bg[0]+'"/><stop offset="1" stop-color="'+a.bg[1]+'"/></linearGradient></defs>'
   +'<rect width="600" height="600" fill="url(#g)"/>'
   +'<g transform="translate(60 40)">'+artIcon(a.icon,a.ink)+'</g>'
   +'<g font-family="Noto Sans KR,Apple SD Gothic Neo,Malgun Gothic,sans-serif" fill="'+a.ink+'" font-weight="800">'
   +'<text x="48" y="430" font-size="64">'+a.title[0]+'</text><text x="48" y="500" font-size="64">'+a.title[1]+'</text>'
   +'<text x="48" y="545" font-size="24" font-weight="500" opacity=".8">'+a.sub+'</text>'
   +'<text x="552" y="570" font-size="16" font-weight="700" text-anchor="end" opacity=".55" letter-spacing="2">SELLERPORT</text></g></svg>';
}
function artUrl(id){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(artSvg(String(id).replace(/^img-/,'')))}
