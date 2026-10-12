(function(){
'use strict';
const PEOPLE=[
 {id:'chaitrali',name:'Chaitrali',ab:'Ch',c:'pc1'},{id:'tanmay',name:'Tanmay',ab:'Ta',c:'pc2'},
 {id:'hetvi',name:'Hetvi',ab:'He',c:'pc3'},{id:'ambika',name:'Ambika',ab:'Am',c:'pc4'},{id:'anu',name:'Anu',ab:'An',c:'pc5'}];
const PID=PEOPLE.map(p=>p.id), P=Object.fromEntries(PEOPLE.map(p=>[p.id,p]));
const SH={c:'chaitrali',t:'tanmay',h:'hetvi',a:'ambika',n:'anu'};
const $=(s,r=document)=>r.querySelector(s)||document.createElement('div'), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dot=id=>`<span class="dot ${P[id].c}" title="${P[id].name}">${P[id].ab}</span>`;
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const maps=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}
async function copy(txt){try{await navigator.clipboard.writeText(txt);toast('Copied')}catch(e){try{const a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();toast('Copied')}catch(e2){toast('Copy is blocked here. Select the text instead.')}}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-copy]');if(b)copy(b.dataset.copy)});

/* ---------- me ---------- */
let ME=lsGet('cota.me','');
const meSel=$('#me');
meSel.innerHTML='<option value="">Who are you?</option>'+PEOPLE.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
meSel.value=ME;
meSel.onchange=()=>{ME=meSel.value;lsSet('cota.me',ME);rerenderAll()};
function needMe(){if(!ME){toast('Pick who you are at the top right first');return true}return false}

/* ---------- theme ---------- */
(function(){const t=lsGet('cota.theme','');if(t)document.documentElement.dataset.theme=t})();
$('#theme').onclick=()=>{const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;r.dataset.theme=dark?'light':'dark';lsSet('cota.theme',r.dataset.theme)};

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
    async set(c,id,data){
      if(state==='shared'){try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({col:c,id,data})});if(!r.ok)throw 0;remote[c]=Object.assign({},remote[c]||{},{[id]:data});if(lget(c)[id]){delete lget(c)[id];lsSet('cota.db.'+c,loc[c])}emit(c);return true}catch(e){toast('Could not reach the shared board. Kept on this device.')}}
      lget(c)[id]=data;lsSet('cota.db.'+c,loc[c]);emit(c);return false},
    async del(c,id){
      if(state==='shared'){try{const r=await fetch(API+'?col='+encodeURIComponent(c)+'&id='+encodeURIComponent(id),{method:'DELETE'});if(!r.ok)throw 0;if(remote[c])delete remote[c][id]}catch(e){toast('Could not delete from the shared board.')}}
      if(lget(c)[id]){delete lget(c)[id];lsSet('cota.db.'+c,loc[c])}emit(c)}
  }})();

/* ---------- fill these in once and everyone sees them (no need for the shared board) ---------- */
const TRIP={address:'8800 US 290 W, Apt 1412 Alister Oak Hill, Austin, TX 78736',phone:'(603) 349-9512',plate:'9YTH681',wifi:'',note:''};
const nonEmpty=o=>Object.fromEntries(Object.entries(o||{}).filter(e=>e[1]));

/* ---------- data ---------- */
const DAYS=[{d:'2026-10-22',s:'Thu',n:22},{d:'2026-10-23',s:'Fri',n:23},{d:'2026-10-24',s:'Sat',n:24},{d:'2026-10-25',s:'Sun',n:25},{d:'2026-10-26',s:'Mon',n:26},{d:'2026-10-27',s:'Tue',n:27}];
const GLANCE={
 '2026-10-22':['Gear run, early night','Costco after work; Tanmay\u2019s pickup is 1:15 am','Tanmay\u2019s 2 am landing is really Friday'],
 '2026-10-23':['Hats, BBQ, Mercedes, Maroon 5','Terry Black\u2019s, Mercedes fan hub, Hetvi at 4 pm, concert at COTA','Fan hub queue vs the 3:15 pm airport run'],
 '2026-10-24':['Cook, qualifying, Post Malone, cocktails','Home lunch 1 pm, COTA 3:15 pm, nightcap 11:30 pm','About 4 hours of sleep before the 5 am alarm'],
 '2026-10-25':['Race day at Turn 3\u20134 lawn','Leave 6:15 am, race 3 pm, Powder Room 8 pm','Exit from COTA vs the 8 pm booking'],
 '2026-10-26':['Hetvi 3 am, Ambika 11 am, early Oasis','Tanmay drives, you work, Tanmay flies at 9 pm','Oasis sunset (6:50) clashes with the 9 pm flight'],
 '2026-10-27':['Back to work','Everyone is home. Write your notes on the After page','None']};
