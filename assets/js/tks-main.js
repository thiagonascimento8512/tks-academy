const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};

/* ===== MÓDULOS ===== */
const modules=[
{lvl:"Iniciante",title:"Fundamentos do PUBG Mobile",desc:"Aprenda as bases antes de acelerar.",items:["Mecânicas, modos e mapas","Loot, zona e sobrevivência","Posicionamento e leitura de jogo","Tomada de decisão"],lessons:[["Conheça o ciclo da partida","Loot inicial, informação, rotação e posicionamento."],["Priorize informação","Ouça passos, observe tiros e compartilhe posições com a equipe."],["Leia a zona","Planeje a rotação com antecedência e evite cruzar áreas abertas sem necessidade."]]},
{lvl:"Iniciante",title:"Arsenal e domínio das armas",desc:"Escolha a arma pela função e distância.",items:["Rifles, SMGs, DMRs e snipers","Dano e cadência","Acessórios compatíveis","Combinação de armas"],lessons:[["Compare duas armas","Teste cadência, estabilidade e tempo para eliminar no campo de treino."],["Teste acessórios","Mude um acessório por vez e compare o agrupamento."],["Monte uma combinação","Escolha uma arma para curta/média distância e outra que cubra sua necessidade de alcance."]]},
{lvl:"Intermediário",title:"Spray e controle de recoil",desc:"Construa controle com prática progressiva.",items:["Rajadas curtas e longas","Recuo vertical e horizontal","Miras e distâncias","Exercícios de precisão"],lessons:[["Rajadas de 5–10 tiros","Observe o padrão antes de tentar sprays longos."],["Progressão de distância","Repita o mesmo teste a 10 m, 30 m e 50 m."],["Registre agrupamento","Anote a consistência antes de mudar a sensibilidade."]]},
{lvl:"Intermediário",title:"Sensibilidade profissional",desc:"Entenda câmera, ADS e giroscópio.",items:["Câmera e ADS","Giroscópio","Quatro configurações TKS","Calibração individual"],lessons:[["Estabeleça uma referência","Registre seus valores atuais antes de experimentar."],["Ajuste uma variável","Altere apenas uma mira ou controle por sessão."],["Avalie o resultado","Mantenha a mudança apenas se melhorar controle e consistência."]]},
{lvl:"Intermediário",title:"HUD e mecânica dos dedos",desc:"Configure controles que funcionem para você.",items:["HUD de 2 a 4 dedos","Botões de tiro e mira","Agachar, pular e deitar","Conforto e visibilidade"],lessons:[["Mapeie os comandos","Identifique quais ações precisam ocorrer simultaneamente."],["Teste em movimento","Mire, mova e atire no campo de treino."],["Revise o layout","Evite cobrir a visão e mantenha os botões essenciais acessíveis."]]},
{lvl:"Intermediário",title:"Movimentação e posicionamento",desc:"Reduza exposição e melhore ângulos.",items:["Peek e jiggle","Uso de cobertura","Reposicionamento","Combate em movimento"],lessons:[["Pratique peek com cobertura","Exponha-se apenas o necessário para obter informação ou atirar."],["Mude de ângulo","Evite repetir a mesma posição depois de ser localizado."],["Planeje saída","Entre em cada confronto sabendo para onde recuar."]]},
{lvl:"Avançado",title:"Combate competitivo",desc:"Aplique a mecânica sob pressão.",items:["1x1, 1x2 e 2x2","Trocação em dupla","Comunicação de dano","Revisão de erros"],lessons:[["Comunique informação útil","Informe posição, direção, dano percebido e necessidade de apoio."],["Evite duelos desnecessários","Reavalie quando estiver sem cobertura ou em desvantagem."],["Faça revisão pós-partida","Escolha um erro repetido e transforme-o em exercício."]]},
{lvl:"Avançado",title:"Estratégia e rotação",desc:"Ganhe vantagem com tempo e informação.",items:["Zona e terreno","Rotação segura","Veículos e recursos","Visão de jogo"],lessons:[["Planeje a rotação","Considere zona, terreno, cobertura e possíveis equipes rivais."],["Evite atravessar aberto","Procure rotas com proteção e opções de reposicionamento."],["Controle recursos","Combine combustível, cura, munição e utilitários com o squad."]]},
{lvl:"Avançado",title:"Equipe e IGL",desc:"Organize funções, comunicação e decisões.",items:["IGL e funções flexíveis","Disciplina de comunicação","Liderança","Treino em squad"],lessons:[["Defina responsabilidades","Todos devem saber quem chama rotação e quem observa cada setor."],["Use comunicação curta","Evite conversas paralelas durante confrontos."],["Avalie como equipe","Revise decisões sem procurar culpados; defina uma ação de melhoria."]]},
{lvl:"Avançado",title:"Treino e evolução contínua",desc:"Transforme prática em progresso mensurável.",items:["Campo de treino e MDM","Plano semanal","Avaliação de desempenho","Mentalidade competitiva"],lessons:[["Defina um objetivo","Cada sessão deve ter uma habilidade principal."],["Registre indicadores","Acompanhe consistência, acertos, decisões e comunicação."],["Progrida com método","Aumente dificuldade quando a execução estiver consistente."]]}
];

/* ===== ESTADO DE TAREFAS (chaves estáveis) ===== */
let taskState={};try{taskState=JSON.parse(store.get('tksTasks2','{}'))||{}}catch(e){taskState={}}
const staticTasks=$$('.task');staticTasks.forEach((t,i)=>{t.dataset.k='s'+i;t.checked=!!taskState['s'+i]});
const totalTasks=()=>staticTasks.length+modules.reduce((a,m)=>a+m.lessons.length,0);
function updateProgress(){
  const done=Object.values(taskState).filter(Boolean).length,tot=totalTasks(),pct=tot?Math.min(100,Math.round(done/tot*100)):0;
  $('#progressFill').style.width=pct+'%';$('#progressText').textContent=pct+'% concluído';const pr=$('#progressRing');if(pr)pr.setAttribute('stroke-dashoffset',100-pct);const pp=$('#progressPct');if(pp)pp.textContent=pct+'%';
  store.set('tksTasks2',JSON.stringify(taskState));
  $$('.module').forEach((el,idx)=>{const i=+el.dataset.i,n=modules[i].lessons.length;let c=0;for(let j=0;j<n;j++)if(taskState['m'+i+'-'+j])c++;el.querySelector('.ring-fg').setAttribute('stroke-dashoffset',100-c/n*100);el.querySelector('.mod-pct').textContent=c+'/'+n;el.classList.toggle('done',c===n)});
  const tr=$('#trailRing');if(tr){const lv={};let D=0,T=0;modules.forEach((m,i)=>{const k=lv[m.lvl]=lv[m.lvl]||[0,0];m.lessons.forEach((_,j)=>{k[1]++;T++;if(taskState['m'+i+'-'+j]){k[0]++;D++}})});
    tr.setAttribute('stroke-dashoffset',100-(T?D/T*100:0));$('#trailPct').textContent=Math.round(T?D/T*100:0)+'%';$('#trailDone').textContent=D;
    $$('[data-lvl]').forEach(x=>{const v=lv[x.dataset.lvl];x.style.width=(v[0]/v[1]*100)+'%'});$$('[data-lvl-c]').forEach(x=>{const v=lv[x.dataset.lvlC];x.textContent=v[0]+'/'+v[1]})}
}
function bindTask(t){if(t.dataset.bound)return;t.dataset.bound='1';t.addEventListener('change',()=>{taskState[t.dataset.k]=t.checked;updateProgress()})}
staticTasks.forEach(bindTask);

