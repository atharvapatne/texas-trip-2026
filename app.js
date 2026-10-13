(function(){
'use strict';
const PEOPLE=[{id:'patne',name:'Patne',full:'Atharva Patne',ab:'AP',c:'pc1'},{id:'tanmay',name:'Tanmay',full:'Tanmay Dighe',ab:'TD',c:'pc2'},{id:'hetvi',name:'Hetvi',full:'Hetvi Rajani',ab:'HR',c:'pc3'},{id:'ambika',name:'Ambika',full:'Ambika Varma',ab:'AV',c:'pc4'},{id:'anu',name:'Anu',full:'Anukriti Yadav',ab:'AY',c:'pc5'}];
const PID=PEOPLE.map(p=>p.id), P=Object.fromEntries(PEOPLE.map(p=>[p.id,p]));
let legs={},menu={},preds={},awards={},songs={},jr={},cocktails={},profiles={},phones={},highlights={},photos={},notes={},bonus={},prog={},lastTotal=null,lastLevel=null,acted=0,collageTok=0;
const SH={c:'patne',t:'tanmay',h:'hetvi',a:'ambika',n:'anu'};
const $=(s,r=document)=>r.querySelector(s)||document.createElement('div'), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dot=id=>`<span class="dot ${P[id].c}" title="${P[id].name}">${P[id].ab}</span>`;
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const maps=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}
async function copy(txt){try{await navigator.clipboard.writeText(txt);toast('Copied')}catch(e){try{const a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();toast('Copied')}catch(e2){toast('Copy is blocked here. Select the text instead.')}}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-copy]');if(b)copy(b.dataset.copy)});

const HL_PTS=5;
/* ---------- levels, pack list, quests (defined early: used by every page) ---------- */
const LEVELS=[{at:0,name:'Rookie'},{at:25,name:'Pit Crew'},{at:60,name:'Qualifier'},{at:100,name:'Pole Sitter'},{at:140,name:'Podium Finisher'},{at:175,name:'World Champion'}];
const levelOf=t=>LEVELS.filter(l=>t>=l.at).pop();
const nextLevel=t=>LEVELS.find(l=>l.at>t);
const PACK=[
 ['Must-haves',['Photo ID (needed to get into COTA)','Phone and charger cable','Power bank, fully charged','Debit or credit card (COTA is cashless: Visa, Mastercard, Amex or Discover)','Your flight or bus details, screenshotted']],
 ['Race-day comfort',['Comfortable closed shoes you can walk miles in','Sunglasses','Sunscreen in a plastic bottle (no spray cans)','A light layer for cool evenings','Small bag or crossbody (max 12 x 12 x 20 in)','Lip balm and hair ties or a bandana','Optional: a cap or hat (buy your own, only if you want one)']],
 ['Nights out',['A nicer outfit for Powder Room on Sunday','Something fun for cocktail night on Saturday','Comfortable shoes for the night out']],
 ['The basics',['Three days of comfy clothes and pajamas','Toiletries and your own medicines','Glasses or contact lenses','Phone storage cleared for photos']]];
const PACKITEMS=PACK.reduce((a,g)=>a.concat(g[1]),[]);
const BINGO=['Cowboy hat in the wild','Someone says \u201cy\u2019all\u201d','\u201cBack at Dartmouth\u2026\u201d story','Longhorn spotted','Worst dad joke (groans required)','Texas flag on a building','Mom or Dad calls: \u201cDid you eat?\u201d','Price converted to rupees out loud','Queso (veg, obviously)','Work call or email on the hill','Bollywood song sung loudly','Sunburn or desi tan line','FREE \u2605','Someone asks where the chai is','Live band or busker','Cannot find the car in Lot F','Traffic compared to Bangalore or Mumbai','Bhangra or line-dance attempt','\u201cIndian Standard Time\u201d excuse','Pretends to understand tyre strategy','\u201cI only watch for Drive to Survive\u201d','Spice level regretted','Food photo before anyone eats','Terrible F1 pun (\u201cthat was pit-iful\u201d)','Group selfie, take five'];
const bingoLines=b=>{const L=[];for(let r=0;r<5;r++){L.push([0,1,2,3,4].map(c=>r*5+c));L.push([0,1,2,3,4].map(c=>c*5+r))}L.push([0,6,12,18,24],[4,8,12,16,20]);return L.filter(l=>l.every(i=>i===12||b[i])).length};
const cnt=o=>Object.values(o||{}).filter(Boolean).length;
const QUESTS=[
 {id:'travel',label:'Add your flight or bus details',max:10,to:'crew.html',calc:p=>(legs[p+'-in']||legs[p+'-out'])?10:0},
 {id:'cocktail',label:'Pick your cocktails',max:10,to:'cocktails.html',calc:p=>cocktails[p]?10:0},
 {id:'pack',label:'Check off your pack list',max:PACKITEMS.length+5,to:'info.html',calc:p=>{const n=cnt((prog[p]||{}).packed);return n+(n>=PACKITEMS.length?5:0)}},
 {id:'menu',label:'Tell Patne what you’d like to eat',max:5,to:'texas.html',calc:p=>(menu[p]&&menu[p].choice)?5:0},
 {id:'predict',label:'Lock in your race predictions',max:15,to:'play.html',calc:p=>preds[p]?15:0},
 {id:'awards',label:'Vote in the trip awards',max:12,to:'play.html',calc:p=>cnt(((awards[p]||{}).v))*2},
 {id:'bingo',label:'Play Texas bingo',max:35,to:'play.html',calc:p=>{const b=(prog[p]||{}).bingo||{};return Math.min(35,cnt(b)+bingoLines(b)*5)}},
 {id:'songs',label:'Add songs to the playlist',max:15,to:'play.html',calc:p=>Math.min(3,Object.values(songs).filter(s=>s.by===p).length)*5},
 {id:'photos',label:'Post your 2 best photos',max:20,to:'photos.html',calc:p=>[1,2].filter(s=>photos[p+'-'+s]).length*10},
 {id:'note',label:'Leave a note for the host',max:5,to:'home.html',calc:p=>Object.values(notes).some(n=>n.by===p)?5:0},
 {id:'profile',label:'Fill in your driver card (driver, team and who you are)',max:30,to:'home.html',calc:p=>{const d=profiles[p]||{};return (d.fav?5:0)+(d.team?5:0)+(((d.bio||'').trim().length>=15)?20:0)}},
 {id:'phone',label:'Add your number to the group directory',max:5,to:'directory.html',calc:p=>(phones[p]&&(phones[p].phone||'').replace(/\D/g,'').length>=7)?5:0},
 {id:'journal',label:'Write your trip page',max:25,to:'after.html',calc:p=>(jr[p]&&jr[p].ts)?25:0}];
function score(p){const rows=QUESTS.map(q=>({id:q.id,label:q.label,to:q.to,max:q.max,pts:Math.min(q.max,q.calc(p))}));const bn=(bonus[p]||{}).pts||0,hl=(highlights[p]||{}).pts||0;return{rows,bonus:bn,hl,total:rows.reduce((a,r)=>a+r.pts,0)+bn+hl}}
const BADGES=[['travel','Navigator'],['cocktail','Bar Regular'],['pack','Packed & Ready'],['predict','Fortune Teller'],['bingo','Bingo Hunter'],['photos','Shutterbug'],['journal','Storyteller'],['songs','DJ'],['note','Chatterbox'],['profile','Main Character']];
const badgesOf=s=>BADGES.filter(b=>{const r=s.rows.find(x=>x.id===b[0]);return r&&r.pts>0&&(b[0]!=='pack'||r.pts>=r.max)&&(b[0]!=='photos'||r.pts>=r.max)}).map(b=>b[1]);

/* ---------- me ---------- */
let ME=lsGet('cota.me','');
const meSel=$('#me');
meSel.innerHTML='<option value="">Pick your driver</option>'+PEOPLE.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
meSel.value=ME;
meSel.onchange=()=>{ME=meSel.value;lsSet('cota.me',ME);lastTotal=null;rerenderAll()};
function needMe(){if(!ME){toast('Pick your driver at the top right first');return true}return false}

/* ---------- store: shared (Netlify Function) when deployed with it, else this device ---------- */
const API='/api/trip';
const Store=(()=>{
  let state='pending';const remote={},loc={},subs={};
  const lget=c=>loc[c]||(loc[c]=lsGet('cota.db.'+c,{}));
  const view=c=>Object.assign({},remote[c]||{},lget(c));
  const emit=c=>(subs[c]||[]).forEach(f=>{try{f(view(c))}catch(e){console.error(e)}});
  function setMode(){const el=state==='shared'?'<span class="pill ok">● Shared board on</span>':state==='local'?'<span class="pill warn">Saved on this device only</span>':'';$$('.mode').forEach(m=>m.innerHTML=el)}
  async function pull(c){try{const r=await fetch(API+'?col='+encodeURIComponent(c),{cache:'no-store'});if(!r.ok)throw 0;const o=await r.json();if(typeof o!=='object'||Array.isArray(o)||o===null)throw 0;remote[c]=o;if(state!=='shared'){state='shared';setMode()}emit(c)}catch(e){if(state==='pending'){state='local';setMode()}}}
  const pullAll=()=>Object.keys(subs).forEach(pull);
  setTimeout(pullAll,0);
  setInterval(()=>{if(state==='shared'&&!document.hidden)pullAll()},15000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state==='shared')pullAll()});
  return{
    mode:()=>state,
    watch(c,f){(subs[c]=subs[c]||[]).push(f);f(view(c));if(state!=='local')pull(c)},
    async set(c,id,data){acted=Date.now();
      if(state==='shared'){try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({col:c,id,data})});if(!r.ok)throw 0;remote[c]=Object.assign({},remote[c]||{},{[id]:data});if(lget(c)[id]){delete lget(c)[id];lsSet('cota.db.'+c,loc[c])}emit(c);return true}catch(e){toast('Could not reach the shared board. Kept on this device.')}}
      lget(c)[id]=data;lsSet('cota.db.'+c,loc[c]);emit(c);return false},
    async del(c,id){
      if(state==='shared'){try{const r=await fetch(API+'?col='+encodeURIComponent(c)+'&id='+encodeURIComponent(id),{method:'DELETE'});if(!r.ok)throw 0;if(remote[c])delete remote[c][id]}catch(e){toast('Could not delete from the shared board.')}}
      if(lget(c)[id]){delete lget(c)[id];lsSet('cota.db.'+c,loc[c])}emit(c)}
  }})();