// [date,time,title,note,who,tag]
const S=(d,t,title,note,who,tag)=>({d:'2026-10-'+d,t,title,note:note||'',who:who==='all'?PID.slice():[...who].map(x=>SH[x]),tag:tag||'cota'});
const EV=[
S(22,'08:00','Chaitrali at work, Bee Cave','Until 4:30 pm.','c','work'),
S(22,'17:00','Costco gear run','Costco South Austin, 4301 W William Cannon. Chairs, ponchos, sunscreen, earplugs. Full list on Need-to-know.','c','food'),
S(22,'19:00','Dinner at home, then an early night','Tanmay\u2019s pickup is at 1:15 am.','c','food'),
S(23,'01:15','Leave for AUS to get Tanmay','Overnight pickup, about 25 min each way. Home by about 3:00 am.','c','travel'),
S(23,'02:00','Tanmay lands at AUS (flight TBC)','Landing 2:00 am Friday. Add his flight on the Crew page.','ct','tbd'),
S(23,'09:30','Late breakfast, load the car','Tanmay landed at 2 am, so no rush. Load chairs, ponchos, sunscreen and power banks so you can go from downtown straight to the airport.','ct','food'),
S(23,'10:15','Buy the five hats','About 75 minutes. Hetvi gets hers at the airport.','ct','fun'),
S(23,'11:45','BBQ at Terry Black\u2019s','1003 Barton Springs Rd. Opens at 11, so expect a line by noon. Order plates.','ct','food'),
S(23,'13:15','Mercedes F1 Fan Hub, 400 Congress Ave','Free, Oct 22\u201325. Pit-stop challenge, simulators, merch and a 2026 show car. Opening hours are not published and entry is by queue, subject to capacity. Check Mercedes\u2019 fan hub page before you go and leave by 3:00 pm.','ct','tbd'),
S(23,'15:15','Leave downtown for AUS to pick up Hetvi','Hetvi lands about 4:00 pm. About 15\u201320 min from downtown. Wait in the cell-phone lot until she texts.','ct','travel'),
S(23,'16:45','Hetvi in the car, hat handed over','Drive to COTA: 15\u201320 min clear, about 40 on a Friday evening.','cth','travel'),
S(23,'17:45','Parked, walk to the gate','Pick a lot near the Turn 1 end. Bags 12 \u00d7 12 \u00d7 20 in max.','cth','cota'),
S(23,'18:30','Inside COTA, dinner','$25\u201330 each. Find a vegetarian stand for Hetvi, then walk to Turn 3\u20134 lawn and look at it.','cth','food'),
S(23,'20:00','Maroon 5 on the Super Stage (time TBA)','Set time is not published. Expect 45\u201390 min to get out afterwards.','cth','cota'),
S(23,'23:00','Anu\u2019s late bus arrives (TBC)','Pickup plan needed: the others are at the concert. Add her bus on the Crew page.','n','tbd'),
S(23,'23:45','Leave COTA, home around midnight','','cth','travel'),
S(24,'09:00','Slow morning and breakfast','Friday ends near midnight.','cthn','food'),
S(24,'09:45','Cook-along for the home lunch','One big pot, with a separate egg dish since Hetvi and Anu do not eat eggs. Menu vote is on the Food & Texas page.','cthn','food'),
S(24,'11:30','Chaitrali leaves to pick up Ambika','Her bus arrives at noon. Stop is TBC: Eastside Bus Plaza or downtown on 9th St. Buses run late. The others finish lunch.','c','travel'),
S(24,'13:00','Home-cooked lunch for all five','The one meal Chaitrali cooks for everyone.','all','food'),
S(24,'13:45','Leave for COTA','45\u201360 min with traffic.','all','travel'),
S(24,'15:15','Inside COTA, scout Turn 3\u20134 lawn','Walk from the gate to the lawn and time it for Sunday.','all','cota'),
S(24,'16:00','Qualifying','From the Turn 3\u20134 lawn.','all','cota'),
S(24,'17:15','Dinner at COTA','$25\u201330 each.','all','food'),
S(24,'19:30','Post Malone on the Super Stage (time TBA)','Lawn opens about 90 min after track action ends. If he has not started by 9:30 pm, leave at 10:30 pm.','all','cota'),
S(24,'21:45','Head to the car','Leave at the end of the set. Exit queue is 45\u201390 min.','all','travel'),
S(24,'23:30','Cocktail night at Chaitrali\u2019s','A short nightcap, about an hour. Sunday\u2019s alarm is 5:00 am. Mix the drinks on Saturday morning so nobody makes them at midnight.','all','fun'),
S(25,'05:00','Wake up, breakfast at home','No outside food at COTA.','all','food'),
S(25,'05:45','Load the car','Chairs, hats, ponchos, sunscreen (plastic bottle), empty bottles, power banks, ID. Anu carries her own bag.','all','travel'),
S(25,'06:15','Leave Oak Hill','Plan 55\u201390 min to the lot.','all','travel'),
S(25,'07:50','At the gate','Lots open about 7:30. Gates open about 8:00 (2026 time not published).','all','cota'),
S(25,'08:15','Claim the Turn 3\u20134 lawn spot','Chairs down, blanket out. Never leave the spot empty. Send two at a time for food.','all','cota'),
S(25,'11:30','Lunch at COTA','Before 11:30 or after 1:30 to dodge the queue.','all','food'),
S(25,'14:30','Last restroom run, sunscreen','','all','cota'),
S(25,'15:00','RACE: 56 laps','','all','cota'),
S(25,'17:00','Chequered flag and trophy ceremony','Stay put 30\u201345 min. Buy a proper meal here: Powder Room serves cocktails and small plates.','all','food'),
S(25,'17:45','Walk to the car','15\u201330 min depending on the lot.','all','travel'),
S(25,'19:00','Anu leaves with her boyfriend (TBC)','He picks her up from COTA. Agree a meeting point and share locations, since he will hit the same exit traffic. She carries her bag with her.','n','tbd'),
S(25,'19:30','Out of the lot (target)','Exit takes 60\u2013120 min. Call Powder Room if you are running late.','cth','travel'),
S(25,'20:00','Cocktails at Powder Room (booked)','301 W 5th St, downtown. About 25 min from COTA, so 8:00 is tight. Ask them to hold the table until 8:45 or move it to 9:00. The driver stays sober.','cth','tbd'),
S(25,'22:30','Head home','Hetvi\u2019s alarm is 2:45 am.','cth','travel'),
S(26,'02:45','Hetvi up, Tanmay drives her at 3:00 am','Flight 5:30 am, at the airport by 3:30. Chaitrali sleeps.','th','travel'),
S(26,'07:15','Chaitrali and Tanmay leave for Bee Cave','Tanmay drops her at the office and takes the car back.','ct','travel'),
S(26,'08:00','Chaitrali at work','Until 4:30 pm.','c','work'),
S(26,'10:00','Tanmay drives Ambika to her bus','Her bus leaves Austin at 11:00 am, so arrive by 10:30. Stop TBC.','ta','tbd'),
S(26,'16:45','Leave for The Oasis on Lake Travis','6550 Comanche Trail. Tanmay picks Chaitrali up from Bee Cave at 4:15 pm.','ct','fun'),
S(26,'17:20','Arrive at The Oasis','No reservations. Get a deck table.','ct','fun'),
S(26,'18:15','Leave The Oasis for AUS','Sunset is 6:50 pm, but a 9 pm flight means leaving by about 6:15 and missing the bell. If his flight is later, stay for it. About 40 min to the airport.','ct','travel'),
S(26,'21:00','Tanmay\u2019s flight (about 9 pm, confirm)','','t','tbd'),
S(27,'08:00','Back to normal life','Write your trip notes on the After page.','c','work')
];
EV.sort((a,b)=>(a.d+a.t).localeCompare(b.d+b.t));
const TAGN={cota:'COTA',food:'Food',travel:'Travel',fun:'Fun',work:'Work',tbd:'TBC'};
const dayLabel=d=>{const x=DAYS.find(y=>y.d===d);return x?x.s+' Oct '+x.n:d};
const hm=t=>{let [h,m]=t.split(':').map(Number);const ap=h>=12?'pm':'am';h=h%12||12;return h+':'+String(m).padStart(2,'0')+' '+ap};
function nowCT(){const p={};new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).forEach(x=>p[x.type]=x.value);return p.year+'-'+p.month+'-'+p.day+' '+(p.hour==='24'?'00':p.hour)+':'+p.minute}
/* ---------- nav (one HTML file per page) ---------- */
const VIEWS=[['index','Home','Countdown, now and next'],['schedule','Schedule','Day by day, filter by person'],['crew','Crew','Flights, buses, pickups'],['info','Need-to-know','Address, phone, plate, gear list'],['cota','COTA','Map, timetable, rules'],['texas','Food & Texas','BBQ, cocktails, the home-cooked lunch'],['play','Play','Predictions, awards, bingo, playlist'],['after','After','Write how the trip went']];
const PAGE=document.body.dataset.page||'index';
$('#tabs').innerHTML=VIEWS.map(v=>`<a href="${v[0]}.html"${v[0]===PAGE?' aria-current="page"':''}>${v[1]}</a>`).join('');
$('#navgrid').innerHTML=VIEWS.slice(1).map(v=>`<a href="${v[0]}.html"><div class="card"><h3>${v[1]}</h3><p>${v[2]}</p></div></a>`).join('');
(function(){const cur=$('#tabs a[aria-current]');if(cur.scrollIntoView)try{cur.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}})();

