/* 시작 처리 (저장소 연결, 세션 복원) */
"use strict";
/* ---------- data ---------- */
async function boot(){
  route();
  var cl=window.claude;
  if((!cl||!cl.use)&&window.SB_CFG&&window.supabase&&window.supabase.createClient){
    SB=window.supabase.createClient(window.SB_CFG.url,window.SB_CFG.key);ST.db=sbMakeDb(SB);ST.write=true}
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
  if(SB){try{var gs=await SB.auth.getSession();var em=gs.data&&gs.data.session&&gs.data.session.user&&gs.data.session.user.email;if(em)sid=em.split('@')[0]}catch(e){}}
  else{try{sid=localStorage.getItem('sp-sess')}catch(e){}}
  if(sid){try{var a=await db.doc('accounts/'+sid).get();if(a.exists)setAcct(sid,a.data());else setAcct(null)}catch(e){}}
  ST.ready=true;route();
}
boot();
