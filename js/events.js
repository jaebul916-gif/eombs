/* 클릭/입력/변경 이벤트 처리 */
"use strict";
/* ---------- events ---------- */
document.addEventListener('click',function(e){var a=e.target.closest('a[data-auth]');if(!a||ST.acct)return;e.preventDefault();
  ST.next=a.getAttribute('href');ST.pendingAdd=null;ST.loginMsg='로그인 후 이용할 수 있습니다.';ST.ltab='in';location.hash='#login';if(ST.route==='login')render()});
document.addEventListener('click',async function(e){
  var t=e.target.closest('[data-act]');if(!t)return;var a=t.dataset.act;var id=t.dataset.id;
  try{
  if(a==='add'){if(needLogin({id:id,qty:1}))return;addToCart(id,1)}
  else if(a==='cat'){ST.cat=t.dataset.v;render()}
  else if(a==='rm'){ST.cart=ST.cart.filter(function(c){return c.lid!==id});if(ST.only===id)ST.only='';saveCart();render()}
  else if(a==='clear'){ST.cart=[];ST.only='';saveCart();render()}
  else if(a==='qty'){var l=ST.cart.find(function(c){return c.lid===id});if(l){l.qty=Math.max(1,Math.min(999,l.qty+parseInt(t.dataset.d,10)));saveCart();render()}}
  else if(a==='order'){if(!ST.busy)await placeOrder()}
  else if(a==='copy'){try{await navigator.clipboard.writeText(t.dataset.v);toast('복사했습니다')}catch(e2){toast('복사하지 못했습니다. 직접 선택해 복사해 주세요.')}}
  else if(a==='of'){ST.ofilter=t.dataset.v;render()}
  else if(a==='ltab'){ST.ltab=t.dataset.v;ST.lerr='';render()}
  else if(a==='login'){if(!ST.busy)await doLogin()}
  else if(a==='signup'){if(!ST.busy)await doSignup()}
  else if(a==='logout'){ST.form={pay:'bank',name:'',phone:'',dep:'',addr:'',agree:false,pts:0};ST.cart=[];ST.sel=null;ST.only='';saveCart();if(SB){try{SB.auth.signOut()}catch(e){}}setAcct(null);toast('로그아웃했습니다');location.hash='#home'}
  else if(a==='me-save'){var nm=document.getElementById('meName').value.trim(),ph=document.getElementById('mePhone').value.trim();if(!nm||!ph){toast('이름과 연락처를 입력해 주세요');return}
    await ST.db.doc('accounts/'+ST.acct.id).update({name:nm,phone:ph});ST.acct.name=nm;ST.acct.phone=ph;toast('내 정보를 저장했습니다');render()}
  else if(a==='pw-save'){var po=document.getElementById('pwOld').value,pn=document.getElementById('pwNew').value,pn2=document.getElementById('pwNew2').value;
    if(pn.length<6){toast('새 비밀번호는 6자 이상이어야 합니다');return}if(pn!==pn2){toast('새 비밀번호 확인이 맞지 않습니다');return}
    if(SB){var vr=await SB.auth.signInWithPassword({email:sbEmail(ST.acct.id),password:po});if(vr.error){toast('현재 비밀번호가 맞지 않습니다');return}
      var ur=await SB.auth.updateUser({password:pn});if(ur.error){toast('비밀번호를 변경하지 못했습니다');return}}
    else{var ps=await ST.db.doc('accounts/'+ST.acct.id).get();if(!ps.exists||ps.data().pw!==await hashPw(ST.acct.id,po)){toast('현재 비밀번호가 맞지 않습니다');return}
    await ST.db.doc('accounts/'+ST.acct.id).update({pw:await hashPw(ST.acct.id,pn)})}['pwOld','pwNew','pwNew2'].forEach(function(k){document.getElementById(k).value=''});toast('비밀번호를 변경했습니다')}
  else if(a==='iq-add'){var it=document.getElementById('iqTitle').value.trim(),ib=document.getElementById('iqBody').value.trim();if(!it||!ib){toast('제목과 내용을 입력해 주세요');return}
    await ST.db.collection('inquiries').add({uid:ST.acct.id,name:ST.acct.name,title:it,body:ib,at:new Date().toISOString()});document.getElementById('iqTitle').value='';document.getElementById('iqBody').value='';toast('문의를 등록했습니다')}
  else if(a==='cancel-req'&&SB){var cr=await SB.rpc('request_cancel',{p_order:id});if(cr.error)throw cr.error;toast('취소를 요청했습니다')}
  else if(a==='cancel-req'){var list=((ST.myDoc&&ST.myDoc.list)||[]).map(function(o){return o.id===id?Object.assign({},o,{cancelRequested:true}):o});
    await ST.db.doc('orders/'+ST.acct.id).set(Object.assign({},ST.myDoc,{list:list}));toast('취소를 요청했습니다')}
  else if(a==='atab'){ST.atab=t.dataset.v;render()}
  else if(SB&&(a==='a-save'||a==='a-pay'||a==='a-refund')){var cx=t.closest('[data-oid]');var st1=a==='a-save'?cx.querySelector('[data-f=status]').value:(a==='a-pay'?'paid':'canceled');var mm=a==='a-save'?cx.querySelector('[data-f=memo]').value:'';
    if(a==='a-refund')mm='적립금 환불';
    var ur=await SB.rpc('admin_update_order',{p_order:cx.dataset.oid,p_status:st1,p_memo:mm});if(ur.error)throw ur.error;toast(a==='a-save'?'저장했습니다':(a==='a-pay'?'결제를 확인했습니다':'적립금으로 환불했습니다'))}
  else if(SB&&(a==='w-add'||a==='w-sub')){var c3s=t.closest('[data-uid]');var am=parseInt(c3s.querySelector('[data-f=amt]').value,10);if(!am||am<1){toast('금액을 입력해 주세요');return}
    var wr=await SB.rpc('admin_wallet_adjust',{p_login:c3s.dataset.uid,p_delta:a==='w-add'?am:-am,p_reason:'관리자 조정'});if(wr.error)throw wr.error;toast('적립금을 반영했습니다')}
  else if(a==='a-save'){var c=t.closest('[data-oid]');var po2={};po2[c.dataset.oid]={status:c.querySelector('[data-f=status]').value,memo:c.querySelector('[data-f=memo]').value};await setDocMerge('fulfil/'+c.dataset.uid,{orders:po2});toast('저장했습니다')}
  else if(a==='a-pay'){var c2=t.closest('[data-oid]');var uid=c2.dataset.uid;
    var o=allOrdersFlat().find(function(x){return x.id===c2.dataset.oid&&x.uid===uid});if(!o)return;
    var bal=(ST.allWallet[uid]||{}).balance||0;var en=[];
    var ded=o.pay==='points'?o.total:(o.pts||0);if(ded>0){if(bal<ded){toast('적립금 잔액이 부족합니다');return}en.push({delta:-ded,reason:'주문 '+o.no+' 결제'})}
    o.items.forEach(function(i){if(i.type==='credit')en.push({delta:(i.credit||i.price)*i.qty,reason:'적립금 충전 '+o.no})});
    if(en.length)await walletSet(uid,en);
    var pp={};pp[o.id]={status:'paid',paidAt:new Date().toISOString(),memo:o.memo||''};await setDocMerge('fulfil/'+uid,{orders:pp});toast('결제를 확인했습니다')}
  else if(a==='a-refund'){var c8=t.closest('[data-oid]');var uid8=c8.dataset.uid;
    var o8=allOrdersFlat().find(function(x){return x.id===c8.dataset.oid&&x.uid===uid8});if(!o8)return;
    await walletSet(uid8,[{delta:o8.total,reason:'주문 '+o8.no+' 취소 환불'}]);
    var rp={};rp[o8.id]={status:'canceled',memo:((o8.memo||'')+' 적립금 환불').trim()};await setDocMerge('fulfil/'+uid8,{orders:rp});toast('적립금으로 환불했습니다')}
  else if(a==='a-csv'){
    var rows=[['주문번호','주문일시','계정','이름','연락처','상태','결제','금액','서비스','입력 항목','메모']];
    allOrdersFlat().forEach(function(x){rows.push([x.no,x.createdAt,x.uid,x.contact&&x.contact.name,x.contact&&x.contact.phone,(STATUS[x.status]||[x.status])[0],x.pay==='points'?'적립금':'무통장입금',x.total,x.items.map(function(i){return i.name+'×'+i.qty}).join(' / '),x.items.map(function(i){return (i.details||[]).map(function(d){return d.k+': '+String(d.v).replace(/\n/g,' / ')}).join(' | ')||(i.refs||[]).join(' ')}).join(' '),x.memo])});
    var dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null;
    if(!dl){toast('이 화면에서는 파일 저장을 쓸 수 없습니다');return}
    await dl.save({filename:'orders-'+ymd()+'.csv',data:'﻿'+rows.map(function(r){return r.map(csvCell).join(',')}).join('\r\n')});toast('파일을 저장했습니다')}
  else if(a==='w-add'||a==='w-sub'){var c3=t.closest('[data-uid]');var amt=parseInt(c3.querySelector('[data-f=amt]').value,10);if(!amt||amt<1){toast('금액을 입력해 주세요');return}
    await walletSet(c3.dataset.uid,[{delta:a==='w-add'?amt:-amt,reason:'관리자 조정'}]);toast('적립금을 반영했습니다')}
  else if(a==='ac-pw'){var c6=t.closest('[data-uid]');var np=c6.querySelector('[data-f=npw]').value;if(np.length<6){toast('비밀번호는 6자 이상이어야 합니다');return}
    await ST.db.doc('accounts/'+c6.dataset.uid).update({pw:await hashPw(c6.dataset.uid,np)});c6.querySelector('[data-f=npw]').value='';toast('비밀번호를 변경했습니다')}
  else if(a==='ac-del'){var c7=t.closest('[data-uid]');await ST.db.doc('accounts/'+c7.dataset.uid).delete();toast('계정을 삭제했습니다')}
  else if(a==='ac-new'){var q=function(k){return document.querySelector('#acForm [data-k='+k+']')};var nid=q('id').value.trim().toLowerCase();
    if(!ID_RE.test(nid)){toast('아이디 형식이 맞지 않습니다');return}if(q('pw').value.length<6){toast('비밀번호는 6자 이상이어야 합니다');return}
    var nrec={name:q('name').value.trim()||nid,phone:q('phone').value.trim(),role:q('role').value,createdAt:new Date().toISOString()};
    if(SB){var sb2=window.supabase.createClient(window.SB_CFG.url,window.SB_CFG.key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false,storageKey:'sp-aux'}});
      var r2=await sb2.auth.signUp({email:sbEmail(nid),password:q('pw').value});
      if(r2.error||!r2.data||!r2.data.user){toast('계정을 만들지 못했습니다. 이미 있는 아이디일 수 있습니다.');return}
      var ir=await SB.from('profiles').insert({id:r2.data.user.id,login_id:nid,name:nrec.name,phone:nrec.phone,role:nrec.role});if(ir.error){toast('계정 정보를 저장하지 못했습니다');return}}
    else{var ex=await ST.db.doc('accounts/'+nid).get();if(ex.exists){toast('이미 사용 중인 아이디입니다');return}
      nrec.pw=await hashPw(nid,q('pw').value);await ST.db.doc('accounts/'+nid).set(nrec)}
    ['id','name','phone','pw'].forEach(function(k){q(k).value=''});toast('계정을 만들었습니다')}
  else if(a==='like'){if(needLogin(null))return;var lid2=id+'_'+ST.acct.id;var has=(ST.likes||[]).some(function(x){return x._id===lid2});if(has)await ST.db.doc('likes/'+lid2).delete();else await ST.db.doc('likes/'+lid2).set({pid:id,uid:ST.acct.id})}
  else if(a==='pts-all'){var tl=cartLines().reduce(function(q,l){return q+l.unit*l.qty},0);var bb=(ST.myWallet&&ST.myWallet.balance)||0;ST.form.pts=bb>=PTS_MIN?Math.min(bb,tl):0;render()}
  else if(a==='gal'){ST.gi=+t.dataset.i;render()}
  else if(a==='dt'){ST.dtab=t.dataset.v;render()}
  else if(a==='sq'){var s0=ST.sel;if(!s0)return;s0.qty=Math.max(1,Math.min(999,s0.qty+parseInt(t.dataset.d,10)));updItem()}
  else if(a==='item-cart'||a==='item-buy'||a==='item-save'){
    var p0=byId(id),s1=ST.sel;if(!p0||!s1)return;
    if(a!=='item-save'&&needLogin(null))return;
    var er0=validateSel(p0,s1);if(er0){ST.ierr=er0;render();return}
    ST.ierr='';
    if(a==='item-save'){var cl=ST.cart.find(function(c){return c.lid===s1.editLid});if(cl){cl.qty=s1.qty;cl.opts=Object.assign({},s1.opts);cl.inputs=Object.assign({},s1.inputs);saveCart()}ST.sel=null;location.hash='#cart';return}
    var others=ST.cart.length>0;var ln={lid:newLid(),pid:id,qty:s1.qty,opts:Object.assign({},s1.opts),inputs:Object.assign({},s1.inputs)};
    ST.cart.push(ln);saveCart();ST.sel=null;
    if(a==='item-cart'){ST.modal={kind:'cart',lid:ln.lid};render()}
    else if(others){ST.modal={kind:'buy',lid:ln.lid};render()}
    else{ST.only='';location.hash='#cart'}}
  else if(a==='item-cancel'){ST.sel=null;location.hash='#cart'}
  else if(a==='m-cart'){ST.modal=null;ST.only='';location.hash='#cart'}
  else if(a==='m-only'){ST.only=ST.modal?ST.modal.lid:'';ST.modal=null;location.hash='#cart'}
  else if(a==='m-close'){ST.modal=null;render()}
  else if(a==='pw-next'){ST.paywin.step=2;render();setTimeout(function(){if(ST.paywin){ST.paywin.step=3;render()}},1400)}
  else if(a==='pw-close'){ST.paywin=null;render()}
  else if(a==='pw-bank'){ST.paywin=null;ST.form.method='bank';render()}
  else if(a==='only-off'){ST.only='';render()}
  else if(a==='line-edit'){var c0=ST.cart.find(function(c){return c.lid===id});if(c0){ST.sel={pid:c0.pid,qty:c0.qty,opts:Object.assign({},c0.opts),inputs:Object.assign({},c0.inputs),editLid:id};ST.gi=0;location.hash='#item-'+c0.pid}}
  else if(a==='rv-add'){if(!ST.acct||!ST.db)return;var rt0=document.getElementById('rvText').value.trim();if(!rt0){toast('내용을 입력해 주세요');return}
    await ST.db.collection('reviews').add({pid:id,uid:ST.acct.id,name:mask(ST.acct.name),rating:parseInt(document.getElementById('rvRating').value,10)||5,text:rt0,at:new Date().toISOString()});toast('구매평을 등록했습니다')}
  else if(a==='rv-del'){await ST.db.doc('reviews/'+id).delete();toast('삭제했습니다')}
  else if(a==='qa-add'){if(!ST.acct||!ST.db)return;var qt0=document.getElementById('qaText').value.trim();if(!qt0){toast('내용을 입력해 주세요');return}
    await ST.db.collection('pqa').add({pid:id,uid:ST.acct.id,name:mask(ST.acct.name),text:qt0,at:new Date().toISOString()});toast('질문을 등록했습니다')}
  else if(a==='qa-reply'){var qc=t.closest('[data-qid]');var qr=qc.querySelector('[data-f=qreply]').value.trim();if(!qr){toast('답변 내용을 입력해 주세요');return}
    await ST.db.doc('qreplies/'+qc.dataset.qid).set({text:qr,at:new Date().toISOString()});toast('답변을 저장했습니다')}
  else if(a==='qa-del'){await ST.db.doc('pqa/'+id).delete();try{await ST.db.doc('qreplies/'+id).delete()}catch(e3){}toast('삭제했습니다')}
  else if(a==='pe-new'){ST.pdraft={id:'p'+Date.now().toString(36),name:'새 상품',cat:'etc',type:'goods',price:1000,sale:0,credit:0,unit:'건',order:99,desc:'',best:false,soldout:false,hidden:true,pointRate:0,minQty:0,maxQty:0,needAddr:false,images:[],options:[],detail:[]};ST.pedit=ST.pdraft.id;ST.pnew=true;ST.upmsg='';render();window.scrollTo(0,0)}
  else if(a==='pe-edit'){var sp=byId(id);if(!sp)return;ST.pdraft=JSON.parse(JSON.stringify(sp));delete ST.pdraft._id;ST.pedit=id;ST.pnew=false;ST.upmsg='';render();window.scrollTo(0,0)}
  else if(a==='pe-cancel'){ST.pedit='';ST.pdraft=null;ST.upmsg='';render()}
  else if(a==='pe-save'){var dd=ST.pdraft;if(!dd)return;
    if(!String(dd.name).trim()){toast('이름을 입력해 주세요');return}
    var rec=JSON.parse(JSON.stringify(dd));var pid2=rec.id;delete rec.id;delete rec._id;
    rec.options=(rec.options||[]).filter(function(g){return String(g.name||'').trim()&&(g.choices||[]).length}).map(function(g){g.choices=g.choices.filter(function(c){return String(c.label||'').trim()});return g}).filter(function(g){return g.choices.length});
    if(Array.isArray(rec.fields))rec.fields=rec.fields.filter(function(x){return String(x.label||'').trim()});
    rec.detail=(rec.detail||[]).filter(function(b){return b.t==='img'?!!b.img:String(b.text||'').trim()});
    ST.busy=true;render();
    try{await ST.db.doc('products/'+pid2).set(rec);ST.busy=false;ST.pedit='';ST.pdraft=null;toast('저장했습니다');render()}
    catch(e4){ST.busy=false;render();toast('저장하지 못했습니다. 편집 권한이 필요합니다.')}}
  else if(a==='pe-add'){var dr=ST.pdraft;if(!dr)return;var k=t.dataset.k,uid0=Date.now().toString(36);
    if(k==='options'){dr.options=dr.options||[];dr.options.push({id:'g'+uid0,name:'새 옵션',required:true,choices:[{label:'선택지 1',add:0}]})}
    else if(k==='fields'){if(!Array.isArray(dr.fields))dr.fields=legacyFields(dr);dr.fields.push({id:'f'+uid0,label:'새 항목',type:'text',required:false,placeholder:'',help:''})}
    else if(k==='detail'){dr.detail=dr.detail||[];dr.detail.push({t:t.dataset.t,text:''})}
    render()}
  else if(a==='pe-addchoice'){var gg=ST.pdraft.options[+t.dataset.i];gg.choices.push({label:'선택지 '+(gg.choices.length+1),add:0});render()}
  else if(a==='pe-rm'||a==='pe-up'||a==='pe-down'){var arr=getPath(ST.pdraft,t.dataset.k);var ix=+t.dataset.i;if(!Array.isArray(arr))return;
    if(a==='pe-rm')arr.splice(ix,1);
    else{var jx=a==='pe-up'?ix-1:ix+1;if(jx<0||jx>=arr.length)return;var tmp=arr[ix];arr[ix]=arr[jx];arr[jx]=tmp}
    render()}
  else if(a==='pe-img-del'){ST.pdraft.images.splice(+t.dataset.i,1);render()}
  else if(a==='pe-img-first'){var im=ST.pdraft.images.splice(+t.dataset.i,1)[0];ST.pdraft.images.unshift(im);render()}
  else if(a==='pe-fields-init'){ST.pdraft.fields=JSON.parse(JSON.stringify(legacyFields(ST.pdraft)));render()}
  else if(a==='pe-fields-reset'){delete ST.pdraft.fields;render()}
  else if(a==='p-delc'){ST.pdelc=id;render()}
  else if(a==='p-del'){await ST.db.doc('products/'+id).delete();ST.pdelc='';toast('삭제했습니다')}
  else if(a==='p-seed'){for(var i=0;i<DEFAULTS.length;i++){var d=Object.assign({},DEFAULTS[i]);var did=d.id;delete d.id;await ST.db.doc('products/'+did).set(d)}toast('기본 상품을 등록했습니다')}
  else if(a==='n-add'){var ti=document.getElementById('nTitle').value.trim(),bo=document.getElementById('nBody').value.trim();if(!ti){toast('제목을 입력해 주세요');return}
    await ST.db.collection('notices').add({title:ti,body:bo,at:new Date().toISOString()});toast('공지를 등록했습니다')}
  else if(a==='n-del'){await ST.db.doc('notices/'+id).delete();toast('삭제했습니다')}
  else if(a==='iq-reply'){var c9=t.closest('[data-qid]');var rt=c9.querySelector('[data-f=reply]').value.trim();if(!rt){toast('답변 내용을 입력해 주세요');return}
    await ST.db.doc('replies/'+c9.dataset.qid).set({text:rt,at:new Date().toISOString()});toast('답변을 등록했습니다')}
  else if(a==='s-save'){var o2={};document.querySelectorAll('#setForm [data-k]').forEach(function(i){o2[i.dataset.k]=i.value.trim()});await ST.db.doc('settings/site').set(o2);toast('설정을 저장했습니다')}
  }catch(err){ST.busy=false;if(err&&err.code==='declined')return;toast(err&&err.message==='neg'?'잔액보다 많이 차감할 수 없습니다':'처리하지 못했습니다. 이 작업은 편집 권한이 필요할 수 있습니다.')}
});
app.addEventListener('input',function(e){var t=e.target;
  if(t.dataset.dp!==undefined){if(!ST.pdraft)return;var dtp=t.dataset.dt;
    var vv=dtp==='stage'?(t.checked?'order':''):dtp==='bool'?t.checked:dtp==='num'?(Number(t.value)||0):dtp==='list'?t.value.split(',').map(function(x){return x.trim()}).filter(Boolean):t.value;
    setPath(ST.pdraft,t.dataset.dp,vv);return}
  if(t.dataset.cin!==undefined){var cp=t.dataset.cin.split('|');var cc=ST.cart.find(function(c){return c.lid===cp[0]});if(cc){cc.inputs=cc.inputs||{};cc.inputs[cp[1]]=t.value;saveCart()}return}
  if(t.dataset.in!==undefined){if(!ST.sel)return;ST.sel.inputs[t.dataset.in]=t.type==='checkbox'?(t.checked?'Y':''):t.value;updItem();return}
  if(t.dataset.note!==undefined){var l=ST.cart.find(function(c){return c.pid===t.dataset.note});if(l){l.note=t.value;saveCart();var cn=document.getElementById('cnt-'+t.dataset.note);if(cn)cn.textContent='입력 '+noteCount(t.value)+' / 수량 '+l.qty}}
  else if(t.dataset.form){ST.form[t.dataset.form]=t.type==='checkbox'?t.checked:t.value}
  else if(t.id==='ordFilter'){var q=t.value.trim().toLowerCase();var any=false;app.querySelectorAll('.ord[data-hay]').forEach(function(el){var m=!q||el.dataset.hay.indexOf(q)>=0;el.hidden=!m;if(m)any=true});var nh=document.getElementById('noHit');if(nh)nh.hidden=any||!app.querySelector('.ord[data-hay]')}
  else if(t.id==='svcQ'||t.id==='aSearch'){var qq=t.value.trim().toLowerCase();var sel=t.id==='svcQ'?'.tile[data-hay]':'.ord[data-hay]';app.querySelectorAll(sel).forEach(function(el){el.hidden=!!qq&&el.dataset.hay.indexOf(qq)<0})}
});
app.addEventListener('change',function(e){var t=e.target;
  if(t.dataset.opt!==undefined){if(!ST.sel)return;ST.sel.opts[t.dataset.opt]=t.value;updItem();return}
  if(t.dataset.up!==undefined){onUpload(t);return}
  if(t.dataset.cup!==undefined){onCartUpload(t);return}
  if(t.dataset.rr&&t.dataset.dp!==undefined){render();return}
  if(t.dataset.form==='pay'){ST.form.pay=t.value;render()}
  else if(t.dataset.form==='method'){ST.form.method=t.value;render()}
  else if(t.dataset.sort!==undefined){ST.sort=t.value;render()}
  else if(t.dataset.afilter!==undefined){ST.afilter=t.value;render()}
});
app.addEventListener('keydown',function(e){if(e.key!=='Enter')return;var t=e.target;if(t.id==='lgId'||t.id==='lgPw'){if(!ST.busy)doLogin()}});