/* ---------- home ---------- */
const LIGHTS=Date.parse('2026-10-25T20:00:00Z');
function tick(){const ms=LIGHTS-Date.now(),el=$('#count');
  if(ms<=0){el.innerHTML='<div><b>Lights out</b><span>It has begun</span></div>';return}
  const d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4);
  el.innerHTML=`<div><b>${d}</b><span>days</span></div><div><b>${h}</b><span>hours</span></div><div><b>${m}</b><span>min</span></div><div style="background:none;text-align:left;align-self:center"><span style="font-size:.78rem">until lights out,<br>Sun Oct 25, 3:00 pm</span></div>`}
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
  $('#glance').innerHTML=DAYS.map(d=>{const g=GLANCE[d.d];return `<button data-day="${d.d}"><b>${d.s} Oct ${d.n}</b><span>${g[0]}. ${g[1]}.</span><em>Tightest: ${g[2]}</em></button>`}).join('');
  $('#days').innerHTML=DAYS.map(d=>`<button class="day" data-day="${d.d}" aria-pressed="${d.d===curDay}"><b>${d.s} ${d.n}</b><small>${{'22':'Arrivals','23':'BBQ + Maroon 5','24':'Cook + Post Malone','25':'Race day','26':'Oasis sunset','27':'Fly out'}[d.n]}</small></button>`).join('');
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
 tanmay:[['in','Arrive','Fri Oct 23','2:00 am (overnight)','Flight','AUS airport. Chaitrali picks up; leave Oak Hill 1:15 am.'],['out','Depart','Mon Oct 26','About 9:00 pm (confirm)','Flight','Leave The Oasis about 6:15 pm for the airport.']],
 hetvi:[['in','Arrive','Fri Oct 23','About 4:00 pm','Flight','AUS airport. Chaitrali and Tanmay pick up.'],['out','Depart','Mon Oct 26','5:30 am','Flight','Leave the house 3:00 am, airport by 3:30. Tanmay drives.']],
 ambika:[['in','Arrive','Sat Oct 24','12:00 pm','Bus','Stop TBC: Eastside Bus Plaza or downtown 9th St.'],['out','Depart','Mon Oct 26','11:00 am','Bus','Stop TBC. Tanmay drives her; arrive by 10:30.']],
 anu:[['in','Arrive','Fri Oct 23','Late night (TBC)','Bus','Arrives during Maroon 5. Pickup plan TBC.'],['out','Depart','Sun Oct 25','About 7:00 pm','Boyfriend picks up','Meeting point at COTA TBC.']]};