/* ---------- fill these in once and everyone sees them (no need for the shared board) ---------- */
const TRIP={address:'8800 US 290 W, Apt 1412 Alister Oak Hill, Austin, TX 78736',phone:'(603) 349-9512',plate:'9YTH681',wifi:'SpectrumSetup-59',wifipass:'braveboat039',note:''};
const nonEmpty=o=>Object.fromEntries(Object.entries(o||{}).filter(e=>e[1]));

/* ---------- data ---------- */
const DAYS=[{d:'2026-10-22',s:'Thu',n:22},{d:'2026-10-23',s:'Fri',n:23},{d:'2026-10-24',s:'Sat',n:24},{d:'2026-10-25',s:'Sun',n:25},{d:'2026-10-26',s:'Mon',n:26},{d:'2026-10-27',s:'Tue',n:27}];
const GLANCE={
 '2026-10-22':['Warm-up','A quiet night at home.'],
 '2026-10-23':['BBQ, the F1 fan hub, Maroon 5','Terry Black’s, the Mercedes fan hub, then COTA for dinner and the concert.'],
 '2026-10-24':['Lunch, qualifying, Post Malone','Home lunch, then COTA for qualifying and the show. Cocktails at home after.'],
 '2026-10-25':['Race day','Be at COTA by 7:15 am for a good spot on the Turn 3–4 hill, race at 3 pm, Powder Room cocktails at night.'],
 '2026-10-26':['Goodbyes and The Oasis','Hetvi and Ambika head home. Early dinner at The Oasis.'],
 '2026-10-27':['Back to work','Everyone is home.']};
// [date,time,title,note,who,tag]
const S=(d,t,title,note,who,tag)=>({d:'2026-10-'+d,t,title,note:note||'',who:who==='all'?PID.slice():[...who].map(x=>SH[x]),tag:tag||'cota'});
const EV=[
S(22,'19:00','Dinner at home, early night','','c','food'),
S(23,'09:30','Late breakfast at home','','ct','food'),
S(23,'10:30','Optional: look for a cowboy hat','Only if you want one. Everyone buys their own, since colours and sizes are personal.','ct','fun'),
S(23,'11:45','Lunch at Terry Black’s BBQ','1003 Barton Springs Rd. Opens at 11, so expect a line by noon.','ct','food'),
S(23,'13:15','Mercedes F1 Fan Hub','400 Congress Ave. Free, Oct 22–25. Opening hours are not published.','ct','tbd'),
S(23,'17:30','Head to COTA for dinner and a look around','Parking lots open 8 am, gates 9 am.','cth','cota'),
S(23,'18:30','Dinner at COTA','About $25–30 each. Look for a veg stand.','cth','food'),
S(23,'20:00','Maroon 5 live (time TBA)','Set time is not published yet.','cth','cota'),
S(24,'09:30','Slow morning, breakfast at home','','cth','food'),
S(24,'13:00','Lunch at Patne’s place','Tell Patne what you would like on the Food & Texas page.','ctha','food'),
S(24,'15:00','Head to COTA, settle on the Turn 3–4 hill','Qualifying is at 4 pm. Anu joins us at COTA.','all','cota'),
S(24,'16:00','Qualifying','','all','cota'),
S(24,'17:30','Dinner at COTA','','all','food'),
S(24,'19:30','Post Malone live (time TBA)','Set time is not published yet.','all','cota'),
S(24,'22:30','Cocktail night at home','Right after we are back from COTA. Pick your drinks on the Cocktails page.','all','fun'),
S(25,'07:15','Be at COTA, in the Lot F queue','Lot F pass is ready. Lots open 7:30 am, gates open 8:30 am. Allow 60-90 minutes for the drive: Sunday is the busiest traffic of the weekend.','all','travel'),
S(25,'08:30','Gates open: claim the Turn 3–4 hill','Chairs and blanket down first. Never leave the spot empty.','all','cota'),
S(25,'11:30','Lunch at COTA','Before 11:30 or after 1:30 to skip the queue.','all','food'),
S(25,'15:00','RACE: 56 laps','','all','cota'),
S(25,'17:00','Chequered flag and trophy ceremony','','all','cota'),
S(25,'20:00','Cocktails at Powder Room (booked)','301 W 5th St, downtown. Leaving COTA can take an hour or two, so we may ask them to push the booking back.','ctha','tbd'),
S(26,'05:30','Hetvi flies home','','h','travel'),
S(26,'11:00','Ambika’s bus home','','a','travel'),
S(26,'17:20','Early dinner at The Oasis on Lake Travis','6550 Comanche Trail. Sunset is 6:50 pm, so the bell may be missed before a 9 pm flight.','ct','fun'),
S(26,'21:00','Tanmay flies home (about 9 pm, to confirm)','','t','tbd'),
S(27,'08:00','Back to normal life','Write your trip notes on the After page.','all','work')
];
EV.sort((a,b)=>(a.d+a.t).localeCompare(b.d+b.t));
const TAGN={cota:'COTA',food:'Food',travel:'Travel',fun:'Fun',work:'Work',tbd:'TBC'};
const dayLabel=d=>{const x=DAYS.find(y=>y.d===d);return x?x.s+' Oct '+x.n:d};
const hm=t=>{let [h,m]=t.split(':').map(Number);const ap=h>=12?'pm':'am';h=h%12||12;return h+':'+String(m).padStart(2,'0')+' '+ap};
function nowCT(){const p={};new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).forEach(x=>p[x.type]=x.value);return p.year+'-'+p.month+'-'+p.day+' '+(p.hour==='24'?'00':p.hour)+':'+p.minute}
/* ---------- nav (one HTML file per page) ---------- */
const VIEWS=[['home','Home','Countdown, quests, note to the host'],['schedule','Schedule','Day by day, filter by person'],['crew','Crew','Who is arriving and leaving, driver cards'],['directory','Directory','Phone numbers for the group'],['info','Pack & Info','Address, Wi-Fi, what to bring'],['cota','COTA','Official map, timetable, parking, rules'],['texas','Food & Texas','BBQ, meals and what you want to eat'],['cocktails','Cocktails','Pick your drinks for cocktail night'],['play','Play','Predictions, awards, bingo, playlist'],['photos','Photos','Post 2 photos, build the collage'],['leaderboard','Standings','Championship leaderboard'],['after','After','Write how the trip went']];
const PAGE=document.body.dataset.page||'index';
$('#tabs').innerHTML=VIEWS.map(v=>`<a href="${v[0]}.html"${v[0]===PAGE?' aria-current="page"':''}>${v[1]}</a>`).join('');
$('#navgrid').innerHTML=VIEWS.slice(1).map(v=>`<a href="${v[0]}.html"><div class="card"><h3>${v[1]}</h3><p>${v[2]}</p></div></a>`).join('');
(function(){const cur=$('#tabs a[aria-current]');if(cur.scrollIntoView)try{cur.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}})();

