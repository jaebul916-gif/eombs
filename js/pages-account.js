/* 계정 화면 (로그인, 마이페이지, 약관, 공지) */
"use strict";
function pageLogin(){
  if(ST.acct)return '<section class="empty"><h1 class="ph" style="margin:0">'+esc(ST.acct.name)+'님, 로그인되어 있습니다.</h1><div class="row"><a class="btn" href="#mypage">마이페이지</a><button class="btn ghost" data-act="logout">로그아웃</button></div></section>';
  var up=ST.ltab==='up';
  var tabs='<div class="chips" style="justify-content:center"><button type="button" data-act="ltab" data-v="in" aria-pressed="'+(!up)+'">로그인</button><button type="button" data-act="ltab" data-v="up" aria-pressed="'+up+'">회원가입</button></div>';
  var form=up?
    '<div class="form" style="margin-top:0"><label>아이디<input id="suId" autocomplete="username" placeholder="영문 소문자·숫자 4~20자"></label><label>이름<input id="suName" autocomplete="name"></label><label>연락처<input id="suPhone" inputmode="tel" autocomplete="tel"></label><label>비밀번호<input id="suPw" type="password" autocomplete="new-password" placeholder="6자 이상"></label><label>비밀번호 확인<input id="suPw2" type="password" autocomplete="new-password"></label><label class="check"><input type="checkbox" id="suAgree"><span><a href="#terms">이용약관</a>과 <a href="#privacy">개인정보 처리방침</a>에 동의합니다.</span></label></div>'+(ST.lerr?'<p class="err" role="alert">'+esc(ST.lerr)+'</p>':'')+'<button class="btn" data-act="signup"'+(ST.busy?' disabled':'')+'>가입하기</button>'
   :'<div class="form" style="margin-top:0"><label>아이디<input id="lgId" autocomplete="username"></label><label>비밀번호<input id="lgPw" type="password" autocomplete="current-password"></label></div>'+(ST.lerr?'<p class="err" role="alert">'+esc(ST.lerr)+'</p>':'')+'<button class="btn" data-act="login"'+(ST.busy?' disabled':'')+'>로그인</button>';
  var demo='<div class="demo"><strong>포트폴리오 데모</strong><p class="muted">웹앱 제작 포트폴리오용 데모입니다. 회원가입 후 바로 주문 흐름을 체험할 수 있고, 실제 결제는 이루어지지 않습니다. 관리자 화면 시연이 필요하면 문의해 주세요.</p></div>';
  return '<div class="authbox"><h1 class="ph" style="text-align:center;margin:0">'+(up?'계정 만들기.':'로그인.')+'</h1>'+(ST.loginMsg?'<p class="banner" style="border-radius:12px">'+esc(ST.loginMsg)+'</p>':'')+tabs+'<div class="card" style="display:grid;gap:1rem">'+form+'</div>'+demo+(ST.db?'':'<p class="small muted" style="text-align:center">저장소에 연결되지 않아 로그인할 수 없습니다. Claude 공유 링크 또는 Supabase 설정이 필요합니다.</p>')+'</div>';
}
function orderCard(o){
  var refs=o.items.map(function(i){return '<li>'+esc(i.name)+' × '+i.qty+itemDetail(i)+'</li>'}).join('');
  var hay=(o.no+' '+o.items.map(function(i){return i.name+' '+((i.refs||[]).join(' '))}).join(' ')).toLowerCase();
  return '<article class="card ord" data-hay="'+esc(hay)+'"><div class="ord-head"><div><strong class="num">'+esc(o.no)+'</strong> <span class="muted small">'+dt(o.createdAt)+'</span></div>'+(o.cancelRequested&&o.status!=='canceled'?'<span class="chip warn">취소 요청됨</span>':chip(o.status))+'</div>'
   +'<ul>'+refs+'</ul><div class="row" style="justify-content:space-between"><span class="small muted">'+(o.pay==='points'?'포인트 결제':o.pay==='card'?'토스페이먼츠(테스트 결제)'+(o.pts?' · 포인트 '+won(o.pts)+' 사용':''):'무통장입금'+(o.depositor?' · '+esc(o.depositor):'')+(o.pts?' · 포인트 '+won(o.pts)+' 사용':''))+'</span><strong class="num">'+won(o.total)+'</strong></div>'
   +(o.status==='pending'&&o.pay==='bank'?'<p class="small reply">입금 안내 · '+bankText()+'<br><span class="muted">입금자명 '+esc(o.depositor||'')+' · 입금액 '+won(o.total-(o.pts||0))+'</span></p>':'')
   +(o.memo?'<p class="small"><span class="muted">관리자 메모</span> '+esc(o.memo)+'</p>':'')
   +((o.status==='pending'||o.status==='paid')&&!o.cancelRequested?'<div><button class="btn danger sm" data-act="cancel-req" data-id="'+esc(o.id)+'">취소 요청</button></div>':'')+'</article>';
}
function pageMy(){
  if(!ST.acct)return '<section class="empty"><h1 class="ph" style="margin:0">마이페이지.</h1><p class="muted">로그인하면 주문 내역과 적립금을 볼 수 있습니다.</p><a class="btn" href="#login">로그인 / 회원가입</a></section>';
  var w=ST.myWallet||{};var bal=w.balance||0;var os=myOrders();
  var fl=ST.ofilter==='all'?os:os.filter(function(o){return o.status===ST.ofilter});
  var chips=['all'].concat(Object.keys(STATUS)).map(function(k){var n=k==='all'?os.length:os.filter(function(o){return o.status===k}).length;return '<button type="button" data-act="of" data-v="'+k+'" aria-pressed="'+(ST.ofilter===k)+'">'+(k==='all'?'전체':STATUS[k][0])+' '+n+'</button>'}).join('');
  var log=(w.log||[]).slice(0,10).map(function(l){return '<li class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-block:.55rem"><span>'+esc(l.reason)+' <span class="muted small num">'+dt(l.at)+'</span></span><strong class="num" style="color:'+(l.delta<0?'var(--bad)':'var(--ok)')+'">'+(l.delta>0?'+':'')+won(l.delta)+'</strong></li>'}).join('');
  var iq=(ST.inq||[]).map(function(q){var r=(ST.replies||{})[q._id];
    return '<article class="card ord"><div class="ord-head"><strong>'+esc(q.title)+'</strong>'+(r?'<span class="chip ok">답변 완료</span>':'<span class="chip warn">답변 대기</span>')+'</div><p class="small muted num">'+dt(q.at)+'</p><p style="white-space:pre-wrap">'+esc(q.body)+'</p>'
     +(r?'<div class="reply"><div class="small muted">관리자 답변 · '+dt(r.at)+'</div><p style="white-space:pre-wrap">'+esc(r.text)+'</p></div>':'')+'</article>'}).join('');
  return '<h1 class="ph">'+esc(ST.acct.name)+'님. <span>주문 내역을 확인하세요.</span></h1>'
   +(ST.tossNotice?'<p class="banner" style="border-radius:12px;margin-bottom:.8rem">'+esc(ST.tossNotice)+'</p>':'')
   +'<div class="card balance"><div><div class="small muted">적립금 잔액</div><strong class="num">'+won(bal)+'</strong></div><a class="btn ghost" href="#services">적립금 충전</a></div>'
   +(log?'<details class="card" style="margin-top:.8rem"><summary>적립금 내역</summary><ul style="list-style:none;padding:0;margin:.6rem 0 0">'+log+'</ul></details>':'')
   +'<section><div class="sechead"><h2>주문 내역.</h2><label style="min-width:13rem"><input id="ordFilter" type="search" placeholder="주문번호 검색" aria-label="주문번호 검색"></label></div>'
   +'<div class="chips tabs">'+chips+'</div>'
   +(fl.length?fl.map(orderCard).join(''):'<p class="muted">'+(os.length?'해당 상태의 주문이 없습니다.':'아직 주문이 없습니다.')+'</p>')+'<p class="muted" id="noHit" hidden>검색 결과가 없습니다.</p></section>'
   +'<section><div class="sechead"><h2>내 정보.</h2></div><div class="tiles" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr))">'
   +'<div class="card"><h3>기본 정보</h3><div class="form"><label>아이디<input value="'+esc(ST.acct.id)+'" disabled></label><label>이름<input id="meName" value="'+esc(ST.acct.name)+'"></label><label>연락처<input id="mePhone" value="'+esc(ST.acct.phone)+'" inputmode="tel"></label><div><button class="btn sm" data-act="me-save">저장</button></div></div></div>'
   +'<div class="card"><h3>비밀번호 변경</h3><div class="form"><label>현재 비밀번호<input id="pwOld" type="password" autocomplete="current-password"></label><label>새 비밀번호<input id="pwNew" type="password" autocomplete="new-password" placeholder="6자 이상"></label><label>새 비밀번호 확인<input id="pwNew2" type="password" autocomplete="new-password"></label><div><button class="btn sm" data-act="pw-save">변경</button></div></div></div></div></section>'
   +'<section><div class="sechead"><h2>1:1 문의.</h2></div><div class="card" style="margin-bottom:.8rem"><div class="form" style="margin-top:0"><label>제목<input id="iqTitle" maxlength="100"></label><label>내용<textarea id="iqBody" style="font-family:var(--font)"></textarea></label><div><button class="btn sm" data-act="iq-add">문의 등록</button></div></div></div>'
   +(iq||'<p class="muted">등록한 문의가 없습니다.</p>')+'</section>';
}
function pageLegal(k){
  var T={terms:'이용약관',privacy:'개인정보 처리방침',refund:'환불 규정'};var t=(ST.settings||{})[k];
  return '<h1 class="ph">'+T[k]+'.</h1>'+(t?'<div class="card" style="white-space:pre-wrap">'+esc(t)+'</div>':'<p class="muted">아직 등록된 내용이 없습니다. 관리자 설정에서 입력할 수 있습니다.</p>');
}
function pageNotices(){
  var ns=ST.notices||[];
  return '<h1 class="ph">공지사항.</h1>'+(ns.length?ns.map(function(n){return '<details class="card" style="margin-bottom:.7rem"><summary>'+esc(n.title)+' <span class="num small muted">'+esc((n.at||'').slice(0,10))+'</span></summary><div class="body">'+esc(n.body)+'</div></details>'}).join(''):'<p class="muted">등록된 공지가 없습니다.</p>');
}

