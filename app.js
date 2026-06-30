const moodVraag={tekst:"Hoe is je stemming op dit moment?",opties:[
  {label:"Heel slecht",score:1,emoji:"😞"},
  {label:"Slecht",score:2,emoji:"🙁"},
  {label:"Neutraal",score:3,emoji:"😐"},
  {label:"Goed",score:4,emoji:"🙂"},
  {label:"Heel goed",score:5,emoji:"😄"}
]};
const stemmingLabels=["Heel slecht","Slecht","Neutraal","Goed","Heel goed"];
const vragen=[
  {tekst:"Hoe gespannen voel je je op dit moment?",opties:[{label:"Geen spanning",score:0},{label:"Licht gespannen",score:1},{label:"Behoorlijk gespannen",score:2},{label:"Heel gespannen",score:3},{label:"Ondraaglijk gespannen",score:4}]},
  {tekst:"Heb je controle over je gedachten?",opties:[{label:"Ja, volledig",score:0},{label:"Ja, redelijk goed",score:1},{label:"Een beetje moeilijk",score:2},{label:"Nauwelijks",score:3},{label:"Nee, helemaal niet",score:4}]},
  {tekst:"Heb je gedachten aan jezelf iets aandoen?",opties:[{label:"Nee",score:0},{label:"Lichte gedachten, geen plannen",score:1},{label:"Sterke gedachten",score:2},{label:"Ik heb een plan of sterke drang",score:3}]}
];
const oefeningen=[
  {titel:"4-7-8 Ademhaling",duur:"3 min",interactief:"ademhaling",icon:'<path d="M12 2c-2 4-2 6 0 8s2 4 0 8M8 6c-1 3-1 5 0 7M16 6c1 3 1 5 0 7"/>',stappen:["Ga comfortabel zitten en sluit je ogen","Adem in via je neus — tel langzaam tot 4","Houd je adem vast — tel tot 7","Adem langzaam uit via je mond — tel tot 8","Herhaal dit nog 3 keer. Goed gedaan."]},
  {titel:"5-4-3-2-1 Grounding",duur:"5 min",interactief:"grounding",icon:'<path d="M12 22s-7-4.5-7-10a7 7 0 0114 0c0 5.5-7 10-7 10z"/><circle cx="12" cy="11" r="2.5"/>',stappen:["Kijk om je heen. Noem 5 dingen die je kunt zien","Noem 4 dingen die je fysiek kunt voelen","Luister. Noem 3 dingen die je kunt horen","Noem 2 dingen die je kunt ruiken","Noem 1 ding dat je kunt proeven. Je bent hier, je bent veilig."]},
  {titel:"Koude water techniek",duur:"1 min",interactief:"timer",timerDuur:60,icon:'<path d="M12 2v6M9 5l3-3 3 3"/><path d="M5 14c0 4 3 7 7 7s7-3 7-7c0-3-3-6-7-12-4 6-7 9-7 12z"/>',stappen:["Ga naar de kraan of pak een ijsblokje","Houd je polsen onder koud stromend water","Focus volledig op het koude gevoel in je handen","Adem rustig door. Je lichaam kalmeert vanzelf."]},
  {titel:"Veilige plek visualisatie",duur:"5 min",autoAdvance:7,icon:'<path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/><path d="M9 20v-6h6v6"/>',stappen:["Sluit je ogen en adem een paar keer rustig in en uit","Stel je een plek voor waar je je volkomen veilig voelt","Kijk goed rond. Wat zie je? Wat hoor je? Wat ruik je?","Voel hoe je lichaam ontspant terwijl je hier bent","Blijf hier zo lang als je wilt. Je kunt hier altijd naartoe."]}
];
const STORAGE_PREFIX='mijnAnker_';
function saveData(key,value){
  try{localStorage.setItem(STORAGE_PREFIX+key,JSON.stringify(value));}catch(e){console.warn('Opslaan mislukt:',key,e);}
}
function loadData(key,fallback){
  try{
    const raw=localStorage.getItem(STORAGE_PREFIX+key);
    return raw!==null?JSON.parse(raw):fallback;
  }catch(e){console.warn('Laden mislukt:',key,e);return fallback;}
}

let planNextId=100;
function withIds(arr){return arr.map(function(tekst){return {id:planNextId++,tekst:tekst};});}
const defaultPlan={
  signalen:[],
  triggers:[],
  helpend:[],
  contacten:[]
};
let plan=loadData('plan',defaultPlan);
function recalcNextIds(){
  let maxPlanId=99;
  ['signalen','triggers','helpend'].forEach(function(key){
    (plan[key]||[]).forEach(function(item){if(item.id>maxPlanId)maxPlanId=item.id;});
  });
  planNextId=maxPlanId+1;
  let maxContactId=0;
  (plan.contacten||[]).forEach(function(c){if(c.id>maxContactId)maxContactId=c.id;});
  contactNextId=maxContactId+1;
}
let contactNextId=4;
recalcNextIds();
const defaultMedicatie=[];
let medicatie=loadData('medicatie',defaultMedicatie);
let medNextId=(function(){let max=0;medicatie.forEach(function(m){if(m.id>max)max=m.id;});return max+1;})();
function todayKey(){return new Date().toISOString().slice(0,10);}
let medChecked=loadData('medChecked_'+todayKey(),{});
let medTab='vandaag';

let stemmingen=loadData('stemmingen',[]);
let stemmingNextId=(function(){let max=0;stemmingen.forEach(function(s){if(s.id>max)max=s.id;});return max+1;})();
function saveStemming(score){
  const nu=new Date();
  stemmingen.push({id:stemmingNextId++,datum:nu.toISOString(),score:score});
  saveData('stemmingen',stemmingen);
  try{renderHomeMoodTile();}catch(e){console.warn('Kon stemmingstegel niet bijwerken:',e);}
}

function selectOS(os){
  document.getElementById('os-iphone').classList.toggle('active',os==='iphone');
  document.getElementById('os-android').classList.toggle('active',os==='android');
  document.getElementById('steps-iphone').style.display=os==='iphone'?'flex':'none';
  document.getElementById('steps-android').style.display=os==='android'?'flex':'none';
}
function enterApp(){
  saveData('seenInstall',true);
  document.getElementById('install-screen').classList.remove('active');
  document.getElementById('naam-modal').classList.add('active');
}
function saveNaamAndContinue(){
  const naam=document.getElementById('naam-input-modal').value.trim();
  if(!naam){alert('Vul alsjeblieft je naam in');return;}
  const checkbox=document.getElementById('consent-checkbox');
  if(checkbox&&!checkbox.checked){alert('Vink het akkoordvakje aan om door te gaan.');return;}
  saveData('username',naam);
  saveData('consentGiven',true);
  document.getElementById('naam-modal').classList.remove('active');
  document.getElementById('home-greeting').textContent='Welkom terug, '+naam;
  openPinSetup();
}

let screenHistory=['home'];
let screenScrollPositions={};
function goTo(screen, fromBack){
  const huidigeActief=document.querySelector('.screen.active');
  if(huidigeActief && huidigeActief.id==='screen-ademhaling' && screen!=='ademhaling' && typeof clearAdemTimers==='function'){
    clearAdemTimers();
  }
  if(huidigeActief && huidigeActief.id==='screen-koudwater-timer' && screen!=='koudwater-timer' && tmInterval){
    clearInterval(tmInterval);tmInterval=null;
  }
  if(huidigeActief && huidigeActief.id==='screen-oefening-detail' && screen!=='oefening-detail' && typeof clearStepAutoTimer==='function'){
    clearStepAutoTimer();
  }
  if(!fromBack){
    const current=document.querySelector('.screen.active');
    const currentId=current?current.id.replace('screen-',''):null;
    if(currentId && currentId!==screen){
      screenScrollPositions[currentId]=window.scrollY;
      screenHistory.push(screen);
    }
  }
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  document.getElementById('screen-'+screen).classList.add('active');
  const savedScroll=screenScrollPositions[screen];
  if(savedScroll!==undefined && fromBack){
    setTimeout(function(){window.scrollTo(0,savedScroll);},0);
  } else {
    window.scrollTo(0,0);
  }
  if(screen==='checkin')initCheckin();
  if(screen==='oefeningen')renderOefeningen();
  if(screen==='plan')renderPlan();
  if(screen==='privacybeleid'){/* statische pagina, geen render nodig */}
  if(screen==='acuut')renderAcuut();
  if(screen==='dagboek')renderDagboek();
  if(screen==='weekplanning')renderWeek();
  if(screen==='medicatie')renderMedicatie();
  if(screen==='goedmoment')renderGoedMomenten();
  if(screen==='stemmingmeter')renderStemmingMeter();
  if(screen==='weekoverzicht'){ weekOvzOffset=0; renderWeekOvz(); }
  if(screen==='instellingen'){ renderPinSettings(); renderNaamSettings(); renderDarkModeSettings(); renderSimpleModeSettings(); renderReminderSettings(); }
  if(screen==='home')renderHomeMoodTile();
}
function goBack(){
  screenHistory.pop();
  const previous=screenHistory.length ? screenHistory[screenHistory.length-1] : 'home';
  goTo(previous, true);
}

let ciIndex=0, ciScores=[];
function initCheckin(){ciIndex=0;ciScores=[];renderQuestion();}
function renderQuestion(){
  const totalSteps=vragen.length+1;
  document.getElementById('ci-progress').innerHTML=Array.from({length:totalSteps},function(_,i){return '<div class="dot '+(i<=ciIndex?'active':'')+'"></div>';}).join('');
  if(ciIndex===0){
    document.getElementById('ci-question').textContent=moodVraag.tekst;
    document.getElementById('ci-options').innerHTML=moodVraag.opties.map(function(o){return '<button class="opt-btn" onclick="answerCheckin('+o.score+')">'+o.emoji+'&nbsp;&nbsp;'+o.label+'</button>';}).join('');
    return;
  }
  const q=vragen[ciIndex-1];
  document.getElementById('ci-question').textContent=q.tekst;
  document.getElementById('ci-options').innerHTML=q.opties.map(function(o){return '<button class="opt-btn" onclick="answerCheckin('+o.score+')">'+o.label+'</button>';}).join('');
}
function answerCheckin(score){
  if(ciIndex===0){
    saveStemming(score);
    ciIndex++;
    renderQuestion();
    return;
  }
  ciScores.push(score);
  if(ciIndex<vragen.length){ciIndex++;renderQuestion();}else{showResult();}
}
function showResult(){
  const total=ciScores.reduce(function(a,b){return a+b;},0);
  const zelfbeschadigingScore=ciScores[2]||0;
  let r;
  if(zelfbeschadigingScore>=2 || total>=10){
    r={fase:"Crisissituatie",kleur:"#B0432E",tekst:"Dit is een zware crisissituatie. Neem direct contact op met je behandelaar of bel 113.",acuut:true};
  } else if(total<=1){
    r={fase:"Rustig",kleur:"#3A6249",tekst:"Je voelt op dit moment geen sterke spanning. Fijn dat het rustig aanvoelt — blijf goed voor jezelf zorgen.",acuut:false};
  } else if(total<=5){
    r={fase:"Gespannen",kleur:"#C9971F",tekst:"Je voelt spanning, maar je hebt nog grip. Probeer een oefening of kijk naar je plan.",acuut:false};
  } else {
    r={fase:"Hoge spanning",kleur:"#C46C4A",tekst:"De spanning loopt op. Gebruik je signaleringsplan en overweeg contact op te nemen.",acuut:false};
  }
  document.getElementById('result-icon').innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="'+r.kleur+'" stroke-width="1.6" width="46" height="46"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>';
  const faseEl=document.getElementById('result-fase');
  faseEl.textContent=r.fase; faseEl.style.color=r.kleur;
  document.getElementById('result-tekst').textContent=r.tekst;
  document.getElementById('result-acties').innerHTML = r.acuut
    ? '<button class="actie-btn warm" onclick="goTo(\'acuut\')">Je bent niet alleen</button>'
    : '<button class="actie-btn primary" onclick="goTo(\'oefeningen\')">Oefening doen</button><button class="actie-btn" style="background:var(--moss);color:var(--green-deep)" onclick="goTo(\'plan\')">Mijn plan bekijken</button>';
  goTo('result');
}