const grid=$('#moduleGrid');
const LEVELS=["Iniciante","Intermediário","Avançado"];
const ringSVG='<svg class="ring" viewBox="0 0 36 36" aria-hidden="true"><circle class="ring-bg" cx="18" cy="18" r="15" pathLength="100"/><circle class="ring-fg" cx="18" cy="18" r="15" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg>';
function renderModules(filter=""){
  grid.innerHTML="";const f=filter.toLowerCase();
  LEVELS.forEach((lv,li)=>{
    const list=modules.map((m,i)=>[m,i]).filter(([m])=>m.lvl===lv&&(m.title.toLowerCase().includes(f)||m.desc.toLowerCase().includes(f)));
    if(!list.length)return;
    const total=modules.filter(m=>m.lvl===lv).length;
    const lane=document.createElement('div');lane.className='lane';
    lane.innerHTML=`<div class="lane-head"><b>${lv}</b><div class="lvl-meter" aria-hidden="true">${LEVELS.map((_,k)=>`<i class="${k<=li?'on':''}"></i>`).join('')}</div><span>${total} ${total>1?'módulos':'módulo'}</span></div><div class="lane-cards"></div>`;
    const cards=lane.querySelector('.lane-cards');
    list.forEach(([m,i])=>{
      const el=document.createElement('article');el.className='card glow module';el.dataset.i=i;
      el.innerHTML=`<div class="mod-top"><span class="mod-n">${String(i+1).padStart(2,'0')}</span><span class="mod-prog" title="Lições concluídas">${ringSVG}<span class="mod-pct">0/${m.lessons.length}</span></span></div><h3>${m.title}</h3><p>${m.desc}</p><ul>${m.items.map(x=>`<li>${x}</li>`).join('')}</ul><button class="btn btn-ghost" type="button" data-open="${i}">Acessar módulo</button>`;
      cards.appendChild(el)});
    if(li===0&&!f)cards.insertAdjacentHTML('beforeend',`<article class="trail-sum"><div class="ring-wrap">${ringSVG.replace('class="ring-fg"','class="ring-fg" id="trailRing"')}<em id="trailPct">0%</em></div><div class="ts-body"><h3>Sua trilha</h3><p class="ts-count"><b id="trailDone">0</b> de ${modules.reduce((a,m)=>a+m.lessons.length,0)} lições concluídas</p><div class="ts-levels">${LEVELS.map(l=>`<div><span>${l}</span><div class="ts-bar"><i data-lvl="${l}"></i></div><em data-lvl-c="${l}">0</em></div>`).join('')}</div><p class="hint">Abra um módulo e marque as lições que já fez. O progresso fica salvo neste navegador.</p></div></article>`);
    grid.appendChild(lane)});
  if(!grid.children.length)grid.innerHTML='<p class="muted">Nenhum módulo encontrado. Tente outro termo.</p>';
  updateProgress();bindGlow();
}
grid.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)openModule(+b.dataset.open)});
function openModule(i){
  const m=modules[i],box=$('#moduleLessons');box.style.display='block';
  box.innerHTML=`<div class="section-head" style="margin-top:0"><div><div class="eyebrow">MÓDULO ${String(i+1).padStart(2,'0')} · ${m.lvl.toUpperCase()}</div><h2>${m.title}</h2><p>${m.desc}</p></div><button class="btn secondary" id="closeMod">Fechar</button></div>`+
  m.lessons.map((l,j)=>`<div class="lesson"><label><input type="checkbox" class="task" data-k="m${i}-${j}"> <b>${j+1}. ${l[0]}</b></label><p>${l[1]}</p></div>`).join('')+
  `<div class="notice">Conclua as atividades no seu ritmo. O progresso é registrado neste navegador.</div>`;
  $('#closeMod').onclick=()=>{box.style.display='none'};
  box.querySelectorAll('.task').forEach(t=>{t.checked=!!taskState[t.dataset.k];bindTask(t)});
  box.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
}
$('#moduleSearch').addEventListener('input',e=>renderModules(e.target.value));

