<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SeaSalt Command Center</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#F5F6FA;color:#1A1D26;font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}
.sl{display:flex;align-items:center;gap:9px;padding:8px 14px;border-radius:9px;font-size:.78rem;font-weight:500;color:#6B7280;cursor:pointer;transition:.15s}
.sl:hover{background:rgba(0,0,0,.04);color:#1A1D26}
.sl.on{background:rgba(212,69,26,.08);color:#D4451A;font-weight:600}
.cd{background:#fff;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.ch{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:1px solid #F0F1F3}
.ch h3{font-size:.8rem;font-weight:600;color:#1A1D26}
.bg{font-size:.55rem;font-family:'Space Mono',monospace;padding:2px 7px;border-radius:5px}
.bg-l{background:rgba(34,197,94,.08);color:#16A34A}
.tbl{width:100%;border-collapse:collapse}
.tbl th{text-align:left;padding:8px 10px;font-size:.54rem;color:#9CA3AF;text-transform:uppercase;letter-spacing:.05em;font-family:'Space Mono',monospace;border-bottom:1px solid #F0F1F3;background:#FAFBFC}
.tbl td{padding:9px 10px;border-bottom:1px solid #F5F6FA;font-size:.76rem;color:#374151}
.tbl tr:last-child td{border-bottom:none}
.tbl tr.clk{cursor:pointer}.tbl tr.clk:hover{background:#FFF7ED}
.btn{padding:7px 14px;border-radius:7px;border:none;font-family:'DM Sans',sans-serif;font-weight:600;font-size:.72rem;cursor:pointer;display:inline-flex;align-items:center;gap:4px}
.bp{background:#D4451A;color:#fff}.bp:hover{background:#B93A15}
.bg2{background:#fff;color:#374151;border:1px solid #E5E7EB}.bg2:hover{border-color:#D4451A}
.bw{background:#25D366;color:#fff}.bw:hover{background:#20BD5A}
.bs{padding:4px 10px;font-size:.64rem;border-radius:5px}
.inp{width:100%;padding:6px 10px;border-radius:7px;background:#FAFBFC;border:1px solid #E5E7EB;color:#1A1D26;font-size:.74rem;font-family:'DM Sans',sans-serif}
.inp:focus{outline:none;border-color:#D4451A;background:#fff}
select.inp{cursor:pointer}
.tag{display:inline-block;padding:2px 8px;border-radius:5px;font-size:.58rem;font-weight:600;font-family:'Space Mono',monospace}
a{color:#2563EB;text-decoration:none}a:hover{text-decoration:underline}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.dot{width:6px;height:6px;border-radius:50%;background:#22C55E;box-shadow:0 0 6px rgba(34,197,94,.5);animation:pulse 2s infinite}
@keyframes spin{to{transform:rotate(360deg)}}.spinner{width:16px;height:16px;border:2px solid #E5E7EB;border-top-color:#D4451A;border-radius:50%;animation:spin .6s linear infinite}
@keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}.fade{animation:fadeIn .2s ease}
.gd{display:grid;gap:12px}.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:1fr 1fr 1fr}.g4{grid-template-columns:repeat(4,1fr)}.g5{grid-template-columns:repeat(5,1fr)}
.st{padding:16px}.st .lb{font-size:.5rem;color:#9CA3AF;text-transform:uppercase;font-family:'Space Mono',monospace;margin-bottom:4px}
.st .vl{font-size:1.4rem;font-weight:700;color:#1A1D26}.st .sb{font-size:.55rem;margin-top:2px;color:#6B7280}
.hidden{display:none!important}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:100;display:flex;align-items:center;justify-content:center}
.modal{background:#fff;border:1px solid #E5E7EB;border-radius:14px;padding:22px;width:520px;max-width:95vw;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.15)}
.wa-popup{position:fixed;bottom:20px;right:20px;background:#25D366;color:#fff;padding:14px 20px;border-radius:12px;z-index:90;box-shadow:0 4px 20px rgba(0,0,0,.2);font-size:.82rem;display:flex;align-items:center;gap:10px}
.bar{height:28px;border-radius:4px;background:linear-gradient(135deg,#D4451A,#FF6B4D);min-width:4px;transition:width .3s}
.sec-label{font-size:.46rem;color:#9CA3AF;text-transform:uppercase;letter-spacing:.1em;padding:0 14px 4px;font-family:'Space Mono',monospace}
.prod-img{width:40px;height:40px;border-radius:8px;object-fit:cover;background:#F5F6FA;border:1px solid #E5E7EB}
.user-row{cursor:pointer;transition:.1s}.user-row:hover{background:#FFF7ED}
.status-confirmed{background:#DCFCE7;color:#16A34A}.status-preparing{background:#FEF9C3;color:#CA8A04}.status-dispatched{background:#DBEAFE;color:#2563EB}.status-delivered{background:#D1FAE5;color:#059669}.status-cancelled{background:#FEE2E2;color:#DC2626}
</style>
</head>
<body>
<div style="display:flex;min-height:100vh">
<aside style="width:210px;background:#fff;border-right:1px solid #E5E7EB;padding:14px 10px;display:flex;flex-direction:column;position:fixed;height:100vh;z-index:10;overflow-y:auto">
  <div style="display:flex;align-items:center;gap:7px;padding:3px 8px;margin-bottom:14px"><div style="width:32px;height:32px;background:#D4451A;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:1rem;color:#fff">S</div><div><div style="font-weight:700;font-size:.82rem;color:#1A1D26">SeaSalt</div><div style="font-size:.48rem;color:#9CA3AF;font-family:'Space Mono',monospace">Command Center</div></div></div>
  <div class="sec-label">Admin</div>
  <div class="sl" onclick="go('dash')" id="n-dash">📊 Dashboard</div>
  <div class="sl" onclick="go('orders')" id="n-orders">📦 Orders</div>
  <div class="sl" onclick="go('products')" id="n-products">🏷️ Products</div>
  <div class="sl" onclick="go('users')" id="n-users">👥 Users</div>
  <div class="sl" onclick="go('shipping')" id="n-shipping">🚚 Shipping</div>
  <div class="sl" onclick="go('notifs')" id="n-notifs">🔔 Notifications <span id="notif-badge" style="background:#D4451A;color:#fff;font-size:.5rem;padding:1px 5px;border-radius:8px;margin-left:auto" class="hidden">0</span></div>
  <div class="sl" onclick="go('settings')" id="n-settings">⚙️ Settings</div>
  <div class="sec-label" style="padding-top:8px">Intelligence</div>
  <div class="sl" onclick="go('intel')" id="n-intel">🏆 Competitors</div>
  <div class="sl" onclick="go('spy')" id="n-spy">🕵️ Social Spy</div>
  <div class="sl" onclick="go('insights')" id="n-insights">🧠 Insights</div>
  <div class="sl" onclick="go('content')" id="n-content">📱 Content Studio</div>
  <div class="sec-label" style="padding-top:8px">Links</div>
  <div class="sl" onclick="window.open('https://seasaltpickles.com','_blank')">🌐 Store</div>
  <div class="sl" onclick="window.open('https://dashboard.razorpay.com','_blank')">💳 Razorpay</div>
  <div class="sl" onclick="window.open('https://supabase.com/dashboard','_blank')">🗄️ Supabase</div>
  <div style="flex:1"></div>
  <div style="padding:8px;border-top:1px solid #E5E7EB;font-size:.52rem;color:#9CA3AF;font-family:'Space Mono',monospace"><div style="display:flex;align-items:center;gap:4px"><div class="dot"></div> Live</div><div style="margin-top:2px">Sync: <span id="sb-sync">-</span></div></div>
</aside>
<main style="flex:1;margin-left:210px;padding:20px 24px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px"><div><h1 id="pt" style="font-size:1.15rem;font-weight:700;color:#1A1D26">📊 Dashboard</h1><p id="ps" style="font-size:.65rem;color:#9CA3AF;margin-top:2px">Overview</p></div><div style="display:flex;gap:4px"><div id="sp" class="spinner hidden"></div><button class="btn bg2 bs" onclick="syncNow()">🔄 Sync</button><button class="btn bp bs" onclick="scanSocial()">🕵️ Spy</button></div></div>
  <div id="ct" class="fade"></div>
  <div id="wa-pop"></div>
  <div id="modal-area"></div>
</main>
</div>
<script>

var SB='https://yosjbsncvghpscsrvxds.supabase.co',SK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvc2pic25jdmdocHNjc3J2eGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjc3NTgsImV4cCI6MjA4NTgwMzc1OH0.PNEbeofoyT7KdkzepRfqg-zqyBiGAat5ElCMiyQ4UAs';
var ADMIN_PHONE='919963971447',TRACK_URL='https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx';
var SHIP_PARTNERS=['India Post','DTDC','Delhivery','BlueDart','Ekart','Self Delivery'];
var STATUSES=['confirmed','preparing','dispatched','delivered','cancelled'];
var STAT_E={confirmed:'\u2705',preparing:'\uD83D\uDC68\u200D\uD83C\uDF73',dispatched:'\uD83D\uDE9A',delivered:'\uD83C\uDF89',cancelled:'\u274C'};
var PLATS=[{id:"ig_post",l:"IG Post",i:"\uD83D\uDCF8"},{id:"ig_reel",l:"Reel",i:"\uD83C\uDFAC"},{id:"fb_post",l:"FB",i:"\uD83D\uDCD8"},{id:"g_post",l:"Google",i:"\uD83D\uDCCD"},{id:"wa_msg",l:"WA",i:"\uD83D\uDCAC"},{id:"yt_short",l:"YT",i:"\u25B6\uFE0F"}];
var CS={'Vellanki Foods':{ig:'vellankifoods',fb:'VellankiFoods'},'Priya Pickles':{ig:'priyafoodsofficial',fb:'PriyaFoodsOfficial'},'Nirupama Pickles':{ig:'nirupamapickles'},'Tulasi Pickles':{fb:'tulasipickleshyderabad'},'Aavarampoo Pickles':{ig:'aavarampoo_pickles'},'Sitara Pickles':{ig:'sitarafoods'},'Ruchulu Pickles':{ig:'ruchulupickles'},'Ammas Homemade Pickles':{},'Andhra Pickles':{},'Hyderabad Pickles':{}};
var pg='dash',dr=null,selUser=null,comps=[],revs=[],ads=[],eu=[],up=[];
var orders=[],users=[],walletTx=[],products=[],deliveryCharges=[],notifs=[],notifConfig=null;
var sPl='ig_post',sPr='Avakaya Mango Pickle';

function ta(d){if(!d)return'-';var s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return s+'s';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';return Math.floor(s/86400)+'d';}
function fs2(s){if(!s||s==='0')return'-';var n=parseInt(s);if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n+'';}
function st(r){return '\u2605'.repeat(Math.floor(r||0))+'\u2606'.repeat(5-Math.floor(r||0));}
function e(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML;}
function sh(){return{'apikey':SK,'Authorization':'Bearer '+SK};}
async function sg(t,p){try{var r=await fetch(SB+'/rest/v1/'+t+'?'+(p||''),{headers:sh()});return r.ok?await r.json():[];}catch(x){return[];}}
async function si(t,d){try{var r=await fetch(SB+'/rest/v1/'+t,{method:'POST',headers:Object.assign({'Content-Type':'application/json','Prefer':'return=representation'},sh()),body:JSON.stringify(d)});return r.ok;}catch(x){return false;}}
async function su(t,f,d){try{var r=await fetch(SB+'/rest/v1/'+t+'?'+f,{method:'PATCH',headers:Object.assign({'Content-Type':'application/json','Prefer':'return=representation'},sh()),body:JSON.stringify(d)});return r.ok;}catch(x){return false;}}
async function sd(t,f){try{var r=await fetch(SB+'/rest/v1/'+t+'?'+f,{method:'DELETE',headers:sh()});return r.ok;}catch(x){return false;}}

async function ld(){try{
orders=await sg('orders','select=*&order=created_at.desc&limit=200');
users=await sg('users','select=*&order=last_seen.desc&limit=300');
try{walletTx=await sg('wallet_transactions','select=*&order=created_at.desc&limit=100');}catch(x){walletTx=[];}
try{products=await sg('products','select=*&order=name');}catch(x){products=[];}
try{deliveryCharges=await sg('delivery_charges','select=*&order=id');}catch(x){deliveryCharges=[];}
try{notifs=await sg('admin_notifications','select=*&order=created_at.desc&limit=50');}catch(x){notifs=[];}
try{var nc=await sg('notification_config','select=*&id=eq.1');notifConfig=nc[0]||null;}catch(x){}
comps=await sg('competitors','select=*&order=google_reviews_count.desc');
revs=await sg('competitor_reviews','select=*&order=publish_time.desc&limit=50');
try{ads=await sg('competitor_ads','select=*&order=detected_at.desc&limit=50');}catch(x){ads=[];}
if(comps.length&&comps[0].last_synced)document.getElementById('sb-sync').textContent=ta(comps[0].last_synced);
var unread=notifs.filter(function(n){return!n.read;}).length;
var nb=document.getElementById('notif-badge');if(unread>0){nb.textContent=unread;nb.classList.remove('hidden');}else nb.classList.add('hidden');
}catch(x){console.error(x);}rn();}
async function ls(){try{var r=await fetch('/.netlify/functions/social-listen?action=get-users');var d=await r.json();eu=d.users||[];up=d.profiles||[];}catch(x){eu=[];up=[];}}

function spin(on){document.getElementById('sp').classList[on?'remove':'add']('hidden');}
async function syncNow(){spin(1);try{var r=await fetch('/.netlify/functions/intel-sync?action=sync');var d=await r.json();alert(d.success?'Synced! Reviews:'+(d.review_count||0):'Error');await ld();}catch(x){alert(x.message);}spin(0);}
async function scanSocial(){spin(1);try{var r=await fetch('/.netlify/functions/social-listen?action=scan');var d=await r.json();if(d.success){alert('Users:'+d.total_users+' Profiled:'+d.total_profiled);await ls();rn();}else alert('Failed');}catch(x){alert(x.message);}spin(0);}

function waT(o,s){var n=o.customer_name||'Customer',id=o.id||'',trk=o.tracking_number||'';var m={confirmed:'Hi '+n+'! \u2705 Order #'+id+' confirmed! Getting ready.',preparing:'Hi '+n+'! \uD83D\uDC68\u200D\uD83C\uDF73 Order #'+id+' being prepared!',dispatched:'Hi '+n+'! \uD83D\uDE9A Order #'+id+' dispatched! Track: '+trk+'\n'+TRACK_URL,delivered:'Hi '+n+'! \uD83C\uDF89 Order #'+id+' delivered! Enjoy!',cancelled:'Hi '+n+', Order #'+id+' cancelled.'};return m[s]||'';}

function showWaPop(ph,msg){
  var el=document.getElementById('wa-pop');
  var url='https://wa.me/'+String(ph).replace(/\+/g,'')+'?text='+encodeURIComponent(msg);
  el.innerHTML='<div class="wa-popup">\uD83D\uDCF1 Send WhatsApp? <button class="btn bw bs" onclick="window.open(\''+url+'\',\'_blank\');document.getElementById(\'wa-pop\').innerHTML=\'\'">Send \u2192</button><button class="btn bg2 bs" onclick="document.getElementById(\'wa-pop\').innerHTML=\'\'">\u2715</button></div>';
  setTimeout(function(){document.getElementById('wa-pop').innerHTML='';},15000);
}

async function updateStatus(oid,newStatus){
  var ok=await su('orders','id=eq.'+oid,{status:newStatus});
  if(ok){
    var ord=orders.find(function(o){return o.id===oid;});
    if(ord){
      ord.status=newStatus;
      var msg=waT(ord,newStatus);
      if(ord.customer_phone&&msg)showWaPop(ord.customer_phone,msg);
    }
    rn();
  }else{alert('Status update failed');}
}
async function updateTracking(oid){var v=document.getElementById('trk-'+oid);if(v){var ok=await su('orders','id=eq.'+oid,{tracking_number:v.value});if(ok){var o=orders.find(function(x){return x.id===oid;});if(o)o.tracking_number=v.value;alert('Saved!');}else alert('Failed');}}
async function updateShipPartner(oid){var v=document.getElementById('ship-'+oid);if(v)await su('orders','id=eq.'+oid,{shipping_partner:v.value});}

async function addWallet(ph){var amt=prompt('Add wallet (\u20B9):');if(!amt||isNaN(amt))return;var n=parseFloat(amt);var u=users.find(function(x){return x.phone===ph;});var nb=(u?parseFloat(u.wallet_balance||0):0)+n;await su('users','phone=eq.'+encodeURIComponent(ph),{wallet_balance:nb,wallet_expires_at:new Date(Date.now()+48*3600000).toISOString()});await si('wallet_transactions',{user_phone:ph,amount:n,type:'admin_credit',description:'Admin +\u20B9'+n,balance_after:nb});alert('\u20B9'+nb);await ld();}

function closeModal(){document.getElementById('modal-area').innerHTML='';}
function showProductModal(pid){
  var p=pid?products.find(function(x){return x.id==pid;}):null;
  var isNew=!p;p=p||{};
  var h='<div class="modal-bg" onclick="closeModal()"><div class="modal" onclick="event.stopPropagation()">';
  h+='<h3 style="font-size:.88rem;font-weight:700;margin-bottom:12px">'+(isNew?'Add':'Edit')+' Product</h3>';
  h+='<input type="hidden" id="p-id" value="'+(p.id||'')+'">';
  h+='<div style="margin-bottom:7px"><label style="font-size:.52rem;color:#9CA3AF">Name</label><input id="p-name" class="inp" value="'+e(p.name||'')+'"></div>';
  h+='<div class="gd g3" style="margin-bottom:7px"><div><label style="font-size:.52rem;color:#9CA3AF">Price (\u20B9)</label><input id="p-price" class="inp" type="number" value="'+(p.price||'')+'"></div><div><label style="font-size:.52rem;color:#9CA3AF">Category</label><input id="p-cat" class="inp" value="'+e(p.category||'')+'"></div><div><label style="font-size:.52rem;color:#9CA3AF">Weight</label><input id="p-weight" class="inp" value="'+e(p.weight||p.variant||'')+'"></div></div>';
  h+='<div style="margin-bottom:7px"><label style="font-size:.52rem;color:#9CA3AF">Description</label><textarea id="p-desc" class="inp" rows="2" style="resize:vertical">'+e(p.description||'')+'</textarea></div>';
  h+='<div style="margin-bottom:7px"><label style="font-size:.52rem;color:#9CA3AF">Image URL</label><input id="p-img" class="inp" value="'+e(p.image_url||'')+'"></div>';
  h+='<div style="margin-bottom:10px"><label style="font-size:.52rem;color:#9CA3AF;display:flex;align-items:center;gap:5px"><input type="checkbox" id="p-active" '+(p.is_active!==false?'checked':'')+'>Active</label></div>';
  h+='<div style="display:flex;gap:5px"><button class="btn bp" onclick="saveProduct('+isNew+')">Save</button><button class="btn bg2" onclick="closeModal()">Cancel</button></div>';
  h+='</div></div>';
  document.getElementById('modal-area').innerHTML=h;
}
async function saveProduct(isNew){
  var nm=document.getElementById('p-name').value,pr=document.getElementById('p-price').value,cat=document.getElementById('p-cat').value,wt=document.getElementById('p-weight').value,desc=document.getElementById('p-desc').value,img=document.getElementById('p-img').value,act=document.getElementById('p-active').checked;
  if(!nm){alert('Name required');return;}
  var data={name:nm,price:parseFloat(pr)||0,category:cat,weight:wt,description:desc,image_url:img,is_active:act};
  var ok;if(isNew)ok=await si('products',data);else{var id=document.getElementById('p-id').value;ok=await su('products','id=eq.'+id,data);}
  if(ok){closeModal();await ld();}else alert('Failed');
}
async function deleteProduct(id){if(confirm('Delete?')){await sd('products','id=eq.'+id);await ld();}}
async function addDeliveryCharge(){var pin=prompt('Pincode prefix:');var amt=prompt('Charge (\u20B9):');if(!pin||!amt)return;await si('delivery_charges',{pincode_prefix:pin,charge:parseFloat(amt),region:prompt('Region:')||''});await ld();}
async function deleteCharge(id){if(confirm('Delete?')){await sd('delivery_charges','id=eq.'+id);await ld();}}
async function logUser(){var u=document.getElementById('lu-u').value.trim(),p=document.getElementById('lu-p').value,c=document.getElementById('lu-c').value,t=document.getElementById('lu-t').value,tx=document.getElementById('lu-x').value.trim();if(!u){alert('Enter username');return;}var h2=u.replace('@','');var url=p==='Instagram'?'https://instagram.com/'+h2:p==='Facebook'?'https://facebook.com/'+h2:p==='LinkedIn'?'https://linkedin.com/in/'+h2:p==='Twitter/X'?'https://x.com/'+h2:'https://youtube.com/@'+h2;var ok=await si('engaged_users',{username:h2,display_name:h2,profile_url:url,platform:p,competitor_name:c,engagement_type:t,content_text:tx||'Manual',content_url:'',video_title:'Manual',detected_at:new Date().toISOString()});if(ok){document.getElementById('lu-u').value='';document.getElementById('lu-x').value='';alert('Logged!');await ls();rn();}else alert('Failed');}
function gc(p,pr){var m={ig_post:'Craving '+pr+'?\n\nHandmade, cold-pressed oil, zero preservatives.\n\nseasaltpickles.com | +91 9963971447\n\n#SeaSaltPickles #Hyderabad',ig_reel:'REEL: '+pr+'\n[0-2s] Jar opening\n[2-5s] Ingredients\n[5-8s] Mixing\n[8-12s] Shot\n[12-15s] CTA',fb_post:'Fresh '+pr+'!\nCold-pressed oil, zero preservatives.\nseasaltpickles.com',g_post:'Fresh '+pr+'! seasaltpickles.com',wa_msg:'*SeaSalt*\n*'+pr+'* ready!\nFrom \u20B9249\nReply ORDER!',yt_short:'SHORT: '+pr+'\n[0-3s] Machines vs tradition\n[3-9s] Making\n[9-15s] CTA'};return m[p]||'';}
function ai(c){var a=[];if((c.active_ads_count||0)>2)a.push('\uD83D\uDD34 Running ads.');if((c.google_rating||0)>=4.5)a.push('\uD83D\uDFE1 High rated.');if((c.active_ads_count||0)===0)a.push('\uD83D\uDFE2 No ads.');if(!a.length)a.push('\uD83D\uDD35 Monitor.');return a;}
function go(p){pg=p;dr=null;selUser=null;rn();window.scrollTo(0,0);}
function dd(n){for(var i=0;i<comps.length;i++)if(comps[i].name===n){dr=comps[i];break;}rn();}
function selectUser(ph){selUser=users.find(function(u){return u.phone===ph;})||null;rn();}


function rn(){
var el=document.getElementById('ct'),t=document.getElementById('pt'),s=document.getElementById('ps');
el.className='fade';
['dash','orders','products','users','shipping','notifs','settings','intel','spy','insights','content'].forEach(function(n){var nd=document.getElementById('n-'+n);if(nd)nd.className=pg===n?'sl on':'sl';});
var h='';

if(pg==='dash'){
t.textContent='\uD83D\uDCCA Dashboard';s.textContent='Business + Intelligence';
var rev=orders.reduce(function(a,o){return a+(o.status!=='cancelled'?parseFloat(o.total||0):0);},0);
var today=orders.filter(function(o){return o.created_at&&new Date(o.created_at).toDateString()===new Date().toDateString();}).length;
var pend=orders.filter(function(o){return o.status==='confirmed'||o.status==='preparing';}).length;
var shipped=orders.filter(function(o){return o.status==='dispatched';}).length;
h+='<div class="gd g4"><div class="cd st"><div class="lb">Revenue</div><div class="vl" style="color:#16A34A">\u20B9'+Math.round(rev).toLocaleString()+'</div><div class="sb">'+orders.length+' orders</div></div>';
h+='<div class="cd st"><div class="lb">Today</div><div class="vl">'+today+'</div><div class="sb" style="color:#CA8A04">'+pend+' pending</div></div>';
h+='<div class="cd st"><div class="lb">Customers</div><div class="vl">'+users.length+'</div></div>';
h+='<div class="cd st"><div class="lb">In Transit</div><div class="vl" style="color:#2563EB">'+shipped+'</div></div></div>';
h+='<div class="cd"><div class="ch"><h3>\uD83D\uDCC8 Last 7 Days</h3></div><div style="padding:12px;display:flex;align-items:flex-end;gap:5px;height:100px">';
for(var di=6;di>=0;di--){var dd2=new Date();dd2.setDate(dd2.getDate()-di);var ds=dd2.toDateString();var dayRev=orders.filter(function(o){return o.created_at&&new Date(o.created_at).toDateString()===ds;}).reduce(function(a,o){return a+parseFloat(o.total||0);},0);var maxR=1;for(var mi=0;mi<7;mi++){var md=new Date();md.setDate(md.getDate()-(6-mi));var mr2=orders.filter(function(o){return o.created_at&&new Date(o.created_at).toDateString()===md.toDateString();}).reduce(function(a,o){return a+parseFloat(o.total||0);},0);if(mr2>maxR)maxR=mr2;}var pct=Math.max(4,dayRev/maxR*70);h+='<div style="flex:1;text-align:center"><div class="bar" style="height:'+pct+'px;margin:0 auto;width:60%"></div><div style="font-size:.48rem;color:#9CA3AF;margin-top:3px">'+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dd2.getDay()]+'</div></div>';}
h+='</div></div>';
h+='<div class="gd g2"><div class="cd"><div class="ch"><h3>\uD83D\uDCE6 Recent Orders</h3><span class="bg bg-l" style="cursor:pointer" onclick="go(\'orders\')">ALL</span></div><div style="padding:10px">';
orders.slice(0,5).forEach(function(o){h+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F0F1F3"><div><span style="font-weight:600;font-size:.72rem;color:#1A1D26">'+e(o.id)+'</span> <span style="font-size:.58rem;color:#9CA3AF">'+e(o.customer_name||'')+'</span></div><div><span style="font-weight:600;color:#16A34A;font-size:.72rem">\u20B9'+Math.round(o.total||0)+'</span> <span class="tag status-'+(o.status||'confirmed')+'" style="margin-left:4px">'+(STAT_E[o.status]||'')+' '+e(o.status||'')+'</span></div></div>';});
h+='</div></div><div class="cd"><div class="ch"><h3>\uD83D\uDC65 Recent Users</h3><span class="bg bg-l" style="cursor:pointer" onclick="go(\'users\')">ALL</span></div><div style="padding:10px">';
users.slice(0,5).forEach(function(u){h+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #F0F1F3"><span style="font-size:.72rem;color:#374151">'+e(u.name||'?')+'</span><span style="color:#16A34A;font-size:.72rem;font-weight:600">\u20B9'+(u.wallet_balance||0)+'</span></div>';});
h+='</div></div></div>';
}

else if(pg==='orders'){
t.textContent='\uD83D\uDCE6 Orders';s.textContent=orders.length+' total';
h+='<div class="gd g4"><div class="cd st"><div class="lb">Total</div><div class="vl">'+orders.length+'</div></div><div class="cd st"><div class="lb">Pending</div><div class="vl" style="color:#CA8A04">'+orders.filter(function(o){return o.status==="confirmed"||o.status==="preparing";}).length+'</div></div><div class="cd st"><div class="lb">Shipped</div><div class="vl" style="color:#2563EB">'+orders.filter(function(o){return o.status==="dispatched";}).length+'</div></div><div class="cd st"><div class="lb">Delivered</div><div class="vl" style="color:#16A34A">'+orders.filter(function(o){return o.status==="delivered";}).length+'</div></div></div>';
h+='<div class="cd"><div class="ch"><h3>\uD83D\uDCE6 All Orders</h3><span class="bg bg-l">LIVE</span></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>ID</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Wallet</th><th>Pay</th><th>Status</th><th>Tracking</th><th>Date</th><th>WA</th></tr></thead><tbody>';
orders.forEach(function(o){var items=[];try{items=typeof o.items==="string"?JSON.parse(o.items):(o.items||[]);}catch(x){}var iStr=items.map(function(it){return(it.name||"?").substring(0,12)+" x"+(it.qty||1);}).join(", ");
h+='<tr><td style="font-weight:600;font-size:.68rem;color:#1A1D26">'+e(o.id)+'</td><td>'+e(o.customer_name||'')+'</td><td style="font-size:.64rem;color:#6B7280">'+e(o.customer_phone||'')+'</td><td style="font-size:.6rem;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+e(iStr)+'">'+e(iStr)+'</td><td style="font-weight:600;color:#16A34A">\u20B9'+Math.round(o.total||0)+'</td><td style="font-size:.64rem;color:#CA8A04">'+(o.wallet_used?'\u20B9'+o.wallet_used:'-')+'</td><td style="font-size:.6rem">'+e(o.payment_method||'')+'</td>';
h+='<td><select class="inp" style="width:105px;font-size:.6rem" onchange="updateStatus(\''+o.id+'\',this.value)">';
STATUSES.forEach(function(s2){h+='<option value="'+s2+'"'+(o.status===s2?' selected':'')+'>'+s2+'</option>';});
h+='</select></td>';
h+='<td><div style="display:flex;gap:2px"><input id="trk-'+e(o.id)+'" class="inp" style="width:80px;font-size:.58rem" value="'+e(o.tracking_number||'')+'" placeholder="Track#"><button class="btn bg2" style="padding:2px 5px;font-size:.52rem" onclick="updateTracking(\''+o.id+'\')">\uD83D\uDCBE</button></div></td>';
h+='<td style="font-size:.52rem;color:#9CA3AF">'+ta(o.created_at)+'</td>';
h+='<td>';
if(o.customer_phone){
  var wMsg=waT(o,o.status||'confirmed');
  h+='<button class="btn bw" style="padding:2px 5px;font-size:.52rem" onclick="showWaPop(\''+e(o.customer_phone)+'\',\''+e(wMsg).replace(/'/g,"").substring(0,100)+'\')">\uD83D\uDCAC</button>';
}
h+='</td></tr>';});
h+='</tbody></table></div></div>';
}

else if(pg==='products'){
t.textContent='\uD83C\uDFF7\uFE0F Products';s.textContent=(products.length||'0')+' items';
h+='<div style="margin-bottom:10px"><button class="btn bp" onclick="showProductModal()">+ Add Product</button></div>';
h+='<div class="cd"><div class="ch"><h3>\uD83C\uDFF7\uFE0F Catalog</h3><span class="bg bg-l">SUPABASE</span></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>Image</th><th>Name</th><th>Price</th><th>Weight</th><th>Category</th><th>Active</th><th>Actions</th></tr></thead><tbody>';
if(products.length){products.forEach(function(p,i){
h+='<tr><td>'+(i+1)+'</td>';
h+='<td>'+(p.image_url?'<img src="'+e(p.image_url)+'" class="prod-img" onerror="this.style.display=\'none\'">':'<div class="prod-img" style="display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#9CA3AF">\uD83C\uDFF7</div>')+'</td>';
h+='<td><div style="font-weight:600;color:#1A1D26">'+e(p.name)+'</div>'+(p.description?'<div style="font-size:.58rem;color:#9CA3AF;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+e(p.description)+'</div>':'')+'</td>';
h+='<td style="font-weight:700;color:'+(parseFloat(p.price||0)>0?'#16A34A':'#DC2626')+'">\u20B9'+(p.price||0)+'</td>';
h+='<td style="font-size:.68rem;color:#6B7280">'+e(p.weight||p.variant||'-')+'</td>';
h+='<td><span class="tag" style="background:rgba(212,69,26,.06);color:#D4451A">'+e(p.category||'-')+'</span></td>';
h+='<td>'+(p.is_active!==false?'<span style="color:#16A34A">\u2705</span>':'<span style="color:#DC2626">\u274C</span>')+'</td>';
h+='<td><button class="btn bg2 bs" onclick="showProductModal('+p.id+')">\u270F\uFE0F</button> <button class="btn bg2 bs" onclick="deleteProduct('+p.id+')">\uD83D\uDDD1</button></td></tr>';
});}else h+='<tr><td colspan="8" style="text-align:center;color:#9CA3AF;padding:16px">No products</td></tr>';
h+='</tbody></table></div></div>';
}

else if(pg==='users'&&!selUser){
t.textContent='\uD83D\uDC65 Users & Wallets';s.textContent=users.length+' users';
var tw=users.reduce(function(a,u){return a+parseFloat(u.wallet_balance||0);},0);
h+='<div class="gd g3"><div class="cd st"><div class="lb">Users</div><div class="vl">'+users.length+'</div></div><div class="cd st"><div class="lb">Wallet Total</div><div class="vl" style="color:#16A34A">\u20B9'+Math.round(tw)+'</div></div><div class="cd st"><div class="lb">Transactions</div><div class="vl">'+walletTx.length+'</div></div></div>';
h+='<div class="cd"><div class="ch"><h3>\uD83D\uDC65 All Users</h3><span style="font-size:.52rem;color:#9CA3AF">Click a user for details</span></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Name</th><th>Phone</th><th>Country</th><th>Wallet</th><th>Expires</th><th>Visits</th><th>Last Seen</th><th>Action</th></tr></thead><tbody>';
users.forEach(function(u){
var exp=u.wallet_expires_at?new Date(u.wallet_expires_at):null;var es=exp?(exp>new Date()?ta(u.wallet_expires_at)+' left':'<span style="color:#DC2626">Expired</span>'):'-';
h+='<tr class="user-row" onclick="selectUser(\''+e(u.phone)+'\')" style="cursor:pointer"><td style="font-weight:600;color:#1A1D26">'+e(u.name||'?')+'</td><td style="font-size:.64rem;font-family:monospace;color:#6B7280">'+e(u.phone||'')+'</td><td style="font-size:.64rem">'+e(u.selected_country||'')+'</td><td style="font-weight:600;color:#16A34A">\u20B9'+(u.wallet_balance||0)+'</td><td style="font-size:.58rem;color:#9CA3AF">'+es+'</td><td>'+(u.total_visits||0)+'</td><td style="font-size:.52rem;color:#9CA3AF">'+ta(u.last_seen)+'</td><td><button class="btn bg2 bs" onclick="event.stopPropagation();addWallet(\''+e(u.phone)+'\')">+\u20B9</button></td></tr>';
});
h+='</tbody></table></div></div>';
}

else if(pg==='users'&&selUser){
var u=selUser;
t.innerHTML='<span onclick="selUser=null;rn()" style="cursor:pointer;color:#D4451A">\u2190 Users</span> \u00B7 '+e(u.name||'?');
s.textContent=u.phone||'';
var uOrders=orders.filter(function(o){return o.customer_phone===u.phone;});
var uTx=walletTx.filter(function(t2){return t2.user_phone===u.phone;});
var uRev=uOrders.reduce(function(a,o){return a+parseFloat(o.total||0);},0);
h+='<div class="gd g4"><div class="cd st"><div class="lb">Orders</div><div class="vl">'+uOrders.length+'</div></div><div class="cd st"><div class="lb">Spent</div><div class="vl" style="color:#16A34A">\u20B9'+Math.round(uRev)+'</div></div><div class="cd st"><div class="lb">Wallet</div><div class="vl" style="color:#2563EB">\u20B9'+(u.wallet_balance||0)+'</div></div><div class="cd st"><div class="lb">Visits</div><div class="vl">'+(u.total_visits||0)+'</div></div></div>';
h+='<div class="gd g2"><div class="cd" style="padding:14px"><h4 style="font-size:.76rem;font-weight:600;margin-bottom:8px">\uD83D\uDC64 Profile</h4>';
h+='<div style="font-size:.74rem;color:#374151"><div style="margin-bottom:4px"><strong>Name:</strong> '+e(u.name||'-')+'</div><div style="margin-bottom:4px"><strong>Phone:</strong> '+e(u.phone||'-')+'</div><div style="margin-bottom:4px"><strong>Country:</strong> '+e(u.selected_country||'-')+'</div><div style="margin-bottom:4px"><strong>Last seen:</strong> '+ta(u.last_seen)+'</div><div style="margin-bottom:4px"><strong>Wallet expires:</strong> '+(u.wallet_expires_at?new Date(u.wallet_expires_at).toLocaleDateString():'-')+'</div></div>';
h+='<button class="btn bp bs" style="margin-top:8px" onclick="addWallet(\''+e(u.phone)+'\')">+ Add Wallet</button>';
h+='<button class="btn bw bs" style="margin-top:8px;margin-left:4px" onclick="showWaPop(\''+e(u.phone)+'\',\'Hi '+e(u.name||'')+' from SeaSalt!\')">\uD83D\uDCAC WhatsApp</button>';
h+='</div>';
h+='<div class="cd" style="padding:14px"><h4 style="font-size:.76rem;font-weight:600;margin-bottom:8px">\uD83D\uDCB0 Wallet History</h4>';
if(uTx.length){uTx.forEach(function(t2){h+='<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #F0F1F3;font-size:.72rem"><div><span style="color:#374151">'+e(t2.type||'')+'</span> <span style="color:#9CA3AF;font-size:.6rem">'+e(t2.description||'')+'</span></div><div style="font-weight:600;color:#16A34A">+\u20B9'+(t2.amount||0)+'</div></div>';});}else h+='<div style="color:#9CA3AF;font-size:.72rem">No transactions</div>';
h+='</div></div>';
h+='<div class="cd"><div class="ch"><h3>\uD83D\uDCE6 Order History ('+uOrders.length+')</h3></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>ID</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>';
if(uOrders.length){uOrders.forEach(function(o){var items=[];try{items=typeof o.items==="string"?JSON.parse(o.items):(o.items||[]);}catch(x){}var iStr=items.map(function(it){return(it.name||"?")+" x"+(it.qty||1);}).join(", ");
h+='<tr><td style="font-weight:600;font-size:.68rem">'+e(o.id)+'</td><td style="font-size:.64rem">'+e(iStr)+'</td><td style="font-weight:600;color:#16A34A">\u20B9'+Math.round(o.total||0)+'</td><td><span class="tag status-'+(o.status||'confirmed')+'">'+(STAT_E[o.status]||'')+' '+e(o.status||'')+'</span></td><td style="font-size:.56rem;color:#9CA3AF">'+ta(o.created_at)+'</td></tr>';});}else h+='<tr><td colspan="5" style="text-align:center;color:#9CA3AF;padding:12px">No orders</td></tr>';
h+='</tbody></table></div></div>';
}

else if(pg==='shipping'){
t.textContent='\uD83D\uDE9A Shipping';s.textContent='Active';
var active=orders.filter(function(o){return o.status==='dispatched'||o.status==='preparing';});
h+='<div class="cd"><div class="ch"><h3>\uD83D\uDE9A Shipments ('+active.length+')</h3></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Address</th><th>Pincode</th><th>Status</th><th>Partner</th><th>Tracking</th><th>Save</th></tr></thead><tbody>';
active.forEach(function(o){
h+='<tr><td style="font-weight:600;font-size:.68rem">'+e(o.id)+'</td><td>'+e(o.customer_name||'')+'</td><td style="font-size:.62rem;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+e(o.customer_address||'')+'</td><td style="font-size:.62rem">'+e(o.customer_pincode||'')+'</td><td><span class="tag status-'+o.status+'">'+(STAT_E[o.status]||'')+' '+e(o.status)+'</span></td>';
h+='<td><select id="ship-'+e(o.id)+'" class="inp" style="width:100px;font-size:.6rem" onchange="updateShipPartner(\''+o.id+'\')"><option>India Post</option><option>DTDC</option><option>Delhivery</option><option>BlueDart</option><option>Ekart</option><option>Self Delivery</option></select></td>';
h+='<td><input id="trk-'+e(o.id)+'" class="inp" style="width:90px;font-size:.58rem" value="'+e(o.tracking_number||'')+'" placeholder="Track#"></td>';
h+='<td><button class="btn bg2 bs" onclick="updateTracking(\''+o.id+'\')">\uD83D\uDCBE</button></td></tr>';});
if(!active.length)h+='<tr><td colspan="8" style="text-align:center;color:#9CA3AF;padding:16px">No active shipments</td></tr>';
h+='</tbody></table></div></div>';
}

else if(pg==='notifs'){
t.textContent='\uD83D\uDD14 Notifications';s.textContent=notifs.length+' alerts';
h+='<div class="cd"><div class="ch"><h3>\uD83D\uDD14 Alerts</h3></div><div style="padding:12px">';
if(notifs.length){notifs.forEach(function(n){h+='<div style="padding:6px 0;border-bottom:1px solid #F0F1F3;opacity:'+(n.read?.6:1)+'"><div style="display:flex;justify-content:space-between"><span style="font-weight:'+(n.read?'400':'600')+';font-size:.76rem;color:#1A1D26">'+e(n.title||n.message||'Alert')+'</span><span style="font-size:.52rem;color:#9CA3AF">'+ta(n.created_at)+'</span></div>'+(n.message?'<div style="font-size:.7rem;color:#6B7280;margin-top:1px">'+e(n.message)+'</div>':'')+'</div>';});}else h+='<div style="text-align:center;color:#9CA3AF;padding:14px">No notifications</div>';
h+='</div></div>';
h+='<div class="cd"><div class="ch"><h3>\u2699\uFE0F Config</h3></div><div style="padding:12px;font-size:.74rem;color:#374151">';
if(notifConfig){h+='<div style="margin-bottom:3px">SMS: '+(notifConfig.sms_is_active?'<span style="color:#16A34A">\u2705 Active</span>':'\u274C Off')+' '+(notifConfig.sms_api_key?'(Key set)':'(No key)')+'</div><div style="margin-bottom:3px">WA API: '+(notifConfig.wa_is_active?'<span style="color:#16A34A">\u2705 Active</span>':'\u274C Off')+' '+(notifConfig.wa_access_token?'(Token)':'(No token)')+'</div><div>Manual WA: <span style="color:#16A34A">\u2705 Always on</span></div>';}else h+='<div style="color:#9CA3AF">Run notification-setup.sql in Supabase</div>';
h+='</div></div>';
}

else if(pg==='settings'){
t.textContent='\u2699\uFE0F Settings';s.textContent='Config';
h+='<div class="cd"><div class="ch"><h3>\uD83D\uDE9A Delivery Charges</h3><button class="btn bp bs" onclick="addDeliveryCharge()">+ Add</button></div>';
if(deliveryCharges.length){h+='<table class="tbl"><thead><tr><th>Pincode</th><th>Region</th><th>Charge</th><th>Del</th></tr></thead><tbody>';deliveryCharges.forEach(function(d){h+='<tr><td style="font-family:monospace;color:#374151">'+e(d.pincode_prefix||'')+'</td><td>'+e(d.region||'')+'</td><td style="color:#16A34A;font-weight:600">\u20B9'+(d.charge||0)+'</td><td><button class="btn bg2 bs" onclick="deleteCharge('+d.id+')">\uD83D\uDDD1</button></td></tr>';});h+='</tbody></table>';}else h+='<div style="padding:12px;color:#9CA3AF;text-align:center">No charges configured</div>';
h+='</div>';
h+='<div class="cd" style="padding:14px"><h4 style="font-size:.76rem;font-weight:600;margin-bottom:6px;color:#1A1D26">System Info</h4><div style="font-size:.72rem;color:#6B7280"><div>Admin: '+ADMIN_PHONE+'</div><div>Razorpay: Live</div><div>Track: <a href="'+TRACK_URL+'" target="_blank">India Post \u2192</a></div></div></div>';
}

else if(pg==='intel'&&!dr){
t.textContent='\uD83C\uDFC6 Competitors';s.textContent=comps.length+' tracked';
if(!comps.length){h='<div style="text-align:center;padding:40px"><button class="btn bp" onclick="syncNow()">\uD83D\uDD04 Sync Now</button></div>';el.innerHTML=h;return;}
h+='<div class="cd"><div class="ch"><h3>\uD83C\uDFC6 Live Data</h3><span class="bg bg-l">GOOGLE PLACES</span></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>Brand</th><th>Rating</th><th>Reviews</th><th>Synced</th></tr></thead><tbody>';
comps.forEach(function(c,i){h+='<tr class="clk" onclick="dd(\''+e(c.name).replace(/'/g,"")+'\')"><td>'+(i+1)+'</td><td style="font-weight:600;color:#1A1D26">'+e(c.name)+'</td><td style="color:'+(c.google_rating>=4.5?'#16A34A':'#CA8A04')+'">'+st(c.google_rating)+' '+(c.google_rating||'-')+'</td><td>'+(c.google_reviews_count||0).toLocaleString()+'</td><td style="font-size:.54rem;color:#9CA3AF">'+ta(c.last_synced)+'</td></tr>';});
h+='</tbody></table></div></div>';
}
else if(pg==='intel'&&dr){
var c=dr;t.innerHTML='<span onclick="dr=null;rn()" style="cursor:pointer;color:#D4451A">\u2190</span> '+e(c.name);s.textContent='Detail';
h+='<div class="gd g2"><div class="cd" style="padding:14px">';
[['Rating',st(c.google_rating)+' '+(c.google_rating||'-')],['Reviews',(c.google_reviews_count||0).toLocaleString()],['Status',c.business_status||'?']].forEach(function(r){h+='<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #F0F1F3;font-size:.74rem"><span style="color:#9CA3AF">'+r[0]+'</span><span style="font-weight:600;color:#1A1D26">'+r[1]+'</span></div>';});
h+='<a href="https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q='+encodeURIComponent(c.name)+'" target="_blank" class="btn bg2 bs" style="margin-top:8px;width:100%;justify-content:center;text-decoration:none">\uD83D\uDD0D Meta Ad Library</a></div>';
h+='<div class="cd" style="padding:14px"><h4 style="font-size:.76rem;font-weight:600;margin-bottom:6px">Actions</h4>';ai(c).forEach(function(a){h+='<div style="padding:4px 8px;margin-bottom:3px;border-radius:6px;background:#FAFBFC;font-size:.72rem;color:#374151">'+e(a)+'</div>';});h+='</div></div>';
}

else if(pg==='spy'){
t.textContent='\uD83D\uDD75\uFE0F Social Spy';s.textContent='Scan + log';
if(!eu.length&&!up.length){h='<div style="text-align:center;padding:40px"><button class="btn bp" onclick="scanSocial()">\uD83D\uDD75\uFE0F Run Scan</button></div>';el.innerHTML=h;return;}
var uu=[];eu.forEach(function(u){if(uu.indexOf(u.username)<0)uu.push(u.username);});
var wI=up.filter(function(p){return p.instagram_url;}).length,wE=up.filter(function(p){return p.email;}).length;
h+='<div class="gd g4"><div class="cd st"><div class="lb">Users</div><div class="vl">'+uu.length+'</div></div><div class="cd st"><div class="lb">\uD83D\uDCF8 IG</div><div class="vl" style="color:#E1306C">'+wI+'</div></div><div class="cd st"><div class="lb">\uD83D\uDCE7 Email</div><div class="vl" style="color:#2563EB">'+wE+'</div></div><div class="cd st"><div class="lb">Profiles</div><div class="vl">'+up.length+'</div></div></div>';
var lds=up.filter(function(p){return p.instagram_url||p.email||p.facebook_url||p.whatsapp;}).sort(function(a,b){return(b.influence_score||0)-(a.influence_score||0);});
if(lds.length){h+='<div class="cd"><div class="ch"><h3>\uD83C\uDFAF Leads</h3><span class="tag" style="background:rgba(212,69,26,.08);color:#D4451A">'+lds.length+'</span></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>User</th><th>Subs</th><th>\uD83D\uDCF8</th><th>\uD83D\uDCD8</th><th>\uD83D\uDCE7</th><th>\uD83D\uDCF1</th><th>Sc</th></tr></thead><tbody>';
lds.slice(0,25).forEach(function(p){h+='<tr><td style="font-weight:600;font-size:.72rem;color:#1A1D26">'+e(p.username||'-')+'</td><td style="font-size:.58rem;color:#6B7280">'+fs2(p.subscribers)+'</td><td>'+(p.instagram_url?'<a href="'+e(p.instagram_url)+'" target="_blank" style="font-size:.58rem;color:#E1306C">Go</a>':'')+'</td><td>'+(p.facebook_url?'<a href="'+e(p.facebook_url)+'" target="_blank" style="font-size:.58rem;color:#1877F2">Go</a>':'')+'</td><td style="font-size:.54rem">'+(p.email?'<a href="mailto:'+e(p.email)+'" style="color:#2563EB">'+e(p.email)+'</a>':'')+'</td><td>'+(p.whatsapp?'<a href="https://wa.me/'+e(p.whatsapp)+'" target="_blank" style="font-size:.58rem;color:#25D366">Go</a>':'')+'</td><td><span class="tag" style="background:'+(p.influence_score>50?'rgba(22,163,106,.08);color:#16A34A':'rgba(107,114,128,.08);color:#9CA3AF')+'">'+(p.influence_score||0)+'</span></td></tr>';});
h+='</tbody></table></div></div>';}
h+='<div class="gd g2"><div class="cd"><div class="ch"><h3>\uD83D\uDD0D Browse</h3></div><div style="padding:10px">';
Object.keys(CS).forEach(function(kn){var ks2=CS[kn];h+='<div style="display:flex;align-items:center;gap:4px;padding:4px 0;border-bottom:1px solid #F0F1F3"><span style="font-size:.7rem;flex:1;color:#374151">'+e(kn)+'</span>';if(ks2.ig)h+='<a href="https://instagram.com/'+ks2.ig+'" target="_blank" class="btn bg2" style="padding:2px 6px;font-size:.54rem;text-decoration:none">\uD83D\uDCF8</a>';if(ks2.fb)h+='<a href="https://facebook.com/'+ks2.fb+'" target="_blank" class="btn bg2" style="padding:2px 6px;font-size:.54rem;text-decoration:none">\uD83D\uDCD8</a>';h+='</div>';});
h+='</div></div>';
h+='<div class="cd"><div class="ch"><h3>\u2795 Log</h3></div><div style="padding:10px"><input id="lu-u" class="inp" placeholder="@username" style="margin-bottom:4px"><div class="gd g2" style="margin-bottom:4px"><select id="lu-p" class="inp"><option>Instagram</option><option>Facebook</option><option>LinkedIn</option><option>Twitter/X</option><option>YouTube</option></select><select id="lu-c" class="inp">';comps.forEach(function(c){h+='<option>'+e(c.name)+'</option>';});h+='<option>_General</option></select></div><div class="gd g2" style="margin-bottom:5px"><select id="lu-t" class="inp"><option>comment</option><option>like</option><option>share</option><option>follow</option></select><input id="lu-x" class="inp" placeholder="Text..."></div><button class="btn bp bs" onclick="logUser()">\u2795 Log</button></div></div></div>';
}

else if(pg==='insights'){
t.textContent='\uD83E\uDDE0 Insights';s.textContent='Analysis';
if(!comps.length){h='<p style="color:#9CA3AF">Sync first.</p>';el.innerHTML=h;return;}
var tp=comps.slice().sort(function(a,b){return(b.google_rating||0)-(a.google_rating||0);})[0];
var mr=comps.slice().sort(function(a,b){return(b.google_reviews_count||0)-(a.google_reviews_count||0);})[0];
h+='<div class="gd g3"><div class="cd st"><div style="font-size:.54rem;color:#16A34A;font-weight:600">TOP RATED</div><div style="font-weight:700;color:#1A1D26">'+e(tp.name)+'</div><div style="font-size:1.1rem;color:#CA8A04">'+(tp.google_rating||0)+'\u2605</div></div>';
h+='<div class="cd st"><div style="font-size:.54rem;color:#2563EB;font-weight:600">MOST REVIEWS</div><div style="font-weight:700;color:#1A1D26">'+e(mr.name)+'</div><div style="font-size:1.1rem;color:#2563EB">'+(mr.google_reviews_count||0).toLocaleString()+'</div></div>';
h+='<div class="cd st"><div style="font-size:.54rem;color:#D4451A;font-weight:600">OPPORTUNITY</div><div style="font-size:.76rem;margin-top:4px;color:#6B7280">Target zero-ad competitors. Collect reviews.</div></div></div>';
h+='<div class="cd"><div class="ch"><h3>Actions</h3></div><div style="padding:12px">';
comps.forEach(function(c){h+='<div style="margin-bottom:5px"><span style="font-weight:600;font-size:.78rem;color:#1A1D26">'+e(c.name)+'</span>';ai(c).forEach(function(a){h+='<span style="font-size:.72rem;color:#6B7280"> '+e(a)+'</span>';});h+='</div>';});
h+='</div></div>';
}

else if(pg==='content'){
t.textContent='\uD83D\uDCF1 Content Studio';s.textContent='Generate';
var pNames=products.length?products.filter(function(p){return p.is_active!==false;}).map(function(p){return p.name;}):['Avakaya Mango Pickle','Gongura Red Chilli','Chicken Pickle','Mutton Pickle','Prawn Pickle'];
h+='<div class="gd g2"><div class="cd" style="padding:12px">';
PLATS.forEach(function(p){h+='<div style="padding:5px 8px;margin-bottom:2px;border-radius:6px;cursor:pointer;background:'+(sPl===p.id?'rgba(212,69,26,.08)':'#FAFBFC')+';font-size:.74rem;color:'+(sPl===p.id?'#D4451A':'#374151')+'" onclick="sPl=\''+p.id+'\';rn()">'+p.i+' '+p.l+'</div>';});
h+='<select class="inp" style="margin-top:6px" onchange="sPr=this.value;rn()">';pNames.forEach(function(n){h+='<option'+(n===sPr?' selected':'')+'>'+n+'</option>';});h+='</select></div>';
h+='<div class="cd" style="padding:12px"><pre id="go2" style="white-space:pre-wrap;font-size:.72rem;background:#FAFBFC;padding:10px;border-radius:6px;line-height:1.4;max-height:240px;overflow-y:auto;color:#374151;border:1px solid #E5E7EB">'+e(gc(sPl,sPr))+'</pre>';
h+='<button class="btn bp bs" style="margin-top:6px" onclick="navigator.clipboard.writeText(document.getElementById(\'go2\').textContent);this.textContent=\'Copied!\';var b=this;setTimeout(function(){b.textContent=\'Copy\';},1200)">Copy</button></div></div>';
}

el.innerHTML=h;
}

ld();ls();
setInterval(async function(){try{var n=await sg('admin_notifications','select=id&read=is.false');var nb=document.getElementById('notif-badge');if(n.length>0){nb.textContent=n.length;nb.classList.remove('hidden');}else nb.classList.add('hidden');}catch(x){}},30000);

</script>
</body></html>
