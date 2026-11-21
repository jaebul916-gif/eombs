/* 장바구니 담기와 주문 처리 */
"use strict";
function addToCart(id,n){var p=byId(id);if(!p||p.soldout)return;ST.cart.push({lid:newLid(),pid:id,qty:n,opts:{},inputs:{}});saveCart();document.getElementById('cartCount').textContent=ST.cart.reduce(function(s,c){return s+c.qty},0);toast('장바구니에 담았습니다')}
async function setDocMerge(path,patch){var ref=ST.db.doc(path);try{await ref.update(patch)}catch(e){if(e&&e.code==='invalid_argument')await ref.set(patch);else throw e}}
function ymd(){var d=new Date();return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')}
async function walletSet(uid,entries){
  var w=ST.allWallet[uid]||{};var bal=w.balance||0;var log=(w.log||[]).slice();var at=new Date().toISOString();
  entries.forEach(function(e){bal+=e.delta;log.unshift({at:at,delta:e.delta,reason:e.reason})});
  if(bal<0)throw new Error('neg');
  await ST.db.doc('wallet/'+uid).set({balance:bal,updatedAt:at,log:log.slice(0,50)});return bal;
}
async function placeOrder(){
  var lines=cartLines();var f=ST.form;ST.err='';
  if(!ST.db||!ST.acct){ST.err='로그인한 상태에서만 주문할 수 있습니다.';return render()}
  if(ST.write===false){ST.err='이 계정은 주문 권한이 없습니다. 공유 설정에서 Contributor 이상이 필요합니다.';return render()}
  if(!lines.length){ST.err='주문할 상품이 없습니다.';return render()}
  if(!f.name.trim()||!f.phone.trim()){ST.err='이름과 연락처를 입력해 주세요.';return render()}
  var seen={};myOrders().filter(function(o){return o.status!=='canceled'}).forEach(function(o){o.items.forEach(function(i){(i.refs||[]).forEach(function(r){seen[r]=1})})});
  var items=[];
  for(var i=0;i<lines.length;i++){var l=lines[i],p=l.p;
    var er=validateSel(p,{qty:l.qty,opts:l.c.opts||{},inputs:l.c.inputs||{}},'order');
    if(er){ST.err=p.name+': '+er;return render()}
    var it={pid:p.id,name:p.name,type:p.type,qty:l.qty,price:l.unit};
    var ot=getOpts(p).map(function(g){var k=(l.c.opts||{})[g.id];return (k!==undefined&&k!==''&&g.choices[k])?g.name+': '+g.choices[k].label:null}).filter(Boolean);
    if(ot.length)it.optsText=ot;
    var det=[],refs=[];
    var fl=getFields(p);
    for(var j=0;j<fl.length;j++){var fd=fl[j];var v=String(((l.c.inputs||{})[fd.id])||'').trim();if(!v)continue;
      if(fd.type==='checkbox')v='예';
      if(fd.type==='file')det.push({k:fd.label,v:'첨부 파일',file:bid(v)});else det.push({k:fd.label,v:v});
      if(fd.unique&&fd.type!=='lines'){if(seen[v]){ST.err='이미 접수했거나 중복 입력된 번호가 있습니다: '+v;return render()}seen[v]=1;refs.push(v)}
      if(fd.type==='lines'&&fd.matchQty){var rr=linesOf(v);
        for(var k=0;k<rr.length;k++){if(seen[rr[k]]){ST.err='이미 접수했거나 중복 입력된 주문번호가 있습니다: '+rr[k];return render()}seen[rr[k]]=1}
        refs=refs.concat(rr)}}
    if(det.length)it.details=det;if(refs.length)it.refs=refs;
    if(p.type==='credit')it.credit=p.credit>0?p.credit:p.price;
    items.push(it)}
  if(lines.some(function(l){return needAddr(l.p)})&&!f.addr.trim()){ST.err='물품을 받을 배송지 주소를 입력해 주세요.';return render()}
  if(!f.agree){ST.err='확인 항목에 체크해 주세요.';return render()}
  var total=items.reduce(function(s,i){return s+i.price*i.qty},0);
  var bal0=(ST.myWallet&&ST.myWallet.balance)||0;var us0=bal0>=PTS_MIN?Math.min(bal0,total):0;var pts=Math.max(0,Math.min(us0,Math.floor(Number(f.pts)||0)));
  f.pay=pts>=total?'points':'bank';
  if(f.pay==='bank'&&(f.method||'bank')!=='bank'){ST.paywin={method:f.method,step:1,amount:total-pts,names:lines.map(function(l){return l.p.name}).join(', ')};render();return}
  var now=new Date().toISOString();
  var order={id:'o'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),no:'EB'+ymd()+'-'+Math.floor(1000+Math.random()*9000),createdAt:now,pay:f.pay,depositor:f.pay==='bank'?(f.dep.trim()||f.name.trim()):'',
    contact:{name:f.name.trim(),phone:f.phone.trim(),addr:f.addr.trim()},items:items,total:total,pts:pts};
  ST.busy=true;render();
  try{
    if(SB){var rr0=await SB.rpc('place_order',{p:{contact:order.contact,depositor:order.depositor,pts:pts,items:lines.map(function(l){return {pid:l.p.id,qty:l.qty,opts:l.c.opts||{},inputs:l.c.inputs||{}}})}});if(rr0.error)throw rr0.error}
    else{var list=((ST.myDoc&&ST.myDoc.list)||[]).slice();list.unshift(order);
    await ST.db.doc('orders/'+ST.acct.id).set({uid:ST.acct.id,name:order.contact.name,phone:order.contact.phone,last:now,list:list})}
    var done={};lines.forEach(function(l){done[l.c.lid]=1});
    ST.cart=ST.cart.filter(function(c){return !done[c.lid]});ST.only='';saveCart();ST.form.agree=false;ST.form.pts=0;ST.busy=false;
    toast('주문이 접수되었습니다');location.hash='#mypage';
  }catch(e){ST.busy=false;ST.err=(SB&&e&&e.message)?'주문을 접수하지 못했습니다. '+e.message:'주문을 저장하지 못했습니다. 권한을 확인하고 다시 시도해 주세요.';render()}
}
function csvCell(v){var s=String(v==null?'':v);return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}