/* ===== SENSIBILIDADES (valores originais preservados) ===== */
const sets={
media:{camera:[["3ª pessoa sem mira",115],["1ª pessoa sem mira",115],["3ª pessoa",120],["1ª pessoa",120],["Ponto vermelho",40],["Mira 2x",16],["Mira 3x",15],["Mira 4x",15],["Mira 6x",15],["Mira 8x",15]],ads:[["3ª pessoa sem mira",115],["1ª pessoa sem mira",120],["3ª pessoa",120],["1ª pessoa",120],["Ponto vermelho",22],["Mira 2x",25],["Mira 3x",10],["Mira 4x",10],["Mira 6x",15],["Mira 8x",246]],gyro:[["3ª pessoa sem mira",330],["1ª pessoa sem mira",330],["3ª pessoa",330],["1ª pessoa",330],["Ponto vermelho",250],["Mira 2x",180],["Mira 3x",70],["Mira 4x",60],["Mira 6x",65],["Mira 8x",55]]},
alta:{camera:[["3ª pessoa sem mira",187],["1ª pessoa sem mira",187],["3ª pessoa",40],["1ª pessoa",40],["Ponto vermelho",24],["Mira 2x",36],["Mira 3x",15],["Mira 4x",10],["Mira 6x",6],["Mira 8x",8]],ads:[["3ª pessoa sem mira",187],["1ª pessoa sem mira",187],["3ª pessoa",40],["1ª pessoa",40],["Ponto vermelho",24],["Mira 2x",36],["Mira 3x",15],["Mira 4x",10],["Mira 6x",6],["Mira 8x",8]],gyro:[["3ª pessoa sem mira",345],["1ª pessoa sem mira",348],["3ª pessoa",348],["1ª pessoa",348],["Ponto vermelho",400],["Mira 2x",400],["Mira 3x",230],["Mira 4x",110],["Mira 6x",160],["Mira 8x",87]]},
geral:{camera:[["3ª pessoa sem mira",200],["1ª pessoa sem mira",200],["3ª pessoa",40],["1ª pessoa",40],["Ponto vermelho",50],["Mira 2x",50],["Mira 3x",13],["Mira 4x",10],["Mira 6x",7],["Mira 8x",5]],ads:[["Sensibilidade ao mirar","Desativado"]],gyro:[["3ª pessoa sem mira",330],["1ª pessoa sem mira",330],["3ª pessoa",30],["1ª pessoa",30],["Ponto vermelho",400],["Mira 2x",400],["Mira 3x",157],["Mira 4x",80],["Mira 6x",45],["Mira 8x",35]]}
};
const baseSets=JSON.parse(JSON.stringify(sets));
try{const sv=JSON.parse(store.get('tksSens','null'));if(sv)Object.assign(sets,sv)}catch(e){}
let currentSet='media';
function drawSens(){
  const s=sets[currentSet],names=new Map();
  ['camera','ads','gyro'].forEach(col=>s[col].forEach(x=>names.set(x[0],{...(names.get(x[0])||{}),[col]:x[1]})));
  const body=$('#sensTable');body.innerHTML='';
  const mx={};['camera','ads','gyro'].forEach(c=>{mx[c]=Math.max(1,...s[c].map(x=>typeof x[1]==='number'?x[1]:0))});
  const cell=(name,col,v)=>v===undefined?'—':(typeof v==='number'?`<div class="cellv"><input type="number" inputmode="numeric" value="${v}" data-name="${name}" data-col="${col}" data-max="${mx[col]}" aria-label="${name} ${col}"><span class="cbar" aria-hidden="true"><i style="width:${Math.min(100,v/mx[col]*100)}%"></i></span></div>`:`<span class="cell-off">${v}</span>`);
  names.forEach((v,k)=>body.insertAdjacentHTML('beforeend',`<tr><td>${k}</td><td>${cell(k,'camera',v.camera)}</td><td>${cell(k,'ads',v.ads)}</td><td>${cell(k,'gyro',v.gyro)}</td></tr>`));
}
$('#sensTable').addEventListener('input',e=>{const i=e.target;if(!i.dataset.col)return;const row=sets[currentSet][i.dataset.col].find(x=>x[0]===i.dataset.name);if(row){row[1]=i.value===''?0:Number(i.value);store.set('tksSens',JSON.stringify(sets))}const bar=i.parentNode.querySelector('.cbar i');if(bar)bar.style.width=Math.min(100,(Number(i.value)||0)/Number(i.dataset.max)*100)+'%';});
$$('#sensTabs .tab').forEach(b=>b.addEventListener('click',()=>{$$('#sensTabs .tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');currentSet=b.dataset.set;drawSens()}));
$('#resetSensitivity').addEventListener('click',()=>{const fresh=JSON.parse(JSON.stringify(baseSets));Object.keys(sets).forEach(k=>sets[k]=fresh[k]);store.del('tksSens');drawSens()});

/* ===== MDM ===== */
const codes=['12552145','3338417','5134737','12085084','17889183'];
$('#mdmCodes').innerHTML=codes.map((c,i)=>`<div class="code" style="--i:${i}"><code>${c}</code><button class="btn secondary" data-code="${c}">Copiar código</button></div>`).join('');
$('#mdmCodes').addEventListener('click',async e=>{const b=e.target.closest('[data-code]');if(!b)return;const c=b.dataset.code;try{await navigator.clipboard.writeText(c);b.textContent='Copiado!'}catch(err){b.textContent=c+' (selecione para copiar)'}setTimeout(()=>b.textContent='Copiar código',1600)});

/* ===== GLOSSÁRIO ===== */
const terms=[["ADS","Aim Down Sight: mirar pela mira da arma. Tem sensibilidade própria."],["IGL","In-Game Leader: quem organiza decisões e rotações do squad."],["Peek","Expor-se rapidamente para ver ou atirar e voltar à cobertura."],["Jiggle","Peek curto e repetido para tirar informação ou provocar tiros."],["Spray","Rajada contínua de tiros controlando o recuo."],["Recoil","Recuo da arma, vertical e horizontal, que desloca a mira."],["Rotação","Deslocamento planejado de uma posição a outra, geralmente seguindo a zona."],["Third party","Terceiro time que ataca quem já está em combate."],["Push","Avançar sobre o inimigo de forma agressiva."],["Entry","Jogador que inicia o espaço e abre o combate."],["Scout","Jogador focado em coletar informação sobre inimigos."],["Cover","Cobertura: qualquer objeto ou terreno que bloqueia tiros."],["Knock","Inimigo derrubado, mas ainda vivo e reanimável."],["Hot drop","Cair em área muito disputada para combate imediato."],["Giroscópio","Sensor que move a mira ao inclinar o aparelho."],["TTK","Time to kill: tempo necessário para eliminar um alvo."],["Zona","Círculo seguro que se reduz ao longo da partida."],["MDM / TDM","Salas de treino de combate em equipe usadas para praticar duelos."]];
function drawGloss(f=""){f=f.toLowerCase();$('#gloss').innerHTML=terms.filter(t=>t[0].toLowerCase().includes(f)||t[1].toLowerCase().includes(f)).map(t=>`<div class="term"><b>${t[0]}</b><p>${t[1]}</p></div>`).join('')||'<p class="muted">Nenhum termo encontrado.</p>'}
$('#glossSearch').addEventListener('input',e=>drawGloss(e.target.value));drawGloss();

/* ===== DIÁRIO ===== */
$('#saveNotes').addEventListener('click',()=>{store.set('tksNotes',$('#trainNotes').value);store.set('tksDate',$('#trainDate').value);$('#saveStatus').textContent='Anotações guardadas neste navegador.'});
$('#trainNotes').value=store.get('tksNotes','');$('#trainDate').value=store.get('tksDate','');