let legs={},editLeg='';
function renderCrew(){
  $('#crewgrid').innerHTML=PEOPLE.map(p=>{
    if(p.id==='chaitrali')return `<div class="card person"><header>${dot(p.id)}<div><h3>${p.name}</h3><span class="small">Host</span></div></header><p class="small">Home base in Oak Hill. Drives the Mazda CX-5 on COTA days. Works 8–4:30 in Bee Cave on Thu, Mon and Tue.</p></div>`;
    return `<div class="card person"><header>${dot(p.id)}<div><h3>${p.name}</h3><span class="small">Guest</span></div></header>${LEGS[p.id].map(L=>{
      const id=p.id+'-'+L[0],sv=legs[id]||{},when=sv.time||L[3],where=sv.where||'',ref=sv.ref||'',note=sv.note||L[5];
      if(editLeg===id)return `<div class="leg" data-leg="${id}"><div class="lh"><b>${L[1]} · ${L[2]}</b></div><div class="stack" style="margin-top:6px"><div><label>${L[4]==='Flight'||L[4]==='Bus'?L[4]+' number':'Name or car'}</label><input type="text" data-k="ref" value="${esc(ref)}" placeholder="e.g. AA 1234"></div><div><label>Time</label><input type="text" data-k="time" value="${esc(sv.time||'')}" placeholder="${esc(L[3])}"></div><div><label>${L[4]==='Flight'?'Terminal or airline':'Pickup or stop'}</label><input type="text" data-k="where" value="${esc(where)}"></div><div><label>Notes</label><input type="text" data-k="note" value="${esc(sv.note||'')}" placeholder="${esc(L[5])}"></div><div class="row"><button class="btn" data-save="${id}">Save</button><button class="btn alt" data-cancel="1">Cancel</button></div></div></div>`;
      return `<div class="leg"><div class="lh"><b>${L[1]} · ${L[2]}</b><button class="chip" data-edit="${id}">Edit</button></div><div class="big">${esc(when)}</div><div class="small">${L[4]}${ref?': '+esc(ref):''}${where?' · '+esc(where):''}</div><div class="small" style="margin-top:2px">${esc(note)}</div></div>`}).join('')}</div>`}).join('');
}
document.addEventListener('click',async e=>{
  const ed=e.target.closest('[data-edit]');if(ed){editLeg=ed.dataset.edit;renderCrew();return}
  if(e.target.closest('[data-cancel]')){editLeg='';renderCrew();return}
  const sv=e.target.closest('[data-save]');if(sv){const box=sv.closest('[data-leg]'),d={};$$('input',box).forEach(i=>d[i.dataset.k]=i.value.trim());editLeg='';await Store.set('legs',sv.dataset.save,d);toast('Saved')}});