/* ---------- home ---------- */
const LIGHTS=Date.parse('2026-10-25T20:00:00Z');
function tick(){const ms=LIGHTS-Date.now(),el=$('#count');
  if(ms<=0){el.innerHTML='<div class="t"><b>GO!</b><span>Lights out</span></div>';return}
  const d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);
  el.innerHTML=`<div class="t"><b>${d}</b><span>days</span></div><div class="t"><b>${h}</b><span>hours</span></div><div class="t"><b>${m}</b><span>min</span></div><div class="t"><b>${s}</b><span>sec</span></div>`}
function nowNext(){const k=nowCT(),i=EV.findIndex(e=>(e.d+' '+e.t)>k),box=$('#nownext');
  const line=e=>`<li style="display:flex;gap:10px;align-items:baseline"><span class="mono small" style="min-width:92px">${dayLabel(e.d).replace(' Oct','')} ${hm(e.t)}</span><span>${esc(e.title)}</span></li>`;
  if(i===-1){box.innerHTML='<h3>That’s a wrap</h3><p class="small" style="margin-top:6px">Everyone is home. Write your notes on the After page.</p>';return}
  const first=i===0;
  box.innerHTML=`<div class="eyebrow">${first?'Trip starts soon':'Next up'}</div><ul class="stack" style="list-style:none;padding:0;margin:8px 0 0">${EV.slice(i,i+4).map(line).join('')}</ul><p class="small" style="margin-top:10px"><a href="schedule.html">Full schedule</a></p>`}
function openItems(){$('#open').innerHTML=EV.filter(e=>e.tag==='tbd').map(e=>`<li><b>${esc(e.title.replace(/ \(TBC\)/,''))}</b> <span class="small">(${dayLabel(e.d)})</span></li>`).join('')}

/* ---------- schedule ---------- */
let curDay=lsGet('cota.day',''),filt='all';
function pickDefaultDay(){const k=nowCT().slice(0,10);if(DAYS.some(d=>d.d===k))return k;return DAYS[0].d}
if(!DAYS.some(d=>d.d===curDay))curDay=pickDefaultDay();
function renderSchedule(){
  $('#glance').innerHTML=DAYS.map(d=>{const g=GLANCE[d.d];return `<button data-day="${d.d}"><b>${d.s} Oct ${d.n}</b><span><strong>${g[0]}</strong></span><span>${g[1]}</span></button>`}).join('');
  $('#days').innerHTML=DAYS.map(d=>`<button class="day" data-day="${d.d}" aria-pressed="${d.d===curDay}"><b>${d.s} ${d.n}</b><small>${{'22':'Warm-up','23':'BBQ + Maroon 5','24':'Lunch + Post Malone','25':'Race day','26':'The Oasis','27':'Back to work'}[d.n]}</small></button>`).join('');
  $('#whofilter').innerHTML=['all',...PID].map(id=>`<button class="chip" data-f="${id}" aria-pressed="${filt===id}">${id==='all'?'Everyone':P[id].name}</button>`).join('');
  const k=nowCT(),list=EV.filter(e=>e.d===curDay&&(filt==='all'||e.who.includes(filt)));
  const nextI=EV.findIndex(e=>(e.d+' '+e.t)>k);const nextEv=nextI>-1?EV[nextI]:null;
  $('#timeline').innerHTML=list.length?list.map(e=>`<li class="ev c-${e.tag}${e===nextEv?' now':''}"><time>${hm(e.t)}</time><div class="card"><h3>${esc(e.title)}</h3>${e.note?`<p>${esc(e.note)}</p>`:''}<div class="meta"><span class="tag t-${e.tag}">${TAGN[e.tag]}</span>${e.who.length===5?'<span class="small">Everyone</span>':`<span class="dots">${e.who.map(dot).join('')}</span>`}${e===nextEv?'<span class="tag t-tbd" style="border-color:var(--red);color:var(--red)">Next up</span>':''}</div></div></li>`).join(''):'<li class="small">Nothing on this day for this person.</li>';
}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-day]');if(g){curDay=g.dataset.day;lsSet('cota.day',curDay);renderSchedule();if(g.closest('#glance'))$('#days').scrollIntoView({behavior:'smooth',block:'start'});return}
  const f=e.target.closest('[data-f]');if(f){filt=f.dataset.f;renderSchedule()}});

/* ---------- crew ---------- */
const LEGS={
 tanmay:[['in','Arrive','Fri Oct 23','2:00 am (overnight)','Flight',''],['out','Depart','Mon Oct 26','About 9:00 pm (to confirm)','Flight','']],
 hetvi:[['in','Arrive','Fri Oct 23','About 4:00 pm','Flight',''],['out','Depart','Mon Oct 26','5:30 am','Flight','']],
 ambika:[['in','Arrive','Sat Oct 24','12:00 pm','Bus',''],['out','Depart','Mon Oct 26','11:00 am','Bus','']],
 anu:[['in','Arrive','Sat Oct 24','Morning, straight to COTA','Bus or ride','Meets us at COTA. Sleeps at Patne\u2019s on Saturday night.'],['out','Depart','Sun Oct 25','About 7:00 pm','Ride','After the trophy ceremony.']]};
let editLeg='';
function renderCrew(){
  $('#crewgrid').innerHTML=PEOPLE.map(p=>{
    if(p.id==='patne')return `<div class="card person"><header>${dot(p.id)}<div><h3>${p.name}</h3><span class="small">Host</span></div></header>${profLine(p.id)}<p class="small">Home base in Austin. Drives the Mazda CX-5 on COTA days.</p></div>`;
    return `<div class="card person"><header>${dot(p.id)}<div><h3>${p.name}</h3><span class="small">Guest</span></div></header>${profLine(p.id)}${LEGS[p.id].map(L=>{
      const id=p.id+'-'+L[0],sv=legs[id]||{},when=sv.time||L[3],where=sv.where||'',ref=sv.ref||'',note=sv.note||L[5];
      if(editLeg===id)return `<div class="leg" data-leg="${id}"><div class="lh"><b>${L[1]} · ${L[2]}</b></div><div class="stack" style="margin-top:6px"><div><label>${L[4]==='Flight'||L[4]==='Bus'?L[4]+' number':'Name or car'}</label><input type="text" data-k="ref" value="${esc(ref)}" placeholder="e.g. AA 1234"></div><div><label>Time</label><input type="text" data-k="time" value="${esc(sv.time||'')}" placeholder="${esc(L[3])}"></div><div><label>${L[4]==='Flight'?'Terminal or airline':'Bus stop or meeting point'}</label><input type="text" data-k="where" value="${esc(where)}"></div><div><label>Notes</label><input type="text" data-k="note" value="${esc(sv.note||'')}" placeholder="${esc(L[5])}"></div><div class="row"><button class="btn" data-save="${id}">Save</button><button class="btn alt" data-cancel="1">Cancel</button></div></div></div>`;
      return `<div class="leg"><div class="lh"><b>${L[1]} · ${L[2]}</b><button class="chip" data-edit="${id}">Edit</button></div><div class="big">${esc(when)}</div><div class="small">${L[4]}${ref?': '+esc(ref):''}${where?' · '+esc(where):''}</div><div class="small" style="margin-top:2px">${esc(note)}</div></div>`}).join('')}</div>`}).join('');
}
document.addEventListener('click',async e=>{
  const ed=e.target.closest('[data-edit]');if(ed){editLeg=ed.dataset.edit;renderCrew();return}
  if(e.target.closest('[data-cancel]')){editLeg='';renderCrew();return}
  const sv=e.target.closest('[data-save]');if(sv){const box=sv.closest('[data-leg]'),d={};$$('input',box).forEach(i=>d[i.dataset.k]=i.value.trim());editLeg='';await Store.set('legs',sv.dataset.save,d);toast('Saved')}});
Store.watch('legs',m=>{legs=m;if(!editLeg)renderCrew();refreshXP()});

