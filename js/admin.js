/* 관리자 화면 (주문, 회원, 상품 편집기, 공지, 설정) */
"use strict";
/* ---------- admin ---------- */
function allOrdersFlat(){var out=[];(ST.allOrders||[]).forEach(function(d){(d.list||[]).forEach(function(o){var s=((ST.allFulfil[d._id]||{}).orders||{})[o.id]||{};out.push(Object.assign({},o,{uid:d._id,status:s.status||'pending',memo:s.memo||''}))})});
  return out.sort(function(a,b){return a.createdAt<b.createdAt?1:-1})}
function pageAdmin(){
  if(!ST.admin)return '<section class="empty"><h1 class="ph" style="margin:0">관리자.</h1><p class="muted">관리자 계정으로 로그인하면 사용할 수 있습니다.</p><a class="btn" href="#login">로그인</a></section>';
  var all=allOrdersFlat();var pend=all.filter(function(o){return o.status==='pending'}).length;
  var iqOpen=(ST.adminInq||[]).filter(function(q){return !(ST.replies||{})[q._id]}).length;
  var tabs=[['orders','주문'+(pend?' ('+pend+')':'')],['cust','계정·적립금'],['prod','상품'],['notice','공지'],['inq','문의'+(iqOpen?' ('+iqOpen+')':'')],['set','설정']];
  var th='<div class="chips tabs">'+tabs.map(function(t){return '<button type="button" data-act="atab" data-v="'+t[0]+'" aria-pressed="'+(ST.atab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>';
  var body='';
  if(ST.atab==='orders'){
    var os=ST.afilter==='all'?all:all.filter(function(o){return o.status===ST.afilter});
    var todayS=new Date().toLocaleDateString('ko-KR');
    var todayN=all.filter(function(o){return new Date(o.createdAt).toLocaleDateString('ko-KR')===todayS}).length;
    var working=all.filter(function(o){return o.status==='working'}).length;
    var sales=all.filter(function(o){return ['paid','working','done'].indexOf(o.status)>=0}).reduce(function(s,o){return s+o.total},0);
    var fo=['all'].concat(Object.keys(STATUS)).map(function(k){return '<option value="'+k+'"'+(ST.afilter===k?' selected':'')+'>'+(k==='all'?'전체 상태':STATUS[k][0])+'</option>'}).join('');
    body='<div class="dash"><div><span class="small muted">입금대기</span><b class="num">'+pend+'건</b></div><div><span class="small muted">처리중</span><b class="num">'+working+'건</b></div><div><span class="small muted">오늘 주문</span><b class="num">'+todayN+'건</b></div><div><span class="small muted">결제 확인 금액</span><b class="num">'+won(sales)+'</b></div></div>'
     +'<div class="row" style="justify-content:space-between;margin-bottom:1rem"><input id="aSearch" type="search" placeholder="주문번호, 이름, 연락처, 마켓 주문번호 검색" aria-label="주문 검색" style="max-width:24rem"><div class="row"><select data-afilter style="width:auto">'+fo+'</select><button class="btn ghost sm" data-act="a-csv">CSV 내보내기</button></div></div>'
     +(ST.allOrders===null?'<p class="muted">불러오는 중...</p>':'')
     +os.map(function(o){
       var so=Object.keys(STATUS).map(function(k){return '<option value="'+k+'"'+(o.status===k?' selected':'')+'>'+STATUS[k][0]+'</option>'}).join('');
       var hasCredit=o.items.some(function(i){return i.type==='credit'});
       var hay=(o.no+' '+o.uid+' '+(o.contact&&o.contact.name)+' '+(o.contact&&o.contact.phone)+' '+o.items.map(function(i){return (i.refs||[]).join(' ')}).join(' ')).toLowerCase();
       var items=o.items.map(function(i){return '<li>'+esc(i.name)+' × '+i.qty+itemDetail(i)+'</li>'}).join('');
       return '<article class="card ord" data-uid="'+esc(o.uid)+'" data-oid="'+esc(o.id)+'" data-hay="'+esc(hay)+'"><div class="ord-head"><div><strong class="num">'+esc(o.no)+'</strong> <span class="muted small">'+dt(o.createdAt)+' · '+esc(o.uid)+'</span></div><div class="row">'+(o.cancelRequested&&o.status!=='canceled'?'<span class="chip warn">취소 요청</span>':'')+chip(o.status)+'</div></div>'
        +'<div class="small">'+esc(o.contact&&o.contact.name)+' · <span class="num">'+esc(o.contact&&o.contact.phone)+'</span>'+(o.contact&&o.contact.addr?'<br>'+esc(o.contact.addr):'')+'</div>'
        +'<ul>'+items+'</ul><div class="row" style="justify-content:space-between"><span class="small muted">'+(o.pay==='points'?'적립금 결제':'무통장입금 · '+esc(o.depositor||''))+'</span><strong class="num">'+won(o.total)+'</strong></div>'
        +'<div class="fgrid"><label>상태<select data-f="status">'+so+'</select></label><label>관리자 메모<input data-f="memo" value="'+esc(o.memo)+'"></label></div>'
        +'<div class="row"><button class="btn sm" data-act="a-save">저장</button>'+(o.status==='pending'?'<button class="btn ghost sm" data-act="a-pay">결제 확인</button>':'')+((o.status==='paid'||o.status==='working')&&!hasCredit?'<button class="btn danger sm" data-act="a-refund">취소·적립금 환불</button>':'')+'</div></article>'}).join('')
     +(os.length?'':'<p class="muted">해당하는 주문이 없습니다.</p>');
  }else if(ST.atab==='cust'){
    var cs=ST.accounts||[];
    body='<div class="card" style="margin-bottom:1rem"><h2 style="font-size:1.3rem;font-weight:600">계정 추가</h2><div class="form" id="acForm"><div class="fgrid"><label>아이디<input data-k="id" placeholder="영문 소문자·숫자 4~20자"></label><label>이름<input data-k="name"></label><label>연락처<input data-k="phone"></label><label>비밀번호<input data-k="pw" type="password" placeholder="6자 이상"></label><label>역할<select data-k="role"><option value="buyer">주문자</option><option value="admin">관리자</option></select></label></div><div><button class="btn sm" data-act="ac-new">계정 만들기</button></div></div></div>'
     +'<div class="sechead"><h2>계정 '+cs.length+'개</h2></div>'+(ST.accounts===null?'<p class="muted">불러오는 중...</p>':'')
     +cs.map(function(d){var w=ST.allWallet[d._id]||{};var b=w.balance||0;var od=(ST.allOrders||[]).find(function(x){return x._id===d._id});
      var lg=(w.log||[]).slice(0,3).map(function(l){return '<li class="small muted">'+esc(l.reason)+' · '+(l.delta>0?'+':'')+won(l.delta)+' · '+dt(l.at)+'</li>'}).join('');
      return '<article class="card ord" data-uid="'+esc(d._id)+'"><div class="ord-head"><div><strong>'+esc(d.name||'이름 없음')+'</strong> <span class="num small muted">'+esc(d._id)+' · '+esc(d.phone||'')+'</span></div><div class="row"><span class="chip '+(d.role==='admin'?'accent':'ok')+'">'+(d.role==='admin'?'관리자':'주문자')+'</span><span class="small muted">주문 '+(od&&od.list?od.list.length:0)+'건</span></div></div>'
       +'<div class="balance"><div><div class="small muted">적립금</div><strong style="font-size:1.5rem" class="num">'+won(b)+'</strong></div><div class="row"><input data-f="amt" type="number" min="1" placeholder="금액" style="width:8rem" inputmode="numeric"><button class="btn sm" data-act="w-add">충전</button><button class="btn danger sm" data-act="w-sub">차감</button></div></div>'
       +(lg?'<ul style="margin:0;padding-left:1.1rem">'+lg+'</ul>':'')
       +'<div class="row">'+(SB?'':'<input data-f="npw" type="password" placeholder="새 비밀번호" style="width:11rem"><button class="btn ghost sm" data-act="ac-pw">비밀번호 변경</button>')+(ST.acct&&ST.acct.id===d._id?'':'<button class="btn danger sm" data-act="ac-del">계정 삭제</button>')+'</div></article>'}).join('');
  }else if(ST.atab==='prod'){
    body=pageProdAdmin(!(ST.products&&ST.products.length));
  }else if(ST.atab==='notice'){
    body='<div class="card" style="margin-bottom:1rem"><h2 style="font-size:1.3rem;font-weight:600">공지 작성</h2><div class="form"><label>제목<input id="nTitle"></label><label>내용<textarea id="nBody" style="font-family:var(--font)"></textarea></label><div><button class="btn sm" data-act="n-add">등록</button></div></div></div>'
     +(ST.notices||[]).map(function(n){return '<article class="card ord"><div class="ord-head"><strong>'+esc(n.title)+'</strong><span class="num small muted">'+esc((n.at||'').slice(0,10))+'</span></div><p class="small muted" style="white-space:pre-wrap">'+esc(n.body)+'</p><div><button class="btn danger sm" data-act="n-del" data-id="'+esc(n.id)+'">삭제</button></div></article>'}).join('');
  }else if(ST.atab==='inq'){
    var qs=(ST.adminInq||[]).slice().sort(function(a,b){return (a.at||'')<(b.at||'')?1:-1});
    body='<div class="sechead"><h2>1:1 문의 '+qs.length+'건</h2></div>'+(ST.adminInq===null?'<p class="muted">불러오는 중...</p>':'')
     +qs.map(function(q){var r=(ST.replies||{})[q._id];
       return '<article class="card ord" data-qid="'+esc(q._id)+'"><div class="ord-head"><div><strong>'+esc(q.title)+'</strong> <span class="small muted">'+esc(q.name||'')+' · '+esc(q.uid||'')+' · '+dt(q.at)+'</span></div>'+(r?'<span class="chip ok">답변 완료</span>':'<span class="chip warn">답변 대기</span>')+'</div>'
        +'<p style="white-space:pre-wrap">'+esc(q.body)+'</p><label>답변<textarea data-f="reply" style="font-family:var(--font)">'+esc(r?r.text:'')+'</textarea></label><div><button class="btn sm" data-act="iq-reply">답변 등록</button></div></article>'}).join('')
     +(qs.length?'':'<p class="muted">접수된 문의가 없습니다.</p>');
  }else{
    var s=ST.settings||{};var F=[['bank','입금 은행'],['account','계좌번호'],['holder','예금주'],['bizName','상호명'],['ceo','대표자'],['bizNo','사업자등록번호'],['mailOrder','통신판매업 신고번호'],['bizAddr','사업장 주소'],['tel','연락처'],['hours','운영 시간']];
    var L=[['terms','이용약관'],['privacy','개인정보 처리방침'],['refund','환불 규정']];
    body='<div class="card"><h2 style="font-size:1.3rem;font-weight:600">사이트 설정</h2><div class="form" id="setForm"><div class="fgrid">'+F.map(function(x){return '<label>'+x[1]+'<input data-k="'+x[0]+'" value="'+esc(s[x[0]])+'"></label>'}).join('')+'</div>'
     +L.map(function(x){return '<label>'+x[1]+' <span class="muted small">고객에게 그대로 표시됩니다</span><textarea data-k="'+x[0]+'" style="font-family:var(--font);min-height:8rem">'+esc(s[x[0]])+'</textarea></label>'}).join('')
     +'<div><button class="btn sm" data-act="s-save">저장</button></div></div></div>';
  }
  return '<h1 class="ph">관리자. <span>주문과 계정을 관리합니다.</span></h1>'+th+body;
}
function pageProdAdmin(lock){
  if(ST.pedit&&ST.pdraft)return prodEditor(ST.pdraft);
  var empty=lock;
  return '<div class="sechead"><h2>상품</h2><button class="btn ghost sm" data-act="pe-new"'+(lock?' disabled':'')+'>상품 추가</button></div>'
   +(empty?'<div class="demo" style="margin-bottom:1rem">저장소에 상품이 없어 기본 상품을 보여주고 있습니다. 편집하기 전에 먼저 등록하세요.<div><button class="btn sm" data-act="p-seed">기본 상품 등록</button></div></div>':'')
   +products().map(function(p){var id=bid((p.images||[])[0]);
     return '<article class="card ord" data-pid="'+esc(p.id)+'"><div class="ord-head"><div class="row">'+(id?'<img src="'+blobUrl(id)+'" alt="" style="width:3.2rem;height:3.2rem;object-fit:cover;border-radius:10px">':'')
      +'<div><strong>'+esc(p.name)+'</strong><div class="small muted num">'+esc(CATS[p.cat]||'')+' · '+won(unit(p))+' · 옵션 '+getOpts(p).length+' · 입력항목 '+getFields(p).length+' · 상세 '+((p.detail||[]).length)+'블록</div></div></div>'
      +'<div class="row">'+(p.best?'<span class="chip accent">BEST</span>':'')+(p.soldout?'<span class="chip bad">품절</span>':'')+(p.hidden?'<span class="chip warn">숨김</span>':'')+'</div></div>'
      +'<div class="row"><button class="btn sm" data-act="pe-edit" data-id="'+esc(p.id)+'"'+(lock?' disabled':'')+'>편집</button><a class="btn ghost sm" href="#item-'+esc(p.id)+'">상세 보기</a>'
      +(ST.pdelc===p.id?'<button class="btn danger sm" data-act="p-del" data-id="'+esc(p.id)+'">정말 삭제</button><button class="btn ghost sm" data-act="p-delc" data-id="">취소</button>':'<button class="btn danger sm" data-act="p-delc" data-id="'+esc(p.id)+'"'+(lock?' disabled':'')+'>삭제</button>')+'</div></article>'}).join('');
}
function dpI(path,v,extra){return ' data-dp="'+path+'" value="'+esc(v==null?'':v)+'"'+(extra||'')}
function prodEditor(d){
  var cats=['shopee','qoo10','etc'].map(function(c){return '<option value="'+c+'"'+(d.cat===c?' selected':'')+'>'+CATS[c]+'</option>'}).join('');
  var types=Object.keys(TYPES).map(function(t){return '<option value="'+t+'"'+(d.type===t?' selected':'')+'>'+TYPES[t]+'</option>'}).join('');
  var ck=function(path,label,v){return '<label class="check"><input type="checkbox" data-dp="'+path+'" data-dt="bool"'+(v?' checked':'')+'>'+label+'</label>'};
  var h='<div class="sechead"><h2>'+(ST.pnew?'새 상품':'상품 편집')+'</h2><div class="row"><button class="btn" data-act="pe-save"'+(ST.busy?' disabled':'')+'>저장</button><button class="btn ghost" data-act="pe-cancel">목록으로</button><a class="btn ghost" href="#item-'+esc(d.id)+'">미리보기</a></div></div>';
  h+='<p class="small muted" style="margin-bottom:1rem">미리보기는 저장한 내용 기준입니다. 숨김 상품도 관리자는 볼 수 있습니다.</p>';
  h+='<article class="card ord"><h3>기본 정보</h3><div class="fgrid"><label>이름<input'+dpI('name',d.name)+'></label><label>분류<select data-dp="cat">'+cats+'</select></label><label>유형<select data-dp="type">'+types+'</select></label>'
   +'<label>정상가<input type="number" min="0" data-dt="num"'+dpI('price',d.price)+'></label><label>할인가 <span class="muted small">0이면 없음</span><input type="number" min="0" data-dt="num"'+dpI('sale',d.sale||0)+'></label>'
   +'<label>적립률 % <span class="muted small">구매 시</span><input type="number" min="0" step="0.1" data-dt="num"'+dpI('pointRate',d.pointRate||0)+'></label><label>충전 금액 <span class="muted small">충전형만</span><input type="number" min="0" data-dt="num"'+dpI('credit',d.credit||0)+'></label>'
   +'<label>단위<input'+dpI('unit',d.unit||'건')+'></label><label>정렬 순서<input type="number" data-dt="num"'+dpI('order',d.order||0)+'></label><label>최소 수량<input type="number" min="0" data-dt="num"'+dpI('minQty',d.minQty||0)+'></label><label>최대 수량<input type="number" min="0" data-dt="num"'+dpI('maxQty',d.maxQty||0)+'></label></div>'
   +'<label>짧은 설명<input'+dpI('desc',d.desc)+'></label>'
   +'<div class="row">'+ck('best','BEST',d.best)+ck('soldout','품절',d.soldout)+ck('hidden','숨김',d.hidden)+ck('needAddr','배송지 필요',d.needAddr)+ck('hideQty','수량 선택 숨김',d.hideQty)+'</div></article>';
  // images
  h+='<article class="card ord"><h3>상품 이미지</h3><p class="small muted">첫 번째 이미지가 목록과 상세 대표 이미지로 쓰입니다.</p><div class="ths" style="margin:0">'
   +(d.images||[]).map(function(id,i){return '<figure style="margin:0;display:grid;gap:.3rem;justify-items:center"><img src="'+blobUrl(bid(id))+'" alt="" style="width:6rem;height:6rem;object-fit:cover;border-radius:12px"><div class="row" style="gap:.3rem">'+(i?'<button class="btn ghost sm" data-act="pe-img-first" data-i="'+i+'">대표</button>':'<span class="chip accent">대표</span>')+'<button class="btn danger sm" data-act="pe-img-del" data-i="'+i+'">삭제</button></div></figure>'}).join('')+'</div>'
   +'<label>이미지 추가<input type="file" accept="image/*" multiple data-up="gallery"></label>'+(ST.upmsg?'<p class="small muted">'+esc(ST.upmsg)+'</p>':'')+'</article>';
  // options
  var gs=getOpts(d);
  h+='<article class="card ord"><div class="ord-head"><h3>옵션</h3><button class="btn ghost sm" data-act="pe-add" data-k="options">옵션 그룹 추가</button></div><p class="small muted">구매자가 고르는 선택지입니다. 추가금이 있으면 단가에 더해집니다.</p>'
   +gs.map(function(g,i){return '<div class="card" style="background:var(--bg)"><div class="fgrid"><label>옵션 이름<input'+dpI('options.'+i+'.name',g.name)+'></label><label>선택 안내 문구<input'+dpI('options.'+i+'.placeholder',g.placeholder)+'></label></div><div class="row">'+ck('options.'+i+'.required','필수 선택',g.required)+'</div>'
     +g.choices.map(function(c,j){return '<div class="row"><input style="flex:2;min-width:8rem" placeholder="선택지 이름"'+dpI('options.'+i+'.choices.'+j+'.label',c.label)+'><input style="flex:1;min-width:6rem" type="number" placeholder="추가금" data-dt="num"'+dpI('options.'+i+'.choices.'+j+'.add',c.add||0)+'><button class="btn danger sm" data-act="pe-rm" data-k="options.'+i+'.choices" data-i="'+j+'">삭제</button></div>'}).join('')
     +'<div class="row"><button class="btn ghost sm" data-act="pe-addchoice" data-i="'+i+'">선택지 추가</button><button class="btn ghost sm" data-act="pe-up" data-k="options" data-i="'+i+'">↑</button><button class="btn ghost sm" data-act="pe-down" data-k="options" data-i="'+i+'">↓</button><button class="btn danger sm" data-act="pe-rm" data-k="options" data-i="'+i+'">그룹 삭제</button></div></div>'}).join('')
   +(gs.length?'':'<p class="muted small">옵션이 없습니다.</p>')+'</article>';
  // fields
  var FT={file:'파일 업로드',text:'한 줄',textarea:'여러 줄',lines:'줄 목록(주문번호)',number:'숫자',select:'드롭다운',radio:'라디오',checkbox:'체크박스'};
  var custom=Array.isArray(d.fields);var fs=getFields(d);
  h+='<article class="card ord"><div class="ord-head"><h3>주문 입력 항목</h3>'+(custom?'<div class="row"><button class="btn ghost sm" data-act="pe-add" data-k="fields">항목 추가</button><button class="btn ghost sm" data-act="pe-fields-reset">기본값으로</button></div>':'<button class="btn ghost sm" data-act="pe-fields-init">직접 편집하기</button>')+'</div>'
   +(custom?'':'<p class="small muted">유형에 따른 기본 항목을 쓰는 중입니다: '+(fs.map(function(f){return esc(f.label)}).join(', ')||'없음')+'</p>')
   +(custom?fs.map(function(f,i){var so=(f.type==='select'||f.type==='radio');
     return '<div class="card" style="background:var(--bg)"><div class="fgrid"><label>항목 이름<input'+dpI('fields.'+i+'.label',f.label)+'></label><label>형식<select data-dp="fields.'+i+'.type" data-rr="1">'+Object.keys(FT).map(function(k){return '<option value="'+k+'"'+(f.type===k?' selected':'')+'>'+FT[k]+'</option>'}).join('')+'</select></label>'
      +'<label>안내 문구<input'+dpI('fields.'+i+'.help',f.help)+'></label><label>예시(placeholder)<input'+dpI('fields.'+i+'.placeholder',f.placeholder)+'></label></div>'
      +(so?'<label>선택지 <span class="muted small">쉼표로 구분</span><input data-dp="fields.'+i+'.options" data-dt="list" value="'+esc((f.options||[]).join(', '))+'"></label>':'')
      +'<div class="row">'+ck('fields.'+i+'.required','필수',f.required)+(f.type==='lines'?ck('fields.'+i+'.matchQty','수량과 같은 개수',f.matchQty):'')+((f.type==='text'||f.type==='lines')?ck('fields.'+i+'.unique','중복 방지(번호)',f.unique):'')+'<label class="check"><input type="checkbox" data-dp="fields.'+i+'.stage" data-dt="stage"'+(f.stage==='order'?' checked':'')+'>주문 단계에서 입력</label>'
      +'<button class="btn ghost sm" data-act="pe-up" data-k="fields" data-i="'+i+'">↑</button><button class="btn ghost sm" data-act="pe-down" data-k="fields" data-i="'+i+'">↓</button><button class="btn danger sm" data-act="pe-rm" data-k="fields" data-i="'+i+'">삭제</button></div></div>'}).join(''):'')+'</article>';
  // detail
  var BT={h:'제목',p:'본문',note:'안내 박스',img:'이미지'};
  h+='<article class="card ord"><div class="ord-head"><h3>상세페이지</h3><div class="row"><button class="btn ghost sm" data-act="pe-add" data-k="detail" data-t="h">+ 제목</button><button class="btn ghost sm" data-act="pe-add" data-k="detail" data-t="p">+ 본문</button><button class="btn ghost sm" data-act="pe-add" data-k="detail" data-t="note">+ 안내</button></div></div><p class="small muted">위에서 아래 순서로 상세정보 탭에 보입니다.</p>'
   +(d.detail||[]).map(function(b,i){return '<div class="card" style="background:var(--bg)"><div class="ord-head"><span class="chip accent">'+BT[b.t]+'</span><div class="row"><button class="btn ghost sm" data-act="pe-up" data-k="detail" data-i="'+i+'">↑</button><button class="btn ghost sm" data-act="pe-down" data-k="detail" data-i="'+i+'">↓</button><button class="btn danger sm" data-act="pe-rm" data-k="detail" data-i="'+i+'">삭제</button></div></div>'
     +(b.t==='img'?(b.img?'<img src="'+blobUrl(bid(b.img))+'" alt="" style="max-width:100%;border-radius:12px;max-height:20rem;object-fit:contain">':'<p class="muted small">이미지를 올려 주세요.</p>')+'<label>이미지 '+(b.img?'교체':'선택')+'<input type="file" accept="image/*" data-up="block" data-i="'+i+'"></label>'
        :(b.t==='h'?'<input data-dp="detail.'+i+'.text" value="'+esc(b.text)+'">':'<textarea data-dp="detail.'+i+'.text" style="min-height:6rem;font-family:var(--font)">'+esc(b.text)+'</textarea>'))+'</div>'}).join('')
   +'<label>이미지 블록 추가<input type="file" accept="image/*" multiple data-up="newblock"></label></article>';
  h+='<div class="row"><button class="btn" data-act="pe-save"'+(ST.busy?' disabled':'')+'>저장</button><button class="btn ghost" data-act="pe-cancel">목록으로</button></div>';
  return h;
}