Store.watch('legs',m=>{legs=m;if(!editLeg)renderCrew()});

/* ---------- info ---------- */
const HF=[['address','Address','Add address'],['phone','Phone','Add phone'],['plate','Plate','Add plate'],['wifi','Wi-Fi','Name and password'],['note','House notes','Parking, door, shoes off, etc.']];
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
const GEAR=['5 collapsible camp chairs','5 small hand-held umbrellas','5 cheap ponchos','2 bottles of sunscreen (plastic, no aerosol)','Picnic blanket','Foam earplugs for everyone','Cooling towels','5 empty plastic bottles, 32 oz or less','2 power banks','Small cooler for the car only','Breakfast food for Sunday 5 am'];
function renderGear(){const st=lsGet('cota.gear',{});$('#gear').innerHTML=GEAR.map((g,i)=>`<label style="display:flex;gap:10px;align-items:center;margin:0;color:var(--ink);font-size:.95rem"><input type="checkbox" data-g="${i}" ${st[i]?'checked':''}> <span style="${st[i]?'text-decoration:line-through;opacity:.6':''}">${g}</span></label>`).join('')}
document.addEventListener('change',e=>{if(e.target.dataset.g!=null){const st=lsGet('cota.gear',{});st[e.target.dataset.g]=e.target.checked;lsSet('cota.gear',st);renderGear()}});

