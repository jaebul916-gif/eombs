/* 상수와 기본 상품 데이터 */
"use strict";
var TYPES={register:'배송등록',domestic:'국내택배',storage:'보관',credit:'적립금',goods:'물품'};
var CATS={all:'전체',shopee:'쇼피',qoo10:'큐텐',etc:'기타'};
var STATUS={pending:['입금대기','warn'],paid:['결제완료','accent'],working:['처리중','accent'],done:['완료','ok'],canceled:['취소','bad']};
var COURIERS=['CJ대한통운','한진택배','롯데택배','우체국택배','로젠택배','경동택배','대신택배','GS25편의점택배','CU편의점택배','기타'];
var REG_FIELDS=[
 {id:'f1',label:'택배운송장번호',type:'text',required:true,unique:true,placeholder:'필수입력'},
 {id:'f2',label:'제품명/색상/수량',type:'text',required:true,placeholder:'필수입력'},
 {id:'f3',label:'상품url',type:'text',required:true,placeholder:'필수입력'},
 {id:'f4',label:'배송요청사항',type:'text',required:true,placeholder:'필수입력'},
 {id:'f5',label:'택배사명(예:대한통운)',type:'select',required:true,options:COURIERS,placeholder:'택배사명(예:대한통운) (필수)'},
 {id:'f6',label:'송장 파일 업로드(PDF)',type:'file',required:true,stage:'order',help:'마켓에서 받은 waybill 파일'}];
var REG_OPTS=[{id:'g1',name:'옵션',required:true,placeholder:'옵션 (선택)',choices:[{label:'옵션없음',add:0},{label:'박스교체',add:300},{label:'화장품사은품추가',add:300},{label:'맥심모카골드추가',add:300},{label:'마스크팩추가',add:500},{label:'이니스프리마스크팩',add:1000},{label:'대형포장',add:500}]}];
var REG_DETAIL=[
 {t:'h',text:'배송등록 사용 방법'},
 {t:'p',text:'1. 해외 마켓 주문이 들어온 상품을 국내 쇼핑몰에서 구매합니다.\n2. 이 페이지에서 택배 운송장번호, 제품명/색상/수량, 상품 URL, 배송요청사항, 택배사를 입력합니다.\n3. 옵션을 고른 뒤 구매하기를 누르고, 다음 단계에서 마켓 송장 파일(PDF)을 올립니다.\n4. 결제를 마치면 배송지에 도착한 상품을 확인해 접수 후 발송합니다.'},
 {t:'note',text:'운송장번호는 배대지로 도착할 상품의 번호를 적어 주세요. 같은 번호는 한 번만 접수됩니다. 부분 배송이 필요하면 배송요청사항에 적어 주세요.'},
 {t:'h',text:'옵션 안내'},
 {t:'p',text:'옵션없음 (+0원)\n도착한 상품을 완충재로 감싸 그대로 발송합니다.\n\n박스교체 (+300원)\n상품에 맞는 박스로 바꿔 다시 포장해 발송합니다.\n\n화장품사은품추가 (+300원)\n샘플 화장품을 무작위로 함께 넣어 보냅니다.\n\n맥심모카골드추가 (+300원)\n커피 스틱을 함께 넣어 보냅니다.\n\n마스크팩추가 (+500원)\n마스크팩을 함께 넣어 보냅니다.\n\n이니스프리마스크팩 (+1,000원)\n해당 브랜드 마스크팩을 함께 넣어 보냅니다.\n\n대형포장 (+500원)\n가로+세로+높이 합이 1m 이상인 상품일 때 선택해 주세요.'},
 {t:'note',text:'옵션이 필요 없으면 옵션없음을 선택해 주세요. 입력 후 구매하기를 누르면 추가 정보 입력(송장 업로드)과 결제 단계로 이동합니다.'}];
var DEFAULTS=[
 {id:'s-shopee',cat:'shopee',type:'register',name:'쇼피 배송등록',desc:'쇼피 주문번호를 입력하면 한 건씩 배송을 접수합니다.',price:2000,sale:1900,unit:'건',best:true,soldout:false,order:1,pointRate:1,hideQty:true,options:REG_OPTS,fields:REG_FIELDS,detail:REG_DETAIL},
 {id:'s-shopee-bundle',cat:'shopee',type:'register',name:'쇼피 합배송등록',desc:'같은 구매자의 여러 주문을 한 상자로 묶어 접수합니다.',price:2500,sale:2200,unit:'건',best:false,soldout:false,order:2,pointRate:1,hideQty:true,options:REG_OPTS,fields:REG_FIELDS,detail:REG_DETAIL},
 {id:'s-qoo10',cat:'qoo10',type:'register',name:'큐텐(KSE) 배송등록',desc:'큐텐 주문번호를 입력해 한 건씩 배송을 접수합니다.',price:2000,sale:1900,unit:'건',best:true,soldout:false,order:3,pointRate:1,hideQty:true,options:REG_OPTS,fields:REG_FIELDS,detail:REG_DETAIL},
 {id:'s-qoo10-bundle',cat:'qoo10',type:'register',name:'큐텐(KSE) 합배송등록',desc:'같은 구매자의 큐텐 주문을 한 상자로 묶어 접수합니다.',price:2500,sale:2200,unit:'건',best:false,soldout:false,order:4,pointRate:1,hideQty:true,options:REG_OPTS,fields:REG_FIELDS,detail:REG_DETAIL},
 {id:'s-domestic',cat:'etc',type:'domestic',name:'국내 택배 서비스',desc:'국내 구간 택배 발송을 대행합니다. 보내는 곳과 받는 곳을 남겨 주세요.',price:3000,sale:0,unit:'건',best:false,soldout:false,order:5},
 {id:'s-storage',cat:'etc',type:'storage',name:'물품 보관 서비스',desc:'입고된 물품을 보관합니다. 품목과 기간을 요청 메모에 적어 주세요.',price:30000,sale:20000,unit:'건',best:false,soldout:false,order:6},
 {id:'s-credit',cat:'etc',type:'credit',name:'적립금 충전',desc:'적립금을 충전해 다음 주문부터 결제에 사용합니다.',price:10000,sale:0,credit:10000,unit:'회',best:true,soldout:false,order:7},
 {id:'s-label',cat:'shopee',type:'goods',name:'쇼피 송장 라벨지 100×100 (500매)',desc:'바코드 프린터용 감열 라벨지입니다. 배송지가 필요합니다.',price:10000,sale:7500,unit:'개',best:false,soldout:false,order:8}
];
