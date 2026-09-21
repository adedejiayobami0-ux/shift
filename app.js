const app = document.getElementById('app');
const state = JSON.parse(localStorage.getItem('shift-demo')) || {
  from: 'Lagos, Nigeria', to: 'Toronto, Canada', date: '2027-08',
  household: 'Just me', reason: 'Work', stage: 'Planning',
  savings: 7500, monthly: 800, arrivalIncome: 'Not sure',
  passport: true, visa: false, job: false, housing: false, health: false,
  readiness: 31
};
let onboardingStep = 0;
let selected = {};

const money = {
  target: 18500,
  low: 15900,
  high: 20600,
  items: [
    ['Documents & applications',1200,350],['Flight',1100,null],['Housing deposit + first month',4500,null],
    ['Initial transportation',600,null],['Household setup',1200,null],['First-month expenses',1900,null],['Emergency runway',8000,null]
  ]
};

function save(){ localStorage.setItem('shift-demo', JSON.stringify(state)); }
function clone(id){ return document.getElementById(id).content.cloneNode(true); }
function city(v){ return v.split(',')[0]; }
function formatMoney(v){ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v); }
function monthLabel(v){ const [y,m]=v.split('-').map(Number); return new Date(y,m-1,1).toLocaleDateString('en-US',{month:'long',year:'numeric'}); }
function monthsUntil(dateStr){ const now=new Date(2026,8,21); const [y,m]=dateStr.split('-').map(Number); return Math.max(1,(y-now.getFullYear())*12+(m-1-now.getMonth())); }

function showLanding(){
  app.innerHTML=''; app.appendChild(clone('landing-template'));
  document.getElementById('fromInput').value=state.from;
  document.getElementById('toInput').value=state.to;
  document.getElementById('dateInput').value=state.date;
  document.getElementById('buildPlanBtn').onclick=()=>{
    state.from=document.getElementById('fromInput').value||state.from;
    state.to=document.getElementById('toInput').value||state.to;
    state.date=document.getElementById('dateInput').value||state.date;
    save(); onboardingStep=0; selected={}; showOnboarding();
  };
}

const steps=[
  {
    title:'Who is making this move?', desc:'We use this to change the plan for family, school, health, and document needs.',
    type:'options', key:'household', options:[
      ['Just me','One-person move'],['Me + partner','Two adults moving together'],['Family','Adults and children'],['Still figuring it out','You can update this later']]
  },
  {
    title:'What is pulling you there?', desc:'Your reason for moving changes what “ready” looks like.',
    type:'options', key:'reason', options:[
      ['Work','Relocating or looking for work'],['School','Study or training'],['Family','Joining or supporting family'],['Remote work','Keeping your current work'],['Starting over','A life reset'],['Still figuring it out','Exploring possibilities']]
  },
  {
    title:'How far along are you?', desc:'Shift should work whether this is a dream, a plan, or a booked flight.',
    type:'options', key:'stage', options:[
      ['Just exploring','I am considering a move'],['Planning','I chose where I want to go'],['Preparing','I am gathering money and documents'],['Confirmed','The move is definitely happening']]
  },
  {
    title:'Let’s make the plan realistic.', desc:'Rough numbers are enough. These stay editable.',
    type:'money'
  }
];

