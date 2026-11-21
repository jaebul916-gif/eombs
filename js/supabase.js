/* Supabase 연결 어댑터 (테이블 읽기/쓰기, 업로드) */
"use strict";
/* ---------- Supabase (GitHub Pages 등 Claude 저장소가 없을 때) ---------- */
var SB=null;
function blobUrl(id){if(SB){try{return SB.storage.from('uploads').getPublicUrl(id).data.publicUrl}catch(e){}}return '/_blob/'+id}
function sbRnd(n){var a=new Uint8Array(n);crypto.getRandomValues(a);return Array.from(a).map(function(x){return x.toString(16).padStart(2,'0')}).join('')}
function sbDeep(a,b){if(b===null||typeof b!=='object'||Array.isArray(b))return b;var o=Object.assign({},(a&&typeof a==='object'&&!Array.isArray(a))?a:{});Object.keys(b).forEach(function(k){o[k]=sbDeep(o[k],b[k])});return o}
function sbMakeDb(sb){
  var nrt=0;var PM={byId:{},byLogin:{}};
  function ck(r){if(r&&r.error)throw r.error;return r.data}
  async function sel(t,s,f){var q=sb.from(t).select(s||'*');if(f)q=f(q);return ck(await q)||[]}
  async function profs(){var r=await sel('profiles','id,login_id,name,phone,role,created_at');PM={byId:{},byLogin:{}};r.forEach(function(p){PM.byId[p.id]=p;PM.byLogin[p.login_id]=p});return r}
  function lg(uid){var p=PM.byId[uid];return p?p.login_id:uid}
  function by(a,k){var m={};a.forEach(function(x){(m[x[k]]=m[x[k]]||[]).push(x)});return m}
  function acctDoc(p){return {name:p.name,phone:p.phone,role:p.role,createdAt:p.created_at}}
  function ordDoc(o,its){return {id:o.id,no:o.no,createdAt:o.created_at,pay:o.pay,depositor:o.depositor,contact:{name:o.contact_name,phone:o.contact_phone,addr:o.contact_addr},
    items:(its||[]).slice().sort(function(a,b){return a.pos-b.pos}).map(function(i){var x={pid:i.product_id||'',name:i.name,type:i.type,qty:i.qty,price:i.price};
      if(i.credit)x.credit=i.credit;if(i.options_text&&i.options_text.length)x.optsText=i.options_text;if(i.details&&i.details.length)x.details=i.details;if(i.refs&&i.refs.length)x.refs=i.refs;return x}),
    total:o.total,pts:o.points_used,cancelRequested:!!o.cancel_requested}}
  async function loadOrders(){await profs();var os=await sel('orders','*,order_items(*)',function(q){return q.order('created_at',{ascending:false})});return os}
  var H={
    products:{t:['products','product_images','product_options','option_choices','product_fields','product_details'],
      load:async function(){
        var r=await Promise.all([sel('products'),sel('product_images'),sel('product_options'),sel('option_choices'),sel('product_fields'),sel('product_details')]);
        var im=by(r[1],'product_id'),op=by(r[2],'product_id'),ch=r[3],fl=by(r[4],'product_id'),dt=by(r[5],'product_id');
        var cm={};ch.forEach(function(c){var k=c.product_id+'|'+c.opt_id;(cm[k]=cm[k]||[]).push(c)});
        function srt(a,k){return (a||[]).slice().sort(function(x,y){return x[k]-y[k]})}
        return r[0].map(function(p){var d={cat:p.cat,type:p.type,name:p.name,desc:p.description,price:p.price,sale:p.sale,credit:p.credit,unit:p.unit,pointRate:Number(p.point_rate),minQty:p.min_qty,maxQty:p.max_qty,
          best:p.best,soldout:p.soldout,hidden:p.hidden,needAddr:p.need_addr,hideQty:p.hide_qty,order:p.sort,
          images:srt(im[p.id],'pos').map(function(x){return x.file_id}),
          options:srt(op[p.id],'pos').map(function(o){return {id:o.id,name:o.name,required:o.required,placeholder:o.placeholder,choices:srt(cm[p.id+'|'+o.id],'pos').map(function(c){return {label:c.label,add:c.add_price}})}}),
          detail:srt(dt[p.id],'pos').map(function(b){var x={t:b.kind,text:b.body};if(b.file_id)x.img=b.file_id;return x})};
          if(p.custom_fields)d.fields=srt(fl[p.id],'pos').map(function(f){var x={id:f.id,label:f.label,type:f.type,required:f.required,unique:f.unique_val,matchQty:f.match_qty,placeholder:f.placeholder,help:f.help};if(f.stage)x.stage=f.stage;if(f.choices&&f.choices.length)x.options=f.choices;return x});
          return [p.id,d]})},
      set:async function(id,d){var o=Object.assign({},d,{id:id});ck(await sb.rpc('admin_save_product',{p:o}))},
      del:async function(id){ck(await sb.from('products').delete().eq('id',id))}},
    notices:{t:['notices'],
      load:async function(){return (await sel('notices')).map(function(n){return [n.id,{title:n.title,body:n.body,at:n.created_at}]})},
      add:async function(d){ck(await sb.from('notices').insert({title:d.title,body:d.body||''}))},
      del:async function(id){ck(await sb.from('notices').delete().eq('id',id))}},
    settings:{t:['site_settings'],
      load:async function(){var o={};(await sel('site_settings')).forEach(function(x){o[x.key]=x.value});return [['site',o]]},
      set:async function(id,d){var rows=Object.keys(d).map(function(k){return {key:k,value:String(d[k]==null?'':d[k])}});if(rows.length)ck(await sb.from('site_settings').upsert(rows,{onConflict:'key'}))}},
    accounts:{t:['profiles'],
      load:async function(){return (await profs()).map(function(p){return [p.login_id,acctDoc(p)]})},
      set:async function(id,d){var u=ck(await sb.auth.getUser());var uid=u&&u.user&&u.user.id;ck(await sb.from('profiles').insert({id:uid,login_id:id,name:d.name,phone:d.phone||'',role:'buyer'}))},
      update:async function(id,d){var o={};if(d.name!==undefined)o.name=d.name;if(d.phone!==undefined)o.phone=d.phone;ck(await sb.from('profiles').update(o).eq('login_id',id))},
      del:async function(id){ck(await sb.from('profiles').delete().eq('login_id',id))}},
    orders:{t:['orders','order_items','profiles'],
      load:async function(){var os=await loadOrders();var g={};os.forEach(function(o){(g[o.user_id]=g[o.user_id]||[]).push(o)});
        return Object.keys(g).map(function(u){var l=g[u];var p=PM.byId[u]||{};return [lg(u),{uid:lg(u),name:p.name||l[0].contact_name,phone:p.phone||l[0].contact_phone,last:l[0].created_at,list:l.map(function(o){return ordDoc(o,o.order_items)})}]})}},
    fulfil:{t:['orders','profiles'],
      load:async function(){var os=await loadOrders();var g={};os.forEach(function(o){var m=g[lg(o.user_id)]=g[lg(o.user_id)]||{orders:{}};var s={status:o.status,memo:o.memo};if(o.paid_at)s.paidAt=o.paid_at;m.orders[o.id]=s});return Object.keys(g).map(function(k){return [k,g[k]]})}},
    wallet:{t:['wallets','wallet_log','profiles'],
      load:async function(){await profs();var r=await Promise.all([sel('wallets'),sel('wallet_log',null,function(q){return q.order('at',{ascending:false}).limit(500)})]);var lg2=by(r[1],'user_id');
        return r[0].map(function(w){return [lg(w.user_id),{balance:w.balance,updatedAt:w.updated_at,log:(lg2[w.user_id]||[]).slice(0,50).map(function(l){return {at:l.at,delta:l.delta,reason:l.reason}})}]})}},
    inquiries:{t:['inquiries','profiles'],
      load:async function(){await profs();return (await sel('inquiries')).map(function(q){var p=PM.byId[q.user_id]||{};return [q.id,{uid:lg(q.user_id),name:p.name||'',title:q.title,body:q.body,at:q.created_at}]})},
      add:async function(d){ck(await sb.from('inquiries').insert({title:d.title,body:d.body}))},
      del:async function(id){ck(await sb.from('inquiries').delete().eq('id',id))}},
    replies:{t:['inquiry_replies'],
      load:async function(){return (await sel('inquiry_replies')).map(function(r){return [r.inquiry_id,{text:r.body,at:r.created_at}]})},
      set:async function(id,d){ck(await sb.from('inquiry_replies').upsert({inquiry_id:id,body:d.text},{onConflict:'inquiry_id'}))},
      del:async function(id){ck(await sb.from('inquiry_replies').delete().eq('inquiry_id',id))}},
    reviews:{t:['reviews','profiles'],
      load:async function(){await profs();return (await sel('reviews')).map(function(r){return [r.id,{pid:r.product_id,uid:lg(r.user_id),name:r.author_name,rating:r.rating,text:r.body,at:r.created_at}]})},
      add:async function(d){ck(await sb.from('reviews').insert({product_id:d.pid,author_name:d.name||'',rating:d.rating,body:d.text}))},
      del:async function(id){ck(await sb.from('reviews').delete().eq('id',id))}},
    pqa:{t:['product_qna','profiles'],
      load:async function(){await profs();return (await sel('product_qna')).map(function(r){return [r.id,{pid:r.product_id,uid:lg(r.user_id),name:r.author_name,text:r.body,at:r.created_at}]})},
      add:async function(d){ck(await sb.from('product_qna').insert({product_id:d.pid,author_name:d.name||'',body:d.text}))},
      del:async function(id){ck(await sb.from('product_qna').delete().eq('id',id))}},
    qreplies:{t:['product_qna_replies'],
      load:async function(){return (await sel('product_qna_replies')).map(function(r){return [r.qna_id,{text:r.body,at:r.created_at}]})},
      set:async function(id,d){ck(await sb.from('product_qna_replies').upsert({qna_id:id,body:d.text},{onConflict:'qna_id'}))},
      del:async function(id){ck(await sb.from('product_qna_replies').delete().eq('qna_id',id))}},
    likes:{t:['product_likes','profiles'],
      load:async function(){await profs();var me=ck(await sb.auth.getUser());var mid=me&&me.user&&me.user.id;return (await sel('product_likes')).map(function(l){var u=l.user_id===mid?lg(mid):lg(l.user_id);H.likes.c[l.product_id+'_'+u]=[l.product_id,l.user_id];return [l.product_id+'_'+u,{pid:l.product_id,uid:u}]})},
      c:{},
      set:async function(id,d){ck(await sb.from('product_likes').insert({product_id:d.pid}))},
      del:async function(id){var c=H.likes.c[id];if(!c)return;ck(await sb.from('product_likes').delete().eq('product_id',c[0]).eq('user_id',c[1]))}}
  };
  function mk(id,data){return {id:id,exists:true,data:function(){return JSON.parse(JSON.stringify(data))}}}
  function none(){return {exists:false,id:null,data:function(){return undefined}}}
  function watch(h,load,er){
    var alive=true,tm=null,chs=[];
    function run(){if(!alive)return;load().catch(function(e){if(er)er(e)})}
    function soon(){clearTimeout(tm);tm=setTimeout(run,250)}
    run();
    h.t.forEach(function(t){try{chs.push(sb.channel('rt-'+t+'-'+(++nrt)).on('postgres_changes',{event:'*',schema:'public',table:t},soon).subscribe())}catch(e){}});
    var iv=setInterval(run,60000);
    return function(){alive=false;clearTimeout(tm);clearInterval(iv);chs.forEach(function(c){try{sb.removeChannel(c)}catch(e){}})}
  }
  function col(coll,filters){var h=H[coll];if(!h)throw new Error('unknown collection '+coll);
    async function docs(){var r=await h.load();return r.filter(function(x){return (filters||[]).every(function(f){return x[1][f[0]]===f[1]})}).map(function(x){return mk(x[0],x[1])})}
    return {
      where:function(f,op,v){if(op!=='==')throw new Error('unsupported');return col(coll,(filters||[]).concat([[f,v]]))},
      onSnapshot:function(cb,er){return watch(h,async function(){cb({docs:await docs()})},er)},
      add:async function(d){if(!h.add)throw new Error('read only');await h.add(d)}}}
  function doc(path){var i=path.indexOf('/'),coll=path.slice(0,i),id=path.slice(i+1),h=H[coll];if(!h)throw new Error('unknown collection '+coll);
    async function get(){
      if(coll==='accounts'){var r=ck(await sb.from('profiles').select('id,login_id,name,phone,role,created_at').eq('login_id',id).maybeSingle());return r?mk(r.login_id,acctDoc(r)):none()}
      var rows=await h.load();var x=rows.find(function(y){return y[0]===id});return x?mk(x[0],x[1]):none()}
    return {get:get,
      set:async function(d){if(!h.set)throw new Error('read only');await h.set(id,d)},
      update:async function(d){if(h.update){await h.update(id,d);return}var e=new Error('missing');e.code='invalid_argument';throw e},
      delete:async function(){if(!h.del)throw new Error('read only');await h.del(id)},
      onSnapshot:function(cb,er){return watch(h,async function(){cb(await get())},er)}}}
  return {doc:doc,collection:function(c){return col(c,[])}};
}
var sbAssetsObj={upload:async function(file){var id='u'+sbRnd(12);var r=await SB.storage.from('uploads').upload(id,file,{contentType:file.type||'application/octet-stream'});if(r.error)throw r.error;return {id:id}}};
function getAssets(){if(SB)return Promise.resolve(sbAssetsObj);return (window.claude&&window.claude.use)?window.claude.use('assets'):Promise.resolve(null)}
function sbEmail(id){return id+'@sellerport.app'}
