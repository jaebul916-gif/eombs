/* 렌더링과 라우팅 */
"use strict";
/* ---------- render ---------- */
function render(){
  var r=ST.route;var h;
  if(!ST.ready&&(r==='cart'||r==='mypage'||r==='manage'))h='<section class="empty"><p class="muted">불러오는 중...</p></section>';
  else if(r.indexOf('item-')===0)h=pageItem(r.slice(5));else if(r==='services')h=pageServices();else if(r==='cart')h=pageCart();else if(r==='mypage')h=pageMy();else if(r==='notices')h=pageNotices();else if(r==='manage')h=pageAdmin();else if(r==='login')h=pageLogin();else if(r==='terms'||r==='privacy'||r==='refund')h=pageLegal(r);else h=pageHome();
  app.innerHTML=h;renderModal();
  document.querySelectorAll('.links a').forEach(function(a){if(a.dataset.r===(r.indexOf('item-')===0?'services':r))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  var al=document.getElementById('adminLink');al.hidden=!ST.admin;var pc=ST.admin?allOrdersFlat().filter(function(o){return o.status==='pending'}).length:0;al.textContent=pc?'관리자 ('+pc+')':'관리자';
  document.getElementById('cartCount').textContent=ST.cart.reduce(function(s,c){return s+c.qty},0);
  document.getElementById('acctSlot').innerHTML=ST.acct?'<a href="#mypage" class="who">'+esc(ST.acct.name)+'님</a> <button class="linkbtn" data-act="logout">로그아웃</button>':'<a href="#login">로그인</a>';
  var s=ST.settings||{};
  var biz=[];if(s.bizName)biz.push('상호 '+s.bizName);if(s.ceo)biz.push('대표 '+s.ceo);if(s.bizNo)biz.push('사업자등록번호 '+s.bizNo);if(s.mailOrder)biz.push('통신판매업 '+s.mailOrder);
  var biz2=[];if(s.bizAddr)biz2.push(s.bizAddr);if(s.tel)biz2.push(s.tel);if(s.hours)biz2.push(s.hours);
  document.getElementById('foot').innerHTML='<span>쇼피·큐텐 셀러를 위한 배송대행 서비스입니다.</span><span><a href="#terms">이용약관</a> · <a href="#privacy">개인정보 처리방침</a> · <a href="#refund">환불 규정</a></span>'+(biz.length||biz2.length?'<hr>':'')+(biz.length?'<span>'+esc(biz.join(' · '))+'</span>':'')+(biz2.length?'<span>'+esc(biz2.join(' · '))+'</span>':'')+'<hr><span>Copyright © 2026 엄배송. All rights reserved.</span>';
}
function refresh(){var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&app.contains(a)){ST.pending=true;return}render()}
app.addEventListener('focusout',function(){if(!ST.pending)return;setTimeout(function(){var a=document.activeElement;if(!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&app.contains(a))){ST.pending=false;render()}},0)});
function route(){var h=(location.hash||'').replace('#','');if(['home','services','cart','mypage','notices','manage','login','terms','privacy','refund'].indexOf(h)<0&&!/^item-[A-Za-z0-9_-]+$/.test(h))h='home';
  if(h!==ST.route){ST.paywin=null;ST.modal=null;ST.dtab='info';ST.gi=0}
  if(ST.sel&&ST.sel.editLid&&h!=='item-'+ST.sel.pid)ST.sel=null;
  if(ST.ready&&!ST.acct&&(h==='cart'||h==='mypage'||h==='manage')){ST.next='#'+h;ST.loginMsg='로그인 후 이용할 수 있습니다.';ST.ltab='in';location.hash='#login';return}
  ST.route=h;ST.err='';ST.lerr='';render();window.scrollTo(0,0)}
window.addEventListener('hashchange',route);