function showOnboarding(){
  app.innerHTML=''; app.appendChild(clone('onboarding-template'));
  const step=steps[onboardingStep];
  document.getElementById('stepLabel').textContent=`Step ${onboardingStep+1} of ${steps.length}`;
  document.getElementById('progressFill').style.width=`${((onboardingStep+1)/steps.length)*100}%`;
  const card=document.getElementById('questionCard');
  card.innerHTML=`<h2>${step.title}</h2><p>${step.desc}</p>`;
  if(step.type==='options'){
    const grid=document.createElement('div'); grid.className='option-grid';
    step.options.forEach(([name,desc])=>{
      const b=document.createElement('button'); b.className='option';
      if((selected[step.key]||state[step.key])===name) b.classList.add('selected');
      b.innerHTML=`<strong>${name}</strong><small>${desc}</small>`;
      b.onclick=()=>{ selected[step.key]=name; [...grid.children].forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); };
      grid.appendChild(b);
    }); card.appendChild(grid);
  } else {
    const grid=document.createElement('div'); grid.className='form-grid';
    grid.innerHTML=`
      <label><span>Saved for the move</span><input id="savingsInput" type="number" min="0" value="${state.savings}"></label>
      <label><span>Can save each month</span><input id="monthlyInput" type="number" min="0" value="${state.monthly}"></label>
      <label class="full"><span>Will you have income immediately after arriving?</span>
        <input id="arrivalInput" value="${state.arrivalIncome}" placeholder="Yes, No, or Not sure"></label>`;
    card.appendChild(grid);
  }
  const actions=document.createElement('div'); actions.className='onboarding-actions';
  actions.innerHTML=`<button class="back-btn">${onboardingStep===0?'Back home':'← Back'}</button><button class="primary-btn">${onboardingStep===steps.length-1?'See my move plan →':'Continue →'}</button>`;
  actions.children[0].onclick=()=>{ if(onboardingStep===0) showLanding(); else { onboardingStep--; showOnboarding(); } };
  actions.children[1].onclick=()=>{
    if(step.type==='options') state[step.key]=selected[step.key]||state[step.key];
    else {
      state.savings=Number(document.getElementById('savingsInput').value)||0;
      state.monthly=Number(document.getElementById('monthlyInput').value)||0;
      state.arrivalIncome=document.getElementById('arrivalInput').value||'Not sure';
      const financial=Math.min(100,Math.round((state.savings/money.target)*100));
      state.readiness=Math.round((financial+55+15+10)/4);
    }
    save();
    if(onboardingStep<steps.length-1){ onboardingStep++; showOnboarding(); } else showDashboard('overview');
  };
  card.appendChild(actions);
}

function dashboardShell(view){
  app.innerHTML=''; app.appendChild(clone('dashboard-template'));
  document.getElementById('sideDestination').textContent=city(state.to);
  document.getElementById('sideRoute').textContent=`${city(state.from)} → ${city(state.to)}`;
  document.querySelectorAll('.nav-item').forEach(b=>{
    b.classList.toggle('active',b.dataset.view===view);
    b.onclick=()=>showDashboard(b.dataset.view);
  });
  document.getElementById('askShiftBtn').onclick=openAsk;
  return document.getElementById('dashboardContent');
}

function showDashboard(view='overview'){
  const content=dashboardShell(view);
  if(view==='overview') renderOverview(content);
  if(view==='fund') renderFund(content);
  if(view==='journey') renderJourney(content);
  if(view==='documents') renderDocuments(content);
}

function header(title,subtitle,badge='Plan updates as your move changes'){
  return `<div class="page-head"><div><span class="eyebrow">${monthLabel(state.date)}</span><h2>${title}</h2><p>${subtitle}</p></div><span class="status-badge">${badge}</span></div>`;
}

