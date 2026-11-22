/* 시작 처리 (저장소 연결, 세션 복원) */
"use strict";
/* ---------- data ---------- */
async function boot(){
  route();
  setTimeout(function(){if(!ST.ready){ST.ready=true;route()}},6000);
  var cl=window.claude;
  if((!cl||!cl.use)&&window.SB_CFG&&window.supabase&&window.supabase.createClient){
    SB=window.supabase.createClient(window.SB_CFG.url,window.SB_CFG.key,{auth:{flowType:'pkce'}});ST.db=sbMakeDb(SB);ST.write=true}
  else if(!cl||!cl.use){ST.ready=true;route();return}
  else{
    try{var u=await cl.use('user');if(u)ST.write=await u.can('data.write')}catch(e){}
    try{ST.db=await cl.use('db')}catch(e){}}
  var db=ST.db;
  if(!db){ST.ready=true;route();return}
  var er=function(){};
  db.collection('products').onSnapshot(function(s){ST.products=snapList(s).map(function(x){x.id=x._id;return x});refresh()},er);
  db.collection('notices').onSnapshot(function(s){ST.notices=snapList(s).sort(byAtDesc).map(function(x){x.id=x._id;return x});refresh()},er);
  db.collection('likes').onSnapshot(function(s){ST.likes=snapList(s);refresh()},er);
  db.collection('reviews').onSnapshot(function(s){ST.reviews=snapList(s);refresh()},er);
  db.collection('pqa').onSnapshot(function(s){ST.pqa=snapList(s);refresh()},er);
  db.collection('qreplies').onSnapshot(function(s){var m={};s.docs.forEach(function(d){m[d.id]=d.data()});ST.qrep=m;refresh()},er);
  db.doc('settings/site').onSnapshot(function(s){ST.settings=s.exists?s.data():{};refresh()},er);
  var sid=null;
  var kk=null,sso=false;try{kk=sessionStorage.getItem('sp-kakao')}catch(e){}
  var qs=new URLSearchParams(location.search);
  var oauthErr=qs.get('error')||qs.get('error_description');
  if(SB){try{var gs=await SB.auth.getSession();var us=gs.data&&gs.data.session&&gs.data.session.user;
    if(us){var em=us.email||'';
      if(/@sellerport\.app$/.test(em))sid=em.split('@')[0];
      else{sso=true;sid=await sbProfileLogin(us.id);if(!sid){try{SB.auth.signOut()}catch(e){}toast('카카오 계정 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요')}}}}catch(e){}}
  else{try{sid=localStorage.getItem('sp-sess')}catch(e){}}
  if(kk||oauthErr||qs.has('code')){
    if(oauthErr){toast('카카오 로그인이 취소되었거나 실패했습니다');try{sessionStorage.removeItem('sp-kakao')}catch(e){}kk=null}
    ['code','state','error','error_code','error_description'].forEach(function(k){qs.delete(k)});
    try{var qq=qs.toString();history.replaceState(null,'',location.pathname+(qq?'?'+qq:'')+location.hash)}catch(e){}}
  if(sid){try{var a=await db.doc('accounts/'+sid).get();if(a.exists){setAcct(sid,a.data());if(sso)ST.acct.sso=true}else setAcct(null)}catch(e){}}
  ST.ready=true;route();
  if(kk){try{sessionStorage.removeItem('sp-kakao')}catch(e){}
    if(ST.acct){try{ST.next=JSON.parse(kk).next||''}catch(e){}toast(ST.acct.name+'님, 환영합니다');afterAuth()}}
  try{tossReturn()}catch(e){}
}
boot();
