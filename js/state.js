/* 앱 상태, 상품 조회, 토스트, 주문 목록 */
"use strict";
var ST={db:null,write:null,acct:null,admin:false,products:null,notices:null,settings:{},
  myDoc:null,myFulfil:null,myWallet:null,allOrders:null,allFulfil:{},allWallet:{},accounts:null,
  cart:[],form:{pay:'bank',name:'',phone:'',dep:'',addr:'',agree:false,pts:0},route:'home',err:'',cat:'all',sort:'pop',
  calc:{pid:'',qty:1},atab:'orders',afilter:'all',busy:false,pending:false,ltab:'in',lerr:'',ready:false,next:'',pendingAdd:null,loginMsg:'',inq:null,replies:{},adminInq:null,ofilter:'all',sel:null,gi:0,ierr:'',dtab:'info',only:'',modal:null,reviews:[],pqa:[],qrep:{},pedit:'',pdraft:null,pnew:false,pdelc:'',upmsg:'',presetQty:0,likes:[],paywin:null};
var subs=[];
try{var c=JSON.parse(localStorage.getItem('sp-cart')||'[]');if(Array.isArray(c))ST.cart=c.filter(function(x){return x&&x.pid}).map(function(x){return x.lid?x:{lid:newLid(),pid:x.pid,qty:x.qty||1,opts:{},inputs:x.note?{f1:x.note}:{}}})}catch(e){}
function saveCart(){try{localStorage.setItem('sp-cart',JSON.stringify(ST.cart))}catch(e){}}

function products(){var p=(ST.products&&ST.products.length)?ST.products:DEFAULTS;return p.slice().sort(function(a,b){return (a.order||0)-(b.order||0)})}
function activeProducts(){return products().filter(function(p){return !p.hidden})}
function byId(id){return products().find(function(p){return p.id===id})}
function unit(p){return (p.sale>0&&p.sale<p.price)?p.sale:p.price}
function noteCount(n){return String(n||'').split('\n').map(function(s){return s.trim()}).filter(Boolean).length}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(function(){t.hidden=true},3200)}
function myOrders(){var l=(ST.myDoc&&ST.myDoc.list)||[];var f=(ST.myFulfil&&ST.myFulfil.orders)||{};
  return l.map(function(o){var x=f[o.id]||{};return Object.assign({},o,{status:x.status||'pending',memo:x.memo||''})}).sort(function(a,b){return a.createdAt<b.createdAt?1:-1})}
function chip(s){var x=STATUS[s]||STATUS.pending;return '<span class="chip '+x[1]+'">'+x[0]+'</span>'}
async function hashPw(id,pw){var b=new TextEncoder().encode(id+':'+pw);var h=await crypto.subtle.digest('SHA-256',b);return Array.from(new Uint8Array(h)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')}
var ID_RE=/^[a-z0-9_-]{4,20}$/;