/* ---------- food & texas ---------- */
const TEX=[
 ['Fri 11:45 am','Terry Black’s BBQ','1003 Barton Springs Rd. Opens at 11, so expect a line by noon. With Tanmay.','Terry Black’s BBQ 1003 Barton Springs Rd Austin','food'],
 ['Fri 1:15 pm','Mercedes F1 Fan Hub','400 Congress Ave, downtown. Free, Oct 22\u201325. Pit-stop challenge, simulators, show car. Hours not published; entry is by queue. With Tanmay.','Mercedes F1 Fan Hub 400 Congress Ave Austin','tbd'],
 ['Sat–Sun','Turn 3–4 GA lawn','Our home on the grass for qualifying and the race.','Circuit of the Americas Turn 3','cota'],
 ['Sat 1:00 pm','Home-cooked lunch','Everyone at the table, cooked by Chaitrali and helpers.',null,'food'],
 ['Sat 11:30 pm','Cocktail night at home','Short nightcap after Post Malone. All five.',null,'fun'],
 ['Sun 8:00 pm','Powder Room','301 W 5th St, downtown. Cocktails booked for the group.','Powder Room 301 W 5th St Austin','fun'],
 ['Mon 5:20 pm','The Oasis on Lake Travis','Early dinner on the deck, 6550 Comanche Trail, before Tanmay\u2019s 9 pm flight. Sunset is 6:50, so the bell is missed unless his flight is later.','The Oasis on Lake Travis 6550 Comanche Trail Austin','fun']];
$('#texgrid').innerHTML=TEX.map(t=>`<div class="card stack"><div class="row" style="justify-content:space-between"><span class="eyebrow">${t[0]}</span><span class="tag t-${t[4]}">${TAGN[t[4]]}</span></div><h3>${t[1]}</h3><p class="small">${t[2]}</p>${t[3]?`<a class="small" href="${maps(t[3])}" target="_blank" rel="noopener">Open in Maps</a>`:''}</div>`).join('');
const MENU=['Biryani + raita','Pulao + raita','Dal, rice and sabzi','Tex-Mex night','Chaitrali decides'];
let menu={};
function renderMenu(){const cnt={};Object.values(menu).forEach(v=>cnt[v.choice]=(cnt[v.choice]||0)+1);
  $('#menuvote').innerHTML=MENU.map(m=>`<button class="chip" data-menu="${esc(m)}" aria-pressed="${ME&&menu[ME]&&menu[ME].choice===m}">${m} · ${cnt[m]||0}</button>`).join('')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-menu]');if(b){if(needMe())return;Store.set('menu',ME,{choice:b.dataset.menu})}});
Store.watch('menu',m=>{menu=m;renderMenu()});
Store.watch('host',m=>{host=Object.assign({},TRIP,nonEmpty(m.card));if(!editHost)renderHost()});

/* ---------- play ---------- */
const REVEAL=LIGHTS+2.5*36e5;
let preds={},awards={},songs={};
function renderPreds(){
  const mine=preds[ME]||{},open=Date.now()<LIGHTS;
  const rows=PEOPLE.map(p=>{const v=preds[p.id];return `<tr><td>${dot(p.id)}</td><td>${v?(Date.now()>=REVEAL||p.id===ME?`${esc(v.winner||'-')}<div class="small">Podium: ${esc(v.podium||'-')} · Safety car: ${esc(v.sc||'-')}</div>`:'<span class="pill ok">Locked in</span>'):'<span class="small">No pick yet</span>'}</td></tr>`}).join('');
  $('#preds').innerHTML=`${open?`<div class="stack"><div><label>Race winner</label><input type="text" id="pw" value="${esc(mine.winner||'')}" placeholder="Driver name"></div><div><label>Podium (three names)</label><input type="text" id="pp" value="${esc(mine.podium||'')}" placeholder="1st, 2nd, 3rd"></div><div><label>Safety car?</label><select class="f" id="ps"><option value="">Pick</option><option ${mine.sc==='Yes'?'selected':''}>Yes</option><option ${mine.sc==='No'?'selected':''}>No</option></select></div><div><button class="btn" id="psave">Lock in my picks</button></div></div>`:'<p class="small">Picks are closed. Lights out has passed.</p>'}<div class="scroll" style="margin-top:12px"><table><tbody>${rows}</tbody></table></div><p class="small" style="margin-top:6px">Everyone’s picks are revealed after the race.</p>`}