/* ===== EFEITOS ===== */
// Efeito de brilho que segue o cursor nos cards
function bindGlow(){$$('.glow').forEach(el=>{if(el.dataset.gl)return;el.dataset.gl='1';el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px')})})}
// Revelação ao rolar
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.12});
function observeAll(){$$('.reveal,.stagger').forEach(el=>{el.querySelectorAll(':scope>*').forEach((c,i)=>c.style.setProperty('--i',i));io.observe(el)})}
// Contadores animados
const cio=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;cio.unobserve(en.target);const b=en.target.querySelector('b'),end=+b.dataset.count;if(reduce){b.textContent=end+'+';return}const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/1400),v=Math.round(end*(1-Math.pow(1-p,3)));b.textContent=v+(p===1?'+':'');if(p<1)requestAnimationFrame(f)})(t0)}),{threshold:.5});
$$('#stats .stat').forEach(s=>cio.observe(s));
// Barra de rolagem + botão topo
const toTop=$('#toTop');
addEventListener('scroll',()=>{const h=document.documentElement,p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);$('#scrollbar').style.width=(p*100)+'%';toTop.classList.toggle('show',h.scrollTop>600)},{passive:true});
toTop.addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}));
// Menu lateral ativo conforme a seção visível
const links=$$('#sideNav a'),secs=links.map(a=>$(a.getAttribute('href'))).filter(Boolean);
const so=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+en.target.id))}}),{rootMargin:'-35% 0px -55% 0px'});
secs.forEach(s=>so.observe(s));
// Destaque do dia atual no plano semanal (segunda = dia 1)
(function(){const d=(new Date().getDay()+6)%7;const el=$$('#days .day')[d];if(el)el.classList.add('today')})();


$('#year').textContent=new Date().getFullYear();
renderModules();drawSens();bindGlow();observeAll();updateProgress();

const LOGO="data:image/webp;base64,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";
/* ===== TKS ACADEMY · EXTENSÕES ===== */
const g=id=>document.getElementById(id);
const hEsc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const todayISO=()=>new Date().toLocaleDateString("en-CA");
async function copyText(text,btn,area){
  const old=btn.textContent;
  try{await navigator.clipboard.writeText(text);btn.textContent="Copiado!"}
  catch(e){if(area){area.value=text;area.hidden=false;area.focus();area.select()}btn.textContent="Selecione e copie"}
  setTimeout(()=>{btn.textContent=old},1800);
}
function confirmInline(btn,msg,yes){
  if(btn.nextElementSibling&&btn.nextElementSibling.classList.contains("cf"))return;
  const box=document.createElement("span");box.className="cf";
  box.innerHTML=`<span>${hEsc(msg)}</span><button type="button" class="chipbtn" data-y>Sim</button><button type="button" class="chipbtn" data-n>Cancelar</button>`;
  btn.hidden=true;btn.after(box);
  const close=()=>{box.remove();btn.hidden=false};
  box.querySelector("[data-y]").onclick=()=>{close();yes()};
  box.querySelector("[data-n]").onclick=close;
  box.querySelector("[data-y]").focus();
}

/* ----- logo em todos os pontos ----- */
document.querySelectorAll("img[data-logo]").forEach(i=>{i.src=LOGO});
(function(){const l=document.createElement("link");l.rel="icon";l.href=LOGO;document.head.appendChild(l)})();

/* ----- menu móvel ----- */
(function(){
  const b=g("menuBtn"),a=document.querySelector("aside");if(!b||!a)return;
  b.addEventListener("click",()=>{const o=a.classList.toggle("open");b.setAttribute("aria-expanded",o)});
  a.querySelectorAll("nav a").forEach(l=>l.addEventListener("click",()=>{a.classList.remove("open");b.setAttribute("aria-expanded","false")}));
})();

/* ----- simulador de recuo ----- */
(function(){
  const cv=g("recoilCv");if(!cv)return;
  const c=cv.getContext("2d"),W=cv.width,H=cv.height;
  const sh=g("rcShots"),cp=g("rcComp"),nz=g("rcNoise");
  const rnd=(a,b)=>a+Math.random()*(b-a);
  function run(){
    const n=+sh.value,comp=+cp.value/100,noise=+nz.value/100;
    g("rcShotsL").textContent=n;g("rcCompL").textContent=Math.round(comp*100)+"%";g("rcNoiseL").textContent=Math.round(noise*100)+"%";
    let v=0;const pts=[];
    for(let i=0;i<n;i++){v+=rnd(.5,1.5)-comp*1.0;pts.push({x:rnd(-1,1)*(.3+noise*1.7),y:v})}
    const sx=W/9,sy=H*.78/45,ox=W/2,oy=H*.86;
    c.clearRect(0,0,W,H);c.fillStyle="#0a0e14";c.fillRect(0,0,W,H);
    c.strokeStyle="#252d3a";c.lineWidth=1;
    for(let i=1;i<10;i++){c.beginPath();c.moveTo(i*W/10,0);c.lineTo(i*W/10,H);c.stroke()}
    for(let i=1;i<8;i++){c.beginPath();c.moveTo(0,i*H/8);c.lineTo(W,i*H/8);c.stroke()}
    c.strokeStyle="#697586";c.setLineDash([6,6]);
    [1,2.5].forEach(r=>{c.beginPath();c.arc(ox,oy,r*sx,0,6.2832);c.stroke()});c.setLineDash([]);
    c.strokeStyle="#f4f5f7";c.lineWidth=2;c.beginPath();c.moveTo(ox-14,oy);c.lineTo(ox+14,oy);c.moveTo(ox,oy-14);c.lineTo(ox,oy+14);c.stroke();
    c.lineWidth=2;c.strokeStyle="#ff304877";c.beginPath();
    pts.forEach((p,i)=>{const X=ox+p.x*sx,Y=oy-p.y*sy;i?c.lineTo(X,Y):c.moveTo(X,Y)});c.stroke();
    pts.forEach((p,i)=>{const f=n>1?i/(n-1):0;c.fillStyle=`rgb(${255},${Math.round(48+f*141)},${Math.round(72+f*10)})`;c.beginPath();c.arc(ox+p.x*sx,oy-p.y*sy,6,0,6.2832);c.fill()});
    c.fillStyle="#a8b0bd";c.font="600 20px 'JetBrains Mono',monospace";c.fillText("↑ recuo vertical",14,28);c.textAlign="right";c.fillText("recuo horizontal →",W-14,H-14);c.textAlign="left";
    const ys=pts.map(p=>p.y),xs=pts.map(p=>p.x);
    g("rcH").textContent=(Math.max(...ys)-Math.min(...ys)).toFixed(1);
    g("rcW").textContent=(Math.max(...xs)-Math.min(...xs)).toFixed(1);
    g("rcMsg").textContent=comp<.35?"Sem compensação, a mira sobe a cada tiro e o spray se espalha para cima.":comp<.85?"A compensação segura parte da subida. O que sobra é o recuo que você ainda precisa corrigir.":"Compensação alta: o spray fica concentrado. Agora a instabilidade lateral é o que abre o agrupamento.";
  }
  [sh,cp,nz].forEach(i=>i.addEventListener("input",run));g("rcGo").addEventListener("click",run);run();
})();