/* ---------- info ---------- */
const HF=[['address','Address','Add address'],['phone','Phone','Add phone'],['plate','Plate','Add plate'],['wifi','Wi-Fi network','Network name'],['wifipass','Wi-Fi password','Password'],['note','House notes','Parking, door, shoes off, etc.']];
let host=Object.assign({},TRIP),editHost=false;
const m0=()=>host;
function renderHost(){
  const car='Mazda CX-5';
  $('#hostcard').innerHTML=`<div class="kv"><span class="k">Car</span><span class="v">${car}</span><span></span></div>`+
  (editHost?`<div class="stack" style="margin-top:8px">${HF.map(f=>`<div><label>${f[1]}</label><input type="text" data-h="${f[0]}" value="${esc(host[f[0]]||'')}" placeholder="${f[2]}"></div>`).join('')}<div class="row"><button class="btn" id="hsave">Save</button><button class="btn alt" id="hcancel">Cancel</button></div></div>`
  :HF.map(f=>{const v=host[f[0]];return `<div class="kv"><span class="k">${f[1]}</span><span class="v${v?'':' empty'}">${v?esc(v):'Not added yet'}</span>${v?`<button class="btn alt" data-copy="${esc(v)}">Copy</button>`:'<span></span>'}</div>`}).join('')+`<div style="margin-top:10px"><button class="btn alt" id="hedit">Edit details</button></div>`);
}
document.addEventListener('click',async e=>{
  if(e.target.id==='hedit'){editHost=true;renderHost()}
  if(e.target.id==='hcancel'){editHost=false;renderHost()}
  if(e.target.id==='hsave'){const d=Object.assign({},m0());$$('[data-h]').forEach(i=>d[i.dataset.h]=i.value.trim());editHost=false;await Store.set('host','card',d);toast('Saved')}});
/* ---------- food & texas ---------- */
const TEX=[
 ['Fri 11:45 am','Terry Black’s BBQ','1003 Barton Springs Rd. Opens at 11, so expect a line by noon.','Terry Black’s BBQ 1003 Barton Springs Rd Austin','food'],
 ['Fri 1:15 pm','Mercedes F1 Fan Hub','400 Congress Ave, downtown. Free, Oct 22–25. Pit-stop challenge, simulators, show car. Hours not published; entry is by queue.','Mercedes F1 Fan Hub 400 Congress Ave Austin','tbd'],
 ['Sat–Sun','Turn 3–4 hill','Our home on the grass for qualifying and the race.','Circuit of the Americas Turn 3','cota'],
 ['Sat 1:00 pm','Lunch at Patne’s place','Tell Patne what you would like, below.',null,'food'],
 ['Sat 10:30 pm','Cocktail night at home','Right after we are back from COTA. Pick your drinks on the Cocktails page.',null,'fun'],
 ['Sun 8:00 pm','Powder Room','301 W 5th St, downtown. Cocktails booked for the group.','Powder Room 301 W 5th St Austin','fun'],
 ['Mon 5:20 pm','The Oasis on Lake Travis','Early dinner on the deck, 6550 Comanche Trail. Sunset is 6:50, so the bell may be missed before a 9 pm flight.','The Oasis on Lake Travis 6550 Comanche Trail Austin','fun']];
const TEXWHO=[['patne','tanmay'],['patne','tanmay'],PID,['patne','tanmay','hetvi','ambika'],PID,['patne','tanmay','hetvi','ambika'],['patne','tanmay']];
$('#texgrid').innerHTML=TEX.map((t,i)=>`<div class="card stack"><div class="row" style="justify-content:space-between"><span class="eyebrow">${t[0]}</span><span class="tag t-${t[4]}">${TAGN[t[4]]}</span></div><h3>${t[1]}</h3><p class="small">${t[2]}</p>${t[3]?`<a class="small" href="${maps(t[3])}" target="_blank" rel="noopener">Open in Maps</a>`:''}<div class="dots" style="margin-top:2px">${TEXWHO[i].map(dot).join('')}</div></div>`).join('');
function renderMenu(){const box=$('#menuvote');if(!document.getElementById('menuvote'))return;
  const f=document.activeElement;if(f&&f.id==='menuin')return;
  const mine=(menu[ME]||{}).choice||'';
  box.innerHTML=`<div class="stack"><div><label for="menuin">What would you like to eat at Patne’s place? One dish.</label><input type="text" id="menuin" value="${esc(mine)}" placeholder="e.g. dal and rice, pasta, veg biryani"></div><div><button class="btn" id="menusave">${mine?'Update my pick':'Save my pick'}</button> <span class="small">You can change it any time.</span></div></div><div style="margin-top:12px">`+PEOPLE.map(p=>{const c=(menu[p.id]||{}).choice;return `<div class="bal"><span class="row" style="gap:8px">${dot(p.id)}${p.name}</span><span class="${c?'':'small'}" style="text-align:right;font-weight:700">${c?esc(c):'Not picked yet'}</span></div>`}).join('')+`</div>`}
document.addEventListener('click',async e=>{if(e.target.id!=='menusave')return;if(needMe())return;const v=$('#menuin').value.trim();if(!v){toast('Type a dish first');return}await Store.set('menu',ME,{choice:v,ts:Date.now()});toast('Saved. Edit any time.')});
Store.watch('menu',m=>{menu=m;renderMenu();refreshXP()});
Store.watch('host',m=>{host=Object.assign({},TRIP,nonEmpty(m.card));if(!editHost)renderHost()});

/* ---------- play ---------- */
const REVEAL=LIGHTS+2.5*36e5;
function renderPreds(){
  const mine=preds[ME]||{},open=Date.now()<LIGHTS;
  const rows=PEOPLE.map(p=>{const v=preds[p.id];return `<tr><td>${dot(p.id)}</td><td>${v?(Date.now()>=REVEAL||p.id===ME?`${esc(v.winner||'-')}<div class="small">Podium: ${esc(v.podium||'-')} · Safety car: ${esc(v.sc||'-')}</div>`:'<span class="pill ok">Locked in</span>'):'<span class="small">No pick yet</span>'}</td></tr>`}).join('');
  $('#preds').innerHTML=`${open?`<div class="stack"><div><label>Race winner</label><input type="text" id="pw" value="${esc(mine.winner||'')}" placeholder="Driver name"></div><div><label>Podium (three names)</label><input type="text" id="pp" value="${esc(mine.podium||'')}" placeholder="1st, 2nd, 3rd"></div><div><label>Safety car?</label><select class="f" id="ps"><option value="">Pick</option><option ${mine.sc==='Yes'?'selected':''}>Yes</option><option ${mine.sc==='No'?'selected':''}>No</option></select></div><div><button class="btn" id="psave">Lock in my picks</button></div></div>`:'<p class="small">Picks are closed. Lights out has passed.</p>'}<div class="scroll" style="margin-top:12px"><table><tbody>${rows}</tbody></table></div><p class="small" style="margin-top:6px">Everyone’s picks are revealed after the race.</p>`}
document.addEventListener('click',e=>{if(e.target.id==='psave'){if(needMe())return;Store.set('preds',ME,{winner:$('#pw').value.trim(),podium:$('#pp').value.trim(),sc:$('#ps').value});toast('Locked in')}});
Store.watch('preds',m=>{preds=m;renderPreds();refreshXP()});
const CATS=['Best co-pilot','Worst joke of the trip','Most likely to nap on the hill','Best food pick of the trip','Loudest cheerer','Trip MVP'];
function renderAwards(){
  const mine=(awards[ME]||{}).v||{};
  $('#awards').innerHTML=CATS.map((c,k)=>{const cnt={};Object.values(awards).forEach(a=>{const w=(a.v||{})[k];if(w)cnt[w]=(cnt[w]||0)+1});const mx=Math.max(1,...Object.values(cnt));
    return `<div><div class="row" style="justify-content:space-between"><b>${c}</b><select class="f" data-aw="${k}" style="width:auto"><option value="">Vote</option>${PEOPLE.map(p=>`<option value="${p.id}" ${mine[k]===p.id?'selected':''}>${p.name}</option>`).join('')}</select></div>${PID.filter(i=>cnt[i]).map(i=>`<div class="bar-row"><span>${P[i].name}</span><i style="width:${cnt[i]/mx*100}%"></i><span>${cnt[i]}</span></div>`).join('')}</div>`}).join('')}
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.aw!=null){if(needMe()){t.value='';return}const v=Object.assign({},(awards[ME]||{}).v||{});if(t.value)v[t.dataset.aw]=t.value;else delete v[t.dataset.aw];Store.set('awards',ME,{v})}});
Store.watch('awards',m=>{awards=m;renderAwards();refreshXP()});
function renderSongs(){const ids=Object.keys(songs).sort((a,b)=>songs[a].ts-songs[b].ts);
  $('#songs').innerHTML=ids.length?ids.map(i=>`<li>${esc(songs[i].title)} <span class="small">${songs[i].by&&P[songs[i].by]?'· '+P[songs[i].by].name:''}</span></li>`).join(''):'<li class="small" style="list-style:none;margin-left:-20px">No songs yet.</li>'}