let activeOef=null, activeStep=0;
function renderOefeningen(){
  document.getElementById('oef-list').innerHTML = oefeningen.map(function(o,i){
    return '<button class="oef-card" onclick="startOefening('+i+')"><svg class="oef-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">'+o.icon+'</svg><div><div class="oef-titel">'+o.titel+'</div><div class="oef-duur">'+o.duur+'</div></div><svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6"/></svg></button>';
  }).join('');
}
function startOefening(i){
  activeOef=oefeningen[i]; activeStep=0;
  if(activeOef.interactief==='ademhaling'){
    resetAdemUI();
    goTo('ademhaling');
    return;
  }
  if(activeOef.interactief==='grounding'){
    resetGroundingUI();
    goTo('grounding');
    return;
  }
  if(activeOef.interactief==='timer'){
    resetTimerUI();
    goTo('koudwater-timer');
    return;
  }
  document.getElementById('oef-detail-title').textContent=activeOef.titel;
  stepPaused=false;
  renderStep();
  goTo('oefening-detail');
}
let stepAutoTimer=null, stepPaused=false;
function clearStepAutoTimer(){
  if(stepAutoTimer){clearTimeout(stepAutoTimer);stepAutoTimer=null;}
}
function renderStep(){
  clearStepAutoTimer();
  const isLast=activeStep>=activeOef.stappen.length-1;
  document.getElementById('step-num').textContent='Stap '+(activeStep+1)+' van '+activeOef.stappen.length;
  document.getElementById('step-tekst').textContent=activeOef.stappen[activeStep];

  const autopaceEl=document.getElementById('step-autopace');
  const pauseWrap=document.getElementById('step-pause-wrap');
  if(activeOef.autoAdvance){
    autopaceEl.style.display='flex';
    autopaceEl.innerHTML=activeOef.stappen.map(function(_,i){return '<div class="step-autopace-dot'+(i<=activeStep?' done':'')+'"></div>';}).join('');
  } else {
    autopaceEl.style.display='none';
    autopaceEl.innerHTML='';
  }

  let html='';
  if(activeStep>0) html+='<button class="nav-btn" onclick="prevStep()">Terug</button>';
  if(!isLast) html+='<button class="nav-btn primary" onclick="nextStep()">Volgende</button>';
  else html+='<button class="nav-btn primary" onclick="goTo(\'oefeningen\')">Klaar</button>';
  document.getElementById('step-btns').innerHTML=html;

  if(activeOef.autoAdvance && !isLast){
    pauseWrap.innerHTML='<button class="step-pause-btn" onclick="toggleStepPause()">'+(stepPaused?'Hervatten':'Pauzeren')+'</button>';
    if(!stepPaused){
      stepAutoTimer=setTimeout(function(){nextStep();},activeOef.autoAdvance*1000);
    }
  } else {
    pauseWrap.innerHTML='';
  }
}
function nextStep(){activeStep++;renderStep();}
function prevStep(){activeStep--;renderStep();}
function toggleStepPause(){
  stepPaused=!stepPaused;
  renderStep();
}

/* ===== Interactieve ademhalingsoefening (4-7-8) ===== */
let ademTimers=[];
let ademCycleCount=0;
const ADEM_TOTAAL_CYCLI=4;

function clearAdemTimers(){
  ademTimers.forEach(function(t){clearTimeout(t);clearInterval(t);});
  ademTimers=[];
}
function resetAdemUI(){
  clearAdemTimers();
  ademCycleCount=0;
  const intro=document.getElementById('adem-intro');
  const actief=document.getElementById('adem-actief');
  const klaar=document.getElementById('adem-klaar');
  if(!intro)return;
  intro.style.display='block';
  actief.style.display='none';
  klaar.style.display='none';
  const circle=document.getElementById('adem-circle');
  circle.style.transitionDuration='0.6s';
  circle.style.transform='scale(1)';
}
function startAdemhalingCyclus(){
  document.getElementById('adem-intro').style.display='none';
  document.getElementById('adem-klaar').style.display='none';
  document.getElementById('adem-actief').style.display='block';
  ademCycleCount=0;
  runAdemCyclus();
}
function runAdemCyclus(){
  if(ademCycleCount>=ADEM_TOTAAL_CYCLI){
    afgerondAdemhaling();
    return;
  }
  ademCycleCount++;
  document.getElementById('adem-cyclus-label').textContent='Cyclus '+ademCycleCount+' van '+ADEM_TOTAAL_CYCLI;
  ademFase('in',4,function(){
    ademFase('hold',7,function(){
      ademFase('out',8,function(){
        runAdemCyclus();
      });
    });
  });
}
function ademFase(type,duur,callback){
  const circle=document.getElementById('adem-circle');
  const label=document.getElementById('adem-fase-label');
  const countEl=document.getElementById('adem-count');
  if(type==='in'){
    label.textContent='Adem in';
    circle.style.transitionDuration=duur+'s';
    circle.style.transform='scale(1.55)';
  } else if(type==='hold'){
    label.textContent='Houd vast';
    circle.style.transitionDuration='0.4s';
  } else {
    label.textContent='Adem uit';
    circle.style.transitionDuration=duur+'s';
    circle.style.transform='scale(1)';
  }
  let remaining=duur;
  countEl.textContent=remaining;
  const interval=setInterval(function(){
    remaining--;
    if(remaining>0){countEl.textContent=remaining;}
  },1000);
  ademTimers.push(interval);
  const timeout=setTimeout(function(){
    clearInterval(interval);
    callback();
  },duur*1000);
  ademTimers.push(timeout);
}
function afgerondAdemhaling(){
  clearAdemTimers();
  document.getElementById('adem-actief').style.display='none';
  document.getElementById('adem-klaar').style.display='block';
}
function stopAdemhaling(){
  resetAdemUI();
  goTo('oefeningen');
}