document.addEventListener('click',e=>{if(e.target.id==='psave'){if(needMe())return;Store.set('preds',ME,{winner:$('#pw').value.trim(),podium:$('#pp').value.trim(),sc:$('#ps').value});toast('Locked in')}});
Store.watch('preds',m=>{preds=m;renderPreds()});
const CATS=['Best co-pilot','Worst two-stepper','Most likely to lose the hat','Best food pick of the trip','Loudest cheerer','Trip MVP'];
function renderAwards(){
  const mine=(awards[ME]||{}).v||{};
  $('#awards').innerHTML=CATS.map((c,k)=>{const cnt={};Object.values(awards).forEach(a=>{const w=(a.v||{})[k];if(w)cnt[w]=(cnt[w]||0)+1});const mx=Math.max(1,...Object.values(cnt));
    return `<div><div class="row" style="justify-content:space-between"><b>${c}</b><select class="f" data-aw="${k}" style="width:auto"><option value="">Vote</option>${PEOPLE.map(p=>`<option value="${p.id}" ${mine[k]===p.id?'selected':''}>${p.name}</option>`).join('')}</select></div>${PID.filter(i=>cnt[i]).map(i=>`<div class="bar-row"><span>${P[i].name}</span><i style="width:${cnt[i]/mx*100}%"></i><span>${cnt[i]}</span></div>`).join('')}</div>`}).join('')}
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.aw!=null){if(needMe()){t.value='';return}const v=Object.assign({},(awards[ME]||{}).v||{});if(t.value)v[t.dataset.aw]=t.value;else delete v[t.dataset.aw];Store.set('awards',ME,{v})}});
Store.watch('awards',m=>{awards=m;renderAwards()});
const BINGO=['Cowboy hat in the wild','Someone says y’all','Truck bigger than the CX-5','Longhorn spotted','Brisket tasted','Texas flag on a building','Armadillo (a sign counts)','Lone Star beer','Queso','Boot shop','Country song on the radio','Sunburn line','Bluebonnet merch','FREE ★','Live band','Lost in the parking lot','F1 fan in a rival kit','Two-step attempted','Sunset over water','Chair breaks or pops','Someone loses the hat','Giant sign for BBQ','Earplugs rescue','Selfie with the car','Gas station snack run'];
function renderBingo(){const st=lsGet('cota.bingo',{13:true});st[13]=true;
  $('#bingo').innerHTML=BINGO.map((b,i)=>`<button data-b="${i}" class="${st[i]?'on':''}">${b}</button>`).join('');
  const L=[];for(let r=0;r<5;r++){L.push([0,1,2,3,4].map(c=>r*5+c));L.push([0,1,2,3,4].map(c=>c*5+r))}L.push([0,6,12,18,24],[4,8,12,16,20]);
  const n=L.filter(l=>l.every(i=>st[i])).length;$('#bingomsg').textContent=n?`${n} line${n>1?'s':''} done. Bingo!`:`${Object.values(st).filter(Boolean).length} of 25 spotted`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-b]');if(b){const st=lsGet('cota.bingo',{});st[b.dataset.b]=!st[b.dataset.b];lsSet('cota.bingo',st);renderBingo()}});
function renderSongs(){const ids=Object.keys(songs).sort((a,b)=>songs[a].ts-songs[b].ts);
  $('#songs').innerHTML=ids.length?ids.map(i=>`<li>${esc(songs[i].title)} <span class="small">${songs[i].by&&P[songs[i].by]?'· '+P[songs[i].by].name:''}</span></li>`).join(''):'<li class="small" style="list-style:none;margin-left:-20px">No songs yet.</li>'}
document.addEventListener('click',e=>{if(e.target.id==='songadd'){const v=$('#songin').value.trim();if(!v)return;Store.set('songs','s'+Date.now().toString(36),{title:v,by:ME,ts:Date.now()});$('#songin').value=''}});
Store.watch('songs',m=>{songs=m;renderSongs()});