document.addEventListener('click',e=>{if(e.target.id==='songadd'){const v=$('#songin').value.trim();if(!v)return;Store.set('songs','s'+Date.now().toString(36),{title:v,by:ME,ts:Date.now()});$('#songin').value=''}});
Store.watch('songs',m=>{songs=m;renderSongs();refreshXP()});

/* ---------- after ---------- */
let stars=0,jdraft={};
const JF=[['best','Best moment','The one you will retell'],['funny','Funniest moment',''],['food','Favourite thing you ate',''],['change','What should we change next time?',''],['note','One line for the group','']];
function renderJournal(){
  if(!ME){$('#journalform').innerHTML='<h3>Your page</h3><p class="small" style="margin-top:6px">Pick who you are at the top right to write yours.</p>';}
  else{const mine=jr[ME]||{},cur=stars||mine.stars||0;
  $('#journalform').innerHTML=`<div class="row" style="gap:8px">${dot(ME)}<h3>${P[ME].name}’s page</h3>${mine.ts?'<span class="pill ok">Posted</span>':''}</div><div class="stack" style="margin-top:10px"><div><label>Overall</label><div class="stars" id="stars">${[1,2,3,4,5].map(n=>`<button data-star="${n}" class="${n<=cur?'on':''}" aria-label="${n} stars">★</button>`).join('')}</div></div>${JF.map(f=>`<div><label>${f[1]}</label><textarea data-j="${f[0]}" placeholder="${f[2]}">${esc(jdraft[f[0]]!=null?jdraft[f[0]]:(mine[f[0]]||''))}</textarea></div>`).join('')}<div class="row"><button class="btn" id="jsave">${mine.ts?'Update my page':'Post my page'}</button><button class="btn alt" id="jcopy">Copy for the group chat</button></div></div>`}
  const done=PID.filter(i=>jr[i]&&jr[i].ts).length,unlocked=!!(ME&&jr[ME]&&jr[ME].ts)||done===5;
  $('#wallcount').textContent=done+' of 5 posted';
  $('#wall').innerHTML=PEOPLE.map(p=>{const j=jr[p.id];if(!j||!j.ts)return `<div class="card plain"><div class="row" style="gap:8px">${dot(p.id)}<b>${p.name}</b></div><p class="small" style="margin-top:6px">Has not written yet.</p></div>`;
    const body=`<div style="color:var(--yellow);font-size:1.2rem">${'★'.repeat(j.stars||0)}<span style="color:#D9C7A5">${'★'.repeat(5-(j.stars||0))}</span></div>`+JF.filter(f=>j[f[0]]).map(f=>`<p style="margin-top:6px"><span class="small">${f[1]}</span><br>${esc(j[f[0]])}</p>`).join('');
    return `<div class="card"><div class="row" style="gap:8px">${dot(p.id)}<b>${p.name}</b></div><div class="${unlocked||p.id===ME?'':'blur'}" style="margin-top:6px">${body}</div>${unlocked||p.id===ME?'':'<p class="small" style="margin-top:6px">Post yours to unlock.</p>'}</div>`}).join('')}
document.addEventListener('input',e=>{if(e.target.dataset.j)jdraft[e.target.dataset.j]=e.target.value});
document.addEventListener('click',async e=>{
  const s=e.target.closest('[data-star]');if(s){stars=+s.dataset.star;renderJournal();return}
  if(e.target.id==='jsave'){if(needMe())return;const d={stars:stars||(jr[ME]||{}).stars||0,ts:Date.now()};JF.forEach(f=>{const el=$(`[data-j="${f[0]}"]`);d[f[0]]=el?el.value.trim():''});await Store.set('journal',ME,d);try{const fd=new URLSearchParams({'form-name':'journal',person:P[ME].name,stars:d.stars});JF.forEach(f=>fd.set(f[0],d[f[0]]));fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:fd.toString()}).catch(()=>{})}catch(e){}jdraft={};stars=0;toast('Posted')}
  if(e.target.id==='jcopy'&&ME){const m=jr[ME]||{};const d={};JF.forEach(f=>{const el=$(`[data-j="${f[0]}"]`);d[f[0]]=el?el.value.trim():(m[f[0]]||'')});const st=stars||m.stars||0;copy(`${P[ME].name}'s Texas F1 trip\n${'★'.repeat(st)}${'☆'.repeat(5-st)}\n`+JF.filter(f=>d[f[0]]).map(f=>f[1]+': '+d[f[0]]).join('\n'))}});
Store.watch('journal',m=>{jr=m;renderJournal();refreshXP()});

/* ---------- progress (pack list + bingo), shared ---------- */
const myProg=()=>JSON.parse(JSON.stringify(prog[ME]||{packed:{},bingo:{}}));
function renderPack(){const mine=((prog[ME]||{}).packed)||{};let i=0;
  $('#pack').innerHTML=PACK.map(g=>`<div><div class="eyebrow" style="margin:4px 0">${g[0]}</div>`+g[1].map(it=>{const k=i++;return `<label style="display:flex;gap:10px;align-items:flex-start;margin:0 0 6px;color:var(--ink);font-size:1rem;font-weight:600"><input type="checkbox" data-pk="${k}" ${mine[k]?'checked':''}> <span style="${mine[k]?'text-decoration:line-through;opacity:.6':''}">${it}</span></label>`}).join('')+`</div>`).join('');
  const n=cnt(mine);$('#packmsg').textContent=ME?`${n} of ${PACKITEMS.length} packed${n>=PACKITEMS.length?'. Packed and ready, +5 bonus!':''}`:'Pick your driver at the top to save your ticks.'}
document.addEventListener('change',e=>{const k=e.target.dataset.pk;if(k==null)return;if(needMe()){e.target.checked=false;return}const p=myProg();p.packed=p.packed||{};p.packed[k]=e.target.checked;Store.set('prog',ME,p)});
function renderBingo(){const st=((prog[ME]||{}).bingo)||{};
  $('#bingo').innerHTML=BINGO.map((b,i)=>`<button data-b="${i}" class="${i===12||st[i]?'on':''}">${b}</button>`).join('');
  const n=bingoLines(st);$('#bingomsg').textContent=n?`${n} line${n>1?'s':''} done. Bingo!`:`${cnt(st)} squares spotted`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-b]');if(!b)return;if(needMe())return;const i=+b.dataset.b;if(i===12)return;const p=myProg();p.bingo=p.bingo||{};p.bingo[i]=!p.bingo[i];Store.set('prog',ME,p)});
Store.watch('prog',m=>{prog=m;renderPack();renderBingo();refreshXP()});

/* ---------- points, header pill, home pit pass, standings ---------- */
function refreshXP(){
  if(ME){const t=score(ME).total,L=levelOf(t).name;
    if(lastTotal!==null&&t>lastTotal&&Date.now()-acted<4000){toast(`+${t-lastTotal} pts!`);const x=$('#xp');x.classList.remove('pop');void x.offsetWidth;x.classList.add('pop');if(L!==lastLevel)setTimeout(()=>toast(`Level up: ${L}!`),1500)}
    lastTotal=t;lastLevel=L}
  renderXP();renderPit();renderBoard();renderQuestList();renderHL();renderDir()}
function renderXP(){const x=$('#xp');if(!ME){x.textContent='Pick your driver →';return}const t=score(ME).total;x.textContent=`${levelOf(t).name} · ${t} pts`}
function meter(t){const L=levelOf(t),N=nextLevel(t);const pct=N?Math.round((t-L.at)/(N.at-L.at)*100):100;return `<div class="meter"><i style="width:${Math.max(6,pct)}%"></i></div><div class="small" style="margin-top:4px">${N?`${N.at-t} pts to ${N.name}`:'You are the champion!'}</div>`}
function renderPit(){const box=$('#xpcard');if(!ME){box.innerHTML='<div class="row" style="justify-content:space-between"><div><h3>Your pit pass</h3><p class="small">Pick your driver at the top right to start earning points.</p></div><a class="btn" href="leaderboard.html">See standings</a></div>';return}
  const s=score(ME),L=levelOf(s.total),todo=s.rows.filter(r=>r.pts<r.max).slice(0,3);
  box.innerHTML=`<div class="row" style="justify-content:space-between;align-items:flex-end"><div><div class="eyebrow">${P[ME].name}’s pit pass</div><div class="lvl">${L.name}</div></div><div class="lvl" style="color:var(--blue)">${s.total} pts</div></div><div style="margin:8px 0">${meter(s.total)}</div>`+(todo.length?`<div class="eyebrow" style="margin-top:8px">Next quests</div>`+todo.map(r=>`<a class="quest" href="${r.to}"><span class="ck"></span><span class="q">${r.label}</span><span class="pts">+${r.max-r.pts}</span></a>`).join(''):'<p class="small">Every quest done. Legend.</p>')+`<div style="margin-top:10px"><a class="btn alt" href="leaderboard.html">Championship standings</a></div>`}
