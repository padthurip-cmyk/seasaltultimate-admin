var SB='https://yosjbsncvghpscsrvxds.supabase.co';
var SK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvc2pic25jdmdocHNjc3J2eGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjc3NTgsImV4cCI6MjA4NTgwMzc1OH0.PNEbeofoyT7KdkzepRfqg-zqyBiGAat5ElCMiyQ4UAs';
var PRODS=[
  {name:"Avakaya Mango Pickle",price:349,cat:"Mango"},
  {name:"Gongura Red Chilli Pickle",price:299,cat:"Chilli"},
  {name:"Chicken Pickle (Bone)",price:499,cat:"Non-Veg"},
  {name:"Boneless Chicken Pickle",price:549,cat:"Non-Veg"},
  {name:"Mutton Pickle",price:599,cat:"Non-Veg"},
  {name:"Prawn Pickle",price:549,cat:"Non-Veg"},
  {name:"Garlic Pachadi",price:279,cat:"Veg"},
  {name:"Tomato Thokku",price:199,cat:"Veg"},
  {name:"Lemon Spice Pickle",price:249,cat:"Veg"},
  {name:"Mixed Vegetable Pickle",price:299,cat:"Veg"},
  {name:"Summer Combo Pack",price:799,cat:"Combo"},
  {name:"Family Pack",price:1299,cat:"Combo"}
];
var PLATS=[{id:"ig_post",l:"Instagram Post",i:"📸"},{id:"ig_reel",l:"Reel Script",i:"🎬"},{id:"fb_post",l:"Facebook Post",i:"📘"},{id:"g_post",l:"Google Business",i:"📍"},{id:"wa_msg",l:"WhatsApp",i:"💬"},{id:"yt_short",l:"YouTube Short",i:"▶️"}];
var CS={'Vellanki Foods':{ig:'vellankifoods',fb:'VellankiFoods'},'Priya Pickles':{ig:'priyafoodsofficial',fb:'PriyaFoodsOfficial'},'Nirupama Pickles':{ig:'nirupamapickles'},'Tulasi Pickles':{fb:'tulasipickleshyderabad'},'Aavarampoo Pickles':{ig:'aavarampoo_pickles'},'Sitara Pickles':{ig:'sitarafoods'},'Ruchulu Pickles':{ig:'ruchulupickles'},'Ammas Homemade Pickles':{},'Andhra Pickles':{},'Hyderabad Pickles':{}};

var pg='dash',dr=null,comps=[],revs=[],ads=[],eu=[],up=[],cso=[],cco=[];
var orders=[],users=[],walletTx=[];
var sPl='ig_post',sPr=PRODS[0].name;

