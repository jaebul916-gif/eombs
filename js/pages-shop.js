/* 쇼핑 화면 (홈, 서비스, 장바구니, 상품 상세, 결제창) */
"use strict";
function thumb(p){var id=bid(p.images&&p.images[0]);return id?'<img class="timg" src="'+blobUrl(id)+'" alt="" loading="lazy">':''}
function tile(p){var u=unit(p);
  return '<article class="tile" data-hay="'+esc((p.name+' '+(p.desc||'')).toLowerCase())+'">'+thumb(p)
   +(p.best?'<div class="eyebrow">BEST</div>':'<div class="eyebrow q">'+esc(CATS[p.cat]||'')+'</div>')
   +(p.soldout?'<div class="eyebrow" style="color:var(--bad)">품절</div>':'')
   +'<h3>'+esc(p.name)+'</h3><p class="sub">'+esc(p.desc||'')+'</p>'
   +'<p class="from num">'+(u<p.price?'<s>'+won(p.price)+'</s>':'')+won(u)+' <span class="muted small">/ '+esc(p.unit||'건')+'</span></p>'
   +'<div class="push"><a class="btn" href="#item-'+esc(p.id)+'">'+(p.soldout?'자세히 보기':'신청하기')+'</a></div></article>'}
function pageHome(){
  var ps=activeProducts();var reg=ps.filter(function(p){return p.type==='register'});
  var low=reg.length?Math.min.apply(null,reg.map(unit)):0;
  var feat=ps.filter(function(p){return !p.soldout}).sort(function(a,b){return (b.best?1:0)-(a.best?1:0)||(a.order||0)-(b.order||0)}).slice(0,4);
  var ns=(ST.notices||[]).slice(0,3).map(function(n){return '<li class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-block:.8rem"><a href="#notices">'+esc(n.title)+'</a><span class="num small muted">'+esc((n.at||'').slice(0,10))+'</span></li>'}).join('');
  var routes=['ICN → SGP','ICN → KUL','ICN → MNL','ICN → BKK','ICN → SGN','ICN → TPE','ICN → NRT','ICN → CGK'];
  var mq=routes.concat(routes).map(function(r){return '<span>'+r+'</span>'}).join('');
  return '<section class="hero"><div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div><h1 class="big"><span class="grad">엄배송.</span> <span>배송등록,<br>이렇게 간단하게.</span></h1>'
   +'<p class="lead">쇼피와 큐텐 주문번호만 적어 보내세요. 배송등록과 합배송 접수'+(low?'는 건당 '+won(low)+'부터':'')+' 시작합니다.</p>'
   +'<div class="row"><a class="btn" href="#services" data-auth="1">배송등록 신청하기</a><a class="btn ghost" href="#mypage" data-auth="1">주문 조회</a></div></section>'
   +'<div class="marquee" aria-hidden="true"><div class="mq-track">'+mq+'</div></div>'
   +'<section class="feats"><article><b class="num">'+(low?won(low):'1,900원')+'~</b><h3>건당 합리적인 요금</h3><p>쇼피·큐텐 배송등록을 건당 요금으로 접수합니다.</p></article>'
   +'<article><b>1분</b><h3>주문번호만 붙여넣기</h3><p>한 줄에 하나씩 적고 송장 PDF만 올리면 끝납니다.</p></article>'
   +'<article><b>실시간</b><h3>처리 상태 확인</h3><p>입금 확인부터 발송 완료까지 마이페이지에서 바로 확인합니다.</p></article></section>'
   +'<section class="showcase"><div class="eyebrow">라벨 한 장까지</div><h2>접수부터 송장 라벨까지,<br>한곳에서.</h2>'
   +'<div class="label" role="img" aria-label="송장 라벨 예시"><div class="label-top"><span>SAMPLE</span><span>100×100</span></div>'
   +'<div class="label-route">ICN → SGP</div><div class="small muted">EB20261121-4821</div><div class="barcode"></div>'
   +'<dl><dt>PCS</dt><dd>1</dd><dt>WEIGHT</dt><dd>480 g</dd><dt>MARKET</dt><dd>SHOPEE SG</dd></dl><div class="label-foot">예시 라벨 · 실제 송장이 아닙니다</div></div></section>'
   +'<section><div class="sechead"><h2>인기 서비스.</h2><a class="lnk" href="#services">전체 보기</a></div><div class="tiles">'+feat.map(tile).join('')+'</div></section>'
   +'<section><div class="sechead"><h2>이용 방법.</h2></div><ol class="steps">'
   +'<li><h3>마켓에서 판매</h3><p class="muted small">쇼피나 큐텐에서 주문이 들어오면 주문번호를 복사해 둡니다.</p></li>'
   +'<li><h3>서비스 담고 신청</h3><p class="muted small">배송등록을 담고 주문번호를 한 줄에 하나씩 붙여 넣습니다.</p></li>'
   +'<li><h3>입금 또는 적립금 결제</h3><p class="muted small">입금자명을 남기면 입금 확인 후 접수가 시작됩니다.</p></li>'
   +'<li><h3>처리 상태 확인</h3><p class="muted small">마이페이지에서 입금대기, 처리중, 완료를 확인합니다.</p></li></ol></section>'
   +(ns?'<section><div class="sechead"><h2>공지.</h2><a class="lnk" href="#notices">전체 보기</a></div><ul style="list-style:none;padding:0;margin:0">'+ns+'</ul></section>':'');
}
function pageServices(){
  var ps=activeProducts();
  if(ST.cat!=='all')ps=ps.filter(function(p){return p.cat===ST.cat});
  if(ST.sort==='low')ps.sort(function(a,b){return unit(a)-unit(b)});
  else if(ST.sort==='high')ps.sort(function(a,b){return unit(b)-unit(a)});
  else if(ST.sort==='name')ps.sort(function(a,b){return a.name.localeCompare(b.name,'ko')});
  var chips=Object.keys(CATS).map(function(k){return '<button type="button" data-act="cat" data-v="'+k+'" aria-pressed="'+(ST.cat===k)+'">'+CATS[k]+'</button>'}).join('');
  return '<h1 class="ph">서비스. <span>셀러에게 꼭 맞는 방법.</span></h1>'
   +'<div class="row tabs" style="justify-content:space-between"><div class="chips">'+chips+'</div><input id="svcQ" type="search" placeholder="서비스 검색" aria-label="서비스 검색" style="max-width:14rem"><label style="grid-auto-flow:column;align-items:center;gap:.5rem">정렬<select data-sort style="width:auto"><option value="pop"'+(ST.sort==='pop'?' selected':'')+'>기본순</option><option value="low"'+(ST.sort==='low'?' selected':'')+'>낮은가격순</option><option value="high"'+(ST.sort==='high'?' selected':'')+'>높은가격순</option><option value="name"'+(ST.sort==='name'?' selected':'')+'>이름순</option></select></label></div>'
   +(ps.length?'<div class="tiles">'+ps.map(tile).join('')+'</div>':'<p class="muted">이 분류에 등록된 서비스가 없습니다.</p>');
}
function bankText(){var s=ST.settings||{};return s.bank&&s.account?esc(s.bank)+' <span class="num">'+esc(s.account)+'</span>'+(s.holder?' (예금주 '+esc(s.holder)+')':'')+' <button type="button" class="btn ghost sm" data-act="copy" data-v="'+esc(s.account)+'">계좌 복사</button>':'입금 계좌는 접수 후 안내됩니다.'}
function lineSummary(l){
  var p=l.p,c=l.c;var h='';
  var os=getOpts(p).map(function(g){var i=c.opts&&c.opts[g.id];return (i!==undefined&&i!==''&&g.choices[i])?g.name+': '+g.choices[i].label:null}).filter(Boolean);
  if(os.length)h+='<div class="small muted">'+esc(os.join(' · '))+'</div>';
  getFields(p).forEach(function(f){if(f.stage==='order')return;var v=String((c.inputs&&c.inputs[f.id])||'').trim();if(v)h+='<div class="small"><span class="muted">'+esc(f.label)+'</span><pre>'+esc(v)+'</pre></div>'});
  var og2=getFields(p).filter(function(f){return f.stage==='order'});
  if(og2.length){h+='<div class="optbox" style="margin-block:.4rem"><strong>추가정보 입력</strong>'+og2.map(function(f){var v=(c.inputs&&c.inputs[f.id])||'';var k=esc(c.lid)+'|'+esc(f.id);var lab=esc(f.label)+(f.required?' *':'');
    if(f.type==='file')return '<label>'+lab+(f.help?' <span class="muted small" style="font-weight:400">'+esc(f.help)+'</span>':'')+'<input type="file" accept="application/pdf,image/*" data-cup="'+k+'">'+(v?'<span class="small"><span class="chip ok">업로드됨</span> <a href="'+blobUrl(bid(v))+'" target="_blank" rel="noopener">파일 보기</a></span>':'')+'</label>';
    return '<label>'+lab+'<input data-cin="'+k+'" value="'+esc(v)+'"></label>'}).join('')+(ST.upmsg?'<p class="small muted">'+esc(ST.upmsg)+'</p>':'')+'</div>'}
  return h;
}
var PTS_MIN=1000;
function pageCart(){
  var lines=cartLines();
  if(!lines.length)return '<section class="empty"><h1 class="ph" style="margin:0">장바구니가 비어 있습니다.</h1><p class="muted">서비스를 담으면 여기에 표시됩니다.</p><a class="btn" href="#services">서비스 보기</a></section>';
  var total=lines.reduce(function(s,l){return s+l.unit*l.qty},0);
  var addrNeeded=lines.some(function(l){return needAddr(l.p)});
  var f=ST.form;var bal=(ST.myWallet&&ST.myWallet.balance)||0;var usable=bal>=PTS_MIN?Math.min(bal,total):0;var pu=Math.max(0,Math.min(usable,Math.floor(Number(f.pts)||0)));var pay=total-pu;
  var html=lines.map(function(l){var p=l.p;var lid=esc(l.c.lid);
    return '<article class="card line"><div class="line-head"><h3 style="font-size:1.15rem"><a href="#item-'+esc(p.id)+'" style="color:inherit">'+esc(p.name)+'</a></h3><div class="row"><button class="btn ghost sm" data-act="line-edit" data-id="'+lid+'">수정</button><button class="btn ghost sm" data-act="rm" data-id="'+lid+'">삭제</button></div></div>'+lineSummary(l)
     +'<div class="line-head">'+(p.hideQty?'<span class="muted small">수량 '+l.qty+'</span>':'<div class="qty"><button type="button" data-act="qty" data-id="'+lid+'" data-d="-1" aria-label="수량 줄이기">−</button><span class="num">'+l.qty+'</span><button type="button" data-act="qty" data-id="'+lid+'" data-d="1" aria-label="수량 늘리기">+</button></div>')+'<strong class="num">'+won(l.unit*l.qty)+'</strong></div></article>'}).join('');
  var action=ST.acct?'<button class="btn" style="width:100%;margin-top:.8rem" data-act="order"'+((ST.busy||!ST.db)?' disabled':'')+'>'+(ST.busy?'처리 중...':'결제하기')+'</button>'
    :'<p class="small muted" style="margin-top:.8rem">주문하려면 로그인이 필요합니다.</p><a class="btn" style="width:100%;margin-top:.5rem" href="#login">로그인 / 회원가입</a>';
  var side='<aside class="card"><h2 style="font-size:1.4rem;font-weight:600">주문 정보</h2><div class="form">'
   +'<label>이름<input data-form="name" value="'+esc(f.name)+'" autocomplete="name"></label>'
   +'<label>연락처<input data-form="phone" value="'+esc(f.phone)+'" inputmode="tel" autocomplete="tel"></label>'
   +(addrNeeded?'<label>배송지 주소<textarea data-form="addr" style="font-family:var(--font)">'+esc(f.addr)+'</textarea></label>':'')
   +'<div><div class="small" style="font-weight:500;margin-bottom:.4rem">포인트 사용</div><div class="row" style="flex-wrap:nowrap"><input data-form="pts" type="number" min="0" inputmode="numeric" value="'+esc(f.pts||0)+'" style="text-align:right"><button type="button" class="btn ghost sm" data-act="pts-all"'+(usable?'':' disabled')+'>전액사용</button></div><p class="small muted" style="margin-top:.4rem">사용 가능 포인트 <b class="num">'+usable+'</b> / 보유 포인트 <b class="num">'+bal+'</b><br>보유 포인트 '+PTS_MIN.toLocaleString('ko-KR')+' 이상 사용 가능</p></div>'
   +(pay>0?'<div><div class="small" style="font-weight:500;margin-bottom:.4rem">결제수단</div><div class="radios">'+[['card','신용카드'],['vbank','가상계좌'],['rt','실시간계좌이체'],['bank','무통장입금'],['spay','삼성페이']].map(function(m){return '<label><input type="radio" name="method" data-form="method" value="'+m[0]+'"'+((f.method||'bank')===m[0]?' checked':'')+'>'+m[1]+'</label>'}).join('')+'</div>'+((f.method||'bank')!=='bank'?'<p class="small muted" style="margin-top:.4rem">이 결제수단은 아직 결제대행사(PG)가 연동되지 않아 테스트 결제창으로만 표시됩니다. 실제 접수는 무통장입금 또는 포인트로 진행해 주세요.</p>':'')+'</div>':'')
   +(pay<=0?'<p class="small muted">포인트로 전액 결제됩니다.</p>':((f.method||'bank')==='bank'?'<label>입금자명<input data-form="dep" value="'+esc(f.dep)+'" placeholder="비우면 이름으로 접수"></label><p class="small muted">'+bankText()+'</p>':''))
   +'<label class="check"><input type="checkbox" data-form="agree"'+(f.agree?' checked':'')+'>전체 동의</label><label class="check" style="margin-left:1.2rem"><input type="checkbox" data-form="agree"'+(f.agree?' checked':'')+'>구매조건 확인 및 결제진행에 동의</label></div>'
   +'<div class="sum" style="margin-top:1.1rem"><div class="t"><span>서비스 합계</span><span class="num">'+won(total)+'</span></div>'+(pu?'<div class="t"><span>포인트 사용</span><span class="num">-'+won(pu)+'</span></div>':'')+'<div class="t tot"><span>결제 금액</span><span class="num">'+won(pay)+'</span></div></div>'
   +(ST.err?'<p class="err" role="alert">'+esc(ST.err)+'</p>':'')
   +(ST.db?'':'<p class="small muted" style="margin-top:.6rem">저장소에 연결되지 않아 주문을 접수할 수 없습니다.</p>')+action+'</aside>';
  return '<div class="sechead"><h1 class="ph" style="margin:0">장바구니.</h1><button class="btn ghost sm" data-act="clear">비우기</button></div>'
   +(ST.only?'<p class="banner" style="border-radius:12px;margin-bottom:.8rem">선택한 상품만 주문합니다. <button class="linkbtn" style="color:var(--link)" data-act="only-off">장바구니 전체 보기</button></p>':'')
   +'<div class="cartwrap"><div>'+html+'</div>'+side+'</div>';
}
function renderBlock(b){
  if(b.t==='h')return '<h2 style="font-size:1.5rem;font-weight:600;letter-spacing:-.02em">'+esc(b.text)+'</h2>';
  if(b.t==='note')return '<div class="demo" style="white-space:pre-wrap">'+esc(b.text)+'</div>';
  if(b.t==='img'){var id=bid(b.img);return id?'<img src="'+blobUrl(id)+'" alt="" loading="lazy">':''}
  return '<p style="white-space:pre-wrap">'+esc(b.text)+'</p>';
}
function selTotal(p){return lineUnit(p,ST.sel.opts)*ST.sel.qty}
function pageItem(pid){
  var p=byId(pid);
  if(!p||(p.hidden&&!ST.admin))return '<section class="empty"><h1 class="ph" style="margin:0">서비스를 찾을 수 없습니다.</h1><a class="btn" href="#services">서비스 목록</a></section>';
  if(!ST.sel||ST.sel.pid!==pid){ST.sel={pid:pid,qty:ST.presetQty||p.minQty||1,opts:{},inputs:{}};ST.gi=0;ST.ierr='';ST.presetQty=0}
  var s=ST.sel;var u=unit(p);var imgs=(p.images||[]).map(bid).filter(Boolean);
  var gi=Math.min(ST.gi||0,Math.max(imgs.length-1,0));
  var gal='<div class="gal"><div class="main">'+(imgs.length?'<img src="'+blobUrl(imgs[gi])+'" alt="'+esc(p.name)+'">':'<span class="noimg">이미지 준비 중</span>')+'</div>'
   +(imgs.length>1?'<div class="ths">'+imgs.map(function(id,i){return '<button type="button" data-act="gal" data-i="'+i+'" aria-pressed="'+(i===gi)+'" aria-label="이미지 '+(i+1)+'"><img src="'+blobUrl(id)+'" alt=""></button>'}).join('')+'</div>':'')+'</div>';
  var og=getOpts(p).map(function(g){return '<label>'+esc(g.name)+(g.required?' *':'')+'<select data-opt="'+esc(g.id)+'"><option value="">'+esc(g.placeholder||'선택하세요')+'</option>'+g.choices.map(function(c,i){return '<option value="'+i+'"'+(String(s.opts[g.id])===String(i)?' selected':'')+'>'+esc(c.label)+(Number(c.add)?' (+'+won(c.add)+')':'')+'</option>'}).join('')+'</select></label>'}).join('');
  var fh=getFields(p).filter(function(f){return f.stage!=='order'}).map(function(f){
    var v=s.inputs[f.id]!=null?s.inputs[f.id]:'';
    var lab=esc(f.label)+(f.required?' *':'')+(f.help?' <span class="muted small" style="font-weight:400">'+esc(f.help)+'</span>':'');
    var ph=f.placeholder?' placeholder="'+esc(f.placeholder)+'"':'';var id=esc(f.id);
    if(f.type==='textarea'||f.type==='lines')return '<label>'+lab+'<textarea data-in="'+id+'"'+ph+'>'+esc(v)+'</textarea></label>'+(f.type==='lines'&&f.matchQty?'<div class="small num muted" id="cnt-'+id+'">입력 '+linesOf(v).length+' / 수량 '+s.qty+'</div>':'');
    if(f.type==='number')return '<label>'+lab+'<input data-in="'+id+'" type="number" inputmode="decimal" value="'+esc(v)+'"'+ph+'></label>';
    if(f.type==='select')return '<label>'+lab+'<select data-in="'+id+'"><option value="">'+esc(f.placeholder||'선택하세요')+'</option>'+(f.options||[]).map(function(o){return '<option'+(v===o?' selected':'')+'>'+esc(o)+'</option>'}).join('')+'</select></label>';
    if(f.type==='radio')return '<div><div class="small" style="font-weight:500;margin-bottom:.4rem">'+lab+'</div><div class="radios">'+(f.options||[]).map(function(o){return '<label><input type="radio" name="r-'+id+'" data-in="'+id+'" value="'+esc(o)+'"'+(v===o?' checked':'')+'>'+esc(o)+'</label>'}).join('')+'</div></div>';
    if(f.type==='checkbox')return '<label class="check"><input type="checkbox" data-in="'+id+'"'+(v==='Y'?' checked':'')+'>'+esc(f.label)+(f.required?'':' <span class="muted small">선택</span>')+'</label>';
    return '<label>'+lab+'<input data-in="'+id+'" value="'+esc(v)+'"'+ph+'></label>';
  }).join('');
  var disc=u<p.price?Math.round((1-u/p.price)*100):0;
  var pts=(p.pointRate>0&&p.type!=='credit')?Math.floor(u*p.pointRate/100):0;
  var rs=(ST.reviews||[]).filter(function(r){return r.pid===pid});
  var qs=(ST.pqa||[]).filter(function(q){return q.pid===pid});
  var avg=rs.length?(rs.reduce(function(a,r){return a+(Number(r.rating)||0)},0)/rs.length):0;
  var tabs=[['info','상세정보'],['rv','구매평 '+rs.length],['qa','Q&A '+qs.length]];
  var th='<div class="chips tabs" style="margin-top:3rem">'+tabs.map(function(t){return '<button type="button" data-act="dt" data-v="'+t[0]+'" aria-pressed="'+(ST.dtab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>';
  var content='';
  if(ST.dtab==='rv'){
    var bought=ST.acct&&myOrders().some(function(o){return o.status!=='canceled'&&o.items.some(function(i){return i.pid===pid})});
    content=(rs.length?'<p class="small muted" style="margin-bottom:.8rem"><span class="stars">'+'★'.repeat(Math.round(avg))+'☆'.repeat(5-Math.round(avg))+'</span> 평균 '+avg.toFixed(1)+' · '+rs.length+'개</p>':'')
     +rs.slice().sort(byAtDesc).map(function(r){var mine=ST.acct&&r.uid===ST.acct.id;return '<article class="card ord"><div class="ord-head"><span><span class="stars">'+'★'.repeat(Number(r.rating)||0)+'☆'.repeat(5-(Number(r.rating)||0))+'</span> <span class="small muted">'+esc(mask(r.name))+' · '+esc((r.at||'').slice(0,10))+'</span></div>'+((ST.admin||mine)?'<button class="btn danger sm" data-act="rv-del" data-id="'+esc(r._id)+'">삭제</button>':'')+'</div><p style="white-space:pre-wrap">'+esc(r.text)+'</p></article>'}).join('')
     +(rs.length?'':'<p class="muted">아직 구매평이 없습니다.</p>')
     +(bought?'<div class="card" style="margin-top:1rem"><h3>구매평 쓰기</h3><div class="form"><label>별점<select id="rvRating"><option value="5">★★★★★ 5점</option><option value="4">★★★★ 4점</option><option value="3">★★★ 3점</option><option value="2">★★ 2점</option><option value="1">★ 1점</option></select></label><label>내용<textarea id="rvText" style="font-family:var(--font)"></textarea></label><div><button class="btn sm" data-act="rv-add" data-id="'+esc(pid)+'">등록</button></div></div></div>':'<p class="small muted" style="margin-top:1rem">구매평은 이 서비스를 주문한 뒤 쓸 수 있습니다.</p>');
  }else if(ST.dtab==='qa'){
    content=qs.slice().sort(byAtDesc).map(function(q){var r=(ST.qrep||{})[q._id];return '<article class="card ord"><div class="ord-head"><span class="small muted">'+esc(mask(q.name))+' · '+esc((q.at||'').slice(0,10))+'</span>'+(r?'<span class="chip ok">답변 완료</span>':'<span class="chip warn">답변 대기</span>')+'</div><p style="white-space:pre-wrap">'+esc(q.text)+'</p>'+(r?'<div class="reply"><div class="small muted">관리자 답변</div><p style="white-space:pre-wrap">'+esc(r.text)+'</p></div>':'')+(ST.admin?'<div class="form" data-qid="'+esc(q._id)+'"><label>답변<textarea data-f="qreply" style="font-family:var(--font)">'+esc(r?r.text:'')+'</textarea></label><div class="row"><button class="btn sm" data-act="qa-reply">답변 저장</button><button class="btn danger sm" data-act="qa-del" data-id="'+esc(q._id)+'">질문 삭제</button></div></div>':'')+'</article>'}).join('')
     +(qs.length?'':'<p class="muted">등록된 질문이 없습니다.</p>')
     +(ST.acct?'<div class="card" style="margin-top:1rem"><h3>질문하기</h3><div class="form"><label>내용<textarea id="qaText" style="font-family:var(--font)"></textarea></label><div><button class="btn sm" data-act="qa-add" data-id="'+esc(pid)+'">등록</button></div></div></div>':'<p class="small muted" style="margin-top:1rem"><a href="#login">로그인</a> 후 질문할 수 있습니다.</p>');
  }else{
    var bl=(p.detail||[]).map(function(b){return '<div class="blk">'+renderBlock(b)+'</div>'}).join('');
    content=bl||'<p class="muted">등록된 상세 설명이 없습니다.</p>';
  }
  var editing=!!s.editLid;
  var lk=(ST.likes||[]).filter(function(x){return x.pid===pid});var mine=!!(ST.acct&&lk.some(function(x){return x.uid===ST.acct.id}));
  var likeBtn='<button type="button" class="btn ghost" data-act="like" data-id="'+esc(pid)+'" aria-pressed="'+mine+'" aria-label="찜">'+(mine?'♥':'♡')+' '+lk.length+'</button>';
  var btns=p.soldout?'<button class="btn" disabled>품절</button>':(editing?'<button class="btn" data-act="item-save" data-id="'+esc(pid)+'">수정 저장</button><button class="btn ghost" data-act="item-cancel">취소</button>':'<button class="btn" data-act="item-buy" data-id="'+esc(pid)+'">구매하기</button><button class="btn ghost" data-act="item-cart" data-id="'+esc(pid)+'">장바구니</button>');
  return '<nav class="crumb muted"><a href="#home">Home</a> › <a href="#services">서비스</a> › '+esc(CATS[p.cat]||'기타')+'</nav>'
   +'<div class="itemtop">'+gal+'<div class="buy"><div class="chips">'+(p.best?'<span class="chip accent">BEST</span>':'')+(disc?'<span class="chip bad">SALE</span>':'')+(p.hidden?'<span class="chip warn">숨김 상품</span>':'')+'</div>'
   +'<h1 class="ph" style="margin:.4rem 0 .6rem;font-size:clamp(1.8rem,4.5vw,2.6rem)">'+esc(p.name)+'</h1>'+(p.desc?'<p class="muted">'+esc(p.desc)+'</p>':'')
   +'<div class="price2" style="margin-block:1rem"><span class="now num">'+won(u)+'</span>'+(u<p.price?' <s class="num">'+won(p.price)+'</s><span class="off">'+disc+'%</span>':'')+' <span class="muted small">/ '+esc(p.unit||'건')+'</span>'+(pts?'<div class="small muted">구매 시 '+won(pts)+' 적립 예정</div>':'')+'</div>'
   +'<div class="optbox">'+fh+og
   +(p.hideQty?'':'<div><div class="small" style="font-weight:500;margin-bottom:.35rem">수량</div><div class="qty" style="width:max-content"><button type="button" data-act="sq" data-d="-1" aria-label="수량 줄이기">−</button><span class="num" id="itemQty">'+s.qty+'</span><button type="button" data-act="sq" data-d="1" aria-label="수량 늘리기">+</button></div></div>')
   +(p.minQty||p.maxQty?'<p class="small muted">'+(p.minQty?'최소 '+p.minQty:'')+(p.minQty&&p.maxQty?' · ':'')+(p.maxQty?'최대 '+p.maxQty:'')+'</p>':'')
   +'<div class="totalbar"><span class="muted">총 금액</span><b class="num" id="itemTotal">'+won(selTotal(p))+'</b></div>'
   +(ST.ierr?'<p class="err" role="alert">'+esc(ST.ierr)+'</p>':'')+'<div class="row">'+btns+likeBtn+'</div></div></div></div>'
   +th+'<div class="detail">'+content+'</div>';
}
var PW_LABEL={card:'신용카드',vbank:'가상계좌',rt:'실시간계좌이체',spay:'삼성페이'};
function payHtml(){
  var w=ST.paywin;var opt=function(a){return a.map(function(x){return '<option>'+x+'</option>'}).join('')};
  var head='<div class="row" style="justify-content:space-between"><strong style="font-size:1.1rem">결제창</strong><span class="chip warn">테스트</span></div><div class="small muted">'+esc(w.names)+'</div><div class="totalbar"><span class="muted">'+esc(PW_LABEL[w.method]||'')+' 결제금액</span><b class="num">'+won(w.amount)+'</b></div>';
  if(w.step===2)return '<div class="mback"></div><div class="mbox" role="dialog" aria-modal="true" aria-label="결제창">'+head+'<p style="text-align:center;padding:1.2rem 0" class="muted">결제 승인을 요청하는 중입니다...</p></div>';
  if(w.step===3)return '<div class="mback"></div><div class="mbox" role="dialog" aria-modal="true" aria-label="결제창">'+head+'<p style="font-weight:600">결제가 진행되지 않았습니다.</p><p class="small muted">테스트 결제창입니다. 결제대행사(PG)가 연결되지 않아 실제 결제와 주문 접수는 이루어지지 않았습니다. 카드번호 등은 입력받지 않았습니다.</p><div class="row"><button class="btn" data-act="pw-bank">무통장입금으로 결제</button><button class="btn ghost" data-act="pw-close">닫기</button></div></div>';
  var body=w.method==='card'?'<label>카드사<select>'+opt(['삼성카드','현대카드','KB국민카드','신한카드','롯데카드','하나카드','우리카드','NH농협카드','BC카드'])+'</select></label><label>할부<select>'+opt(['일시불','2개월','3개월','6개월','12개월'])+'</select></label>'
   :w.method==='rt'?'<label>은행 선택<select>'+opt(['국민은행','신한은행','우리은행','하나은행','농협은행','기업은행','카카오뱅크','토스뱅크'])+'</select></label>'
   :w.method==='vbank'?'<label>입금 은행<select>'+opt(['국민은행','신한은행','우리은행','하나은행','농협은행'])+'</select></label><label>현금영수증<select>'+opt(['발급 안 함','소득공제','지출증빙'])+'</select></label>'
   :'<p class="muted small">삼성페이 앱에서 결제를 승인하는 화면입니다.</p>';
  return '<div class="mback" data-act="pw-close"></div><div class="mbox" role="dialog" aria-modal="true" aria-label="결제창">'+head+'<div class="form" style="margin:0">'+body+'</div><div class="row"><button class="btn" data-act="pw-next">결제 진행</button><button class="btn ghost" data-act="pw-close">취소</button></div></div>';
}
function renderModal(){
  var el=document.getElementById('modalSlot');if(!el)return;var m=ST.modal;
  if(ST.paywin){el.innerHTML=payHtml();return}
  if(!m){el.innerHTML='';return}
  var msg=m.kind==='buy'?'장바구니에 다른 상품이 있습니다. 함께 주문할까요?':'선택하신 상품을 장바구니에 담았습니다.';
  var btns=m.kind==='buy'?'<button class="btn" data-act="m-cart">함께 주문</button><button class="btn ghost" data-act="m-only">이 상품만 구매</button>':'<button class="btn" data-act="m-cart">장바구니</button><button class="btn ghost" data-act="m-close">계속 쇼핑</button>';
  el.innerHTML='<div class="mback" data-act="m-close"></div><div class="mbox" role="dialog" aria-modal="true" aria-label="알림"><p style="font-weight:600;font-size:1.05rem">'+msg+'</p><div class="row">'+btns+'</div></div>';
}