function renderOverview(el){
  const financial=Math.min(100,Math.round((state.savings/money.target)*100));
  const projected=state.savings+state.monthly*monthsUntil(state.date);
  const shortfall=Math.max(0,money.target-projected);
  el.innerHTML=header(`Your ${city(state.to)} plan`,`A living view of what stands between “I want to move” and “I’m ready.”`)+`
  <div class="hero-panel">
    <div>
      <span class="eyebrow" style="color:#aeb9b1">Move readiness</span>
      <div class="readiness-num">${state.readiness}% <small>of your Shift plan complete</small></div>
      <p>${city(state.from)} → ${city(state.to)} · ${monthLabel(state.date)} · ${monthsUntil(state.date)} months to go</p>
    </div>
    <div class="metric-list">
      ${metric('Money',financial)}${metric('Documents',55)}${metric('Immigration',15)}${metric('Logistics',10)}
    </div>
  </div>
  <div class="grid-2">
    <article class="card">
      <span class="eyebrow">Focus now</span><h3>Your next three moves</h3>
      <div class="priority-list">
        ${priority(1,'Choose your immigration pathway','Your plan cannot time document and application steps until this is clearer.')}
        ${priority(2,'Check passport validity','Record the expiry date so Shift can flag timing risks.')}
        ${priority(3,'Close the Move Fund gap',shortfall?`Current trajectory is about ${formatMoney(shortfall)} below the planning target.`:'Your current trajectory meets the planning target.')}
      </div>
    </article>
    <article class="card">
      <span class="eyebrow">Move Fund</span><h3>${formatMoney(state.savings)} saved</h3>
      <div class="money-big">${formatMoney(state.savings)} <span>/ ${formatMoney(money.target)}</span></div>
      <div class="progress-large"><span style="width:${financial}%"></span></div>
      <p>Planning range: ${formatMoney(money.low)}–${formatMoney(money.high)}. Shift separates estimates from confirmed costs.</p>
      <button class="link-btn" id="viewFund">Open Move Fund →</button>
    </article>
  </div>`;
  document.getElementById('viewFund').onclick=()=>showDashboard('fund');
}
function metric(name,val){ return `<div class="metric-row"><span>${name}</span><div class="metric-bar"><span style="width:${val}%"></span></div><strong>${val}%</strong></div>`; }
function priority(n,title,desc){ return `<div class="priority"><div class="num-dot">${n}</div><div><strong>${title}</strong><small>${desc}</small></div><button class="link-btn">Open</button></div>`; }

function renderFund(el){
  const pct=Math.min(100,Math.round(state.savings/money.target*100));
  el.innerHTML=header('Move Fund','Turn “save more” into a concrete financial runway for your move.','Estimates are planning guidance, not quotes')+`
    <div class="card">
      <span class="eyebrow">Funding progress</span>
      <div class="money-big">${formatMoney(state.savings)} <span>/ ${formatMoney(money.target)}</span></div>
      <div class="progress-large"><span style="width:${pct}%"></span></div>
      <p>${pct}% funded · ${formatMoney(Math.max(0,money.target-state.savings))} remaining to the comfortable planning target.</p>
    </div>
    <div class="grid-2">
      <article class="card">
        <span class="eyebrow">Budget</span><h3>What the money is for</h3>
        <div class="breakdown">
          <div class="breakdown-row header"><span>Category</span><span>Planned</span><span>Confirmed</span></div>
          ${money.items.map(x=>`<div class="breakdown-row"><span>${x[0]}</span><strong>${formatMoney(x[1])}</strong><span>${x[2]!=null?formatMoney(x[2]):'—'}</span></div>`).join('')}
        </div>
      </article>
      <article class="card">
        <span class="eyebrow">Move-date simulator</span><h3>When could I realistically move?</h3>
        <p>Move the date to see how your monthly savings target changes.</p>
        <div class="simulator">
          <input id="dateSlider" type="range" min="4" max="24" value="${monthsUntil(state.date)}">
          <div class="simulator-result"><div><small>Months from now</small><strong id="simMonths">${monthsUntil(state.date)}</strong></div><div><small>Monthly target</small><strong id="simMonthly">${formatMoney(Math.ceil(Math.max(0,money.target-state.savings)/monthsUntil(state.date)))}</strong></div></div>
        </div>
      </article>
    </div>`;
  const slider=document.getElementById('dateSlider');
  slider.oninput=()=>{
    const m=Number(slider.value); document.getElementById('simMonths').textContent=m;
    document.getElementById('simMonthly').textContent=formatMoney(Math.ceil(Math.max(0,money.target-state.savings)/m));
  };
}