/* ----- demonstração de FPS ----- */
(function(){
  const rows=[...document.querySelectorAll("#fpsDemo .fps-row")];if(!rows.length)return;
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let vis=true;const box=g("fpsDemo");
  if("IntersectionObserver" in window)new IntersectionObserver(es=>{vis=es[0].isIntersecting}).observe(box);
  function loop(now){
    if(vis&&!document.hidden)rows.forEach(r=>{
      const fps=+r.dataset.fps,tq=Math.floor(now/1000*fps)/fps*1000,p=(tq%2400)/2400,tri=p<.5?p*2:(2-p*2);
      r.querySelector(".fps-dot").style.left=(5+tri*90)+"%";
    });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ----- laboratório de sensibilidade ----- */
(function(){
  if(!g("slTable"))return;
  const scopes=["TPP sem mira","FPP sem mira","Red Dot / Holo","Mira 2x","Mira 3x","Mira 4x / VSS","Mira 6x","Mira 8x"];
  const base={camera:[130,120,55,42,32,25,16,12],ads:[115,105,50,38,28,22,14,10],gyro:[300,300,300,280,240,210,100,75],free:[120,110,60,45,35,25,15,10]};
  const labels={camera:"CÂMERA",ads:"ADS",gyro:"GIROSCÓPIO",free:"CÂMERA LIVRE"};
  let cur="camera",vals={};
  function build(){
    const style=g("slStyle").value,gyro=g("slGyro").value,dev=g("slDevice").value,fin=g("slFingers").value;
    const sm=style==="rush"?1.16:style==="spray"?.88:1,dm=dev==="Tablet"?.9:1,fm=fin==="2 dedos"?.92:fin==="5 ou mais dedos"?1.05:1;
    vals={};
    Object.keys(base).forEach(k=>{vals[k]=base[k].map((v,i)=>{
      if(k==="gyro"&&gyro==="off")return 0;
      let m=k==="gyro"?(gyro==="ads"?(i<2?0:1):1):sm*dm*fm;
      if(k==="ads"&&style==="rush"&&i<3)m*=1.04;
      if(k==="camera"&&style==="spray"&&i>3)m*=.96;
      return Math.max(0,Math.min(300,Math.round(v*m)));
    })});
  }
  function render(){
    const arr=vals[cur];
    g("slTable").innerHTML=`<table><thead><tr><th>Mira</th><th>Valor</th></tr></thead><tbody>${scopes.map((s,i)=>`<tr><td>${s}</td><td><div class="valbox"><input class="rng" type="range" min="0" max="300" value="${arr[i]}" data-i="${i}" aria-label="${s}"><output>${arr[i]}</output></div></td></tr>`).join("")}</tbody></table>`;
    g("slTabs").querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===cur));
  }
  function generate(){
    build();
    const st=g("slStyle").value,gy=g("slGyro").value;
    g("slProfile").textContent=st==="rush"?"Rush / capa":st==="spray"?"Spray longe":"Equilibrado";
    g("slGyroStat").textContent=gy==="on"?"Ligado":gy==="ads"?"ADS":"Desligado";
    render();
  }
  g("slTable").addEventListener("input",e=>{const i=e.target;if(i.dataset.i===undefined)return;const v=+i.value;vals[cur][+i.dataset.i]=v;i.nextElementSibling.textContent=v});
  g("slTabs").addEventListener("click",e=>{const b=e.target.closest(".tab");if(!b)return;cur=b.dataset.tab;render()});
  g("slGenerate").addEventListener("click",generate);g("slReset").addEventListener("click",generate);
  g("slCopy").addEventListener("click",e=>{
    let o="PUBG MOBILE — MINHA CONFIGURAÇÃO\n";
    Object.keys(vals).forEach(k=>{o+="\n"+labels[k]+"\n";scopes.forEach((s,i)=>{o+=s+": "+vals[k][i]+"\n"})});
    copyText(o,e.currentTarget,g("slArea"));
  });
  generate();
})();

/* ----- teste profissional ----- */
(function(){
  if(!g("tpP"))return;
  let log=[];
  function paint(){
    const n=log.length,p=log.filter(x=>x==="p").length,m=log.filter(x=>x==="m").length,r=log.filter(x=>x==="r").length;
    g("tpBp").style.width=p/20*100+"%";g("tpBm").style.width=m/20*100+"%";g("tpBr").style.width=r/20*100+"%";
    g("tpCount").textContent=`${n} de 20 sprays registrados · ${p} perfeitos, ${m} médios, ${r} ruins`;
    const v=g("tpVerdict");v.className="verdict";
    if(n<20){v.textContent=n?`Faltam ${20-n} sprays para fechar o teste.`:"Registre os resultados para ver a avaliação."}
    else{const pct=Math.round(p/20*100);
      if(pct<70){v.classList.add("warn");v.textContent=`${pct}% de sprays perfeitos. Menos de 70%: você ainda não encontrou a sua sensibilidade. Ajuste um valor por vez e repita o teste.`}
      else{v.classList.add("good");v.textContent=`${pct}% de sprays perfeitos. Acima de 70%: base sólida. Valide agora em outras distâncias e com outras miras.`}}
    [g("tpP"),g("tpM"),g("tpR")].forEach(b=>b.disabled=n>=20);
  }
  const add=k=>()=>{if(log.length<20){log.push(k);paint()}};
  g("tpP").onclick=add("p");g("tpM").onclick=add("m");g("tpR").onclick=add("r");
  g("tpUndo").onclick=()=>{log.pop();paint()};g("tpReset").onclick=()=>{log=[];paint()};
  paint();
})();

/* ----- níveis de evolução ----- */
(function(){
  const box=g("levels");if(!box)return;
  const names=["20 metros","30 metros","50 metros","100 metros","150 metros","200 metros ou mais"];
  let cur=-1;try{cur=+store.get("tksLevel","-1")}catch(e){}
  function paint(){
    box.querySelectorAll(".lvl").forEach(b=>{const i=+b.dataset.i;b.classList.toggle("done",i<=cur);b.classList.toggle("now",i===cur)});
    g("lvlMsg").textContent=cur<0?"Nenhum nível marcado ainda.":"Você controla o spray até "+names[cur]+(cur<5?". Próximo objetivo: "+names[cur+1]+".":". Mantenha a consistência.");
  }
  box.addEventListener("click",e=>{const b=e.target.closest(".lvl");if(!b)return;const i=+b.dataset.i;cur=cur===i?-1:i;store.set("tksLevel",String(cur));paint()});
  paint();
})();

/* ----- checklist final ----- */
(function(){
  const box=g("ckBox");if(!box)return;
  const qs=[...box.querySelectorAll("input[data-q]")],v=g("ckVerdict");
  function paint(){
    const no=qs.filter(q=>!q.checked);v.className="verdict";
    if(!qs.some(q=>q.checked)){v.textContent="Marque as respostas “sim” para ver a avaliação.";return}
    if(!no.length){v.classList.add("good");v.textContent="Tudo certo. Você pode ajustar a sensibilidade com segurança: mude um valor por vez e registre o resultado.";return}
    v.classList.add("warn");v.innerHTML="Resolva antes de mudar a sensibilidade:<ul style='margin:6px 0 0;padding-left:18px'>"+no.map(q=>"<li>"+hEsc(q.dataset.q)+"</li>").join("")+"</ul>";
  }
  qs.forEach(q=>q.addEventListener("change",paint));paint();
})();

/* ----- construtor de HUD ----- */
(function(){
  const game=g("hbGame");if(!game)return;
  const catalog={
    hbCombat:["ATIRAR","ATIRAR ESQ.","MIRAR","OLHO","MIRA LIVRE","PULAR","AGACHAR","DEITAR","LEAN ESQ.","LEAN DIR.","RECARREGAR","TROCAR ARMA","ARMA 1","ARMA 2","PISTOLA","CORPO A CORPO","GRANADA","SMOKE","MOLOTOV","GRANADA ATORD.","CANCELAR GRANADA","ABRIR MIRA","FECHAR MIRA","MARCAR INIMIGO"],
    hbMovement:["JOYSTICK","CORRER","ANDAR","PULAR","AGACHAR","DEITAR","NADAR","MERGULHAR","SUBIR","ESCALAR","INTERAGIR","ABRIR PORTA","FECHAR PORTA","PEGAR ITEM","MARCAR LOCAL","PING"],
    hbWeapons:["RECARREGAR","ARMA 1","ARMA 2","PISTOLA","CORPO A CORPO","MOCHILA","INVENTÁRIO","CURAR","KIT MÉDICO","BANDAGEM","ENERGÉTICO","ANALGÉSICO","MUNIÇÃO","MODO DE TIRO","INSPECIONAR"],
    hbOther:["DIRIGIR","FREIO","ACELERAR","SAIR VEÍCULO","TROCAR ASSENTO","BUZINA","MAPA","CONFIGURAÇÕES","CHAT","MICROFONE","ÁUDIO","EMOTES","MARCADOR","CANCELAR","USAR ITEM"]
  };
  const defaults=[["JOYSTICK",12,72],["ATIRAR",89,28],["ATIRAR ESQ.",10,25],["MIRAR",78,34],["OLHO",65,20],["PULAR",88,62],["AGACHAR",79,69],["DEITAR",69,77],["LEAN ESQ.",73,49],["LEAN DIR.",82,49],["RECARREGAR",63,43],["ARMA 1",88,83],["ARMA 2",78,83],["GRANADA",58,83],["MOCHILA",95,82],["CORRER",25,52]];
  const presets={
    classic:{"ATIRAR":[88,28],"MIRAR":[78,35],"PULAR":[88,62],"AGACHAR":[78,69]},
    rush:{"ATIRAR":[88,25],"ATIRAR ESQ.":[12,25],"PULAR":[87,58],"AGACHAR":[77,63],"LEAN ESQ.":[68,47],"LEAN DIR.":[78,47]},
    claw3:{"ATIRAR":[88,25],"MIRAR":[78,35],"ATIRAR ESQ.":[12,25],"PULAR":[88,61]},
    claw4:{"ATIRAR":[89,23],"ATIRAR ESQ.":[12,24],"MIRAR":[78,34],"PULAR":[88,60],"AGACHAR":[78,66],"LEAN ESQ.":[68,45],"LEAN DIR.":[79,45]},
    claw5:{"ATIRAR":[88,22],"ATIRAR ESQ.":[12,22],"MIRAR":[78,34],"PULAR":[88,58],"AGACHAR":[78,65],"LEAN ESQ.":[67,44],"LEAN DIR.":[78,44],"OLHO":[64,20]},
    sniper:{"MIRAR":[84,35],"ATIRAR":[90,28],"OLHO":[68,20],"RECARREGAR":[70,48]},
    spray:{"ATIRAR":[88,24],"ATIRAR ESQ.":[12,24],"MIRAR":[78,35],"AGACHAR":[80,66],"LEAN ESQ.":[68,45],"LEAN DIR.":[78,45]},
    tablet:{"ATIRAR":[91,25],"ATIRAR ESQ.":[9,25],"MIRAR":[82,35],"PULAR":[91,62]},
    left:{"ATIRAR ESQ.":[12,25],"ATIRAR":[89,32],"MIRAR":[79,40],"PULAR":[89,62]}
  };
  const sizeI=g("hbSize"),opI=g("hbOpacity"),rotI=g("hbRot"),status=g("hbStatus");
  let selected=null;
  const all=()=>[...game.querySelectorAll(".hb-btn")];
  function look(b){
    b.style.width=b.dataset.size+"px";b.style.height=b.dataset.size+"px";
    b.style.background=`rgba(16,24,32,${Number(b.dataset.opacity)/100})`;
    b.style.transform=`translate(-50%,-50%) rotate(${b.dataset.rotation}deg)`;
  }
  function create(label,x=50,y=50,s={}){
    const b=document.createElement("button");b.type="button";b.className="hb-btn";b.textContent=label;
    b.dataset.label=label;b.dataset.x=x;b.dataset.y=y;
    b.dataset.size=s.size||54;b.dataset.opacity=s.opacity||60;b.dataset.rotation=s.rotation||0;
    b.style.left=x+"%";b.style.top=y+"%";game.appendChild(b);look(b);drag(b);
    b.addEventListener("click",()=>select(b));refresh();return b;
  }
  function drag(b){
    let on=false;
    b.addEventListener("pointerdown",e=>{on=true;select(b);try{b.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});
    b.addEventListener("pointermove",e=>{
      if(!on)return;const r=game.getBoundingClientRect();
      const x=Math.max(2,Math.min(98,(e.clientX-r.left)/r.width*100)),y=Math.max(5,Math.min(95,(e.clientY-r.top)/r.height*100));
      b.dataset.x=x.toFixed(2);b.dataset.y=y.toFixed(2);b.style.left=x+"%";b.style.top=y+"%";
    });
    const stop=()=>{on=false};b.addEventListener("pointerup",stop);b.addEventListener("pointercancel",stop);
  }
  function labels(){g("hbSizeL").textContent=sizeI.value+" px";g("hbOpacityL").textContent=opI.value+"%";g("hbRotL").textContent=rotI.value+"°"}
  function select(b){
    if(selected)selected.classList.remove("selected");
    selected=b;b.classList.add("selected");
    g("hbName").value=b.dataset.label;sizeI.value=b.dataset.size;opI.value=b.dataset.opacity;rotI.value=b.dataset.rotation;labels();
    status.textContent="Editando: "+b.dataset.label;
  }
  function refresh(){
    const bs=all();g("hbCount").textContent=bs.length;g("hbFingerStat").textContent=g("hbFingers").value;
    const list=g("hbActive");list.innerHTML="";
    bs.forEach(b=>{const i=document.createElement("button");i.type="button";i.className="chipbtn";i.textContent=b.dataset.label;i.addEventListener("click",()=>select(b));list.appendChild(i)});
  }
  function clear(){all().forEach(b=>b.remove());selected=null}
  function loadDefaults(){clear();defaults.forEach(([l,x,y])=>create(l,x,y));g("hbPresetStat").textContent="Claw 4";refresh()}
  function applyPreset(){
    const p=presets[g("hbPreset").value];if(!p)return;
    const tablet=g("hbDevice").value==="tablet";
    clear();
    const used=new Set(defaults.map(d=>d[0]));Object.keys(p).forEach(k=>used.add(k));
    used.forEach(l=>{
      const o=defaults.find(d=>d[0]===l);let x=o?o[1]:50,y=o?o[2]:50;
      if(p[l])[x,y]=p[l];
      if(tablet)x=x<50?x*.92:100-(100-x)*.92;
      create(l,x,y);
    });
    g("hbPresetStat").textContent=g("hbPreset").selectedOptions[0].text;
    status.textContent="Modelo aplicado. Ajuste as posições conforme a sua preferência.";refresh();
  }
  Object.entries(catalog).forEach(([id,items])=>{
    const box=g(id);
    items.forEach(label=>{
      const b=document.createElement("button");b.type="button";b.className="chipbtn";b.textContent=label;
      b.addEventListener("click",()=>{
        const ex=all().find(x=>x.dataset.label===label);
        if(ex){select(ex);status.textContent="Esse botão já está no layout.";return}
        select(create(label,50,50));
      });
      box.appendChild(b);
    });
  });
  g("hbApply").addEventListener("click",applyPreset);
  g("hbFingers").addEventListener("change",refresh);
  [sizeI,opI,rotI].forEach(i=>i.addEventListener("input",()=>{labels();if(!selected)return;selected.dataset.size=sizeI.value;selected.dataset.opacity=opI.value;selected.dataset.rotation=rotI.value;look(selected)}));
  g("hbSave").addEventListener("click",()=>{
    if(!selected){status.textContent="Selecione um botão primeiro.";return}
    const n=g("hbName").value.trim().toUpperCase();if(n){selected.dataset.label=n;selected.textContent=n}
    refresh();status.textContent="Nome salvo.";
  });
  g("hbDup").addEventListener("click",()=>{
    if(!selected){status.textContent="Selecione um botão primeiro.";return}
    const c=create(selected.dataset.label+" 2",Math.min(95,+selected.dataset.x+5),Math.min(90,+selected.dataset.y+5),{size:selected.dataset.size,opacity:selected.dataset.opacity,rotation:selected.dataset.rotation});
    select(c);
  });
  g("hbDel").addEventListener("click",()=>{if(!selected)return;selected.remove();selected=null;g("hbName").value="";status.textContent="Botão excluído.";refresh()});
  g("hbShowAll").addEventListener("click",()=>all().forEach(b=>b.classList.remove("off")));
  g("hbHideAll").addEventListener("click",()=>all().forEach(b=>b.classList.add("off")));
  g("hbResetPos").addEventListener("click",loadDefaults);
  function data(){return{device:g("hbDevice").value,fingers:g("hbFingers").value,preset:g("hbPreset").value,buttons:all().map(b=>({label:b.dataset.label,x:+b.dataset.x,y:+b.dataset.y,size:+b.dataset.size,opacity:+b.dataset.opacity,rotation:+b.dataset.rotation}))}}
  g("hbExport").addEventListener("click",e=>copyText(JSON.stringify(data(),null,2),e.currentTarget,g("hbArea")));
  g("hbImport").addEventListener("click",()=>{
    const a=g("hbArea");
    if(a.hidden){a.hidden=false;a.value="";a.focus();status.textContent="Cole o JSON no campo e toque em “Carregar JSON” de novo.";return}
    try{
      const d=JSON.parse(a.value);if(!Array.isArray(d.buttons))throw new Error("inválido");
      clear();
      if(d.device)g("hbDevice").value=d.device;if(d.fingers)g("hbFingers").value=d.fingers;if(d.preset&&presets[d.preset])g("hbPreset").value=d.preset;
      d.buttons.forEach(b=>create(String(b.label||"BOTÃO"),Number(b.x)||50,Number(b.y)||50,b));
      refresh();status.textContent="HUD carregado com sucesso.";
    }catch(err){status.textContent="Não foi possível ler esse JSON. Confira se ele veio do botão “Gerar e copiar JSON”."}
  });
  loadDefaults();
})();

/* ----- painel competitivo ----- */
(function(){
  if(!g("pcForm"))return;
  const KEY="tksPainelV1";
  const routine=[["10 min","Aquecimento","Movimentação, troca de alvos e precisão."],["15 min","Treino mecânico","Recoil, rastreamento e giroscópio."],["10 min","Treino situacional","Combate próximo, pré-mira e cobertura."],["20 min","Partida em Squad","Posicionamento, decisões e comunicação."],["5 min","Análise","Um acerto, um erro e uma ação de melhoria."]];
  const goalDefs=[["Treino mecânico","Treinar mira e recoil.",5],["Comunicação","Fazer chamadas úteis e objetivas.",4],["Decisões","Rever uma decisão ruim por sessão.",5],["Disciplina","Não mudar a sensibilidade por uma partida ruim.",5],["Trabalho em equipe","Não se afastar do Squad sem motivo tático.",4]];
  const fresh=()=>({routineDate:todayISO(),routine:[0,0,0,0,0].map(()=>false),days:[],matches:[],goals:goalDefs.map(()=>Array(7).fill(false)),review:{before:"",during:"",next:""}});
  let d;try{d=JSON.parse(store.get(KEY,"null"))||fresh()}catch(e){d=fresh()}
  if(!Array.isArray(d.goals)||!Array.isArray(d.goals[0]))d.goals=goalDefs.map(()=>Array(7).fill(false));
  function save(){store.set(KEY,JSON.stringify(d));render()}
  function render(){
    if(d.routineDate!==todayISO()){d.routineDate=todayISO();d.routine=routine.map(()=>false)}
    // rotina
    g("pcRoutine").innerHTML=routine.map((r,i)=>`<label class="pc-task"><input type="checkbox" data-r="${i}" ${d.routine[i]?"checked":""}><span><b>${r[0]} · ${r[1]}</b><small>${r[2]}</small></span></label>`).join("");
    const rc=d.routine.filter(Boolean).length;g("pcRoutineBar").style.width=rc/routine.length*100+"%";g("pcRoutineText").textContent=`${rc} de ${routine.length} atividades concluídas`;
    // 30 dias
    g("pcMonth").innerHTML=Array.from({length:30},(_,i)=>`<label class="pc-day"><span>${i+1}</span><input type="checkbox" data-d="${i+1}" ${d.days.includes(i+1)?"checked":""} aria-label="Dia ${i+1}"></label>`).join("");
    g("pcMonthBar").style.width=d.days.length/30*100+"%";g("pcMonthText").textContent=`${d.days.length} de 30 dias concluídos`;g("pcDays").textContent=d.days.length+"/30";
    // metas
    g("pcGoals").innerHTML=goalDefs.map((gd,i)=>{const n=d.goals[i].filter(Boolean).length;return `<div class="pc-goal"><b>${gd[0]}</b><p>${gd[1]} ${n}/7 dias · meta: ${gd[2]} dias</p><div class="pc-week">${d.goals[i].map((v,j)=>`<label class="pc-day"><span>${["S","T","Q","Q","S","S","D"][j]}</span><input type="checkbox" data-g="${i}" data-j="${j}" ${v?"checked":""} aria-label="${gd[0]}, dia ${j+1}"></label>`).join("")}</div></div>`}).join("");
    // partidas
    const m=d.matches,sum=k=>m.reduce((t,x)=>t+(Number(x[k])||0),0),kills=sum("kills"),deaths=sum("deaths"),dmg=sum("damage");
    g("pcMatches").textContent=m.length;g("pcKills").textContent=kills;g("pcKD").textContent=(deaths?kills/deaths:kills).toFixed(2);
    g("pcAvgK").textContent=(m.length?kills/m.length:0).toFixed(1);g("pcAvgD").textContent=Math.round(m.length?dmg/m.length:0);
    const errs={};m.forEach(x=>{errs[x.mainError]=(errs[x.mainError]||0)+1});const top=Object.entries(errs).sort((a,b)=>b[1]-a[1])[0];
    g("pcTopErr").textContent=top?top[0]:"—";
    g("pcCalm").textContent=(m.length?Math.round(m.filter(x=>x.emotion==="Mantive a calma").length/m.length*100):0)+"%";
    g("pcHistory").innerHTML=m.length?m.slice().reverse().slice(0,6).map(x=>`<div class="pc-rec"><b>${hEsc(x.date)}${x.placement?" · "+hEsc(x.placement)+"º lugar":""}</b><p>Eliminações: ${hEsc(x.kills)} · Dano: ${hEsc(x.damage||0)} · Sobrevivência: ${hEsc(x.survival||"—")} min</p><p>Erro: ${hEsc(x.mainError)} · ${hEsc(x.emotion)}</p>${x.lesson?`<p>Próxima melhoria: ${hEsc(x.lesson)}</p>`:""}</div>`).join(""):'<p class="muted">Ainda não há partidas registradas.</p>';if(window.tksPcChart)window.tksPcChart(m);
    g("pcBefore").value=d.review.before||"";g("pcDuring").value=d.review.during||"";g("pcNext").value=d.review.next||"";
  }
  g("pcRoutine").addEventListener("change",e=>{const i=e.target.dataset.r;if(i===undefined)return;d.routine[+i]=e.target.checked;save()});
  g("pcMonth").addEventListener("change",e=>{const n=e.target.dataset.d;if(!n)return;const k=+n;d.days=e.target.checked?[...new Set([...d.days,k])]:d.days.filter(x=>x!==k);save()});
  g("pcGoals").addEventListener("change",e=>{const i=e.target.dataset.g;if(i===undefined)return;d.goals[+i][+e.target.dataset.j]=e.target.checked;save()});
  g("pcFinish").addEventListener("click",()=>{const n=Array.from({length:30},(_,i)=>i+1).find(x=>!d.days.includes(x));if(n)d.days.push(n);save()});
  g("pcRoutineReset").addEventListener("click",()=>{d.routine=routine.map(()=>false);save()});
  g("pcGoalsReset").addEventListener("click",e=>confirmInline(e.currentTarget,"Reiniciar as metas?",()=>{d.goals=goalDefs.map(()=>Array(7).fill(false));save()}));
  g("pcClear").addEventListener("click",e=>confirmInline(e.currentTarget,"Apagar todas as partidas?",()=>{d.matches=[];save()}));
  g("pcForm").addEventListener("submit",e=>{
    e.preventDefault();
    d.matches.push({date:g("pcDate").value,placement:g("pcPlace").value,kills:+g("pcK").value,deaths:+g("pcD").value,damage:+(g("pcDmg").value||0),survival:g("pcSurv").value,mainError:g("pcErr").value,emotion:g("pcEmo").value,lesson:g("pcLesson").value.trim()});
    save();["pcLesson","pcDmg","pcSurv","pcPlace"].forEach(i=>{g(i).value=""});
  });
  g("pcSaveReview").addEventListener("click",()=>{d.review={before:g("pcBefore").value,during:g("pcDuring").value,next:g("pcNext").value};store.set(KEY,JSON.stringify(d));g("pcReviewMsg").textContent="Revisão salva neste navegador."});
  g("pcExport").addEventListener("click",e=>copyText(JSON.stringify(d,null,2),e.currentTarget,g("pcArea")));
  g("pcDate").value=todayISO();
  render();
})();