/* ===== Interactieve grounding-oefening (5-4-3-2-1) ===== */
const groundingZintuigen=[
  {label:'Zien',count:5,instructie:'Kijk om je heen.',sub:'Tik bij elk ding dat je ziet.',icon:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'},
  {label:'Voelen',count:4,instructie:'Voel om je heen.',sub:'Tik bij elk ding dat je fysiek voelt.',icon:'<path d="M9 12V5a1.5 1.5 0 013 0v6M12 11V4a1.5 1.5 0 013 0v7M15 11.5V6a1.5 1.5 0 013 0v9c0 3.5-2 7-7 7s-6.5-2.5-7.5-4.5L2 13a1.5 1.5 0 012.5-1.7L6 13.5V8a1.5 1.5 0 013 0v4"/>'},
  {label:'Horen',count:3,instructie:'Luister goed.',sub:'Tik bij elk geluid dat je hoort.',icon:'<path d="M9 18V6l8-3v15"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="14.5" cy="15" r="2.5"/>'},
  {label:'Ruiken',count:2,instructie:'Ruik om je heen.',sub:'Tik bij elke geur die je opmerkt.',icon:'<path d="M3 13c0 5 4 8 9 8s9-3 9-8M3 13c0-5 4-9 9-9M3 13h18M12 4c2 2 2 4 0 6"/>'},
  {label:'Proeven',count:1,instructie:'Wat proef je nu?',sub:'Tik wanneer je het hebt benoemd.',icon:'<path d="M4 11c0 5 3.5 9 8 9s8-4 8-9"/><path d="M4 11a8 8 0 0116 0"/><path d="M9 11c0-2 1-3 3-3s3 1 3 3"/>'}
];
let grIndex=0, grRemaining=0;
function resetGroundingUI(){
  grIndex=0;
  document.getElementById('gr-actief').style.display='flex';
  document.getElementById('gr-klaar').style.display='none';
  renderGrSense();
}
function renderGrSense(){
  const z=groundingZintuigen[grIndex];
  grRemaining=z.count;
  document.getElementById('gr-sense-icon').innerHTML=z.icon;
  document.getElementById('gr-instructie').textContent=z.instructie;
  document.getElementById('gr-sub').textContent=z.sub;
  document.getElementById('gr-dots').innerHTML=Array.from({length:z.count},function(){return '<div class="gr-dot"></div>';}).join('');
  document.getElementById('gr-remaining').textContent='Nog '+z.count+' te gaan';
}
function grTik(){
  if(grRemaining<=0)return;
  const z=groundingZintuigen[grIndex];
  const dots=document.querySelectorAll('#gr-dots .gr-dot');
  const filledCount=z.count-grRemaining;
  if(dots[filledCount])dots[filledCount].classList.add('filled');
  grRemaining--;
  if(grRemaining>0){
    document.getElementById('gr-remaining').textContent='Nog '+grRemaining+' te gaan';
  } else {
    document.getElementById('gr-remaining').textContent='Goed zo';
    setTimeout(function(){
      grIndex++;
      if(grIndex>=groundingZintuigen.length){
        document.getElementById('gr-actief').style.display='none';
        document.getElementById('gr-klaar').style.display='flex';
      } else {
        renderGrSense();
      }
    },550);
  }
}

/* ===== Koude water techniek: visuele aftimer ===== */
let tmRemaining=60, tmInterval=null;
const TM_OMTREK=502.65;
function resetTimerUI(){
  if(tmInterval){clearInterval(tmInterval);tmInterval=null;}
  tmRemaining=(activeOef&&activeOef.timerDuur)?activeOef.timerDuur:60;
  document.getElementById('tm-intro').style.display='flex';
  document.getElementById('tm-actief').style.display='none';
  document.getElementById('tm-klaar').style.display='none';
  document.getElementById('tm-ring-fg').style.strokeDashoffset='0';
  updateTimerDisplay();
}
function updateTimerDisplay(){
  const totaal=(activeOef&&activeOef.timerDuur)?activeOef.timerDuur:60;
  const min=Math.floor(tmRemaining/60);
  const sec=tmRemaining%60;
  document.getElementById('tm-count').textContent=min+':'+String(sec).padStart(2,'0');
  const fractie=1-(tmRemaining/totaal);
  document.getElementById('tm-ring-fg').style.strokeDashoffset=(TM_OMTREK*fractie).toFixed(1);
}
function startTimerOefening(){
  document.getElementById('tm-intro').style.display='none';
  document.getElementById('tm-klaar').style.display='none';
  document.getElementById('tm-actief').style.display='flex';
  tmRemaining=(activeOef&&activeOef.timerDuur)?activeOef.timerDuur:60;
  updateTimerDisplay();
  tmInterval=setInterval(function(){
    tmRemaining--;
    updateTimerDisplay();
    if(tmRemaining<=0){
      clearInterval(tmInterval);tmInterval=null;
      document.getElementById('tm-actief').style.display='none';
      document.getElementById('tm-klaar').style.display='flex';
    }
  },1000);
}
function stopTimerOefening(){
  resetTimerUI();
  goTo('oefeningen');
}

function renderPlanList(key, containerId){
  const items=plan[key];
  if(items.length===0){
    document.getElementById(containerId).innerHTML='<div class="empty-state">Nog niets toegevoegd</div>';
    return;
  }
  document.getElementById(containerId).innerHTML=items.map(function(item){
    return '<div class="plan-item-row"><div class="plan-item">· '+item.tekst+'</div><button class="item-delete-btn" onclick="deletePlanItem(\''+key+'\','+item.id+')" aria-label="Verwijder">×</button></div>';
  }).join('');
}
function renderPlan(){
  saveData('plan',plan);
  renderPlanList('signalen','plan-signalen');
  renderPlanList('triggers','plan-triggers');
  renderPlanList('helpend','plan-helpend');
  if(plan.contacten.length===0){
    document.getElementById('plan-contacten').innerHTML='<div class="empty-state">Nog geen contacten toegevoegd</div>';
  } else {
    document.getElementById('plan-contacten').innerHTML=plan.contacten.map(function(c){
      return '<div class="contact-row"><span class="contact-name">'+c.naam+'</span><div style="display:flex;align-items:center;gap:8px"><a class="tel-btn" href="tel:'+c.tel+'">'+c.tel+'</a><button class="item-delete-btn" onclick="deletePlanContact('+c.id+')" aria-label="Contact verwijderen">×</button></div></div>';
    }).join('');
  }
}
function addPlanItem(key){
  const input=document.getElementById('plan-'+key+'-input');
  const tekst=input.value.trim();
  if(!tekst){alert('Vul een tekst in');return;}
  plan[key].push({id:planNextId++,tekst:tekst});
  input.value='';
  renderPlan();
}
function deletePlanItem(key,id){
  plan[key]=plan[key].filter(function(item){return item.id!==id;});
  renderPlan();
}
function addPlanContact(){
  const naam=document.getElementById('plan-contact-naam-input').value.trim();
  const tel=document.getElementById('plan-contact-tel-input').value.trim();
  if(!naam||!tel){alert('Vul naam en telefoonnummer in');return;}
  plan.contacten.push({id:contactNextId++,naam:naam,tel:tel});
  document.getElementById('plan-contact-naam-input').value='';
  document.getElementById('plan-contact-tel-input').value='';
  renderPlan();
}
function deletePlanContact(id){
  plan.contacten=plan.contacten.filter(function(c){return c.id!==id;});
  renderPlan();
}
function renderAcuut(){
  document.getElementById('acuut-contacten').innerHTML=plan.contacten.map(function(c){
    const isCrisis=c.tel.indexOf('113')>-1;
    return '<a href="tel:'+c.tel+'" class="acuut-contact '+(isCrisis?'crisis':'')+'"><div><div class="name">'+c.naam+'</div><div class="num">'+c.tel+'</div></div><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="'+(isCrisis?'var(--warm)':'var(--green)')+'" stroke-width="2"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .3 2 .6 2.9a2 2 0 01-.5 2.1L8 10a16 16 0 006 6l1.3-1.2a2 2 0 012.1-.5c.9.3 1.9.5 2.9.6a2 2 0 011.7 2z"/></svg></a>';
  }).join('');
  document.getElementById('acuut-leeg-hint').style.display = plan.contacten.length===0 ? 'block' : 'none';
}

let selectedMood=null;
const moodOptions=[{e:'😊',l:'Goed'},{e:'😐',l:'Oké'},{e:'😟',l:'Moeilijk'},{e:'😰',l:'Zwaar'}];
const defaultDagboekEntries=[];
let dagboekEntries=loadData('dagboekEntries',defaultDagboekEntries);
let dagboekNextId=(function(){let max=0;dagboekEntries.forEach(function(e){if(e.id>max)max=e.id;});return max+1;})();
let editingEntryId=null;
function renderDagboek(){
  document.getElementById('mood-row').innerHTML=moodOptions.map(function(m){
    return '<button class="mood-btn '+(selectedMood===m.e?'selected':'')+'" onclick="selectMood(\''+m.e+'\')">'+m.e+'<span>'+m.l+'</span></button>';
  }).join('');
  document.getElementById('dagboek-save-label').textContent = editingEntryId!==null ? 'Wijziging opslaan' : 'Opslaan';
  document.getElementById('dagboek-cancel-btn').style.display = editingEntryId!==null ? 'block' : 'none';
  renderDagboekList();
}
function selectMood(e){selectedMood=e;renderDagboek();}
function saveDagboekEntry(){
  if(!selectedMood){alert('Kies eerst een stemming');return;}
  const tekst=document.getElementById('dagboek-tekst').value.trim();
  if(editingEntryId!==null){
    const entry=dagboekEntries.find(function(e){return e.id===editingEntryId;});
    entry.mood=selectedMood;
    entry.tekst=tekst;
    editingEntryId=null;
  } else {
    const nu=new Date();
    const datumStr=nu.getDate()+' '+maandenLang[nu.getMonth()]+', '+String(nu.getHours()).padStart(2,'0')+':'+String(nu.getMinutes()).padStart(2,'0');
    dagboekEntries.unshift({id:dagboekNextId++,datum:datumStr,mood:selectedMood,tekst:tekst});
  }
  document.getElementById('dagboek-tekst').value='';
  selectedMood=null;
  switchDagTab('lijst');
}
function cancelDagboekEdit(){
  editingEntryId=null;
  selectedMood=null;
  document.getElementById('dagboek-tekst').value='';
  renderDagboek();
}
function editDagboekEntry(id){
  const entry=dagboekEntries.find(function(e){return e.id===id;});
  if(!entry)return;
  editingEntryId=id;
  selectedMood=entry.mood;
  document.getElementById('dagboek-tekst').value=entry.tekst;
  switchDagTab('invoer');
}
function deleteDagboekEntry(id){
  dagboekEntries=dagboekEntries.filter(function(e){return e.id!==id;});
  renderDagboekList();
}
function switchDagTab(tab){
  document.getElementById('dag-tab-invoer').classList.toggle('active',tab==='invoer');
  document.getElementById('dag-tab-lijst').classList.toggle('active',tab==='lijst');
  document.getElementById('dag-invoer').style.display=tab==='invoer'?'block':'none';
  document.getElementById('dag-lijst').style.display=tab==='lijst'?'block':'none';
  renderDagboek();
}
function renderDagboekList(){
  saveData('dagboekEntries',dagboekEntries);
  if(dagboekEntries.length===0){
    document.getElementById('dag-lijst').innerHTML='<div class="empty-state">Nog geen aantekeningen. Schrijf je eerste invoer via "Invoer".</div>';
    return;
  }
  document.getElementById('dag-lijst').innerHTML=dagboekEntries.map(function(e){
    return '<div class="entry"><div class="entry-header"><span class="entry-date">'+e.datum+'</span><span class="entry-mood">'+e.mood+'</span></div><div class="entry-text">'+(e.tekst||'<em style="color:var(--ink-soft)">Geen toelichting</em>')+'</div><div class="entry-actions"><button class="entry-action-btn" onclick="editDagboekEntry('+e.id+')">Bewerken</button><button class="entry-action-btn delete" onclick="deleteDagboekEntry('+e.id+')">Verwijderen</button></div></div>';
  }).join('');
}

const weekdagenLang=['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
const maandenLang=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
function formatAfspraakDatum(datumStr){
  if(!datumStr) return 'Geen datum';
  const d=new Date(datumStr+'T00:00:00');
  if(isNaN(d.getTime())) return datumStr;
  return weekdagenLang[d.getDay()].slice(0,2)+' '+d.getDate()+' '+maandenLang[d.getMonth()];
}
const defaultAfspraken=[];
let afspraken=loadData('afspraken',defaultAfspraken);
let afspraakNextId=(function(){let max=0;afspraken.forEach(function(a){if(a.id>max)max=a.id;});return max+1;})();
let agSelectedDatum='';
let agSelectedTijd='';
function saveAfspraak(){
  const titel=document.getElementById('ag-titel').value.trim();
  if(!titel){alert('Vul een omschrijving in');return;}
  if(!agSelectedDatum){alert('Kies een datum');return;}
  afspraken.push({id:afspraakNextId++,titel:titel,datum:agSelectedDatum,tijd:agSelectedTijd||'--:--'});
  afspraken.sort(function(a,b){return (a.datum||'').localeCompare(b.datum||'');});
  document.getElementById('ag-titel').value='';
  agSelectedDatum='';
  agSelectedTijd='';
  document.getElementById('ag-datum-label').textContent='Kies een datum';
  document.getElementById('ag-datum-label').classList.remove('filled');
  document.getElementById('ag-tijd-label').textContent='Tijd';
  document.getElementById('ag-tijd-label').classList.remove('filled');
  renderAgenda();
}
function deleteAfspraak(id){
  afspraken=afspraken.filter(function(a){return a.id!==id;});
  renderAgenda();
}
function renderAgenda(){
  saveData('afspraken',afspraken);
  if(afspraken.length===0){
    document.getElementById('agenda-lijst').innerHTML='<div class="empty-state">Nog geen afspraken gepland.</div>';
    return;
  }
  document.getElementById('agenda-lijst').innerHTML=afspraken.map(function(a){
    return '<div class="afspraak-card"><div class="afspraak-titel">'+a.titel+'</div><div class="afspraak-tijd">'+formatAfspraakDatum(a.datum)+' · '+a.tijd+'</div><button class="entry-action-btn delete" style="margin-top:10px;width:100%" onclick="deleteAfspraak('+a.id+')">Verwijderen</button></div>';
  }).join('');
}
renderAgenda();

/* ===== Custom datum- & tijdkiezer ===== */
let calViewYear, calViewMonth;
function openDatePicker(){
  const base=agSelectedDatum?new Date(agSelectedDatum+'T00:00:00'):new Date();
  calViewYear=base.getFullYear();
  calViewMonth=base.getMonth();
  renderCalendar();
  document.getElementById('date-sheet').classList.add('active');
}
function closeDatePicker(){
  document.getElementById('date-sheet').classList.remove('active');
}
function calPrevMonth(){
  calViewMonth--; if(calViewMonth<0){calViewMonth=11;calViewYear--;}
  renderCalendar();
}
function calNextMonth(){
  calViewMonth++; if(calViewMonth>11){calViewMonth=0;calViewYear++;}
  renderCalendar();
}
function renderCalendar(){
  const naam=maandenLang[calViewMonth];
  document.getElementById('cal-title').textContent=naam.charAt(0).toUpperCase()+naam.slice(1)+' '+calViewYear;
  const firstDay=new Date(calViewYear,calViewMonth,1);
  const startWeekday=(firstDay.getDay()+6)%7;
  const daysInMonth=new Date(calViewYear,calViewMonth+1,0).getDate();
  const daysInPrevMonth=new Date(calViewYear,calViewMonth,0).getDate();
  const todayKey=dateToKey(new Date());
  let html='';
  for(let i=startWeekday-1;i>=0;i--){
    html+='<button class="cal-day other-month">'+(daysInPrevMonth-i)+'</button>';
  }
  for(let d=1; d<=daysInMonth; d++){
    const key=dateToKey(new Date(calViewYear,calViewMonth,d));
    let cls='cal-day';
    if(key===todayKey) cls+=' today';
    if(key===agSelectedDatum) cls+=' selected';
    html+='<button class="'+cls+'" onclick="selectCalDay(\''+key+'\')">'+d+'</button>';
  }
  const totalCells=startWeekday+daysInMonth;
  const remainder=totalCells%7;
  if(remainder>0){
    const fillCount=7-remainder;
    for(let d=1; d<=fillCount; d++){
      html+='<button class="cal-day other-month">'+d+'</button>';
    }
  }
  document.getElementById('cal-days').innerHTML=html;
}
function selectCalDay(key){
  agSelectedDatum=key;
  const d=new Date(key+'T00:00:00');
  const label=document.getElementById('ag-datum-label');
  label.textContent=weekdagenLang[d.getDay()].slice(0,2)+' '+d.getDate()+' '+maandenLang[d.getMonth()];
  label.classList.add('filled');
  closeDatePicker();
}

let timePickerHour=null, timePickerMinute=null;
function openTimePicker(){
  if(agSelectedTijd && agSelectedTijd!=='--:--'){
    const parts=agSelectedTijd.split(':');
    timePickerHour=parseInt(parts[0],10);
    timePickerMinute=parseInt(parts[1],10);
  } else {
    const nu=new Date();
    timePickerHour=nu.getHours();
    timePickerMinute=Math.round(nu.getMinutes()/15)*15%60;
  }
  buildTimeColumns();
  document.getElementById('time-sheet').classList.add('active');
}
function closeTimePicker(){
  document.getElementById('time-sheet').classList.remove('active');
}
function buildTimeColumns(){
  const hoursEl=document.getElementById('time-hours');
  let hHtml='';
  for(let h=0; h<24; h++){
    const sel=h===timePickerHour?' selected':'';
    hHtml+='<div class="time-opt'+sel+'" id="time-h-'+h+'" onclick="pickTimeHour('+h+')">'+String(h).padStart(2,'0')+'</div>';
  }
  hoursEl.innerHTML=hHtml;
  const minutesEl=document.getElementById('time-minutes');
  const minuteOpts=[0,5,10,15,20,25,30,35,40,45,50,55];
  let mHtml='';
  minuteOpts.forEach(function(m){
    const sel=m===timePickerMinute?' selected':'';
    mHtml+='<div class="time-opt'+sel+'" id="time-m-'+m+'" onclick="pickTimeMinute('+m+')">'+String(m).padStart(2,'0')+'</div>';
  });
  minutesEl.innerHTML=mHtml;
  setTimeout(function(){
    const hSel=document.getElementById('time-h-'+timePickerHour);
    if(hSel) hSel.scrollIntoView({block:'center'});
    const mSel=document.getElementById('time-m-'+timePickerMinute);
    if(mSel) mSel.scrollIntoView({block:'center'});
  },50);
}
function pickTimeHour(h){
  timePickerHour=h;
  document.querySelectorAll('#time-hours .time-opt').forEach(function(el){el.classList.remove('selected');});
  document.getElementById('time-h-'+h).classList.add('selected');
}
function pickTimeMinute(m){
  timePickerMinute=m;
  document.querySelectorAll('#time-minutes .time-opt').forEach(function(el){el.classList.remove('selected');});
  document.getElementById('time-m-'+m).classList.add('selected');
}
function confirmTimePicker(){
  agSelectedTijd=String(timePickerHour).padStart(2,'0')+':'+String(timePickerMinute).padStart(2,'0');
  const label=document.getElementById('ag-tijd-label');
  label.textContent=agSelectedTijd;
  label.classList.add('filled');
  closeTimePicker();
}

const weekDagenKort=['ma','di','wo','do','vr','za','zo'];
let weekOffset=0;
let selectedDayKey=null;
let takenPerDag=loadData('takenPerDag',{});
let taakNextId=(function(){
  let max=0;
  Object.keys(takenPerDag).forEach(function(key){
    (takenPerDag[key]||[]).forEach(function(t){if(t.id>max)max=t.id;});
  });
  return max+1;
})();

function dateToKey(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function getWeekStart(offset){
  const today=new Date();
  const day=today.getDay();
  const diff=today.getDate()-day+(day===0?-6:1);
  const monday=new Date(today.getFullYear(),today.getMonth(),diff);
  monday.setDate(monday.getDate()+offset*7);
  return monday;
}
function navigateWeek(dir){
  weekOffset+=dir;
  selectedDayKey=null;
  renderWeek();
}
function selectDay(key){
  selectedDayKey=key;
  renderWeek();
}
function getAfsprakenForDay(key){
  return afspraken.filter(function(a){return a.datum===key;});
}
function addWeekTaak(){
  const tekst=document.getElementById('week-taak-input').value.trim();
  if(!tekst){alert('Vul een taak in');return;}
  if(!takenPerDag[selectedDayKey])takenPerDag[selectedDayKey]=[];
  takenPerDag[selectedDayKey].push({id:taakNextId++,tekst:tekst,gedaan:false});
  document.getElementById('week-taak-input').value='';
  renderWeek();
}
function toggleWeekTaak(key,id){
  const taken=takenPerDag[key]||[];
  const t=taken.find(function(x){return x.id===id;});
  if(t)t.gedaan=!t.gedaan;
  renderWeek();
}
function deleteWeekTaak(key,id){
  takenPerDag[key]=(takenPerDag[key]||[]).filter(function(x){return x.id!==id;});
  renderWeek();
}
function renderWeek(){
  saveData('takenPerDag',takenPerDag);
  const ws=getWeekStart(weekOffset);
  const we=new Date(ws);we.setDate(ws.getDate()+6);
  document.getElementById('week-label').textContent=ws.getDate()+' '+maandenLang[ws.getMonth()].slice(0,3)+' – '+we.getDate()+' '+maandenLang[we.getMonth()].slice(0,3);

  const todayKey=dateToKey(new Date());
  const days=[];
  for(let i=0;i<7;i++){
    const d=new Date(ws);d.setDate(ws.getDate()+i);
    days.push({key:dateToKey(d),label:weekDagenKort[i],num:d.getDate()});
  }
  if(!selectedDayKey || !days.find(function(d){return d.key===selectedDayKey;})){
    const todayInWeek=days.find(function(d){return d.key===todayKey;});
    selectedDayKey=todayInWeek?todayInWeek.key:days[0].key;
  }

  document.getElementById('week-days').innerHTML=days.map(function(d){
    return '<button class="week-day-btn '+(d.key===selectedDayKey?'active':'')+'" onclick="selectDay(\''+d.key+'\')"><span>'+d.label+'</span><span class="day-num">'+d.num+'</span></button>';
  }).join('');

  const dagAfspraken=getAfsprakenForDay(selectedDayKey);
  document.getElementById('week-afspraken').innerHTML = dagAfspraken.length
    ? dagAfspraken.map(function(a){return '<div class="afspraak-card" style="margin-bottom:6px"><div class="afspraak-titel">'+a.titel+'</div><div class="afspraak-tijd">'+a.tijd+'</div></div>';}).join('')
    : '<div class="empty-state">Geen afspraken op deze dag</div>';

  const dagTaken=takenPerDag[selectedDayKey]||[];
  document.getElementById('week-taken').innerHTML = dagTaken.length
    ? dagTaken.map(function(t){
        return '<div class="taak-item '+(t.gedaan?'gedaan':'')+'"><div class="taak-check" onclick="toggleWeekTaak(\''+selectedDayKey+'\','+t.id+')">'+(t.gedaan?'✓':'')+'</div><div class="taak-tekst" onclick="toggleWeekTaak(\''+selectedDayKey+'\','+t.id+')">'+t.tekst+'</div><button class="med-delete-btn" onclick="deleteWeekTaak(\''+selectedDayKey+'\','+t.id+')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m2 0l-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7"/></svg></button></div>';
      }).join('')
    : '<div class="empty-state">Geen taken op deze dag — voeg er een toe</div>';
}

function switchMedTab(tab){
  medTab=tab;
  document.getElementById('med-tab-vandaag').classList.toggle('active',tab==='vandaag');
  document.getElementById('med-tab-beheer').classList.toggle('active',tab==='beheer');
  document.getElementById('med-vandaag').style.display=tab==='vandaag'?'block':'none';
  document.getElementById('med-beheer').style.display=tab==='beheer'?'block':'none';
  renderMedicatie();
}
function renderMedicatie(){
  saveData('medicatie',medicatie);
  saveData('medChecked_'+todayKey(),medChecked);
  const nu=new Date();
  document.getElementById('med-datum-label').textContent=weekdagenLang[nu.getDay()]+' '+nu.getDate()+' '+maandenLang[nu.getMonth()];
  if(medicatie.length===0){
    document.getElementById('med-progress-fill').style.width='0%';
    document.getElementById('med-progress-label').textContent='';
    document.getElementById('med-lijst').innerHTML='<div class="empty-state">Nog geen medicatie toegevoegd. Voeg medicatie toe via "Mijn medicatie".</div>';
  } else {
    const genomen=medicatie.filter(function(m){return medChecked[m.id];}).length;
    document.getElementById('med-progress-fill').style.width=(genomen/medicatie.length*100)+'%';
    document.getElementById('med-progress-label').textContent=genomen+' van '+medicatie.length+' genomen';
    document.getElementById('med-lijst').innerHTML=medicatie.map(function(m){
      const isChecked=!!medChecked[m.id];
      return '<div class="med-item '+(isChecked?'genomen':'')+'" onclick="toggleMed('+m.id+')"><div class="med-check">'+(isChecked?'✓':'')+'</div><div><div class="med-naam">'+m.naam+' '+m.dosering+'</div><div class="med-moment">'+m.moment+'</div></div></div>';
    }).join('');
  }
  if(medTab==='beheer'){
    const lijstEl=document.getElementById('med-beheer-lijst');
    if(medicatie.length===0){
      lijstEl.innerHTML='<div class="empty-state">Nog geen medicatie toegevoegd.</div>';
    } else {
      lijstEl.innerHTML=medicatie.map(function(m){
        return '<div class="med-beheer-item"><div class="med-beheer-info"><div class="med-naam">'+m.naam+' '+m.dosering+'</div><div class="med-moment">'+m.moment+'</div></div><button class="med-delete-btn" onclick="deleteMedicatie('+m.id+')" aria-label="Medicatie verwijderen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m2 0l-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7"/></svg></button></div>';
      }).join('');
    }
  }
}
function toggleMed(id){
  medChecked[id]=!medChecked[id];
  saveData('medChecked_'+todayKey(),medChecked);
  renderMedicatie();
}
function addMedicatie(){
  const naam=document.getElementById('med-naam-input').value.trim();
  const dosering=document.getElementById('med-dosering-input').value.trim();
  const moment=document.getElementById('med-moment-input').value.trim();
  if(!naam){alert('Vul een naam in');return;}
  medicatie.push({id:medNextId++,naam:naam,dosering:dosering,moment:moment||'—'});
  document.getElementById('med-naam-input').value='';
  document.getElementById('med-dosering-input').value='';
  document.getElementById('med-moment-input').value='';
  renderMedicatie();
}
function deleteMedicatie(id){
  medicatie=medicatie.filter(function(m){return m.id!==id;});
  delete medChecked[id];
  renderMedicatie();
}

const defaultGoedMomenten=[];
let goedMomenten=loadData('goedMomenten',defaultGoedMomenten);
let goedMomentNextId=(function(){let max=0;goedMomenten.forEach(function(g){if(g.id>max)max=g.id;});return max+1;})();
function saveGoedMoment(){
  const tekst=document.getElementById('goedmoment-tekst').value.trim();
  if(!tekst){alert('Schrijf eerst een boodschap');return;}
  const nu=new Date();
  const datumStr=nu.getDate()+' '+maandenLang[nu.getMonth()];
  goedMomenten.unshift({id:goedMomentNextId++,datum:datumStr,tekst:tekst});
  document.getElementById('goedmoment-tekst').value='';
  renderGoedMomenten();
}
function deleteGoedMoment(id){
  goedMomenten=goedMomenten.filter(function(g){return g.id!==id;});
  renderGoedMomenten();
}
function renderGoedMomenten(){
  saveData('goedMomenten',goedMomenten);
  if(goedMomenten.length===0){
    document.getElementById('goedmoment-lijst').innerHTML='<div class="empty-state">Nog geen boodschappen geschreven.</div>';
    return;
  }
  document.getElementById('goedmoment-lijst').innerHTML=goedMomenten.map(function(g){
    return '<div class="plan-block"><div class="entry-header"><span class="plan-head" style="margin-bottom:0">Aan mezelf</span><span class="entry-date">'+g.datum+'</span></div><p class="plan-item" style="line-height:1.7;margin-top:8px">'+g.tekst+'</p><div class="entry-actions"><button class="entry-action-btn delete" onclick="deleteGoedMoment('+g.id+')">Verwijderen</button></div></div>';
  }).join('');
}

/* ===== Stemming Meter ===== */
function startOfDay(d){const x=new Date(d);x.setHours(0,0,0,0);return x;}
function isSameDay(d1,d2){return startOfDay(d1).getTime()===startOfDay(d2).getTime();}
function gemiddelde(arr){return arr.length?Math.round(arr.reduce(function(a,b){return a+b;},0)/arr.length*10)/10:null;}

function getDagData(){
  const vandaag=new Date();
  return stemmingen
    .filter(function(s){return isSameDay(new Date(s.datum),vandaag);})
    .sort(function(a,b){return new Date(a.datum)-new Date(b.datum);})
    .map(function(s){
      const d=new Date(s.datum);
      return {label:String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'),score:s.score};
    });
}
function getWeekData(){
  const vandaag=startOfDay(new Date());
  const dagen=[];
  for(let i=6;i>=0;i--){const d=new Date(vandaag);d.setDate(vandaag.getDate()-i);dagen.push(d);}
  return dagen.map(function(d){
    const scores=stemmingen.filter(function(s){return isSameDay(new Date(s.datum),d);}).map(function(s){return s.score;});
    const naam=weekDagenKort[(d.getDay()+6)%7];
    return {label:naam.charAt(0).toUpperCase()+naam.slice(1)+' '+d.getDate(),score:gemiddelde(scores)};
  });
}
function getMaandData(){
  const vandaag=startOfDay(new Date());
  const aantalWeken=4;
  const buckets=[];
  for(let w=aantalWeken-1;w>=0;w--){
    const eind=new Date(vandaag);eind.setDate(vandaag.getDate()-w*7);
    const start=new Date(eind);start.setDate(eind.getDate()-6);
    buckets.push({start:start,eind:eind});
  }
  return buckets.map(function(b,i){
    const eindGrens=new Date(b.eind.getFullYear(),b.eind.getMonth(),b.eind.getDate(),23,59,59);
    const scores=stemmingen.filter(function(s){const d=new Date(s.datum);return d>=b.start&&d<=eindGrens;}).map(function(s){return s.score;});
    const label=i===buckets.length-1?'Deze week':(b.start.getDate()+' '+maandenLang[b.start.getMonth()].slice(0,3));
    return {label:label,score:gemiddelde(scores)};
  });
}

/* Lichte, dependency-vrije SVG lijn-grafiek — geen externe libraries nodig */
function bouwLijnPad(data,xForIdx,yForScore){
  let pad='',tekenen=false;
  const punten=[];
  data.forEach(function(d,i){
    if(d.score===null||d.score===undefined){tekenen=false;return;}
    const x=xForIdx(i),y=yForScore(d.score);
    punten.push({x:x,y:y,i:i,label:d.label,score:d.score});
    pad+=(tekenen?'L':'M')+x.toFixed(1)+','+y.toFixed(1)+' ';
    tekenen=true;
  });
  return {pad:pad,punten:punten};
}
function cssVar(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function renderMoodChart(container,data){
  const W=300,H=210,padL=26,padR=10,padT=14,padB=24;
  const plotW=W-padL-padR,plotH=H-padT-padB;
  const n=data.length;
  function xForIdx(i){return padL+(n>1?i*(plotW/(n-1)):plotW/2);}
  function yForScore(s){return padT+(5-s)/4*plotH;}
  const cGreen=cssVar('--green')||'#4A7A5C';
  const cInkSoft=cssVar('--ink-soft')||'#8A8D85';
  const cCard=cssVar('--card')||'#FFFFFF';
  const cLine=cssVar('--line')||'rgba(74,122,92,0.12)';

  let grid='';
  for(let v=1;v<=5;v++){
    const y=yForScore(v);
    grid+='<line x1="'+padL+'" y1="'+y+'" x2="'+(W-padR)+'" y2="'+y+'" stroke="'+cLine+'" stroke-width="1"/>';
    grid+='<text x="'+(padL-7)+'" y="'+(y+3)+'" text-anchor="end" font-size="9" fill="'+cInkSoft+'">'+v+'</text>';
  }
  const lijn=bouwLijnPad(data,xForIdx,yForScore);
  const dots=lijn.punten.map(function(p){
    return '<circle data-idx="'+p.i+'" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="4" fill="'+cGreen+'" stroke="'+cCard+'" stroke-width="1.5"/>'
      +'<circle class="mood-hit" data-idx="'+p.i+'" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="13" fill="transparent"/>';
  }).join('');
  const xLabels=data.map(function(d,i){
    return '<text x="'+xForIdx(i).toFixed(1)+'" y="'+(H-7)+'" text-anchor="middle" font-size="9" fill="'+cInkSoft+'">'+d.label+'</text>';
  }).join('');

  container.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="100%" preserveAspectRatio="none" style="font-family:Inter,sans-serif">'
    +grid
    +'<path d="'+lijn.pad+'" fill="none" stroke="'+cGreen+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
    +dots+xLabels+'</svg>';

  container.querySelectorAll('.mood-hit').forEach(function(hit){
    const idx=parseInt(hit.getAttribute('data-idx'),10);
    const punt=lijn.punten.find(function(p){return p.i===idx;});
    if(!punt)return;
    hit.addEventListener('click',function(e){toonMoodTooltip(container,punt,e);});
  });
  const svgEl=container.querySelector('svg');
  svgEl.addEventListener('click',function(e){
    if(!e.target.classList.contains('mood-hit'))verbergMoodTooltip(container);
  });
}
function toonMoodTooltip(container,punt,evt){
  let tip=container.querySelector('.mood-tooltip');
  if(!tip){
    tip=document.createElement('div');
    tip.className='mood-tooltip';
    container.appendChild(tip);
  }
  const idx=Math.max(0,Math.min(4,Math.round(punt.score)-1));
  tip.innerHTML='<div style="font-size:11px;color:var(--ink-soft);margin-bottom:2px">'+punt.label+'</div><div style="font-weight:600;color:var(--ink)">'+punt.score+' · '+stemmingLabels[idx]+'</div>';
  const rect=container.getBoundingClientRect();
  let x=evt.clientX-rect.left, y=evt.clientY-rect.top;
  tip.style.left=x+'px';
  tip.style.top=y+'px';
  tip.style.display='block';
}
function verbergMoodTooltip(container){
  const tip=container.querySelector('.mood-tooltip');
  if(tip)tip.style.display='none';
}
function renderSparkline(container,data){
  const W=88,H=42,pad=4;
  const plotW=W-2*pad,plotH=H-2*pad;
  const n=data.length;
  function xForIdx(i){return pad+(n>1?i*(plotW/(n-1)):plotW/2);}
  function yForScore(s){return pad+(5-s)/4*plotH;}
  const lijn=bouwLijnPad(data,xForIdx,yForScore);
  const cGreen=cssVar('--green')||'#4A7A5C';
  container.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" width="100%" height="100%" preserveAspectRatio="none"><path d="'+lijn.pad+'" fill="none" stroke="'+cGreen+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function getDagEntriesRuw(){
  const vandaag=new Date();
  return stemmingen
    .filter(function(s){return isSameDay(new Date(s.datum),vandaag);})
    .sort(function(a,b){return new Date(a.datum)-new Date(b.datum);});
}
let editingStemmingId=null;
function startEditStemming(id){editingStemmingId=id;renderStemmingLijst();}
function cancelEditStemming(){editingStemmingId=null;renderStemmingLijst();}
function setStemmingScore(id,score){
  const entry=stemmingen.find(function(s){return s.id===id;});
  if(entry)entry.score=score;
  editingStemmingId=null;
  saveData('stemmingen',stemmingen);
  renderStemmingMeter();
  renderHomeMoodTile();
}
function deleteStemming(id){
  stemmingen=stemmingen.filter(function(s){return s.id!==id;});
  if(editingStemmingId===id)editingStemmingId=null;
  saveData('stemmingen',stemmingen);
  renderStemmingMeter();
  renderHomeMoodTile();
}
function renderStemmingLijst(){
  const container=document.getElementById('sm-entry-list');
  if(!container)return;
  if(smTab!=='dag'){container.innerHTML='';return;}
  const entries=getDagEntriesRuw();
  if(entries.length===0){container.innerHTML='';return;}
  container.innerHTML='<div class="section-label" style="margin-top:20px">Stemmingen van vandaag</div>'+entries.map(function(e){
    const tijd=new Date(e.datum);
    const tijdStr=String(tijd.getHours()).padStart(2,'0')+':'+String(tijd.getMinutes()).padStart(2,'0');
    const idx=Math.max(0,Math.min(4,e.score-1));
    if(editingStemmingId===e.id){
      return '<div class="entry"><div class="entry-header"><span class="entry-date">'+tijdStr+'</span></div>'
        +'<div class="mood-row" style="margin-top:8px">'+moodVraag.opties.map(function(o){
          return '<button class="mood-btn" onclick="setStemmingScore('+e.id+','+o.score+')">'+o.emoji+'<span>'+o.label+'</span></button>';
        }).join('')
        +'</div><div class="entry-actions"><button class="entry-action-btn" onclick="cancelEditStemming()">Annuleren</button></div></div>';
    }
    return '<div class="entry"><div class="entry-header"><span class="entry-date">'+tijdStr+'</span><span class="entry-mood">'+moodVraag.opties[idx].emoji+'</span></div>'
      +'<div class="entry-text">'+e.score+' · '+stemmingLabels[idx]+'</div>'
      +'<div class="entry-actions"><button class="entry-action-btn" onclick="startEditStemming('+e.id+')">Wijzigen</button><button class="entry-action-btn delete" onclick="deleteStemming('+e.id+')">Verwijderen</button></div></div>';
  }).join('');
}

let smTab='dag';
function switchStemmingTab(tab){
  smTab=tab;
  document.getElementById('sm-tab-dag').classList.toggle('active',tab==='dag');
  document.getElementById('sm-tab-week').classList.toggle('active',tab==='week');
  document.getElementById('sm-tab-maand').classList.toggle('active',tab==='maand');
  editingStemmingId=null;
  renderStemmingMeter();
}
function renderStemmingMeter(){
  let data,titel;
  if(smTab==='dag'){data=getDagData();titel='Vandaag';}
  else if(smTab==='week'){data=getWeekData();titel='Afgelopen 7 dagen';}
  else{data=getMaandData();titel='Afgelopen 4 weken';}

  document.getElementById('sm-chart-title').textContent=titel;
  const metScore=data.filter(function(d){return d.score!==null&&d.score!==undefined;});
  const container=document.getElementById('sm-chart-container');
  const single=document.getElementById('sm-chart-single');
  const leeg=document.getElementById('sm-chart-empty');

  if(metScore.length===0){
    container.style.display='none';
    single.style.display='none';
    leeg.style.display='block';
    document.getElementById('sm-chart-avg').textContent='';
  } else if(smTab==='dag' && metScore.length===1){
    container.style.display='none';
    leeg.style.display='none';
    single.style.display='block';
    document.getElementById('sm-chart-avg').textContent='';
    renderSingleMoodEntry(single,metScore[0]);
  } else {
    container.style.display='block';
    single.style.display='none';
    leeg.style.display='none';
    document.getElementById('sm-chart-avg').textContent='Gem. '+gemiddelde(metScore.map(function(d){return d.score;}))+' / 5';
    renderMoodChart(container,data);
  }
  renderStemmingLijst();
}
function renderSingleMoodEntry(container,entry){
  const idx=Math.max(0,Math.min(4,Math.round(entry.score)-1));
  const opt=moodVraag.opties[idx];
  container.innerHTML='<div class="sm-single-emoji">'+opt.emoji+'</div>'
    +'<div class="sm-single-score">'+entry.score+' / 5</div>'
    +'<div class="sm-single-label">'+opt.label+'</div>'
    +'<div class="sm-single-time">Vastgelegd om '+entry.label+'</div>'
    +'<div class="sm-single-hint">Nog een check-in vandaag? <span class="link" onclick="goTo(\'checkin\')">Start de check-in</span></div>';
}

function renderHomeMoodTile(){
  const sub=document.getElementById('home-mood-sub');
  if(!sub)return;
  const data=getDagData();
  if(data.length===0){
    sub.textContent='Nog geen data vandaag';
    return;
  }
  sub.textContent='Gem. vandaag: '+gemiddelde(data.map(function(d){return d.score;}))+' / 5';
}


/* ===== Weekoverzicht ===== */
var weekOvzOffset = 0;

function getWeekRange(offset) {
  var nu = new Date();
  var dag = nu.getDay();
  var diffMa = (dag === 0 ? -6 : 1 - dag);
  var ma = new Date(nu);
  ma.setDate(nu.getDate() + diffMa + offset * 7);
  ma.setHours(0,0,0,0);
  var zo = new Date(ma);
  zo.setDate(ma.getDate() + 6);
  zo.setHours(23,59,59,999);
  return { start: ma, end: zo };
}

function formatWeekLabel(range) {
  var s = range.start, e = range.end;
  if (s.getMonth() === e.getMonth()) {
    return s.getDate() + ' \u2013 ' + e.getDate() + ' ' + maandenLang[s.getMonth()].slice(0,3);
  }
  return s.getDate() + ' ' + maandenLang[s.getMonth()].slice(0,3) + ' \u2013 ' + e.getDate() + ' ' + maandenLang[e.getMonth()].slice(0,3);
}

function weekOvzDagen(range) {
  var dagNamen = ['ma','di','wo','do','vr','za','zo'];
  var result = [];
  for (var i = 0; i < 7; i++) {
    var d = new Date(range.start);
    d.setDate(range.start.getDate() + i);
    var sc = stemmingen.filter(function(s){ return isSameDay(new Date(s.datum), d); }).map(function(s){ return s.score; });
    result.push({ label: dagNamen[i], date: new Date(d), score: gemiddelde(sc) });
  }
  return result;
}

function renderWeekOvz() {
  var range = getWeekRange(weekOvzOffset);
  var nu = new Date();
  var isHuidig = weekOvzOffset === 0;

  document.getElementById('week-ovz-label').textContent = formatWeekLabel(range);
  document.getElementById('week-ovz-sub').textContent = isHuidig ? 'Deze week' : (weekOvzOffset === -1 ? 'Vorige week' : (weekOvzOffset * -1) + ' weken geleden');
  var nextBtn = document.getElementById('week-ovz-next-btn');
  nextBtn.style.opacity = isHuidig ? '0.3' : '1';
  nextBtn.style.pointerEvents = isHuidig ? 'none' : 'auto';

  var dagen = weekOvzDagen(range);
  var scores = dagen.map(function(d){ return d.score; }).filter(function(s){ return s !== null; });
  var gem = scores.length ? gemiddelde(scores) : null;
  var checkins = scores.length;

  document.getElementById('ovz-stat-checkins').textContent = checkins;
  document.getElementById('ovz-stat-gem').textContent = gem !== null ? gem.toFixed(1) : '\u2014';

  var streak = 0;
  for (var i = 6; i >= 0; i--) {
    if (dagen[i].score !== null) streak++;
    else break;
  }
  document.getElementById('ovz-stat-streak').textContent = streak;

  var maxH = 44;
  document.getElementById('ovz-bars').innerHTML = dagen.map(function(d) {
    var h = d.score !== null ? Math.max(4, Math.round((d.score / 5) * maxH)) : 4;
    var isEmpty = d.score === null;
    var isFuture = d.date > nu;
    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:5px">'
      + '<div style="width:100%;display:flex;align-items:flex-end;justify-content:center;height:' + maxH + 'px">'
      + '<div style="width:11px;height:' + h + 'px;border-radius:6px 6px 3px 3px;'
      + (isEmpty ? 'background:var(--line);opacity:' + (isFuture ? '0.2' : '0.5') : 'background:linear-gradient(180deg,var(--green) 0%,var(--green-deep) 100%)')
      + '"></div></div>'
      + '<div style="font-size:10px;color:var(--ink-soft);font-weight:500">' + d.label + '</div>'
      + '</div>';
  }).join('');

  document.getElementById('ovz-gem-label').textContent = gem !== null ? gem.toFixed(1) + ' \u00b7 ' + stemmingLabels[Math.round(gem) - 1] : 'Nog geen data';

  var trendEl = document.getElementById('ovz-trend');
  if (gem !== null && weekOvzOffset > -4) {
    var prevScores = weekOvzDagen(getWeekRange(weekOvzOffset - 1)).map(function(d){ return d.score; }).filter(function(s){ return s !== null; });
    var prevGem = prevScores.length ? gemiddelde(prevScores) : null;
    if (prevGem !== null) {
      var diff = Math.round((gem - prevGem) * 10) / 10;
      var arrow = diff > 0 ? '\u2191' : (diff < 0 ? '\u2193' : '\u2192');
      var kleur = diff > 0 ? 'var(--green)' : (diff < 0 ? 'var(--warm)' : 'var(--ink-soft)');
      trendEl.innerHTML = '<span style="color:' + kleur + '">' + arrow + ' ' + (diff > 0 ? '+' : '') + diff + ' vs week ervoor</span>';
    } else { trendEl.textContent = ''; }
  } else { trendEl.textContent = ''; }

  var dagNamen2 = ['ma','di','wo','do','vr','za','zo'];
  document.getElementById('ovz-checkin-dots').innerHTML = dagen.map(function(d, i) {
    var done = d.score !== null;
    var isVandaag = isSameDay(d.date, nu);
    var bg = isVandaag
      ? (done ? 'background:var(--green);color:#fff' : 'background:var(--cream);border:1.5px dashed var(--green);color:var(--green)')
      : (done ? 'background:var(--moss);color:var(--green-deep)' : 'background:var(--cream);border:1.5px dashed var(--line);color:var(--ink-soft)');
    return '<div style="width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:600;' + bg + '">' + dagNamen2[i] + '</div>';
  }).join('');
  document.getElementById('ovz-checkin-count').textContent = checkins + ' van 7 dagen';

  var dagNamen3 = ['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'];
  var highlights = [];
  var besteIdx = -1, besteScore = 0;
  dagen.forEach(function(d, i){ if (d.score !== null && d.score > besteScore){ besteScore = d.score; besteIdx = i; } });
  if (besteIdx >= 0 && besteScore >= 4) {
    highlights.push({ icon: '\u2728', kleur: 'var(--moss)', label: 'Goed moment', text: dagNamen3[besteIdx] + ' was je beste dag met een ' + besteScore + '.' });
  }
  var slechtsteIdx = -1, slechtsteScore = 6;
  dagen.forEach(function(d, i){ if (d.score !== null && d.score < slechtsteScore){ slechtsteScore = d.score; slechtsteIdx = i; } });
  if (slechtsteIdx >= 0 && slechtsteScore <= 2 && slechtsteIdx !== besteIdx) {
    highlights.push({ icon: '\uD83D\uDCA1', kleur: 'var(--warm-bg)', label: 'Let op', text: dagNamen3[slechtsteIdx] + ' was zwaarder (score ' + slechtsteScore + '). Heb je al gedeeld wat er speelde?' });
  }
  if (checkins === 0) {
    highlights.push({ icon: '\uD83D\uDCCB', kleur: 'var(--cream)', label: 'Geen data', text: 'Er zijn geen check-ins gevonden voor deze week.' });
  }

  var opvalWrap = document.getElementById('ovz-opvallend-wrap');
  opvalWrap.style.display = highlights.length ? 'block' : 'none';
  document.getElementById('ovz-opvallend').innerHTML = highlights.map(function(h) {
    return '<div style="background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start">'
      + '<div style="width:34px;height:34px;border-radius:10px;flex-shrink:0;background:' + h.kleur + ';display:flex;align-items:center;justify-content:center;font-size:16px">' + h.icon + '</div>'
      + '<div><div style="font-size:11.5px;font-weight:600;color:var(--ink-soft);margin-bottom:2px">' + h.label + '</div>'
      + '<div style="font-size:14px;color:var(--ink);line-height:1.45">' + h.text + '</div></div></div>';
  }).join('');

  try {
    var el = document.getElementById('home-week-sub');
    if (el) el.textContent = gem !== null ? 'Gemiddelde stemming: ' + gem.toFixed(1) : 'Hoe was jouw week?';
  } catch(e){}
}

function weekOvzPrev() { weekOvzOffset--; renderWeekOvz(); }
function weekOvzNext() { if (weekOvzOffset < 0) { weekOvzOffset++; renderWeekOvz(); } }

/* ===== Pincode beveiliging ===== */
let pinEntryBuffer='';
let pinSetupBuffer='';
let pinSetupStage='create'; // 'create' of 'confirm'
let pinFirstEntry='';

function getStoredPin(){ return loadData('appPin', null); }
function isPinEnabled(){ return !!getStoredPin(); }

function buildPinPad(padId, buffer, onDigit){
  const pad=document.getElementById(padId);
  const layout=['1','2','3','4','5','6','7','8','9','','0','del'];
  pad.innerHTML=layout.map(function(k){
    if(k===''){return '<div class="pin-key ghost"></div>';}
    if(k==='del'){return '<button class="pin-key del" onclick="'+onDigit+'(\'del\')">⌫</button>';}
    return '<button class="pin-key" onclick="'+onDigit+'(\''+k+'\')">'+k+'</button>';
  }).join('');
}

function updatePinDots(dotsId, length){
  const dots=document.querySelectorAll('#'+dotsId+' .pin-dot');
  dots.forEach(function(d,i){ d.classList.toggle('filled', i<length); });
}

function shakeDots(dotsId){
  const el=document.getElementById(dotsId);
  el.classList.add('shake');
  setTimeout(function(){ el.classList.remove('shake'); },400);
}

/* --- Setup flow (eerste keer of wijzigen) --- */
let pinSetupContext='onboarding'; // 'onboarding' | 'settings-new' | 'settings-change'
function openPinSetup(context){
  pinSetupContext=context||'onboarding';
  pinSetupStage='create';
  pinSetupBuffer='';
  pinFirstEntry='';
  document.getElementById('pin-setup-title').textContent='Stel een pincode in';
  document.getElementById('pin-setup-error').textContent='';
  updatePinDots('pin-setup-dots',0);
  buildPinPad('pin-setup-pad','pinSetupBuffer','pinSetupDigit');
  document.getElementById('pin-setup-screen').classList.add('active');
}
function skipPinSetup(){
  document.getElementById('pin-setup-screen').classList.remove('active');
  if(pinSetupContext==='settings-new'||pinSetupContext==='settings-change'){
    renderPinSettings();
  }
}
function pinSetupDigit(k){
  const errEl=document.getElementById('pin-setup-error');
  if(k==='del'){ pinSetupBuffer=pinSetupBuffer.slice(0,-1); updatePinDots('pin-setup-dots',pinSetupBuffer.length); return; }
  if(pinSetupBuffer.length>=4) return;
  pinSetupBuffer+=k;
  updatePinDots('pin-setup-dots',pinSetupBuffer.length);
  if(pinSetupBuffer.length===4){
    if(pinSetupStage==='create'){
      pinFirstEntry=pinSetupBuffer;
      pinSetupStage='confirm';
      pinSetupBuffer='';
      errEl.textContent='';
      document.getElementById('pin-setup-title').textContent='Bevestig je pincode';
      setTimeout(function(){ updatePinDots('pin-setup-dots',0); },150);
    } else {
      if(pinSetupBuffer===pinFirstEntry){
        saveData('appPin', pinFirstEntry);
        document.getElementById('pin-setup-screen').classList.remove('active');
        if(pinSetupContext==='settings-new'||pinSetupContext==='settings-change'){
          renderPinSettings();
        }
      } else {
        errEl.textContent='Pincodes komen niet overeen, probeer opnieuw';
        shakeDots('pin-setup-dots');
        pinSetupStage='create';
        pinSetupBuffer='';
        pinFirstEntry='';
        document.getElementById('pin-setup-title').textContent='Stel een pincode in';
        setTimeout(function(){ updatePinDots('pin-setup-dots',0); },400);
      }
    }
  }
}

/* --- Lock flow (bij elke opstart) --- */
function openPinLock(){
  pinEntryBuffer='';
  updatePinDots('pin-lock-dots',0);
  document.getElementById('pin-lock-error').innerHTML='&nbsp;';
  buildPinPad('pin-lock-pad','pinEntryBuffer','pinLockDigit');
  document.getElementById('pin-lock-screen').classList.add('active');
}
function pinLockDigit(k){
  const errEl=document.getElementById('pin-lock-error');
  if(k==='del'){ pinEntryBuffer=pinEntryBuffer.slice(0,-1); updatePinDots('pin-lock-dots',pinEntryBuffer.length); return; }
  if(pinEntryBuffer.length>=4) return;
  pinEntryBuffer+=k;
  updatePinDots('pin-lock-dots',pinEntryBuffer.length);
  if(pinEntryBuffer.length===4){
    if(pinEntryBuffer===getStoredPin()){
      document.getElementById('pin-lock-screen').classList.remove('active');
    } else {
      errEl.textContent='Onjuiste pincode, probeer opnieuw';
      shakeDots('pin-lock-dots');
      pinEntryBuffer='';
      setTimeout(function(){ updatePinDots('pin-lock-dots',0); },400);
    }
  }
}

/* --- Instellingen scherm --- */
function renderNaamSettings(){
  const naam=loadData('username','');
  document.getElementById('naam-huidig-sub').textContent=naam||'—';
  document.getElementById('naam-display-row').style.display='flex';
  document.getElementById('naam-edit-row').style.display='none';
}
function startChangeNaam(){
  const naam=loadData('username','');
  document.getElementById('naam-input-instellingen').value=naam;
  document.getElementById('naam-display-row').style.display='none';
  document.getElementById('naam-edit-row').style.display='block';
  document.getElementById('naam-input-instellingen').focus();
}
function cancelChangeNaam(){
  document.getElementById('naam-display-row').style.display='flex';
  document.getElementById('naam-edit-row').style.display='none';
}
function saveChangeNaam(){
  const naam=document.getElementById('naam-input-instellingen').value.trim();
  if(!naam){alert('Vul alsjeblieft je naam in');return;}
  saveData('username',naam);
  document.getElementById('home-greeting').textContent='Welkom terug, '+naam;
  renderNaamSettings();
}

/* ===== Data export & import ===== */
const EXPORT_KEYS=['username','plan','medicatie','stemmingen','dagboekEntries','afspraken','takenPerDag','goedMomenten'];

function wisAlleGegevens(){
  if(!confirm('Weet je zeker dat je ALLE gegevens wilt verwijderen?\n\nDit verwijdert:\n• Je naam en signaleringsplan\n• Alle stemmingen en dagboekentries\n• Medicatie, agenda en weekplanning\n• Je pincode en instellingen\n\nDit kan niet ongedaan worden gemaakt.')) return;
  if(!confirm('Laatste bevestiging: alle gegevens worden permanent gewist. Doorgaan?')) return;
  const prefix='mijnAnker_';
  Object.keys(localStorage).filter(function(k){return k.startsWith(prefix);}).forEach(function(k){localStorage.removeItem(k);});
  alert('Alle gegevens zijn verwijderd. De app wordt opnieuw gestart.');
  location.reload();
}
function exportAppData(){
  const data={};
  EXPORT_KEYS.forEach(function(key){
    data[key]=loadData(key,null);
  });
  const payload={
    app:'MijnAnker',
    versie:1,
    geexporteerdOp:new Date().toISOString(),
    data:data
  };
  const json=JSON.stringify(payload,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const datumStr=new Date().toISOString().slice(0,10);
  a.href=url;
  a.download='mijnanker-backup-'+datumStr+'.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
}

function importAppData(event){
  const file=event.target.files && event.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(e){
    let parsed;
    try{
      parsed=JSON.parse(e.target.result);
    }catch(err){
      alert('Dit bestand kon niet worden gelezen. Controleer of je het juiste back-upbestand hebt gekozen.');
      event.target.value='';
      return;
    }
    if(!parsed || parsed.app!=='MijnAnker' || !parsed.data){
      alert('Dit lijkt geen geldig MijnAnker back-upbestand te zijn.');
      event.target.value='';
      return;
    }
    const datumLabel=parsed.geexporteerdOp ? new Date(parsed.geexporteerdOp).toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'}) : 'onbekende datum';
    const bevestig=confirm('Gegevens importeren van back-up (' + datumLabel + ')?\n\nDit overschrijft je huidige plan, medicatie, stemmingen, afspraken en dagboek in deze app. Je pincode en naam-instelling blijven ongewijzigd tenzij ze in de back-up staan.');
    if(!bevestig){
      event.target.value='';
      return;
    }
    EXPORT_KEYS.forEach(function(key){
      if(Object.prototype.hasOwnProperty.call(parsed.data,key) && parsed.data[key]!==null){
        saveData(key,parsed.data[key]);
      }
    });
    event.target.value='';
    alert('Gegevens zijn geïmporteerd. De app wordt opnieuw geladen.');
    location.reload();
  };
  reader.onerror=function(){
    alert('Er ging iets mis bij het lezen van het bestand. Probeer het opnieuw.');
    event.target.value='';
  };
  reader.readAsText(file);
}

function renderPinSettings(){
  const enabled=isPinEnabled();
  document.getElementById('pin-toggle').classList.toggle('on',enabled);
  document.getElementById('pin-toggle-sub').textContent=enabled?'Aan':'Uit';
  document.getElementById('pin-change-btn').style.display=enabled?'flex':'none';
}
function togglePinLock(){
  if(isPinEnabled()){
    if(confirm('Pincode-vergrendeling uitschakelen?')){
      saveData('appPin', null);
      renderPinSettings();
    }
  } else {
    openPinSetup('settings-new');
  }
}
function startChangePin(){
  openPinSetup('settings-change');
}

function isDarkModeOn(){return loadData('darkMode',false)===true;}
function renderDarkModeSettings(){
  const enabled=isDarkModeOn();
  document.getElementById('dark-toggle').classList.toggle('on',enabled);
  document.getElementById('dark-toggle-sub').textContent=enabled?'Aan':'Uit';
}
function applyDarkMode(on){
  document.documentElement.classList.toggle('dark',on);
  const tc=document.querySelector('meta[name="theme-color"]');
  if(tc)tc.setAttribute('content', on?'#1B201C':'#FAF8F3');
  rerenderActiveCharts();
}
function toggleDarkMode(){
  const newState=!isDarkModeOn();
  saveData('darkMode',newState);
  applyDarkMode(newState);
  renderDarkModeSettings();
}
function isSimpleModeOn(){return loadData('simpleMode',false)===true;}
function renderSimpleModeSettings(){
  const enabled=isSimpleModeOn();
  document.getElementById('simple-toggle').classList.toggle('on',enabled);
  document.getElementById('simple-toggle-sub').textContent=enabled?'Aan':'Uit';
}
function toggleSimpleMode(){
  const newState=!isSimpleModeOn();
  saveData('simpleMode',newState);
  document.documentElement.classList.toggle('simple',newState);
  renderSimpleModeSettings();
}

function heeftVandaagIngecheckt(){
  const key=todayKey();
  return stemmingen.some(function(s){return s.datum&&s.datum.slice(0,10)===key;});
}
function isReminderOn(){return loadData('reminderEnabled',false)===true;}
function getReminderTime(){return loadData('reminderTime','20:00');}
function renderReminderSettings(){
  const enabled=isReminderOn();
  const toggle=document.getElementById('reminder-toggle');
  const sub=document.getElementById('reminder-toggle-sub');
  const timeRow=document.getElementById('reminder-time-row');
  if(!toggle)return;
  toggle.classList.toggle('on',enabled);
  sub.textContent=enabled?'Aan':'Uit';
  timeRow.style.display=enabled?'block':'none';
  if(enabled){
    const parts=getReminderTime().split(':');
    const hSel=document.getElementById('reminder-hour-select');
    const mSel=document.getElementById('reminder-min-select');
    if(hSel&&hSel.options.length===0){
      for(var h=0;h<24;h++){var o=document.createElement('option');o.value=String(h).padStart(2,'0');o.textContent=String(h).padStart(2,'0');hSel.appendChild(o);}
    }
    if(mSel&&mSel.options.length===0){
      ['00','15','30','45'].forEach(function(m){var o=document.createElement('option');o.value=m;o.textContent=m;mSel.appendChild(o);});
    }
    if(hSel)hSel.value=parts[0]||'20';
    if(mSel)mSel.value=parts[1]||'00';
  }
}
function saveReminderTime(){
  const h=document.getElementById('reminder-hour-select').value;
  const m=document.getElementById('reminder-min-select').value;
  saveData('reminderTime',h+':'+m);
  planReminderVandaag();
}
var _reminderTimer=null;
function planReminderVandaag(){
  if(_reminderTimer){clearTimeout(_reminderTimer);_reminderTimer=null;}
  if(!isReminderOn())return;
  if(typeof Notification==='undefined'||Notification.permission!=='granted')return;
  const parts=getReminderTime().split(':');
  const nu=new Date();
  const doel=new Date();
  doel.setHours(parseInt(parts[0]||20),parseInt(parts[1]||0),0,0);
  const ms=doel-nu;
  if(ms>0){
    _reminderTimer=setTimeout(function(){
      if(!heeftVandaagIngecheckt()){
        try{new Notification('MijnAnker',{body:'Hoe voel je je vandaag? Doe je dagelijkse check-in.',icon:'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚓</text></svg>',tag:'dagelijkse-checkin'});}catch(e){}
      }
    },ms);
  }
}
async function toggleReminder(){
  const newState=!isReminderOn();
  if(newState && typeof Notification !== 'undefined' && Notification.permission==='default'){
    try{
      const result=await Notification.requestPermission();
      if(result!=='granted'){
        // Geen toestemming maar we slaan de voorkeur wél op — tijdkiezer blijft bruikbaar
      }
    }catch(e){}
  }
  saveData('reminderEnabled',newState);
  renderReminderSettings();
  if(newState) planReminderVandaag();
  else if(_reminderTimer){clearTimeout(_reminderTimer);_reminderTimer=null;}
}
function rerenderActiveCharts(){
  try{
    const actief=document.querySelector('.screen.active');
    if(!actief)return;
    if(actief.id==='screen-stemmingmeter' && typeof renderStemmingMeter==='function')renderStemmingMeter();
    if(actief.id==='screen-weekoverzicht' && typeof renderWeekOvz==='function')renderWeekOvz();
  }catch(e){}
  try{
    if(typeof renderHomeMoodTile==='function')renderHomeMoodTile();
  }catch(e){}
}

function initOnboarding(){
  const seenInstall=loadData('seenInstall',false);
  const savedNaam=loadData('username',null);
  if(savedNaam){
    document.getElementById('home-greeting').textContent='Welkom terug, '+savedNaam;
  }
  if(!seenInstall){
    document.getElementById('install-screen').classList.add('active');
  } else if(!savedNaam){
    document.getElementById('naam-modal').classList.add('active');
  } else if(isPinEnabled()){
    openPinLock();
  }
}
/* ===== PDF Export (Noodplan) ===== */
let _jspdfLoadPromise=null;
function loadJsPDF(){
  if(typeof window.jspdf!=='undefined')return Promise.resolve();
  if(_jspdfLoadPromise)return _jspdfLoadPromise;
  _jspdfLoadPromise=new Promise(function(resolve,reject){
    var s=document.createElement('script');
    s.src='./jspdf.min.js';
    s.onload=function(){resolve();};
    s.onerror=function(){_jspdfLoadPromise=null;reject(new Error('jsPDF kon niet geladen worden'));};
    document.head.appendChild(s);
  });
  return _jspdfLoadPromise;
}
function buildNoodplanPDF(){
  if(typeof window.jspdf==='undefined'){alert('PDF-bibliotheek kon niet laden. Controleer je internetverbinding en probeer opnieuw.');return null;}
  const COL={
    inkSoft:[107,125,114], greenDark:[45,90,61], green:[74,124,89],
    greenPale:[238,243,236], warm:[181,101,74], warmBg:[246,236,231], line:[225,221,212], ink:[45,59,51]
  };
  const MARGIN=20, PAGE_W=210, PAGE_H=297, CONTENT_W=PAGE_W-2*MARGIN, BOTTOM_LIMIT=PAGE_H-18;
  const doc=new jspdf.jsPDF({unit:'mm',format:'a4'});
  let y=18;

  function checkBreak(needed){
    if(y+needed>BOTTOM_LIMIT){doc.addPage();y=18;}
  }
  function setColor(rgb){doc.setTextColor(rgb[0],rgb[1],rgb[2]);}
  function drawAnchorIcon(x,yTop,size){
    doc.setDrawColor(COL.greenDark[0],COL.greenDark[1],COL.greenDark[2]);
    doc.setLineWidth(0.45);
    const cx=x+size/2;
    doc.line(cx,yTop,cx,yTop+size*0.78);
    doc.circle(cx,yTop-size*0.06,size*0.11,'S');
    doc.line(cx-size*0.22,yTop+size*0.5,cx+size*0.22,yTop+size*0.5);
    doc.line(cx,yTop+size*0.78,cx-size*0.32,yTop+size*0.55);
    doc.line(cx,yTop+size*0.78,cx+size*0.32,yTop+size*0.55);
  }

  // Header
  drawAnchorIcon(MARGIN, 12, 9);
  doc.setFont('helvetica','bold'); doc.setFontSize(20); setColor(COL.ink);
  doc.text('Noodplan', MARGIN+13, 19);
  doc.setFont('helvetica','normal'); doc.setFontSize(10); setColor(COL.inkSoft);
  doc.text('MijnAnker  ·  persoonlijk veiligheidsplan', MARGIN, 26);
  y=33;

  const naam=loadData('username',null)||'Gebruiker';
  const nuExport=new Date();
  const datumStr=nuExport.getDate()+' '+maandenLang[nuExport.getMonth()]+' '+nuExport.getFullYear();
  doc.setFontSize(9);
  doc.setFont('helvetica','bold'); setColor(COL.ink); doc.text('Naam: ', MARGIN, y);
  doc.setFont('helvetica','normal'); setColor(COL.inkSoft);
  doc.text(naam, MARGIN+doc.getTextWidth('Naam: '), y);
  doc.setFont('helvetica','bold'); setColor(COL.ink);
  const datumLabel='Datum export: '+datumStr;
  doc.text(datumLabel, MARGIN+CONTENT_W, y, {align:'right'});
  y+=6;

  // Acuut box
  const acuutText='Bij een acuut moment: bel 113 (Zelfmoordpreventie) of 112 bij direct gevaar';
  doc.setFont('helvetica','bold'); doc.setFontSize(11.5);
  const acuutLines=doc.splitTextToSize(acuutText, CONTENT_W-8);
  const acuutBoxH=acuutLines.length*5.6+6;
  doc.setFillColor(COL.warmBg[0],COL.warmBg[1],COL.warmBg[2]);
  doc.roundedRect(MARGIN, y, CONTENT_W, acuutBoxH, 2.2, 2.2, 'F');
  setColor(COL.warm);
  acuutLines.forEach(function(line,i){doc.text(line, MARGIN+5, y+6+i*5.6);});
  y+=acuutBoxH+5;
  doc.setDrawColor(COL.line[0],COL.line[1],COL.line[2]); doc.setLineWidth(0.25);
  doc.line(MARGIN, y, MARGIN+CONTENT_W, y);
  y+=7;

  function bulletSection(title, subtitle, items){
    checkBreak(16+items.length*6);
    doc.setFont('helvetica','bold'); doc.setFontSize(12); setColor(COL.greenDark);
    doc.text(title, MARGIN, y); y+=5.5;
    doc.setFont('helvetica','normal'); doc.setFontSize(9); setColor(COL.inkSoft);
    doc.text(subtitle, MARGIN, y); y+=5.5;
    doc.setFontSize(10.5);
    if(items.length===0){
      setColor(COL.inkSoft); doc.setFont('helvetica','italic');
      doc.text('Nog niets toegevoegd in de app.', MARGIN+5, y); y+=6;
    } else {
      items.forEach(function(item){
        checkBreak(6);
        doc.setFillColor(COL.green[0],COL.green[1],COL.green[2]);
        doc.circle(MARGIN+1.6, y-1.3, 0.9, 'F');
        setColor(COL.ink); doc.setFont('helvetica','normal');
        const lines=doc.splitTextToSize(item.tekst, CONTENT_W-9);
        lines.forEach(function(l,li){ doc.text(l, MARGIN+5, y+li*5); });
        y+=lines.length*5+1;
      });
    }
    y+=4;
  }

  bulletSection('Vroege signalen', 'Wat merk ik bij mezelf als het minder goed gaat?', plan.signalen||[]);
  bulletSection('Mijn triggers', 'Situaties die het moeilijker kunnen maken', plan.triggers||[]);
  bulletSection('Wat helpt mij', 'Dingen die rust of houvast geven', plan.helpend||[]);

  // Stemmingsgrafiek (laatste 7 dagen, echte data)
  checkBreak(55);
  doc.setFont('helvetica','bold'); doc.setFontSize(12); setColor(COL.greenDark);
  doc.text('Stemming, afgelopen 7 dagen', MARGIN, y); y+=5.5;
  doc.setFont('helvetica','normal'); doc.setFontSize(9); setColor(COL.inkSoft);
  doc.text('Score per dag, op een schaal van heel slecht tot heel goed', MARGIN, y); y+=4;

  const weekData=getWeekData();
  const haveData=weekData.some(function(d){return d.score!==null;});
  if(!haveData){
    setColor(COL.inkSoft); doc.setFont('helvetica','italic'); doc.setFontSize(10);
    doc.text('Nog geen stemmingen vastgelegd voor deze periode.', MARGIN+5, y+8);
    y+=18;
  } else {
    const chartX=MARGIN+22, chartW=CONTENT_W-22, chartTop=y+2, chartH=32;
    const stemmingLabelsKort=['Heel slecht','Slecht','Neutraal','Goed','Heel goed'];
    doc.setFontSize(7.5); setColor(COL.inkSoft); doc.setFont('helvetica','normal');
    for(let lv=1;lv<=5;lv++){
      const ly=chartTop+chartH-((lv-1)/4)*chartH;
      doc.text(stemmingLabelsKort[lv-1], chartX-3, ly+1, {align:'right'});
      doc.setDrawColor(COL.line[0],COL.line[1],COL.line[2]); doc.setLineWidth(0.15);
      doc.line(chartX, ly, chartX+chartW, ly);
    }
    const scored=weekData.filter(function(d){return d.score!==null;}).map(function(d){return d.score;});
    const avg=scored.reduce(function(a,b){return a+b;},0)/scored.length;
    const avgY=chartTop+chartH-((avg-1)/4)*chartH;
    doc.setLineWidth(0.3); doc.setLineDashPattern([1.2,1],0);
    doc.setDrawColor(150,150,150); doc.line(chartX, avgY, chartX+chartW, avgY);
    doc.setLineDashPattern([],0);
    doc.setFont('helvetica','italic'); doc.setFontSize(8); setColor(COL.inkSoft);
    doc.text('gemiddeld '+avg.toFixed(1), chartX+chartW, avgY-1.5, {align:'right'});

    const stepX=chartW/(weekData.length-1);
    let prevPt=null;
    doc.setDrawColor(COL.greenDark[0],COL.greenDark[1],COL.greenDark[2]); doc.setLineWidth(0.6);
    weekData.forEach(function(d,i){
      const px=chartX+i*stepX;
      if(d.score===null){prevPt=null;return;}
      const py=chartTop+chartH-((d.score-1)/4)*chartH;
      if(prevPt){doc.line(prevPt.x,prevPt.y,px,py);}
      doc.setFillColor(COL.greenDark[0],COL.greenDark[1],COL.greenDark[2]);
      doc.circle(px,py,0.9,'F');
      prevPt={x:px,y:py};
    });
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); setColor(COL.inkSoft);
    weekData.forEach(function(d,i){
      const px=chartX+i*stepX;
      doc.text(d.label, px, chartTop+chartH+5, {align:'center'});
    });
    y=chartTop+chartH+10;
  }
  y+=4;

  // Contacten
  checkBreak(20+(plan.contacten||[]).length*8);
  doc.setFont('helvetica','bold'); doc.setFontSize(12); setColor(COL.greenDark);
  doc.text('Mijn contacten', MARGIN, y); y+=4;
  const nameColW=105;
  doc.setFillColor(COL.greenPale[0],COL.greenPale[1],COL.greenPale[2]);
  doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(9); setColor([100,115,105]);
  doc.text('Naam', MARGIN+2.8, y+4.8);
  doc.text('Telefoonnummer', MARGIN+CONTENT_W-2.8, y+4.8, {align:'right'});
  y+=7;
  const contacten=plan.contacten||[];
  if(contacten.length===0){
    setColor(COL.inkSoft); doc.setFont('helvetica','italic'); doc.setFontSize(10);
    doc.text('Nog geen contacten toegevoegd in de app.', MARGIN+2.8, y+5); y+=8;
  } else {
    contacten.forEach(function(c){
      checkBreak(8);
      doc.setFont('helvetica','bold'); doc.setFontSize(10.5); setColor(COL.ink);
      doc.text(c.naam, MARGIN+2.8, y+5);
      doc.setFont('helvetica','normal'); setColor(COL.inkSoft);
      doc.text(c.tel, MARGIN+CONTENT_W-2.8, y+5, {align:'right'});
      y+=7.2;
      doc.setDrawColor(COL.line[0],COL.line[1],COL.line[2]); doc.setLineWidth(0.2);
      doc.line(MARGIN, y, MARGIN+CONTENT_W, y);
    });
  }
  y+=8;

  // Medicatie
  checkBreak(20+medicatie.length*8);
  doc.setFont('helvetica','bold'); doc.setFontSize(12); setColor(COL.greenDark);
  doc.text('Mijn medicatie', MARGIN, y); y+=4;
  doc.setFillColor(COL.greenPale[0],COL.greenPale[1],COL.greenPale[2]);
  doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(9); setColor([100,115,105]);
  doc.text('Medicatie', MARGIN+2.8, y+4.8);
  doc.text('Dosering', MARGIN+nameColW+2.8, y+4.8);
  doc.text('Moment', MARGIN+nameColW+25+2.8, y+4.8);
  y+=7;
  if(medicatie.length===0){
    setColor(COL.inkSoft); doc.setFont('helvetica','italic'); doc.setFontSize(10);
    doc.text('Nog geen medicatie toegevoegd in de app.', MARGIN+2.8, y+5); y+=8;
  } else {
    medicatie.forEach(function(m){
      checkBreak(8);
      doc.setFont('helvetica','normal'); doc.setFontSize(10.5); setColor(COL.ink);
      doc.text(m.naam, MARGIN+2.8, y+5);
      doc.text(m.dosering||'—', MARGIN+nameColW+2.8, y+5);
      doc.text(m.moment||'—', MARGIN+nameColW+25+2.8, y+5);
      y+=7.2;
      doc.setDrawColor(COL.line[0],COL.line[1],COL.line[2]); doc.setLineWidth(0.2);
      doc.line(MARGIN, y, MARGIN+CONTENT_W, y);
    });
  }
  y+=8;

  checkBreak(12);
  doc.setDrawColor(COL.line[0],COL.line[1],COL.line[2]); doc.setLineWidth(0.25);
  doc.line(MARGIN, y, MARGIN+CONTENT_W, y); y+=4.5;
  doc.setFont('helvetica','italic'); doc.setFontSize(8.5); setColor(COL.inkSoft);
  const footerLines=doc.splitTextToSize('Gegenereerd vanuit MijnAnker op '+datumStr+' om te delen met een behandelaar, huisarts of naaste. Vervangt geen professionele hulp.', CONTENT_W);
  footerLines.forEach(function(l,i){doc.text(l, MARGIN, y+i*4);});

  return doc;
}
async function exportNoodplanPDF(){
  var btn=document.querySelector('.actie-btn[onclick="exportNoodplanPDF()"]');
  var origTxt=btn?btn.textContent:null;
  if(btn){btn.textContent='Even wachten…';btn.disabled=true;}
  try{
    await loadJsPDF();
  }catch(e){
    alert('PDF-bibliotheek kon niet laden. Controleer je internetverbinding en probeer opnieuw.');
    if(btn){btn.textContent=origTxt;btn.disabled=false;}
    return;
  }
  if(btn){btn.textContent=origTxt;btn.disabled=false;}
  var doc=buildNoodplanPDF();
  if(!doc)return;
  doc.save('noodplan-mijnanker.pdf');
}
async function deelNoodplanPDF(){
  var btn=document.getElementById('deel-pdf-btn');
  var origTxt=btn?btn.textContent:null;
  if(btn){btn.textContent='Even wachten…';btn.disabled=true;}
  try{
    await loadJsPDF();
  }catch(e){
    alert('PDF-bibliotheek kon niet laden. Controleer je internetverbinding en probeer opnieuw.');
    if(btn){btn.textContent=origTxt;btn.disabled=false;}
    return;
  }
  var doc=buildNoodplanPDF();
  if(!doc){if(btn){btn.textContent=origTxt;btn.disabled=false;}return;}
  try{
    if(navigator.canShare){
      var blob=doc.output('blob');
      var file=new File([blob],'noodplan-mijnanker.pdf',{type:'application/pdf'});
      if(navigator.canShare({files:[file]})){
        await navigator.share({files:[file],title:'Mijn noodplan',text:'Mijn persoonlijk veiligheidsplan vanuit MijnAnker.'});
        if(btn){btn.textContent=origTxt;btn.disabled=false;}
        return;
      }
    }
  }catch(e){
    if(e.name!=='AbortError') console.warn('Share mislukt, terugvallen op download',e);
  }
  doc.save('noodplan-mijnanker.pdf');
  if(btn){btn.textContent=origTxt;btn.disabled=false;}
}

initOnboarding();
renderHomeMoodTile();
planReminderVandaag();

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('SW registratie mislukt',e));
  });
}
