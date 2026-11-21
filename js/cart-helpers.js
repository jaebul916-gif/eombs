/* 옵션, 입력 항목, 장바구니 계산과 검증 */
"use strict";
function legacyFields(p){
  if(p.type==='register')return [{id:'f1',label:'마켓 주문번호',type:'lines',required:true,matchQty:true,placeholder:'한 줄에 하나씩 입력',help:'수량과 같은 개수를 입력해 주세요.'}];
  if(p.type==='domestic')return [{id:'f1',label:'택배 정보',type:'textarea',required:true,placeholder:'',help:'보내는 곳, 받는 곳, 물품'}];
  if(p.type==='storage')return [{id:'f1',label:'보관 요청',type:'textarea',required:true,placeholder:'',help:'품목과 기간'}];
  if(p.type==='goods')return [{id:'f1',label:'요청 메모',type:'text',required:false,placeholder:'',help:''}];
  return [];
}
function getFields(p){return Array.isArray(p.fields)?p.fields:legacyFields(p)}
function getOpts(p){return Array.isArray(p.options)?p.options:[]}
function needAddr(p){return !!p.needAddr||p.type==='goods'}
function newLid(){return 'l'+Date.now().toString(36)+Math.random().toString(36).slice(2,5)}
function bid(id){return String(id||'').replace(/[^A-Za-z0-9_-]/g,'')}
function mask(n){n=String(n||'');return n?n.slice(0,1)+'***':'***'}
function optAdd(p,sel){var s=0;getOpts(p).forEach(function(g){var i=sel&&sel[g.id];if(i!==undefined&&i!==''&&g.choices[i])s+=Number(g.choices[i].add)||0});return s}
function lineUnit(p,sel){return unit(p)+optAdd(p,sel)}
function linesOf(v){return String(v||'').split('\n').map(function(s){return s.trim()}).filter(Boolean)}
function cartLines(){return ST.cart.map(function(c){var p=byId(c.pid);if(!p)return null;if(ST.only&&c.lid!==ST.only)return null;return {c:c,p:p,qty:c.qty,unit:lineUnit(p,c.opts)}}).filter(Boolean)}
function validateSel(p,sel,stage){
  var qty=sel.qty;
  if(p.minQty&&qty<p.minQty)return '최소 주문 수량은 '+p.minQty+'입니다.';
  if(p.maxQty&&qty>p.maxQty)return '최대 주문 수량은 '+p.maxQty+'입니다.';
  var gs=getOpts(p);
  for(var i=0;i<gs.length;i++){var g=gs[i];var v=sel.opts&&sel.opts[g.id];if(g.required&&(v===undefined||v===''))return g.name+' 옵션을 선택해 주세요.'}
  var fs=getFields(p);
  for(var j=0;j<fs.length;j++){var f=fs[j];if(stage!=='order'&&f.stage==='order')continue;var x=String((sel.inputs&&sel.inputs[f.id])||'').trim();
    if(f.required&&!x)return f.label+' 항목을 입력해 주세요.';
    if(f.type==='lines'&&f.matchQty&&x&&linesOf(x).length!==qty)return f.label+': '+linesOf(x).length+'개가 입력되었고 수량은 '+qty+'입니다. 개수를 맞춰 주세요.';
    if(f.type==='number'&&x&&isNaN(Number(x)))return f.label+'은(는) 숫자로 입력해 주세요.'}
  return '';
}
function itemDetail(i){
  var h='';
  if(i.optsText&&i.optsText.length)h+='<div class="small muted">'+esc(i.optsText.join(' · '))+'</div>';
  if(i.details&&i.details.length)h+=i.details.map(function(d){return '<div class="small"><span class="muted">'+esc(d.k)+'</span>'+(d.file?'<div><a href="'+blobUrl(bid(d.file))+'" target="_blank" rel="noopener">첨부 파일 보기</a></div>':'<pre>'+esc(d.v)+'</pre>')+'</div>'}).join('');
  else{var r=(i.refs&&i.refs.length)?i.refs.join('\n'):(i.note||'');if(r)h+='<pre>'+esc(r)+'</pre>'}
  return h;
}
function getPath(o,path){var k=String(path).split('.');for(var i=0;i<k.length;i++){if(o==null)return undefined;o=o[k[i]]}return o}
function setPath(o,path,v){var k=String(path).split('.');for(var i=0;i<k.length-1;i++){o=o[k[i]];if(o==null)return}o[k[k.length-1]]=v}
function updItem(){var s=ST.sel;if(!s)return;var p=byId(s.pid);if(!p)return;
  var q=document.getElementById('itemQty');if(q)q.textContent=s.qty;
  var tt=document.getElementById('itemTotal');if(tt)tt.textContent=won(selTotal(p));
  getFields(p).forEach(function(f){var e=document.getElementById('cnt-'+f.id);if(e)e.textContent='입력 '+linesOf(s.inputs[f.id]).length+' / 수량 '+s.qty})}
async function onCartUpload(t){
  var f=t.files&&t.files[0];var cp=t.dataset.cup.split('|');if(!f)return;
  if(f.size>20*1024*1024){ST.upmsg='파일은 20MB 이하만 올릴 수 있습니다.';return render()}
  var as=null;try{as=await getAssets()}catch(e){}
  if(!as){ST.upmsg='파일 업로드를 사용할 수 없습니다. 로그인 상태와 권한을 확인해 주세요.';return render()}
  ST.upmsg='업로드 중...';render();
  try{var r=await as.upload(f);var cc=ST.cart.find(function(c){return c.lid===cp[0]});if(cc){cc.inputs=cc.inputs||{};cc.inputs[cp[1]]=r.id;saveCart()}ST.upmsg=''}
  catch(e){ST.upmsg='업로드하지 못했습니다. PDF 또는 이미지 파일을 확인해 주세요.'}
  render();
}
async function onUpload(t){
  var files=Array.prototype.slice.call(t.files||[]);var kind=t.dataset.up,bi=+t.dataset.i;
  if(!files.length||!ST.pdraft)return;
  var as=null;try{as=await getAssets()}catch(e){}
  if(!as){ST.upmsg='이미지 업로드는 이 페이지의 편집 권한(Editor 이상)이 있는 계정에서만 쓸 수 있습니다.';return render()}
  ST.upmsg='업로드 중...';render();
  try{
    for(var i=0;i<files.length;i++){var f=files[i];if(!/^image\//.test(f.type))continue;
      var r=await as.upload(f);var d=ST.pdraft;if(!d)return;
      if(kind==='gallery'){d.images=d.images||[];d.images.push(r.id)}
      else if(kind==='newblock'){d.detail=d.detail||[];d.detail.push({t:'img',img:r.id})}
      else if(kind==='block'&&d.detail[bi])d.detail[bi].img=r.id}
    ST.upmsg='';
  }catch(e){ST.upmsg='업로드하지 못했습니다. 파일 형식과 크기(20MB 이하)를 확인해 주세요.'}
  render();
}

