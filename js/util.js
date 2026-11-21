/* 공통 도구 (이스케이프, 금액, 날짜) */
"use strict";
var app=document.getElementById('app');
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function won(n){return Number(n||0).toLocaleString('ko-KR')+'원'}
function dt(iso){try{return new Date(iso).toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