// ═══ UTILS ═══
function ta(d){var s=Math.floor((Date.now()-d)/1000);if(s<60)return s+'s';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';return Math.floor(s/86400)+'d';}
function fs(s){if(!s||s==='0')return'-';var n=parseInt(s);if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n+'';}
function st(r){return '\u2605'.repeat(Math.floor(r||0))+'\u2606'.repeat(5-Math.floor(r||0));}
function e(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML;}
function mu(n){return 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&q='+encodeURIComponent(n);}
function waMsg(ph,msg){window.open('https://wa.me/'+ph.replace(/\+/g,'')+'?text='+encodeURIComponent(msg),'_blank');}

// ═══ SUPABASE ═══
function sh(){return{'apikey':SK,'Authorization':'Bearer '+SK};}
async function sg(t,p){try{var r=await fetch(SB+'/rest/v1/'+t+'?'+(p||''),{headers:sh()});return r.ok?await r.json():[];}catch(x){return[];}}
async function si(t,d){try{var r=await fetch(SB+'/rest/v1/'+t,{method:'POST',headers:Object.assign({'Content-Type':'application/json','Prefer':'return=representation'},sh()),body:JSON.stringify(d)});return r.ok;}catch(x){return false;}}
async function su(t,f,d){try{var r=await fetch(SB+'/rest/v1/'+t+'?'+f,{method:'PATCH',headers:Object.assign({'Content-Type':'application/json','Prefer':'return=representation'},sh()),body:JSON.stringify(d)});return r.ok;}catch(x){return false;}}

// ═══ DATA ═══
async function ld(){
  try{
    comps=await sg('competitors','select=*&order=google_reviews_count.desc');
    revs=await sg('competitor_reviews','select=*&order=publish_time.desc&limit=50');
    try{ads=await sg('competitor_ads','select=*&order=detected_at.desc&limit=50');}catch(x){ads=[];}
    orders=await sg('orders','select=*&order=created_at.desc&limit=200');
    users=await sg('users','select=*&order=last_seen.desc&limit=200');
    try{walletTx=await sg('wallet_transactions','select=*&order=created_at.desc&limit=100');}catch(x){walletTx=[];}
    if(comps.length&&comps[0].last_synced)document.getElementById('sb-sync').textContent=ta(new Date(comps[0].last_synced));
  }catch(x){console.error(x);}
  rn();
}
async function ls(){try{var r=await fetch('/.netlify/functions/social-listen?action=get-users');var d=await r.json();eu=d.users||[];up=d.profiles||[];cso=d.socials||[];cco=d.content||[];}catch(x){eu=[];up=[];}}

// ═══ ACTIONS ═══
function spin(on){document.getElementById('sp').classList[on?'remove':'add']('hidden');}
async function syncNow(){spin(1);try{var r=await fetch('/.netlify/functions/intel-sync?action=sync');var d=await r.json();alert(d.success?'Synced! Reviews:'+(d.review_count||0):'Error');await ld();}catch(x){alert(x.message);}spin(0);}
async function scanSocial(){spin(1);try{var r=await fetch('/.netlify/functions/social-listen?action=scan');var d=await r.json();if(d.success){alert('Users:'+d.total_users+' Profiled:'+d.total_profiled);await ls();rn();}else alert('Failed');}catch(x){alert(x.message);}spin(0);}

async function updateStatus(oid,status){
  var ok=await su('orders','id=eq.'+oid,{status:status});
  if(ok){
    var ord=orders.find(function(o){return o.id===oid;});
    if(ord){ord.status=status;
      var msgs={'confirmed':'Your order #'+oid+' confirmed!','preparing':'Order #'+oid+' being prepared!','dispatched':'Order #'+oid+' dispatched!','delivered':'Order #'+oid+' delivered! Enjoy!','cancelled':'Order #'+oid+' cancelled.'};
      if(ord.customer_phone&&msgs[status])waMsg(ord.customer_phone,msgs[status]);
    }rn();
  }else alert('Failed');
}
async function updateTracking(oid){var inp=document.getElementById('trk-'+oid);if(inp){var ok=await su('orders','id=eq.'+oid,{tracking_number:inp.value});alert(ok?'Saved':'Failed');}}

async function addWallet(phone){
  var amt=prompt('Add wallet amount (Rs):');if(!amt||isNaN(amt))return;
  var n=parseFloat(amt);var user=users.find(function(u){return u.phone===phone;});
  var nb=(user?parseFloat(user.wallet_balance||0):0)+n;
  var ok=await su('users','phone=eq.'+encodeURIComponent(phone),{wallet_balance:nb,wallet_expires_at:new Date(Date.now()+48*3600000).toISOString()});
  await si('wallet_transactions',{user_phone:phone,amount:n,type:'admin_credit',description:'Admin added Rs.'+n,balance_after:nb});
  alert(ok?'Wallet: Rs.'+nb:'Failed');await ld();
}

async function logUser(){
  var u=document.getElementById('lu-u').value.trim(),p=document.getElementById('lu-p').value,c=document.getElementById('lu-c').value,t=document.getElementById('lu-t').value,tx=document.getElementById('lu-x').value.trim();
  if(!u){alert('Enter username');return;}var h=u.replace('@','');
  var url=p==='Instagram'?'https://instagram.com/'+h:p==='Facebook'?'https://facebook.com/'+h:p==='LinkedIn'?'https://linkedin.com/in/'+h:p==='Twitter/X'?'https://x.com/'+h:'https://youtube.com/@'+h;
  var ok=await si('engaged_users',{username:h,display_name:h,profile_url:url,platform:p,competitor_name:c,engagement_type:t,content_text:tx||'Manual',content_url:'',video_title:'Manual',detected_at:new Date().toISOString()});
  if(ok){document.getElementById('lu-u').value='';document.getElementById('lu-x').value='';alert('Logged!');await ls();rn();}else alert('Failed');
}

function gc(p,pr){var m={ig_post:'Craving '+pr+'?\n\nHandmade, cold-pressed oil, zero preservatives.\n\nseasaltpickles.com | +91 9963971447\n\n#SeaSaltPickles #Hyderabad',ig_reel:'REEL: '+pr+'\n[0-2s] Jar opening\n[2-5s] Ingredients\n[5-8s] Traditional mixing\n[8-12s] Beauty shot\n[12-15s] CTA',fb_post:'Fresh '+pr+'!\nCold-pressed oil, zero preservatives.\nseasaltpickles.com',g_post:'Fresh '+pr+'! seasaltpickles.com',wa_msg:'*SeaSalt*\n*'+pr+'* ready!\nFrom Rs.249\nReply ORDER!',yt_short:'SHORT: '+pr+'\n[0-3s] Machines vs tradition\n[3-9s] Making\n[9-15s] CTA'};return m[p]||'';}
function ai(c){var a=[];if((c.active_ads_count||0)>2)a.push('🔴 Running ads.');if((c.google_rating||0)>=4.5)a.push('🟡 High rated.');if((c.active_ads_count||0)===0)a.push('🟢 No ads.');if(!a.length)a.push('🔵 Monitor.');return a;}

// ═══ NAV ═══
function go(p){pg=p;dr=null;rn();window.scrollTo(0,0);}
function dd(n){for(var i=0;i<comps.length;i++)if(comps[i].name===n){dr=comps[i];break;}rn();}

// ═══════════════════════════════════════
// RENDER ENGINE
// ═══════════════════════════════════════
function rn(){
  var el=document.getElementById('ct'),t=document.getElementById('pt'),s=document.getElementById('ps');
  el.className='fade';
  ['dash','orders','products','users','intel','spy','insights','content'].forEach(function(n){var nd=document.getElementById('n-'+n);if(nd)nd.className=pg===n?'sl on':'sl';});
  var h='';

  // ═══ DASHBOARD ═══
  if(pg==='dash'){
    t.textContent='📊 Dashboard';s.textContent='Business + Intelligence';
    var rev=orders.reduce(function(a,o){return a+(o.status!=='cancelled'?parseFloat(o.total||0):0);},0);
    var today=orders.filter(function(o){return o.created_at&&new Date(o.created_at).toDateString()===new Date().toDateString();}).length;
    var pend=orders.filter(function(o){return o.status==='confirmed'||o.status==='preparing';}).length;
    var uu=[];eu.forEach(function(u){if(uu.indexOf(u.username)<0)uu.push(u.username);});
    h+='<div class="gd g4"><div class="cd st"><div class="lb">Revenue</div><div class="vl" style="color:#22C55E">\u20B9'+Math.round(rev).toLocaleString()+'</div><div class="sb">'+orders.length+' orders</div></div>';
    h+='<div class="cd st"><div class="lb">Today</div><div class="vl">'+today+'</div><div class="sb" style="color:#EAB308">'+pend+' pending</div></div>';
    h+='<div class="cd st"><div class="lb">Customers</div><div class="vl">'+users.length+'</div></div>';
    h+='<div class="cd st"><div class="lb">Spy Users</div><div class="vl" style="color:#FF4D2D">'+uu.length+'</div><div class="sb">'+up.filter(function(p){return p.instagram_url||p.email;}).length+' w/ socials</div></div></div>';
    h+='<div class="gd g2">';
    h+='<div class="cd"><div class="ch"><h3>📦 Recent Orders</h3><span class="bg bg-l" style="cursor:pointer" onclick="go(\'orders\')">ALL</span></div><div style="padding:12px">';
    orders.slice(0,5).forEach(function(o){h+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(37,43,56,.3)"><div><div style="font-weight:600;font-size:.76rem">'+e(o.id)+'</div><div style="font-size:.58rem;color:#8B95A5">'+e(o.customer_name||'')+'</div></div><div style="text-align:right"><div style="font-weight:600;color:#22C55E">\u20B9'+Math.round(o.total||0)+'</div><div style="font-size:.58rem">'+e(o.status||'')+'</div></div></div>';});
    h+='</div></div>';
    h+='<div class="cd"><div class="ch"><h3>👥 Recent Users</h3><span class="bg bg-l" style="cursor:pointer" onclick="go(\'users\')">ALL</span></div><div style="padding:12px">';
    users.slice(0,5).forEach(function(u){h+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(37,43,56,.3)"><div><div style="font-weight:600;font-size:.76rem">'+e(u.name||'?')+'</div><div style="font-size:.58rem;color:#8B95A5">'+e(u.phone||'')+'</div></div><div style="color:#22C55E;font-size:.78rem">\u20B9'+(u.wallet_balance||0)+'</div></div>';});
    h+='</div></div></div>';
    h+='<div class="gd g4">';
    [['orders','📦','Orders',orders.length],['products','🏷️','Products',PRODS.length],['intel','🏆','Competitors',comps.length],['spy','🕵️','Spy',uu.length]].forEach(function(q){h+='<div class="cd" style="padding:14px;cursor:pointer" onclick="go(\''+q[0]+'\')"><div style="font-size:1.2rem;margin-bottom:4px">'+q[1]+'</div><div style="font-weight:600;font-size:.8rem">'+q[2]+'</div><div style="font-size:.62rem;color:#8B95A5">'+q[3]+' items</div></div>';});
    h+='</div>';
  }

  // ═══ ORDERS ═══
  else if(pg==='orders'){
    t.textContent='📦 Orders';s.textContent=orders.length+' orders';
    h+='<div class="cd"><div class="ch"><h3>📦 All Orders</h3><span class="bg bg-l">SUPABASE LIVE</span></div>';
    h+='<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>ID</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Wallet</th><th>Status</th><th>Tracking</th><th>Date</th><th>WA</th></tr></thead><tbody>';
    orders.forEach(function(o){
      var items=[];try{items=typeof o.items==='string'?JSON.parse(o.items):(o.items||[]);}catch(x){}
      var iStr=items.map(function(it){return(it.name||'?').substring(0,15)+' x'+(it.qty||1);}).join(', ');
      h+='<tr><td style="font-weight:600;font-size:.72rem">'+e(o.id)+'</td>';
      h+='<td>'+e(o.customer_name||'')+'</td>';
      h+='<td style="font-size:.68rem">'+e(o.customer_phone||'')+'</td>';
      h+='<td style="font-size:.65rem;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+e(iStr)+'">'+e(iStr)+'</td>';
      h+='<td style="font-weight:600;color:#22C55E">\u20B9'+Math.round(o.total||0)+'</td>';
      h+='<td style="font-size:.68rem;color:#EAB308">'+(o.wallet_used?'\u20B9'+o.wallet_used:'—')+'</td>';
      h+='<td><select class="inp" style="width:110px;font-size:.65rem" onchange="updateStatus(\''+e(o.id)+'\',this.value)">';
      ['confirmed','preparing','dispatched','delivered','cancelled'].forEach(function(st2){h+='<option'+(o.status===st2?' selected':'')+'>'+st2+'</option>';});
      h+='</select></td>';
      h+='<td><div style="display:flex;gap:3px"><input id="trk-'+e(o.id)+'" class="inp" style="width:90px;font-size:.62rem" value="'+e(o.tracking_number||'')+'" placeholder="Track#"><button class="btn bg2" style="padding:3px 6px;font-size:.58rem" onclick="updateTracking(\''+e(o.id)+'\')">Save</button></div></td>';
      h+='<td style="font-size:.58rem;color:#8B95A5">'+(o.created_at?ta(new Date(o.created_at)):'')+'</td>';
      h+='<td>'+(o.customer_phone?'<button class="btn bg2" style="padding:3px 6px;font-size:.58rem" onclick="waMsg(\''+e(o.customer_phone)+'\',\'Hi about order '+e(o.id)+'\')">💬</button>':'')+'</td></tr>';
    });
    h+='</tbody></table></div></div>';
  }

  // ═══ PRODUCTS ═══
  else if(pg==='products'){
    t.textContent='🏷️ Products';s.textContent=PRODS.length+' SKUs';
    h+='<div class="cd"><div class="ch"><h3>🏷️ Catalog</h3><span class="bg bg-l">'+PRODS.length+'</span></div>';
    h+='<table class="tbl"><thead><tr><th>#</th><th>Product</th><th>Price</th><th>Category</th></tr></thead><tbody>';
    PRODS.forEach(function(p,i){h+='<tr><td>'+(i+1)+'</td><td style="font-weight:600">'+e(p.name)+'</td><td style="color:#22C55E;font-weight:600">\u20B9'+p.price+'</td><td><span class="tag" style="background:rgba(255,77,45,.08);color:#FF9966">'+e(p.cat)+'</span></td></tr>';});
    h+='</tbody></table></div>';
  }

  // ═══ USERS ═══
  else if(pg==='users'){
    t.textContent='👥 Users & Wallets';s.textContent=users.length+' users';
    var tw=users.reduce(function(a,u){return a+parseFloat(u.wallet_balance||0);},0);
    h+='<div class="gd g3"><div class="cd st"><div class="lb">Users</div><div class="vl">'+users.length+'</div></div><div class="cd st"><div class="lb">Total Wallet</div><div class="vl" style="color:#22C55E">\u20B9'+Math.round(tw)+'</div></div><div class="cd st"><div class="lb">Transactions</div><div class="vl">'+walletTx.length+'</div></div></div>';
    h+='<div class="cd"><div class="ch"><h3>👥 All Users</h3></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Name</th><th>Phone</th><th>Country</th><th>Wallet</th><th>Expires</th><th>Visits</th><th>Last Seen</th><th>Action</th></tr></thead><tbody>';
    users.forEach(function(u){
      var exp=u.wallet_expires_at?new Date(u.wallet_expires_at):null;
      var es=exp?(exp>new Date()?ta(exp)+' left':'Expired'):'—';
      h+='<tr><td style="font-weight:600">'+e(u.name||'?')+'</td><td style="font-size:.68rem;font-family:\'Space Mono\',monospace">'+e(u.phone||'')+'</td><td style="font-size:.68rem">'+e(u.selected_country||'')+'</td><td style="font-weight:600;color:#22C55E">\u20B9'+(u.wallet_balance||0)+'</td><td style="font-size:.62rem;color:#8B95A5">'+es+'</td><td>'+(u.total_visits||0)+'</td><td style="font-size:.58rem;color:#8B95A5">'+(u.last_seen?ta(new Date(u.last_seen)):'—')+'</td><td><button class="btn bg2 bs" onclick="addWallet(\''+e(u.phone)+'\')">+💰</button></td></tr>';
    });
    h+='</tbody></table></div></div>';
  }

  // ═══ COMPETITORS ═══
  else if(pg==='intel'&&!dr){
    t.textContent='🏆 Competitors';s.textContent=comps.length+' tracked';
    if(!comps.length){h='<div style="text-align:center;padding:50px"><button class="btn bp" onclick="syncNow()">🔄 Sync</button></div>';el.innerHTML=h;return;}
    h+='<div class="cd"><div class="ch"><h3>🏆 Live</h3><span class="bg bg-l">GOOGLE PLACES</span></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>Brand</th><th>Rating</th><th>Reviews</th><th>Ads</th><th>Synced</th></tr></thead><tbody>';
    comps.forEach(function(c,i){
      h+='<tr class="clk" onclick="dd(\''+e(c.name).replace(/'/g,"\\'")+'\')">';
      h+='<td>'+(i+1)+'</td><td><div style="display:flex;align-items:center;gap:6px"><div style="width:26px;height:26px;border-radius:7px;background:'+(c.color||'#333')+';display:flex;align-items:center;justify-content:center;font-size:.48rem;font-weight:700;color:#fff">'+(c.code||'?')+'</div><div><div style="font-weight:600;font-size:.78rem">'+e(c.name)+'</div><div style="font-size:.55rem;color:#8B95A5">'+e(c.url||'')+'</div></div></div></td>';
      h+='<td style="color:'+(c.google_rating>=4.5?'#22C55E':c.google_rating>=4?'#EAB308':'#EF4444')+'">'+st(c.google_rating)+' '+(c.google_rating||'-')+'</td>';
      h+='<td>'+(c.google_reviews_count||0).toLocaleString()+'</td>';
      var ac=ads.filter(function(a){return a.competitor_name===c.name&&a.ad_status==='active';}).length;
      h+='<td>'+(ac?'<span class="tag" style="background:rgba(255,77,45,.12);color:#FF4D2D">'+ac+'</span>':'0')+'</td>';
      h+='<td style="font-size:.58rem;color:#8B95A5">'+(c.last_synced?ta(new Date(c.last_synced)):'—')+'</td></tr>';
    });
    h+='</tbody></table></div></div>';
  }
  else if(pg==='intel'&&dr){
    var c=dr;t.innerHTML='<span onclick="dr=null;rn()" style="cursor:pointer;color:#FF4D2D">\u2190</span> '+e(c.name);s.textContent='Detail';
    h+='<div class="gd g2"><div class="cd" style="padding:16px">';
    [['Rating',st(c.google_rating)+' '+(c.google_rating||'-')],['Reviews',(c.google_reviews_count||0).toLocaleString()],['Status',c.business_status||'?']].forEach(function(r){h+='<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #1C2130;font-size:.76rem"><span style="color:#8B95A5">'+r[0]+'</span><span style="font-weight:600">'+r[1]+'</span></div>';});
    h+='<a href="'+mu(c.name)+'" target="_blank" class="btn bg2 bs" style="margin-top:8px;width:100%;justify-content:center;text-decoration:none">🔍 Meta Ad Library</a></div>';
    h+='<div class="cd" style="padding:16px">';ai(c).forEach(function(a){h+='<div style="padding:4px 8px;margin-bottom:4px;border-radius:6px;background:#0B0E11;font-size:.74rem">'+e(a)+'</div>';});
    h+='</div></div>';
  }

  // ═══ SOCIAL SPY ═══
  else if(pg==='spy'){
    t.textContent='🕵️ Social Spy';s.textContent='YouTube auto + IG/FB/LinkedIn manual';
    if(!eu.length&&!up.length){h='<div style="text-align:center;padding:50px"><button class="btn bp" onclick="scanSocial()">🕵️ Run Scan</button></div>';el.innerHTML=h;return;}
    var uu=[];eu.forEach(function(u){if(uu.indexOf(u.username)<0)uu.push(u.username);});
    var wI=up.filter(function(p){return p.instagram_url;}).length,wE=up.filter(function(p){return p.email;}).length,wF=up.filter(function(p){return p.facebook_url;}).length;
    h+='<div class="gd g4"><div class="cd st"><div class="lb">Users</div><div class="vl">'+uu.length+'</div></div><div class="cd st"><div class="lb">📸 IG</div><div class="vl" style="color:#E1306C">'+wI+'</div></div><div class="cd st"><div class="lb">📧 Email</div><div class="vl" style="color:#4FC3F7">'+wE+'</div></div><div class="cd st"><div class="lb">📘 FB</div><div class="vl" style="color:#1877F2">'+wF+'</div></div></div>';
    // Leads
    var lds=up.filter(function(p){return p.instagram_url||p.facebook_url||p.email||p.website_url||p.whatsapp;}).sort(function(a,b){return(b.influence_score||0)-(a.influence_score||0);});
    if(lds.length){
      h+='<div class="cd"><div class="ch"><h3>🎯 Leads</h3><span class="tag" style="background:rgba(255,77,45,.15);color:#FF4D2D">'+lds.length+'</span></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>User</th><th>Subs</th><th>📸</th><th>📘</th><th>📧</th><th>🌐</th><th>📱</th><th>Sc</th></tr></thead><tbody>';
      lds.slice(0,30).forEach(function(p){
        h+='<tr><td style="font-weight:600;font-size:.74rem">'+e(p.username||'-')+'</td><td style="font-size:.6rem">'+fs(p.subscribers)+'</td>';
        h+='<td>'+(p.instagram_url?'<a href="'+e(p.instagram_url)+'" target="_blank" style="font-size:.6rem;color:#E1306C">Go</a>':'')+'</td>';
        h+='<td>'+(p.facebook_url?'<a href="'+e(p.facebook_url)+'" target="_blank" style="font-size:.6rem;color:#1877F2">Go</a>':'')+'</td>';
        h+='<td>'+(p.email?'<a href="mailto:'+e(p.email)+'" style="font-size:.56rem;color:#4FC3F7">'+e(p.email)+'</a>':'')+'</td>';
        h+='<td>'+(p.website_url?'<a href="'+e(p.website_url)+'" target="_blank" style="font-size:.6rem;color:#22C55E">Go</a>':'')+'</td>';
        h+='<td>'+(p.whatsapp?'<a href="https://wa.me/'+e(p.whatsapp)+'" target="_blank" style="font-size:.6rem;color:#25D366">Go</a>':'')+'</td>';
        h+='<td><span class="tag" style="background:'+(p.influence_score>50?'rgba(34,197,94,.15);color:#22C55E':'rgba(107,114,128,.15);color:#9CA3AF')+'">'+(p.influence_score||0)+'</span></td></tr>';
      });
      h+='</tbody></table></div></div>';
    }
    // Browse competitors
    h+='<div class="cd"><div class="ch"><h3>🔍 Browse</h3></div><div style="padding:12px"><div class="gd g2" style="gap:8px">';
    Object.keys(CS).forEach(function(kn){var ks2=CS[kn];h+='<div style="display:flex;align-items:center;gap:5px;padding:6px 10px;border-radius:7px;background:#0B0E11;border:1px solid #1C2130"><span style="font-weight:600;font-size:.74rem;flex:1">'+e(kn)+'</span>';if(ks2.ig)h+='<a href="https://instagram.com/'+ks2.ig+'" target="_blank" class="btn bg2 bs" style="text-decoration:none">📸</a>';if(ks2.fb)h+='<a href="https://facebook.com/'+ks2.fb+'" target="_blank" class="btn bg2 bs" style="text-decoration:none">📘</a>';h+='</div>';});
    h+='</div></div></div>';
    // Log form
    h+='<div class="cd"><div class="ch"><h3>➕ Log User</h3></div><div style="padding:12px"><div class="gd g5" style="margin-bottom:8px">';
    h+='<div><label style="font-size:.5rem;color:#8B95A5">Username</label><input id="lu-u" class="inp" placeholder="@"></div>';
    h+='<div><label style="font-size:.5rem;color:#8B95A5">Platform</label><select id="lu-p" class="inp"><option>Instagram</option><option>Facebook</option><option>LinkedIn</option><option>Twitter/X</option><option>YouTube</option></select></div>';
    h+='<div><label style="font-size:.5rem;color:#8B95A5">Found on</label><select id="lu-c" class="inp">';comps.forEach(function(c){h+='<option>'+e(c.name)+'</option>';});h+='<option>_General</option></select></div>';
    h+='<div><label style="font-size:.5rem;color:#8B95A5">Type</label><select id="lu-t" class="inp"><option>comment</option><option>like</option><option>share</option><option>follow</option></select></div>';
    h+='<div><label style="font-size:.5rem;color:#8B95A5">Text</label><input id="lu-x" class="inp" placeholder="..."></div>';
    h+='</div><button class="btn bp bs" onclick="logUser()">➕ Log</button></div></div>';
    // All
    h+='<div class="cd"><div class="ch"><h3>👥 All</h3><span class="bg bg-l">'+eu.length+'</span></div><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>User</th><th>Platform</th><th>Profile</th><th>Competitor</th><th>Type</th><th>Date</th></tr></thead><tbody>';
    eu.slice(0,80).forEach(function(u){
      var pc=u.platform==='Instagram'?'rgba(225,48,108,.15);color:#E1306C':u.platform==='Facebook'?'rgba(24,119,242,.15);color:#1877F2':u.platform==='YouTube'?'rgba(255,0,0,.15);color:#FF0000':'rgba(107,114,128,.15);color:#9CA3AF';
      h+='<tr><td style="font-weight:600;font-size:.74rem">'+e(u.display_name||u.username)+'</td><td><span class="tag" style="background:'+pc+'">'+e(u.platform)+'</span></td><td>'+(u.profile_url?'<a href="'+e(u.profile_url)+'" target="_blank" style="font-size:.6rem">Open</a>':'')+'</td><td style="font-size:.62rem;color:#FF4D2D">'+e(u.competitor_name)+'</td><td style="font-size:.6rem">'+e(u.engagement_type||'')+'</td><td style="font-size:.55rem;color:#555">'+(u.detected_at?ta(new Date(u.detected_at)):'')+'</td></tr>';
    });
    h+='</tbody></table></div></div>';
  }

  // ═══ INSIGHTS ═══
  else if(pg==='insights'){
    t.textContent='🧠 Insights';s.textContent='Analysis';
    if(!comps.length){h='<p style="color:#8B95A5">Sync first.</p>';el.innerHTML=h;return;}
    var tp=comps.slice().sort(function(a,b){return(b.google_rating||0)-(a.google_rating||0);})[0];
    var mr=comps.slice().sort(function(a,b){return(b.google_reviews_count||0)-(a.google_reviews_count||0);})[0];
    h+='<div class="gd g3"><div class="cd st"><div style="font-size:.56rem;color:#22C55E;font-weight:600">TOP RATED</div><div style="font-weight:700">'+e(tp.name)+'</div><div style="font-size:1.2rem;color:#EAB308">'+(tp.google_rating||0)+'\u2605</div></div>';
    h+='<div class="cd st"><div style="font-size:.56rem;color:#0891B2;font-weight:600">MOST REVIEWS</div><div style="font-weight:700">'+e(mr.name)+'</div><div style="font-size:1.2rem;color:#0891B2">'+(mr.google_reviews_count||0).toLocaleString()+'</div></div>';
    h+='<div class="cd st"><div style="font-size:.56rem;color:#FF4D2D;font-weight:600">OPPORTUNITY</div><div style="font-size:.78rem;margin-top:4px">Target zero-ad competitors. Collect reviews aggressively.</div></div></div>';
    h+='<div class="cd"><div class="ch"><h3>Actions</h3></div><div style="padding:12px">';
    comps.forEach(function(c){h+='<div style="margin-bottom:8px"><span style="font-weight:600;font-size:.8rem">'+e(c.name)+'</span>';ai(c).forEach(function(a){h+='<div style="font-size:.74rem;color:#C8CED8;padding:1px 0">'+e(a)+'</div>';});h+='</div>';});
    h+='</div></div>';
  }

  // ═══ CONTENT STUDIO ═══
  else if(pg==='content'){
    t.textContent='📱 Content Studio';s.textContent='Generate posts';
    h+='<div class="gd g2"><div class="cd" style="padding:16px">';
    PLATS.forEach(function(p){h+='<div style="padding:6px 10px;margin-bottom:3px;border-radius:7px;cursor:pointer;background:'+(sPl===p.id?'rgba(255,77,45,.12)':'#0B0E11')+';font-size:.76rem" onclick="sPl=\''+p.id+'\';rn()">'+p.i+' '+p.l+'</div>';});
    h+='<select class="inp" style="margin-top:10px" onchange="sPr=this.value;rn()">';PRODS.forEach(function(p){h+='<option'+(p.name===sPr?' selected':'')+'>'+p.name+'</option>';});h+='</select></div>';
    h+='<div class="cd" style="padding:16px"><pre id="go2" style="white-space:pre-wrap;font-size:.74rem;background:#0B0E11;padding:10px;border-radius:7px;line-height:1.4;max-height:280px;overflow-y:auto">'+e(gc(sPl,sPr))+'</pre>';
    h+='<button class="btn bp bs" style="margin-top:8px" onclick="navigator.clipboard.writeText(document.getElementById(\'go2\').textContent);this.textContent=\'Copied!\';var b=this;setTimeout(function(){b.textContent=\'Copy\';},1200)">Copy</button></div></div>';
  }

  el.innerHTML=h;
}

// ═══ INIT ═══
ld();ls();
</script>
