/* 실시간 구독, 로그인, 회원가입 */
"use strict";
/* ---------- accounts ---------- */
function snapList(s){return s.docs.map(function(d){return Object.assign({_id:d.id},d.data())})}
function byAtDesc(a,b){return (a.at||'')<(b.at||'')?1:-1}
function startSubs(){
  subs.forEach(function(u){try{u()}catch(e){}});subs=[];
  ST.myDoc=null;ST.myFulfil=null;ST.myWallet=null;ST.allOrders=null;ST.allFulfil={};ST.allWallet={};ST.accounts=null;ST.inq=null;ST.replies={};ST.adminInq=null;
  var db=ST.db;if(!db||!ST.acct){render();return}
  var id=ST.acct.id;var er=function(){};
  subs.push(db.doc('orders/'+id).onSnapshot(function(s){ST.myDoc=s.exists?s.data():{list:[]};refresh()},er));
  subs.push(db.doc('fulfil/'+id).onSnapshot(function(s){ST.myFulfil=s.exists?s.data():{};refresh()},er));
  subs.push(db.doc('wallet/'+id).onSnapshot(function(s){ST.myWallet=s.exists?s.data():{balance:0};refresh()},er));
  subs.push(db.collection('inquiries').where('uid','==',id).onSnapshot(function(s){ST.inq=snapList(s).sort(byAtDesc);refresh()},er));
  subs.push(db.collection('replies').onSnapshot(function(s){var m={};s.docs.forEach(function(d){m[d.id]=d.data()});ST.replies=m;refresh()},er));
  if(ST.admin){
    subs.push(db.collection('orders').onSnapshot(function(s){ST.allOrders=snapList(s);refresh()},er));
    subs.push(db.collection('fulfil').onSnapshot(function(s){var m={};s.docs.forEach(function(d){m[d.id]=d.data()});ST.allFulfil=m;refresh()},er));
    subs.push(db.collection('wallet').onSnapshot(function(s){var m={};s.docs.forEach(function(d){m[d.id]=d.data()});ST.allWallet=m;refresh()},er));
    subs.push(db.collection('accounts').onSnapshot(function(s){ST.accounts=snapList(s);refresh()},er));
    subs.push(db.collection('inquiries').onSnapshot(function(s){ST.adminInq=snapList(s);refresh()},er));
  }
  render();
}
function setAcct(id,d){
  if(d){ST.acct={id:id,name:d.name||id,phone:d.phone||'',role:d.role||'buyer'};ST.admin=ST.acct.role==='admin';
    if(!ST.form.name)ST.form.name=ST.acct.name;if(!ST.form.phone)ST.form.phone=ST.acct.phone;
    try{localStorage.setItem('sp-sess',id)}catch(e){}}
  else{ST.acct=null;ST.admin=false;try{localStorage.removeItem('sp-sess')}catch(e){}}
  startSubs();
}
function needLogin(act){
  if(ST.acct)return false;
  ST.pendingAdd=act||null;ST.next=location.hash||'#home';ST.loginMsg='로그인 후 이용할 수 있습니다.';ST.ltab='in';
  location.hash='#login';if(ST.route==='login')render();
  return true;
}
function afterAuth(){
  var pa=ST.pendingAdd;ST.pendingAdd=null;if(pa)addToCart(pa.id,pa.qty);
  var nx=ST.next||'';ST.next='';ST.loginMsg='';
  var to=(nx&&nx!=='#login')?nx:(ST.admin?'#manage':'#mypage');
  if(location.hash===to)route();else location.hash=to;
}
async function doLogin(){
  var id=document.getElementById('lgId').value.trim().toLowerCase(),pw=document.getElementById('lgPw').value;
  ST.lerr='';
  if(!ST.db){ST.lerr='저장소에 연결되지 않았습니다.';return render()}
  if(!id||!pw){ST.lerr='아이디와 비밀번호를 입력해 주세요.';return render()}
  ST.busy=true;render();
  try{var s=null,ok=false;
    if(SB){var lr=await SB.auth.signInWithPassword({email:sbEmail(id),password:pw});if(!lr.error){s=await ST.db.doc('accounts/'+id).get();ok=s.exists}}
    else{s=await ST.db.doc('accounts/'+id).get();ok=s.exists&&s.data().pw===await hashPw(id,pw)}
    ST.busy=false;
    if(!ok){ST.lerr='아이디 또는 비밀번호가 맞지 않습니다.';return render()}
    setAcct(id,s.data());toast(ST.acct.name+'님, 환영합니다');afterAuth();
  }catch(e){ST.busy=false;ST.lerr='로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.';render()}
}
async function doSignup(){
  var g=function(i){return document.getElementById(i).value.trim()};
  var id=g('suId').toLowerCase(),name=g('suName'),phone=g('suPhone'),pw=document.getElementById('suPw').value,pw2=document.getElementById('suPw2').value;
  ST.lerr='';
  if(!ST.db){ST.lerr='저장소에 연결되지 않았습니다.';return render()}
  if(!ID_RE.test(id)){ST.lerr='아이디는 영문 소문자, 숫자, _, - 로 4~20자여야 합니다.';return render()}
  if(!name||!phone){ST.lerr='이름과 연락처를 입력해 주세요.';return render()}
  if(pw.length<6){ST.lerr='비밀번호는 6자 이상이어야 합니다.';return render()}
  if(pw!==pw2){ST.lerr='비밀번호 확인이 맞지 않습니다.';return render()}
  if(!document.getElementById('suAgree').checked){ST.lerr='이용약관과 개인정보 처리방침에 동의해 주세요.';return render()}
  ST.busy=true;render();
  try{
    var rec={name:name,phone:phone,role:'buyer',createdAt:new Date().toISOString()};
    if(SB){var sr=await SB.auth.signUp({email:sbEmail(id),password:pw});
      if(sr.error){ST.busy=false;ST.lerr=/registered|already|exists/i.test(sr.error.message)?'이미 사용 중인 아이디입니다.':'가입하지 못했습니다. '+sr.error.message;return render()}
      if(!sr.data.session){ST.busy=false;ST.lerr='이미 사용 중인 아이디이거나 이메일 확인 설정이 켜져 있습니다.';return render()}}
    else{var ex=await ST.db.doc('accounts/'+id).get();
      if(ex.exists){ST.busy=false;ST.lerr='이미 사용 중인 아이디입니다.';return render()}
      rec.pw=await hashPw(id,pw)}
    await ST.db.doc('accounts/'+id).set(rec);ST.busy=false;
    setAcct(id,rec);toast('가입이 완료되었습니다');afterAuth();
  }catch(e){ST.busy=false;ST.lerr='가입하지 못했습니다. 권한을 확인해 주세요.';render()}
}

/* ---------- cart & orders ---------- */