function standings(){return PEOPLE.map(p=>({p,s:score(p.id)})).sort((a,b)=>b.s.total-a.s.total||a.p.name.localeCompare(b.p.name))}
function renderBoard(){const st=standings();
  $('#podium').innerHTML=[st[1],st[0],st[2]].map((x,i)=>{const pos=[2,1,3][i];return `<div class="st p${pos}"><div class="pos">P${pos}</div>${dot(x.p.id)}<div class="nm">${x.p.name}</div><div class="pt">${x.s.total}</div></div>`}).join('');
  const html=st.map((x,i)=>`<div class="row-board"><div class="p">${i+1}</div><div><div class="row" style="gap:8px">${dot(x.p.id)}<b>${x.p.name}</b><span class="pill">${levelOf(x.s.total).name}</span></div>${(profiles[x.p.id]||{}).fav?`<div class="small">♥ ${esc(profiles[x.p.id].fav)}</div>`:''}<div>${badgesOf(x.s).map(b=>`<span class="badge">${b}</span>`).join('')}</div></div><div class="tp">${x.s.total}</div></div>`).join('');
  $('#board').innerHTML=html;
  $('#miniboard').innerHTML=st.map((x,i)=>`<div class="row-board" style="padding:6px 0"><div class="p" style="font-size:1.5rem">${i+1}</div><div class="row" style="gap:8px">${dot(x.p.id)}<b>${x.p.name}</b></div><div class="tp" style="font-size:1.4rem">${x.s.total}</div></div>`).join('');
  $('#rules').innerHTML='<table><thead><tr><th>Quest</th><th>Max points</th></tr></thead><tbody>'+QUESTS.map(q=>`<tr><td><a href="${q.to}">${q.label}</a></td><td>${q.max}</td></tr>`).join('')+'<tr><td>Highlight reel (Patne awards one per person for an epic or funny moment)</td><td>5</td></tr><tr><td>Host bonus (race calls and other extras)</td><td>any</td></tr></tbody></table>';
  const hb=$('#hostbonus');if(ME==='patne'){hb.hidden=false;$('#hostbonus-body').innerHTML=PEOPLE.map(p=>`<div class="bal"><span class="row" style="gap:8px">${dot(p.id)}${p.name} <span class="pill">${(bonus[p.id]||{}).pts||0} bonus</span></span><span class="row"><button class="chip" data-bonus="${p.id}|-5">-5</button><button class="chip" data-bonus="${p.id}|5">+5</button><button class="chip" data-bonus="${p.id}|10">+10</button></span></div>`).join('')}else hb.hidden=true}
document.addEventListener('click',e=>{const b=e.target.closest('[data-bonus]');if(!b)return;const [p,d]=b.dataset.bonus.split('|');Store.set('bonus',p,{pts:Math.max(0,((bonus[p]||{}).pts||0)+(+d))})});
function renderQuestList(){const box=$('#questlist');if(!ME){box.innerHTML='<p class="small">Pick your driver at the top right to see your quests.</p>';return}
  const s=score(ME);box.innerHTML=s.rows.map(r=>`<a class="quest${r.pts>=r.max?' done':''}" href="${r.to}"><span class="ck">${r.pts>=r.max?'✓':''}</span><span class="q">${r.label}</span><span class="pts">${r.pts}/${r.max}</span></a>`).join('')+(s.hl?`<div class="quest"><span class="ck" style="background:var(--yellow)"></span><span class="q">Highlight reel</span><span class="pts">+${s.hl}</span></div>`:'')+(s.bonus?`<div class="quest"><span class="ck" style="background:var(--yellow)"></span><span class="q">Host bonus</span><span class="pts">+${s.bonus}</span></div>`:'')}
Store.watch('bonus',m=>{bonus=m;refreshXP()});

/* ---------- host note ---------- */
function renderNotes(){const box=$('#hn-list');if(!ME){box.innerHTML='';return}
  const all=Object.entries(notes).map(([id,n])=>Object.assign({id},n)).sort((a,b)=>b.ts-a.ts),show=ME==='patne'?all:all.filter(n=>n.by===ME);
  box.innerHTML=(show.length?`<div class="eyebrow" style="margin:10px 0 4px">${ME==='patne'?'Notes for you':'Notes you sent'}</div>`:'')+show.map(n=>`<div class="bal" style="align-items:flex-start"><div><b>${esc(n.from||'Someone')}</b> <span class="small">${new Date(n.ts).toLocaleString('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</span><div>${esc(n.text)}</div></div></div>`).join('')}
document.addEventListener('click',async e=>{if(e.target.id!=='hn-send')return;const t=$('#hn-text').value.trim();if(!t){toast('Write something first');return}
  const from=$('#hn-from').value.trim()||(ME?P[ME].name:'Someone');
  await Store.set('notes','n'+Date.now().toString(36),{from,by:ME,text:t,ts:Date.now()});
  try{fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({'form-name':'host-note',from,text:t}).toString()}).catch(()=>{})}catch(x){}
  $('#hn-text').value='';toast('Sent to Patne');});
Store.watch('notes',m=>{notes=m;renderNotes();refreshXP()});
function prefillFrom(){const f=$('#hn-from');if(f&&!f.value&&ME)f.value=P[ME].name}

/* ---------- cocktails ---------- */
function renderCocktails(){const grid=$('#cocktail-grid');if(!window.COCKTAILS)return;
  const mine=cocktails[ME]||{picks:[],fav:'',dry:false};
  $('#cocktail-sample').hidden=!window.COCKTAILS_SAMPLE;$('#shopcard').hidden=ME!=='patne';
  $('#drybtn').setAttribute('aria-pressed',!!mine.dry);
  grid.innerHTML=COCKTAILS.map(c=>`<div class="card cocktail">${c.img?`<img class="cimg" src="${c.img}" alt="${esc(c.name)}" loading="lazy">`:''}<h3>${esc(c.name)}</h3><p class="small" style="letter-spacing:.06em;text-transform:uppercase;font-size:.75rem">${esc(c.tags||c.blurb||'')}</p>${c.ing?`<div class="ing">${esc(c.ing.join(' · '))}</div>`:''}<div class="seg"><button class="chip" data-cp="${c.id}" aria-pressed="${mine.picks.includes(c.id)}">I’d drink this</button><button class="chip" data-cf="${c.id}" aria-pressed="${mine.fav===c.id}">★ My favourite</button></div></div>`).join('');
  const T=COCKTAILS.map(c=>{const who=Object.entries(cocktails).filter(([p,d])=>(d.picks||[]).includes(c.id)).map(([p])=>p),favs=Object.entries(cocktails).filter(([p,d])=>d.fav===c.id).map(([p])=>p);return{c,who,favs,score:favs.length*2+who.length}}).sort((a,b)=>b.score-a.score);
  const voters=Object.keys(cocktails).length,dry=Object.values(cocktails).filter(d=>d.dry).length,mx=Math.max(1,...T.map(t=>t.who.length));
  $('#cocktail-results').innerHTML=voters?`<div class="small" style="margin-bottom:8px">${voters} of 5 have picked${dry?`, ${dry} want an alcohol-free option`:''}.</div>`+T.map((t,i)=>`<div style="margin-bottom:8px"><div class="row" style="justify-content:space-between"><b>${i===0&&t.score?'👑 ':''}${esc(t.c.name)}</b><span class="small">${t.who.length} want it · ${t.favs.length} favourite${t.favs.length===1?'':'s'}</span></div><div class="bar-row" style="grid-template-columns:1fr 24px"><i style="width:${t.who.length/mx*100}%"></i><span>${t.who.length}</span></div><div class="dots">${t.who.map(dot).join('')}</div></div>`).join(''):'<p class="small">No picks yet. Be the first.</p>';
  const pp=lsGet('cota.pp',4);$('#drinks').value=pp;
  const est={};COCKTAILS.forEach(c=>est[c.id]=0);Object.values(cocktails).forEach(d=>{const ids=(d.picks||[]).filter(x=>est[x]!==undefined);if(!ids.length||d.dry&&!ids.length)return;const w=ids.map(x=>x===d.fav?2:1),tot=w.reduce((a,b)=>a+b,0);ids.forEach((x,i)=>est[x]+=pp*w[i]/tot)});
  $('#cocktail-shop').innerHTML=T.filter(t=>t.who.length).map(t=>`<div class="bal" style="align-items:flex-start"><div><b>${esc(t.c.name)}</b><div class="small">${t.c.ing?esc(t.c.ing.join(', ')):''}</div></div><div class="lvl" style="font-size:1.6rem">${Math.round(est[t.c.id])}<span class="small"> drinks</span></div></div>`).join('')||'<p class="small">Nothing to buy yet.</p>'}
