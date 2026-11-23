/* 토스페이먼츠 결제위젯(주문서형) v2 — 테스트 결제 연동 */
"use strict";
var TOSS_KEY=(window.TOSS_CFG&&window.TOSS_CFG.clientKey)||'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
/* 결제 후 돌아올 주소: 지금 열려 있는 주소 기준(루트 배포면 /, 하위 경로 배포면 그 경로) */
var TOSS_BASE=location.origin+((location.pathname.indexOf('/eombs/')===0)?'/eombs/':'/');

function tossCustomerKey(){
  var k='';try{k=localStorage.getItem('sp-tck')||''}catch(e){}
  if(!k||k.length<22){k='eb_'+sbRnd(16);try{localStorage.setItem('sp-tck',k)}catch(e){}}
  return k;
}
function tossPhone(v){var s=String(v||'').replace(/[^0-9]/g,'');return (s.length>=8&&s.length<=15)?s:''}
function tossOrderName(lines){
  var n=(lines&&lines.length)?lines[0].p.name:'엄배송 주문';
  if(lines&&lines.length>1)n+=' 외 '+(lines.length-1)+'건';
  return n.slice(0,100);
}
function tossErrShow(msg){
  ST.tossErr=msg||'';
  var e=document.getElementById('tossErr');
  if(!e)return;
  e.textContent=msg||'';
  e.hidden=!msg;
}
function mountToss(amount){
  var box=document.getElementById('payment-method');
  if(!box||!ST.acct)return Promise.resolve(null);
  if(!(amount>0))return Promise.resolve(null);
  if(!window.TossPayments){tossErrShow('토스페이먼츠 SDK를 불러오지 못했습니다. 새로고침해 주세요.');return Promise.resolve(null)}
  var sig=amount+'|'+tossCustomerKey();
  if(box._tossP&&box._tossSig===sig)return box._tossP;
  if(box._tossDone&&ST.toss&&ST.toss.sig===sig)return Promise.resolve(ST.toss);
  box._tossSig=sig;
  box._tossP=(async function(){
    try{
      var tp=window.TossPayments(TOSS_KEY);
      var w=tp.widgets({customerKey:tossCustomerKey()});
      await w.setAmount({currency:'KRW',value:amount});
      await Promise.all([
        w.renderPaymentMethods({selector:'#payment-method',variantKey:'DEFAULT'}),
        w.renderAgreement({selector:'#agreement',variantKey:'AGREEMENT'})
      ]);
      ST.toss={widgets:w,amount:amount,sig:sig};
      box._tossDone=true;
      tossErrShow('');
      return ST.toss;
    }catch(e){
      ST.toss=null;
      tossErrShow('결제수단을 불러오지 못했습니다.'+(e&&e.message?' ('+e.message+')':''));
      return null;
    }
  })();
  return box._tossP;
}
async function tossRequest(pend,lines){
  if(!ST.toss)await mountToss(pend.amount);
  if(ST.toss&&ST.toss.amount!==pend.amount){ST.busy=false;tossErrShow('결제 금액이 바뀌었습니다. 장바구니를 다시 열어 주세요.');render();return}
  var w=ST.toss&&ST.toss.widgets;
  if(!w){tossErrShow('결제수단을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');ST.busy=false;render();return}
  var req={orderId:pend.no,orderName:tossOrderName(lines),windowTarget:'self',
    successUrl:TOSS_BASE+'?toss=success&oid='+encodeURIComponent(pend.id),
    failUrl:TOSS_BASE+'?toss=fail'};
  if(ST.form.name)req.customerName=String(ST.form.name).slice(0,100);
  var ph=tossPhone(ST.form.phone);if(ph)req.customerMobilePhone=ph;
  try{await w.requestPayment(req)}
  catch(e){ST.busy=false;tossErrShow('결제창을 열지 못했습니다.'+(e&&e.message?' ('+e.message+')':''));render()}
}
function tossQuery(){
  var q={},raw=String(location.search||'').replace(/^\?/,'').replace(/\?/g,'&');
  raw.split('&').forEach(function(kv){
    if(!kv)return;var i=kv.indexOf('=');if(i<0)return;
    var k=decodeURIComponent(kv.slice(0,i)),v=decodeURIComponent(kv.slice(i+1).replace(/\+/g,' '));
    if(!(k in q))q[k]=v;
  });
  return q;
}
function tossCleanUrl(){try{history.replaceState(null,'',location.pathname+(location.hash||''))}catch(e){}}
function tossReturn(){
  var q=tossQuery();
  if(!q.paymentKey&&!q.code&&!q.toss)return false;
  if(!q.paymentKey){
    ST.tossNotice='결제가 취소되었거나 실패했습니다.'+(q.message?' '+q.message:'');
    try{sessionStorage.removeItem('sp-toss')}catch(e){}
    tossCleanUrl();return true;
  }
  var pend=null;try{pend=JSON.parse(sessionStorage.getItem('sp-toss')||'null')}catch(e){}
  var oid=q.oid||(pend&&pend.id)||'';
  ST.tossNotice='결제 정보를 확인하는 중입니다.';
  (async function(){
    if(!SB||!oid){
      ST.tossNotice='주문 정보를 찾지 못했습니다. 마이페이지에서 주문 상태를 확인해 주세요.';
    }else{
      try{
        var r=await SB.rpc('confirm_toss_payment',{p_order:oid,p_key:q.paymentKey,p_amount:Number(q.amount||0)});
        if(r.error)throw r.error;
        var no=(r.data&&r.data.no)||'';
        ST.tossNotice='테스트 결제가 완료되었습니다. 주문 '+(no?no+' ':'')+'이 결제완료 상태로 저장되었습니다. 실제 금액은 청구되지 않았습니다.';
        if(pend&&pend.lids&&pend.lids.length){var done={};pend.lids.forEach(function(x){done[x]=1});ST.cart=ST.cart.filter(function(c){return !done[c.lid]});saveCart()}
        ST.form.agree=false;ST.form.pts=0;ST.form.method='toss';
        toast('테스트 결제가 완료되었습니다');
      }catch(e){
        ST.tossNotice='결제는 인증되었지만 주문 확정에 실패했습니다.'+(e&&e.message?' '+e.message:'');
      }
    }
    try{sessionStorage.removeItem('sp-toss')}catch(e){}
    tossCleanUrl();
    if(location.hash!=='#mypage')location.hash='#mypage';else route();
    render();
  })();
  return true;
}