function renderJourney(el){
  const stages=[
    ['Now','Build the foundation',['Choose an immigration pathway to investigate','Confirm passport validity','Set your Move Fund target','Research employment and licensing needs']],
    ['6–9 months before','Turn the plan into preparation',['Gather official documents','Begin eligible application processes','Research neighborhoods and housing norms','Build emergency runway']],
    ['3–6 months before','Reduce uncertainty',['Request medical records','Compare flight windows','Plan what to sell, ship, or store','Validate realistic arrival costs']],
    ['Final 30 days','Close the loops',['Confirm accommodation','Notify important institutions','Prepare access to money abroad','Create a critical-document travel folder']],
    ['Arrival','Land with a plan',['Phone and connectivity','Banking and payments','Local transport','Required registrations and healthcare setup']],
    ['First 90 days','Build stability',['Permanent housing','Credit and taxes','Long-term healthcare','Community and professional network']]
  ];
  el.innerHTML=header('Your journey','A timeline shaped by your destination, household, reason for moving, and how far along you are.')+`<div class="timeline">${stages.map((s,i)=>`<article class="stage"><div class="stage-top"><div><span class="eyebrow">${s[0]}</span><h3>${s[1]}</h3></div><span class="status-badge">${i===0?'Active':'Upcoming'}</span></div><ul>${s[2].map(x=>`<li>${x}</li>`).join('')}</ul></article>`).join('')}</div>`;
}

function renderDocuments(el){
  const docs=[
    ['Passport','done','Have it','Record your expiry date so timing warnings can be more accurate.'],
    ['Birth certificate','done','Have it','Useful for identity, family, and some government processes.'],
    ['Education records','','Needed soon','Degree certificates and transcripts may matter for work, study, or licensing.'],
    ['Employment records','','Missing','References, offer letters, and proof of employment can support multiple parts of a move.'],
    ['Bank statements','','Review','Recent financial records may be requested for applications, housing, or proof of funds.'],
    ['Health records','','Missing','Keep vaccination, prescription, and key medical information accessible during the move.']
  ];
  el.innerHTML=header('Documents','A move-specific vault that tracks what you have, what may matter, and what needs checking.','Always verify legal requirements with official sources')+`<div class="doc-grid">${docs.map(d=>`<article class="doc-card"><div class="doc-card-top"><h3>${d[0]}</h3><span class="doc-state ${d[1]}">${d[2]}</span></div><p>${d[3]}</p><button class="link-btn">Review →</button></article>`).join('')}</div>`;
}

function openAsk(){
  const modal=document.createElement('div'); modal.className='modal';
  modal.innerHTML=`<div class="modal-card"><span class="eyebrow">Ask Shift</span><h2 style="font-family:Instrument Serif;font-size:42px;font-weight:400;margin:8px 0 14px">Ask about your move</h2><textarea id="askInput" placeholder="What should I focus on this month?"></textarea><div id="answer"></div><div class="modal-actions"><button class="ghost-btn" id="closeAsk">Close</button><button class="primary-btn" id="answerAsk">Answer</button></div></div>`;
  document.body.appendChild(modal);
  document.getElementById('closeAsk').onclick=()=>modal.remove();
  document.getElementById('answerAsk').onclick=()=>{
    const q=document.getElementById('askInput').value.toLowerCase();
    let a='Your highest-leverage next step is to clarify your immigration pathway, then confirm passport timing and keep building your Move Fund. Those three items unlock the rest of your plan.';
    if(q.includes('money')||q.includes('afford')||q.includes('save')) a=`You have ${formatMoney(state.savings)} saved toward a ${formatMoney(money.target)} planning target. At ${formatMoney(state.monthly)}/month, you would add about ${formatMoney(state.monthly*monthsUntil(state.date))} before ${monthLabel(state.date)}. Review housing and emergency-runway assumptions first because they are the largest parts of this demo budget.`;
    if(q.includes('document')) a='Start with passport validity, identity records, education records, recent financial statements, and employment documents. Exact requirements depend on your immigration pathway, so Shift should always link legal requirements back to the relevant official authority.';
    document.getElementById('answer').innerHTML=`<div class="answer-box">${a}</div>`;
  };
}

document.querySelector('.brand').onclick=showLanding;
document.getElementById('demoReset').onclick=()=>{ localStorage.removeItem('shift-demo'); location.reload(); };
showLanding();