/* ---------- after ---------- */
let jr={},stars=0,jdraft={};
const JF=[['best','Best moment','The one you will retell'],['funny','Funniest moment',''],['food','Favourite thing you ate',''],['change','What should we change next time?',''],['note','One line for the group','']];
function renderJournal(){
  if(!ME){$('#journalform').innerHTML='<h3>Your page</h3><p class="small" style="margin-top:6px">Pick who you are at the top right to write yours.</p>';}
  else{const mine=jr[ME]||{},cur=stars||mine.stars||0;
  $('#journalform').innerHTML=`<div class="row" style="gap:8px">${dot(ME)}<h3>${P[ME].name}’s page</h3>${mine.ts?'<span class="pill ok">Posted</span>':''}</div><div class="stack" style="margin-top:10px"><div><label>Overall</label><div class="stars" id="stars">${[1,2,3,4,5].map(n=>`<button data-star="${n}" class="${n<=cur?'on':''}" aria-label="${n} stars">★</button>`).join('')}</div></div>${JF.map(f=>`<div><label>${f[1]}</label><textarea data-j="${f[0]}" placeholder="${f[2]}">${esc(jdraft[f[0]]!=null?jdraft[f[0]]:(mine[f[0]]||''))}</textarea></div>`).join('')}<div class="row"><button class="btn" id="jsave">${mine.ts?'Update my page':'Post my page'}</button><button class="btn alt" id="jcopy">Copy for the group chat</button></div></div>`}
  const done=PID.filter(i=>jr[i]&&jr[i].ts).length,unlocked=!!(ME&&jr[ME]&&jr[ME].ts)||done===5;
  $('#wallcount').textContent=done+' of 5 posted';
  $('#wall').innerHTML=PEOPLE.map(p=>{const j=jr[p.id];if(!j||!j.ts)return `<div class="card plain"><div class="row" style="gap:8px">${dot(p.id)}<b>${p.name}</b></div><p class="small" style="margin-top:6px">Has not written yet.</p></div>`;
    const body=`<div style="color:var(--gold);font-size:1.2rem">${'★'.repeat(j.stars||0)}<span style="color:var(--line)">${'★'.repeat(5-(j.stars||0))}</span></div>`+JF.filter(f=>j[f[0]]).map(f=>`<p style="margin-top:6px"><span class="small">${f[1]}</span><br>${esc(j[f[0]])}</p>`).join('');
    return `<div class="card"><div class="row" style="gap:8px">${dot(p.id)}<b>${p.name}</b></div><div class="${unlocked||p.id===ME?'':'blur'}" style="margin-top:6px">${body}</div>${unlocked||p.id===ME?'':'<p class="small" style="margin-top:6px">Post yours to unlock.</p>'}</div>`}).join('')}
document.addEventListener('input',e=>{if(e.target.dataset.j)jdraft[e.target.dataset.j]=e.target.value});
document.addEventListener('click',async e=>{
  const s=e.target.closest('[data-star]');if(s){stars=+s.dataset.star;renderJournal();return}
  if(e.target.id==='jsave'){if(needMe())return;const d={stars:stars||(jr[ME]||{}).stars||0,ts:Date.now()};JF.forEach(f=>{const el=$(`[data-j="${f[0]}"]`);d[f[0]]=el?el.value.trim():''});await Store.set('journal',ME,d);try{const fd=new URLSearchParams({'form-name':'journal',person:P[ME].name,stars:d.stars});JF.forEach(f=>fd.set(f[0],d[f[0]]));fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:fd.toString()}).catch(()=>{})}catch(e){}jdraft={};stars=0;toast('Posted')}
  if(e.target.id==='jcopy'&&ME){const m=jr[ME]||{};const d={};JF.forEach(f=>{const el=$(`[data-j="${f[0]}"]`);d[f[0]]=el?el.value.trim():(m[f[0]]||'')});const st=stars||m.stars||0;copy(`${P[ME].name}'s Texas F1 trip\n${'★'.repeat(st)}${'☆'.repeat(5-st)}\n`+JF.filter(f=>d[f[0]]).map(f=>f[1]+': '+d[f[0]]).join('\n'))}});
Store.watch('journal',m=>{jr=m;renderJournal()});

/* ---------- boot ---------- */
function rerenderAll(){renderSchedule();renderMenu();renderPreds();renderAwards();renderJournal()}
renderSchedule();renderCrew();renderHost();renderGear();renderBingo();nowNext();openItems();tick();
setInterval(()=>{tick();nowNext()},30000);
})();