document.addEventListener('click',e=>{
  const p=e.target.closest('[data-cp]'),f=e.target.closest('[data-cf]'),d=e.target.closest('#drybtn');
  if(!p&&!f&&!d)return;if(needMe())return;
  const m=Object.assign({picks:[],fav:'',dry:false},cocktails[ME]||{});m.picks=[...m.picks];
  if(p){const i=m.picks.indexOf(p.dataset.cp);if(i>-1){m.picks.splice(i,1);if(m.fav===p.dataset.cp)m.fav=''}else m.picks.push(p.dataset.cp)}
  if(f){const id=f.dataset.cf;if(m.fav===id)m.fav='';else{m.fav=id;if(!m.picks.includes(id))m.picks.push(id)}}
  if(d)m.dry=!m.dry;
  m.ts=Date.now();Store.set('cocktails',ME,m)});
document.addEventListener('change',e=>{if(e.target.id==='drinks'){lsSet('cota.pp',Math.max(1,+e.target.value||4));renderCocktails()}});
Store.watch('cocktails',m=>{cocktails=m;renderCocktails();refreshXP()});

/* ---------- photos + collage ---------- */
const photoSrc=d=>d.local||Store.mode()!=='shared'?lsGet('cota.photo.'+d.person+'.'+d.slot,''):`/api/photo?person=${d.person}&slot=${d.slot}&v=${d.ts||0}`;
function photoList(){return Object.values(photos).filter(d=>PID.includes(d.person)).sort((a,b)=>PID.indexOf(a.person)-PID.indexOf(b.person)||a.slot-b.slot)}
function renderPhotos(){
  const up=$('#upslots');if(up.tagName){up.innerHTML=[1,2].map(s=>{const d=photos[ME+'-'+s];return `<div class="upslot"><b>Photo ${s}</b>${d&&ME?`<img src="${photoSrc(d)}" alt="Your photo ${s}">`:''}<label class="btn alt" style="margin:0;cursor:pointer">${d&&ME?'Replace':'Choose a photo'}<input type="file" accept="image/*" data-up="${s}" hidden></label></div>`}).join('')}
  $('#gallery').innerHTML=photoList().map((d,i)=>`<figure class="polaroid" style="--rot:${((i*37)%7-3)*.6}deg"><img src="${photoSrc(d)}" alt="${P[d.person].name}'s photo ${d.slot}" loading="lazy"><figcaption>${P[d.person].name}</figcaption></figure>`).join('')||'<p class="small">No photos yet.</p>';
  drawCollage()}
document.addEventListener('change',async e=>{const s=e.target.dataset.up;if(!s)return;const f=e.target.files[0];e.target.value='';if(!f)return;await uploadPhoto(f,+s)});
function resizeImg(file,max){return new Promise((res,rej)=>{const img=new Image(),u=URL.createObjectURL(file);img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>b?res(b):rej(),'image/jpeg',.82)};img.onerror=()=>rej();img.src=u})}
const blobURL=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
async function uploadPhoto(file,slot){if(needMe())return;toast('Uploading...');let blob;try{blob=await resizeImg(file,1400)}catch(x){toast('That image would not open');return}
  if(Store.mode()==='shared'){try{const r=await fetch(`/api/photo?person=${ME}&slot=${slot}`,{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob});if(!r.ok)throw 0;await Store.set('photos',ME+'-'+slot,{person:ME,slot,ts:Date.now()});toast('Photo posted');return}catch(x){toast('Upload failed. Try again.');return}}
  const url=await blobURL(blob);try{localStorage.setItem('cota.photo.'+ME+'.'+slot,JSON.stringify(url))}catch(x){toast('Phone storage is full');return}
  await Store.set('photos',ME+'-'+slot,{person:ME,slot,ts:Date.now(),local:true});toast('Saved on this device')}
Store.watch('photos',m=>{photos=m;renderPhotos();refreshXP()});
function gridFor(n,W,H){let best=null;for(let cols=1;cols<=n;cols++){const rows=Math.ceil(n/cols),sc=Math.abs(Math.log((W/cols)/(H/rows)/1.15))+(cols*rows-n)*.09;if(!best||sc<best.sc)best={cols,rows,sc}}
  const {cols,rows}=best,cw=W/cols,ch=H/rows,out=[];for(let r=0;r<rows;r++){const k=Math.min(cols,n-r*cols),off=(cols-k)*cw/2;for(let c=0;c<k;c++)out.push({x:off+c*cw,y:r*ch,w:cw,h:ch})}return out}

async function drawCollage(){const cv=$('#collage');if(!cv.getContext)return;const tok=++collageTok,list=photoList();
  try{await document.fonts.load('80px Bangers')}catch(x){}
  const imgs=await Promise.all(list.map(d=>new Promise(r=>{const i=new Image();i.onload=()=>r({i,d});i.onerror=()=>r(null);i.src=photoSrc(d)}))).then(a=>a.filter(Boolean));
  if(tok!==collageTok)return;
  const W=1600,HB=imgs.length<=2?760:imgs.length<=4?1000:1150,HT=210,ctx=cv.getContext('2d');cv.width=W;cv.height=HT+HB+40;
  ctx.fillStyle='#FFF3D6';ctx.fillRect(0,0,W,cv.height);ctx.fillStyle='rgba(191,87,0,.16)';for(let y=14;y<cv.height;y+=44)for(let x=14;x<W;x+=44){ctx.beginPath();ctx.arc(x,y,5,0,7);ctx.fill()}
  ctx.fillStyle='#1F4BA8';ctx.fillRect(0,0,W/3,26);ctx.fillStyle='#FFFDF6';ctx.fillRect(W/3,0,W/3,26);ctx.fillStyle='#D7263D';ctx.fillRect(2*W/3,0,W/3,26);ctx.fillStyle='#2A1608';ctx.fillRect(0,26,W,6);
  ctx.textAlign='center';ctx.lineJoin='round';ctx.font='130px Bangers, Impact, sans-serif';ctx.lineWidth=14;ctx.strokeStyle='#2A1608';ctx.strokeText('TEXAS × F1 2026',W/2,150);ctx.fillStyle='#F28A1B';ctx.fillText('TEXAS × F1 2026',W/2,150);
  ctx.font='42px Bangers, Impact, sans-serif';ctx.fillStyle='#2A1608';ctx.fillText('US GRAND PRIX · AUSTIN · OCT 22–27',W/2,200);
  if(!imgs.length){ctx.font='60px Bangers, Impact, sans-serif';ctx.fillText('Photos will appear here',W/2,HT+HB/2);return}
  const cells=gridFor(imgs.length,W-60,HB);
  imgs.forEach((m,i)=>{const c=cells[i],pad=22,x=30+c.x+pad,y=HT+c.y+pad,w=c.w-pad*2,h=c.h-pad*2,cap=46,ang=(((i*37)%7)-3)*.012;
    ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(ang);ctx.fillStyle='#2A1608';ctx.fillRect(-w/2+9,-h/2+9,w,h);ctx.fillStyle='#fff';ctx.fillRect(-w/2,-h/2,w,h);ctx.lineWidth=5;ctx.strokeStyle='#2A1608';ctx.strokeRect(-w/2,-h/2,w,h);
    const iw=w-24,ih=h-24-cap,sc=Math.max(iw/m.i.width,ih/m.i.height),sw=iw/sc,sh=ih/sc;ctx.drawImage(m.i,(m.i.width-sw)/2,(m.i.height-sh)/2,sw,sh,-w/2+12,-h/2+12,iw,ih);ctx.strokeRect(-w/2+12,-h/2+12,iw,ih);
    ctx.fillStyle='#2A1608';ctx.font='34px Bangers, Impact, sans-serif';ctx.textAlign='center';ctx.fillText(P[m.d.person].name,0,h/2-14);ctx.restore()})}
document.addEventListener('click',e=>{if(e.target.id!=='dl')return;const cv=$('#collage');cv.toBlob(b=>{if(!b){toast('Could not make the image');return}const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='texas-f1-collage.png';document.body.appendChild(a);a.click();a.remove();toast('Collage downloaded')},'image/png')});

/* ---------- driver card: favourite F1 driver, team and bio ---------- */
const DRIVERS=[['McLaren',['Lando Norris','Oscar Piastri']],['Mercedes',['George Russell','Kimi Antonelli']],['Red Bull',['Max Verstappen','Isack Hadjar']],['Ferrari',['Charles Leclerc','Lewis Hamilton']],['Williams',['Alex Albon','Carlos Sainz']],['Racing Bulls',['Liam Lawson','Arvid Lindblad']],['Aston Martin',['Fernando Alonso','Lance Stroll']],['Haas',['Esteban Ocon','Oliver Bearman']],['Audi',['Nico H\u00fclkenberg','Gabriel Bortoleto']],['Alpine',['Pierre Gasly','Franco Colapinto']],['Cadillac',['Valtteri Bottas','Sergio P\u00e9rez']]];
const TEAMS=DRIVERS.map(t=>t[0]);
function profLine(id){const d=profiles[id]||{};if(!d.fav&&!d.team&&!d.bio)return '';return `<div class="small" style="color:var(--ink)">${d.fav?`<b>Favourite driver:</b> ${esc(d.fav)}`:''}${d.fav&&d.team?'<br>':''}${d.team?`<b>Favourite team:</b> ${esc(d.team)}`:''}${d.bio?`<div style="margin-top:3px">${esc(d.bio)}</div>`:''}</div>`}
function renderProfile(){if(!document.getElementById('profilecard'))return;const box=$('#profilecard');
  if(!ME){box.innerHTML='';return}
  const f=document.activeElement;if(f&&['pf-fav','pf-team','pf-bio'].includes(f.id))return;
  const d=profiles[ME]||{};const pts=(d.fav?5:0)+(d.team?5:0)+(((d.bio||'').trim().length>=15)?20:0);
  box.innerHTML=`<div class="row" style="justify-content:space-between"><h3>${P[ME].name}\u2019s driver card</h3><span class="pill">${pts}/30 pts</span></div><p class="small" style="margin:4px 0 10px">Tell the crew who you are and what you like. Everyone sees it on the Crew page.</p><div class="stack"><div><label for="pf-fav">Favourite F1 driver (+5)</label><select class="f" id="pf-fav"><option value="">Pick one</option>${DRIVERS.map(t=>`<optgroup label="${t[0]}">${t[1].map(n=>`<option ${d.fav===n?'selected':''}>${n}</option>`).join('')}</optgroup>`).join('')}<option ${d.fav==='Someone else'?'selected':''}>Someone else</option></select></div><div><label for="pf-team">Favourite F1 team (+5)</label><select class="f" id="pf-team"><option value="">Pick one</option>${TEAMS.map(n=>`<option ${d.team===n?'selected':''}>${n}</option>`).join('')}<option ${d.team==='Someone else'?'selected':''}>Someone else</option></select></div><div><label for="pf-bio">Who are you and what do you like? (+20)</label><textarea id="pf-bio" placeholder="Hi, I\u2019m ... I love ... (a couple of sentences)">${esc(d.bio||'')}</textarea></div><div><button class="btn" id="pf-save">Save my card</button></div></div><p class="small" style="margin-top:8px">Drivers and teams are the 2026 start-of-season grid.</p>`}
document.addEventListener('click',async e=>{if(e.target.id!=='pf-save')return;if(needMe())return;await Store.set('profiles',ME,{fav:$('#pf-fav').value,team:$('#pf-team').value,bio:$('#pf-bio').value.trim(),ts:Date.now()});toast('Card saved')});
Store.watch('profiles',m=>{profiles=m;renderProfile();renderCrew();renderBoard();refreshXP()});

/* ---------- group directory (mobile numbers) ---------- */
function renderDir(){if(!document.getElementById('dir'))return;
  $('#dir').innerHTML=PEOPLE.map(p=>{const ph=(phones[p.id]||{}).phone||(p.id==='patne'?TRIP.phone:''),raw=ph.replace(/[^+\d]/g,'');return `<div class="card person"><header>${dot(p.id)}<div><h3>${p.name}</h3><span class="small">${p.full}</span></div></header>${ph?`<div style="font-family:var(--display);font-size:1.7rem;letter-spacing:.03em">${esc(ph)}</div><div class="row"><a class="btn" href="tel:${esc(raw)}">Call</a><a class="btn alt" href="sms:${esc(raw)}">Text</a><button class="btn alt" data-copy="${esc(ph)}">Copy</button></div>`:'<p class="small">No number yet.</p>'}</div>`}).join('');
  const f=document.activeElement;if(f&&f.id==='phin')return;
  const mine=(phones[ME]||{}).phone||'';
  $('#dirform').innerHTML=ME?`<div class="stack"><div><label for="phin">Your mobile number (+5)</label><input type="tel" id="phin" value="${esc(mine)}" placeholder="(555) 123-4567" style="width:100%;background:#fff;border:3px solid var(--ink);border-radius:12px;padding:7px 10px;font-weight:600"></div><div><button class="btn" id="phsave">${mine?'Update my number':'Save my number'}</button></div></div>`:'<p class="small">Pick your driver at the top to add your number.</p>'}
document.addEventListener('click',async e=>{if(e.target.id!=='phsave')return;if(needMe())return;const v=$('#phin').value.trim();if(v.replace(/\D/g,'').length<7){toast('Enter a full phone number');return}await Store.set('phones',ME,{phone:v,ts:Date.now()});toast('Number saved')});
Store.watch('phones',m=>{phones=m;renderDir();refreshXP()});

/* ---------- highlight reel (host awards, one per person) ---------- */
function renderHL(){
  if(document.getElementById('hlreel')){const got=PEOPLE.filter(p=>highlights[p.id]).sort((a,b)=>(highlights[a.id].ts||0)-(highlights[b.id].ts||0));
    $('#hlreel').innerHTML=got.length?got.map(p=>`<div class="bal" style="align-items:flex-start"><span class="row" style="gap:8px;flex:1;flex-wrap:nowrap">${dot(p.id)}<span><b>${p.name}</b><br><span class="small" style="color:var(--ink)">${esc(highlights[p.id].reason||'')}</span></span></span><span class="lvl" style="font-size:1.5rem">+${highlights[p.id].pts||HL_PTS}</span></div>`).join(''):'<p class="small">No highlights yet. Patne hands these out for epic or funny moments, one per person.</p>'}
  const card=document.getElementById('hlhostcard');if(!card)return;card.hidden=ME!=='patne';if(ME!=='patne')return;
  const f=document.activeElement;if(f&&f.dataset&&f.dataset.hlr!=null)return;
  $('#hlhost').innerHTML=PEOPLE.map(p=>highlights[p.id]?`<div class="bal"><span class="row" style="gap:8px">${dot(p.id)}${p.name} <span class="pill ok">Awarded</span></span><button class="chip" data-hlx="${p.id}">Undo</button></div>`:`<div style="padding:8px 0;border-bottom:2px dashed #CDB48F"><label>${p.name}</label><div class="row" style="flex-wrap:nowrap"><input type="text" data-hlr="${p.id}" placeholder="What made it epic or funny?" style="flex:1"><button class="btn" data-hl="${p.id}">+${HL_PTS}</button></div></div>`).join('')}
document.addEventListener('click',async e=>{const g=e.target.closest('[data-hl]'),x=e.target.closest('[data-hlx]');
  if(g){const id=g.dataset.hl,i=$(`[data-hlr="${id}"]`);await Store.set('highlights',id,{reason:(i.value||'').trim()||'A great moment',pts:HL_PTS,ts:Date.now()});toast('Highlight awarded')}
  if(x){await Store.del('highlights',x.dataset.hlx);toast('Removed')}});
Store.watch('highlights',m=>{highlights=m;renderHL();refreshXP()});

/* ---------- boot ---------- */
function rerenderAll(){renderSchedule();renderMenu();renderPreds();renderAwards();renderJournal();renderPack();renderBingo();renderCocktails();renderPhotos();renderNotes();renderProfile();renderCrew();prefillFrom();refreshXP()}
renderSchedule();renderCrew();renderHost();nowNext();openItems();tick();prefillFrom();refreshXP();
setInterval(tick,1000);setInterval(nowNext,30000);
})();
