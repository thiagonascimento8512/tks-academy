/* ===== TKS ACADEMY · navegação por capítulos, numeração e interações ===== */
(function(){
  const CH=[
    {n:1,name:"Aprender",ids:["comecar","fundamentos","modulos","mapas","armas","acessorios"]},
    {n:2,name:"Mecânica",ids:["recoil","spray","sens-conceitos","sensibilidade","lab","diagnostico","hardware","hud","hudlab"]},
    {n:3,name:"Jogo",ids:["combate","utilitarios","equipamento","veiculos","mdm"]},
    {n:4,name:"Evolução",ids:["metodo","treino","plano","mentalidade","painel","erros","checklist"]},
    {n:5,name:"Referência",ids:["glossario","faq","videos","compromisso"]}
  ];
  const secCh={inicio:CH[0]},secTitle={inicio:"Início"};
  const plain=h=>[...h.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join("").trim();

  /* numeração 1.1, 1.2… nos títulos das seções */
  CH.forEach(c=>c.ids.forEach((id,i)=>{
    secCh[id]=c;
    const s=document.getElementById(id),h=s&&s.querySelector(":scope>.section-head h2");
    if(!h)return;
    secTitle[id]=plain(h);
    if(!h.querySelector(".sec-num")){const n=document.createElement("span");n.className="sec-num";n.textContent=c.n+"."+(i+1);h.prepend(n)}
  }));

  /* grupos recolhíveis da barra lateral */
  const groups=[...document.querySelectorAll("#sideNav .nav-group")];
  function setOpen(g,o){
    g.classList.toggle("open",o);
    g.querySelector(".nav-head").setAttribute("aria-expanded",String(o));
    const l=g.querySelector(".nav-links");o?l.removeAttribute("inert"):l.setAttribute("inert","");
  }
  groups.forEach(g=>g.querySelector(".nav-head").addEventListener("click",()=>setOpen(g,!g.classList.contains("open"))));

  /* capítulo atual → abre o grupo e atualiza o caminho na topbar */
  const crumbCh=document.getElementById("crumbCh"),crumbSec=document.getElementById("crumbSec");
  let cur=null;
  function show(id){
    const c=secCh[id];if(!c)return;
    if(crumbCh){if(id==="inicio"){crumbCh.textContent="TKS Academy";crumbSec.textContent="Início"}else{crumbCh.textContent=c.name;crumbSec.textContent=secTitle[id]||c.name}}
    if(c!==cur){cur=c;groups.forEach(g=>setOpen(g,+g.dataset.ch===c.n))}
  }
  CH.forEach(c=>{const h=document.getElementById("cap-"+c.n);if(h){secCh[h.id]=c;secTitle[h.id]="Capítulo "+c.n}});
  const targets=Object.keys(secCh).map(id=>document.getElementById(id)).filter(Boolean);
  if("IntersectionObserver" in window){
    const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting)show(en.target.id)}),{rootMargin:"-35% 0px -55% 0px"});
    targets.forEach(t=>io.observe(t));
  }

  /* cartões de mapa: inclinação 3D que acompanha o cursor */
  const fine=matchMedia("(hover:hover) and (pointer:fine)").matches,still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(fine&&!still)document.querySelectorAll(".map").forEach(el=>{
    let raf=0;
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{el.style.transform=`perspective(900px) rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*9).toFixed(2)}deg) translateY(-3px)`});
    });
    el.addEventListener("pointerleave",()=>{cancelAnimationFrame(raf);el.style.transform=""});
  });


  /* níveis de spray: régua de distância acompanha o nível marcado */
  const marks=[20,30,50,100,150,200],lv=document.getElementById("levels"),fill=document.getElementById("lvlFill");
  function paintRuler(){
    if(!lv||!fill)return;const n=lv.querySelectorAll(".lvl.done").length;
    fill.style.width=(n?marks[n-1]/200*100:0)+"%";
    document.querySelectorAll("#lvlRuler span").forEach((s,i)=>s.classList.toggle("on",i<n));
  }
  if(lv){lv.addEventListener("click",()=>setTimeout(paintRuler,0));paintRuler()}

  /* painel competitivo: gráfico das últimas partidas */
  const chart=document.getElementById("pcChart");
  window.tksPcChart=function(m){
    if(!chart)return;
    const W=520,H=190,pl=34,pr=38,pt=26,pb=30,list=(m||[]).slice(-10);
    if(!list.length){
      chart.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico vazio: registre partidas para ver a evolução"><g fill="rgba(255,255,255,.05)">${[40,70,55,90,65,110,80].map((h,i)=>`<rect x="${pl+14+i*64}" y="${H-pb-h}" width="30" height="${h}" rx="5"/>`).join("")}</g><path d="M${pl} ${H-pb}H${W-pr}" stroke="rgba(255,255,255,.12)"/><text x="${W/2}" y="${H/2-4}" text-anchor="middle" class="pc-empty">Registre partidas para ver a evolução aqui</text></svg>`;
      return;
    }
    const k=list.map(x=>+x.kills||0),d=list.map(x=>+x.damage||0),mk=Math.max(1,...k),md=Math.max(1,...d);
    const n=list.length,step=(W-pl-pr)/n,bw=Math.min(34,step*.55),y=(v,mx)=>H-pb-(v/mx)*(H-pt-pb);
    let g=`<text x="${pl}" y="14" class="lg"><tspan class="lk">■</tspan> Eliminações   <tspan class="ld">●</tspan> Dano</text>`;
    g+=`<path d="M${pl} ${H-pb}H${W-pr}" stroke="rgba(255,255,255,.14)"/>`;
    [.5,1].forEach(f=>{g+=`<path d="M${pl} ${y(f*mk,mk)}H${W-pr}" stroke="rgba(255,255,255,.05)" stroke-dasharray="3 5"/><text x="${pl-8}" y="${y(f*mk,mk)+4}" text-anchor="end" class="ax">${Math.round(f*mk)}</text><text x="${W-pr+8}" y="${y(f*md,md)+4}" class="ax ad">${Math.round(f*md)}</text>`});
    list.forEach((x,i)=>{const cx=pl+step*i+step/2,yy=y(k[i],mk);
      g+=`<rect x="${cx-bw/2}" y="${yy}" width="${bw}" height="${H-pb-yy}" rx="5" fill="url(#pcG)"><title>${k[i]} eliminações</title></rect><text x="${cx}" y="${H-pb+18}" text-anchor="middle" class="ax">${String(x.date||"").replace(/[^0-9-]/g,"").slice(8,10)}/${String(x.date||"").replace(/[^0-9-]/g,"").slice(5,7)}</text>`});
    const pts=list.map((x,i)=>[pl+step*i+step/2,y(d[i],md)]);
    g+=`<path d="${pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join("")}" fill="none" stroke="#ff3048" stroke-width="2"/>`;
    g+=pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#07090d" stroke="#ff3048" stroke-width="2"><title>${d[i]} de dano</title></circle>`).join("");
    chart.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Eliminações e dano das últimas ${n} partidas"><defs><linearGradient id="pcG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2bd52"/><stop offset="1" stop-color="#f2bd52" stop-opacity=".25"/></linearGradient></defs>${g}</svg>`;
  };
  try{const d=JSON.parse(localStorage.getItem("tksPainelV1")||"null");window.tksPcChart(d&&d.matches)}catch(e){window.tksPcChart([])}

  /* aviso do 3D: muda o texto conforme o tipo de tela */
  const hint=document.getElementById("heroHint");
  if(hint&&matchMedia("(hover:none)").matches)hint.textContent="Toque no medalhão ou arraste para girar";

  /* fallback: se o 3D não carregar em 6 s, mostra a logo estática */
  setTimeout(()=>{if(!window.__tks3d){const c=document.getElementById("heroGL");if(c)c.remove();const f=document.querySelector(".hero-stage .logo-fallback");if(f)f.hidden=false}},6000);
})();

/* ===== erros: mostrar todos ===== */
(function(){
  const b=document.getElementById("errMore"),l=document.getElementById("errList");if(!b||!l)return;
  const n=l.querySelectorAll(".err").length;
  b.addEventListener("click",()=>{const o=l.classList.toggle("open");b.setAttribute("aria-expanded",o);b.textContent=o?"Mostrar menos":`Ver todos os ${n} erros`;
    if(!o)l.scrollIntoView({block:"start",behavior:"smooth"})});
})();

/* ===== capítulos como telas: home + um capítulo por vez ===== */
(function(){
  const content=document.querySelector(".content");if(!content)return;
  const kids=[...content.children];let cur="home";const grp=new Map();
  kids.forEach(el=>{
    if(el.classList.contains("chapter"))cur="c"+el.id.split("-")[1];
    if(el.classList.contains("cta")||el.tagName==="FOOTER")cur="all";
    if(el.classList.contains("hero")||el.classList.contains("marquee"))cur="home";
    const g=el.tagName==="DIALOG"?"all":cur;grp.set(el,g);el.dataset.pg=g;
  });
  const chs=[...content.querySelectorAll(".chapter")].map(h=>({n:h.id.split("-")[1],t:h.querySelector(".ch-title").textContent,d:h.querySelector(".ch-desc").textContent,c:h.querySelectorAll(".ch-index li").length}));
  /* home: cartões dos capítulos e atalhos */
  const home=document.createElement("section");home.className="home-ch";home.dataset.pg="home";home.id="capitulos";
  /* imagens já presentes na página, reaproveitadas como miniaturas */
  const q=sel=>{const e=document.querySelector(sel);return e?(e.getAttribute("src")||""):""};
  let ars={};try{ars=JSON.parse(document.getElementById("arsData").textContent)}catch(e){}
  const IMG={
    arsenal:(ars.img||{}).m416||"",mapas:q('.has-map[data-map="erangel"] .map-img'),acess:(ars.aimg||{}).comp_ar||"",
    cura:q('#cura .hr-img img[src*="medkit"]')||q('#cura .hr-img img'),equip:q('#equipamento .gear-card.lv3 img'),veic:q('#veiculos .veh-img img')
  };
  const ic=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const I={target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22"/>',
    sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    phone:'<rect x="2" y="6" width="20" height="12" rx="2.5"/><circle cx="7" cy="12" r="2"/><circle cx="17" cy="10" r="1.3"/><circle cx="19" cy="13" r="1.3"/>',
    steps:'<path d="M9 3.5h6v3H9z"/><path d="M8 5H6.5A1.5 1.5 0 0 0 5 6.5v13A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 17.5 5H16"/><path d="m8.5 13.5 2.2 2.2 4.6-4.6"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',cal:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    x:'<path d="M6 6l12 12M18 6 6 18"/>',book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17v.5"/>',
    play:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>'};
  const HL={
    1:[["#comecar","Primeiros passos","Como usar o manual e evoluir mais rápido",null,I.steps],["#armas","Arsenal","18 armas com filtros e attachments recomendados",IMG.arsenal],["#mapas","Mapas interativos","Planeje queda e rota nos mapas oficiais",IMG.mapas]],
    2:[["#diagnostico","Diagnóstico de mira","4 testes: reação, precisão, rastreamento e recuo",null,I.target,true],["#lab","Laboratório de sensibilidade","Monte uma base para testar no campo de treino",null,I.sliders,true],["#hudlab","Construtor de HUD","Posicione os botões e exporte o layout",null,I.phone,true]],
    3:[["#cura","Cura e boost","Quanto cada item recupera e quando usar",IMG.cura],["#equipamento","Equipamento do jogador","Capacete, colete e mochila por nível",IMG.equip],["#veiculos","Guia de veículos","Qual veículo para cada situação",IMG.veic]],
    4:[["#painel","Painel e diário","Registre treinos e partidas e veja a evolução",null,I.chart,true],["#plano","Plano semanal","Um foco de treino para cada dia",null,I.cal],["#erros","Erros comuns","16 erros e como corrigir",null,I.x]],
    5:[["#glossario","Glossário","Termos das calls e dos treinos",null,I.book],["#faq","Perguntas frequentes","Respostas rápidas para as dúvidas comuns",null,I.help],["#videos","Vídeos","Demonstrações do conteúdo",null,I.play]]
  };
  const lede=n=>{const h=document.getElementById("cap-"+n);let e=h&&h.nextElementSibling,l=null;while(e&&!e.classList.contains("chapter")&&!l){l=e.querySelector(".lede");e=e.nextElementSibling}return l?l.textContent:""};
  /* "seu treino de hoje": plano do dia, diagnóstico e progresso */
  const days=[...document.querySelectorAll("#days .day")],today=days[(new Date().getDay()+6)%7];
  const tdN=today?today.querySelector(".dn").textContent:"",tdT=today?today.querySelector("h4").textContent:"",tdP=today?today.querySelector("p").textContent:"";
  let dg=null;try{const d=JSON.parse(localStorage.getItem("tksDiag")||"{}"),l=(d[matchMedia("(pointer:coarse)").matches?"mobile":"mouse"]||[]).filter(e=>Object.keys(e.s).length===4).pop();if(l)dg=Math.round(Object.values(l.s).reduce((a,b)=>a+b,0)/4)}catch(e){}
  const prog=(document.getElementById("progressPct")||{}).textContent||"0%";
  home.innerHTML=`<div class="hm-today">
      <a class="td-main" href="#plano"><small>Seu treino de hoje · ${tdN.toLowerCase()}</small><b>${tdT}</b><span>${tdP}</span></a>
      <a class="td-box" href="#diagnostico"><small>Diagnóstico de mira</small><b>${dg!==null?dg:"—"}</b><span>${dg!==null?"última nota geral":"faça o primeiro teste"}</span></a>
      <a class="td-box" href="#modulos"><small>Trilha de formação</small><b id="tdProg">${prog}</b><span>das lições concluídas</span></a>
    </div>
    <h2>Capítulos</h2><p class="hc-sub">Veja o essencial de cada um e abra o capítulo completo quando quiser se aprofundar.</p>
    <div class="chx">${chs.map((c,i)=>`<article class="chx-row${i===0?" first":""}">
      <div class="chx-head"><span class="hc-n">${String(c.n).padStart(2,"0")}</span><div><b>${c.t}</b><p>${c.d}</p>${lede(c.n)?`<q>${lede(c.n)}</q>`:""}
        <a class="btn ${i===0?"":"btn-ghost "}chx-open" href="#cap-${c.n}">Abrir capítulo completo <span class="chx-cnt">${c.c} seções</span></a></div></div>
      <ul class="chx-hl">${(HL[c.n]||[]).map(([h,t,d,img,icon,tool])=>`<li><a href="${h}"><span class="chx-img">${img?`<img src="${img}" alt="" loading="lazy">`:ic(icon)}</span><span class="chx-tx"><b>${t}</b>${tool?'<em>Ferramenta</em>':""}<small>${d}</small></span><i aria-hidden="true">→</i></a></li>`).join("")}</ul>
    </article>`).join("")}</div>`;
  const mq=content.querySelector(".marquee");(mq||content.querySelector(".hero")).after(home);
  /* barra fixa dentro dos capítulos: voltar e trocar de capítulo */
  const bar=document.createElement("nav");bar.className="ch-bar";bar.setAttribute("aria-label","Capítulos");bar.hidden=true;
  bar.innerHTML=`<a class="chb-back" href="#capitulos">← Capítulos</a><div class="chb-tabs">${chs.map(c=>`<a href="#cap-${c.n}" data-c="${c.n}"><span>${c.n}</span>${c.t}</a>`).join("")}</div>`;
  content.prepend(bar);bar.dataset.pg="all";
  /* paginação entre capítulos */
  chs.forEach((c,i)=>{
    const last=[...content.children].filter(e=>e.dataset.pg==="c"+c.n&&e.tagName!=="DIALOG").pop();if(!last)return;
    const p=chs[i-1],n=chs[i+1],nav=document.createElement("nav");nav.className="ch-pager";nav.dataset.pg="c"+c.n;nav.setAttribute("aria-label","Navegar entre capítulos");
    nav.innerHTML=(p?`<a class="prev" href="#cap-${p.n}"><small>← Capítulo ${p.n}</small><b>${p.t}</b></a>`:`<a class="prev" href="#capitulos"><small>← Voltar</small><b>Todos os capítulos</b></a>`)+
      (n?`<a class="next" href="#cap-${n.n}"><small>Capítulo ${n.n} →</small><b>${n.t}</b></a>`:"");
    last.after(nav);
  });
  document.body.classList.add("paged");
  const all=()=>[...content.children];
  function show(pg){all().forEach(e=>e.classList.toggle("pg-off",!(e.dataset.pg===pg||e.dataset.pg==="all")));
    bar.hidden=pg==="home";bar.querySelectorAll(".chb-tabs a").forEach(a=>{const on="c"+a.dataset.c===pg;a.classList.toggle("on",on);if(on)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
    const tp=document.getElementById("tdProg"),pp=document.getElementById("progressPct");if(tp&&pp)tp.textContent=pp.textContent}
  function pgOf(el){let e=el;while(e&&e.parentElement!==content)e=e.parentElement;return e?e.dataset.pg:"home"}
  let shown=null;
  const curHash=()=>{try{return decodeURIComponent(location.hash.slice(1))}catch(e){return ""}};
  function go(id,scroll){
    const el=id&&document.getElementById(id);
    const pg=el&&content.contains(el)?pgOf(el):"home";
    const changed=pg!==shown;if(changed){show(pg);shown=pg}
    if(!scroll)return;
    requestAnimationFrame(()=>{
      if(!el||id==="inicio"){window.scrollTo({top:0,behavior:changed?"instant":"smooth"});return}
      orig.call(el,{behavior:changed?"instant":"smooth",block:"start"});
    });
  }
  /* atualiza o endereço sem navegar; em visualizadores restritos isso pode falhar, e tudo bem */
  const setHash=id=>{try{history.pushState(null,"","#"+id)}catch(e){}};
  addEventListener("hashchange",()=>go(curHash(),true));
  addEventListener("popstate",()=>go(curHash(),true));
  /* todo link interno é tratado aqui: nunca deixa o navegador recarregar a página */
  document.addEventListener("click",e=>{
    const a=e.target.closest('a[href^="#"]');if(!a||e.defaultPrevented||a.hasAttribute("data-actab"))return;
    const id=a.getAttribute("href").slice(1);if(!id)return;
    e.preventDefault();go(id,true);setHash(id);
  });
  /* elementos abertos por script (ex.: scrollIntoView em capítulo oculto) */
  const orig=Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView=function(o){if(content.contains(this)&&this.closest(".pg-off")){const pg=pgOf(this);show(pg);shown=pg}return orig.call(this,o)};
  go(curHash(),!!curHash());
})();

/* ===== ciclo de ajuste: interativo, avança sozinho até a pessoa tocar ===== */
(function(){
  const card=document.querySelector(".tvc-ciclo");if(!card)return;
  const nodes=[...card.querySelectorAll(".cy-node")],T=document.getElementById("cyT"),N=document.getElementById("cyN"),D=document.getElementById("cyD");
  const S=[0,1,2,3].map(i=>(card.dataset["s"+i]||"|").split("|"));
  let i=0,auto=!matchMedia("(prefers-reduced-motion: reduce)").matches,timer=null;
  function set(k){i=k;nodes.forEach((n,j)=>n.classList.toggle("on",j===k));T.textContent=S[k][0];N.textContent=`passo ${k+1} de 4`;D.innerHTML=`<span><b>${k+1} · ${S[k][0]}:</b> ${S[k][1]}</span>`}
  function loop(){clearInterval(timer);if(auto)timer=setInterval(()=>{if(!document.hidden)set((i+1)%4)},2600)}
  nodes.forEach((n,k)=>{const go=()=>{auto=false;clearInterval(timer);set(k)};n.addEventListener("click",go);n.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}})});
  set(0);loop();
})();

/* ===== TKS ACADEMY · arsenal com filtros ===== */
(function(){
  const root=document.getElementById("arsenal"),src=document.getElementById("arsData");
  if(!root||!src)return;
  let D;try{D=JSON.parse(src.textContent)}catch(e){return}
  const list=document.getElementById("arsList"),det=document.getElementById("arsDetail");
  const SLOTS=["Boca","Empunhadura","Carregador","Coronha","Mira"],RG=["Curta","Média","Longa"];
  const KEY="tksArsenal";
  let st={cat:"all",rg:-1,am:"all",sel:"m416"};
  try{Object.assign(st,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){}
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const visible=()=>D.w.filter(w=>(st.cat==="all"||w.c===st.cat)&&(st.rg<0||w.g[st.rg]>=1)&&(st.am==="all"||w.am===st.am))
    .sort((a,b)=>st.rg<0?0:(b.g[st.rg]-a.g[st.rg]));
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
  const rangeBar=g=>`<div class="range-bar">${RG.map((t,i)=>`<span class="${g[i]===2?"on2":g[i]===1?"on1":""}">${t}</span>`).join("")}</div>`;

  function renderList(){
    const v=visible();
    if(!v.find(w=>w.k===st.sel)&&v.length)st.sel=v[0].k;
    list.innerHTML=v.length?v.map(w=>`<button type="button" class="ars-tile${w.k===st.sel?" on":""}" role="option" aria-selected="${w.k===st.sel}" data-k="${w.k}">
      <span class="at-img"><img src="${D.img[w.k]}" alt="" loading="lazy" decoding="async"></span>
      <span class="at-txt"><b>${esc(w.n)}</b><small><img class="at-ammo" src="${D.ammo[w.am][1]}" alt="" loading="lazy">${D.cat[w.c][1]} · ${w.a}</small></span>
      ${st.rg>=0&&w.g[st.rg]===2?'<em class="at-ideal">Ideal</em>':""}</button>`).join("")
      :'<p class="muted ars-empty">Nenhuma arma nessa combinação de filtros.</p>';
    root.querySelectorAll(".af").forEach(b=>{const on=b.dataset.cat===st.cat;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
    root.querySelectorAll(".ar").forEach(b=>{const on=+b.dataset.rg===st.rg;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
    root.querySelectorAll(".am").forEach(b=>{const on=b.dataset.am===st.am;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
    renderDetail();
  }
  function slot(i,s){
    if(!s)return `<li class="slot off"><small>${SLOTS[i]}</small><span class="sl-img"></span><b>Não aceita</b></li>`;
    const [m,...alt]=s;
    const fam=m.replace(/_(ar|smg|sr)$/,"").replace(/^eq$/,"eq");const id=i===4?m:fam;
    return `<li class="slot"><small>${SLOTS[i]}</small><span class="sl-img"><img src="${D.aimg[m]}" alt="" loading="lazy"></span><b>${esc(D.at[m])}</b>${alt.length?`<em>ou ${alt.map(a=>esc(D.at[a])).join(" · ")}</em>`:""}<a class="sl-more" href="#ac-${id}" data-actab="${i}" data-acitem="ac-${id}">Ver no guia</a></li>`;
  }
  function renderDetail(){
    const w=D.w.find(x=>x.k===st.sel);
    if(!w){det.innerHTML="";return}
    const v=visible(),i=v.findIndex(x=>x.k===w.k),same=D.w.filter(x=>x.am===w.am&&x.k!==w.k);
    det.innerHTML=`<div class="ad-stage" data-cat="${D.cat[w.c][1]}">
        <img src="${D.img[w.k]}" alt="${esc(w.n)}">
        ${v.length>1?`<button type="button" class="ad-nav prev" data-step="-1" aria-label="Arma anterior">‹</button><button type="button" class="ad-nav next" data-step="1" aria-label="Próxima arma">›</button>`:""}
        <span class="ad-count">${i+1} / ${v.length}</span>
      </div>
      <div class="ad-body">
        <div class="ad-head"><div><p class="ad-rank">Nº ${String(w.r).padStart(2,"0")} em ${D.cat[w.c][0]}</p><h4>${esc(w.n)}</h4></div><span class="ad-ammo" title="Munição"><img src="${D.ammo[w.am][1]}" alt="">${w.a}</span></div>
        <div class="ad-row">
          <div class="wcond"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg><div><small>Melhor condição</small><p>${esc(w.cd)}</p></div></div>
          <div class="range ad-range"><small>Alcance ideal</small>${rangeBar(w.g)}</div>
        </div>
        ${w.t?`<p class="ad-tip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/></svg>${esc(w.t)}</p>`:""}
        ${same.length?`<div class="ad-same"><small>Usa a mesma munição</small><div>${same.map(x=>`<button type="button" class="ad-mate" data-k="${x.k}">${esc(x.n)}</button>`).join("")}</div></div>`:""}
        <h5>Attachments recomendados</h5>
        <ul class="slots">${w.s.map((s,i)=>slot(i,s)).join("")}</ul>
      </div>`;
  }
  root.addEventListener("click",e=>{
    const am=e.target.closest(".am");if(am){st.am=am.dataset.am;renderList();save();return}
    const mate=e.target.closest(".ad-mate");if(mate){st.sel=mate.dataset.k;if(!visible().find(x=>x.k===st.sel)){st.cat="all";st.rg=-1;st.am="all"}renderList();save();const tl=list.querySelector(`[data-k="${st.sel}"]`);if(tl)tl.scrollIntoView({block:"nearest",inline:"nearest"});return}
    const f=e.target.closest(".af"),r=e.target.closest(".ar"),t=e.target.closest(".ars-tile"),n=e.target.closest(".ad-nav");
    if(f){st.cat=f.dataset.cat;renderList();save();return}
    if(r){st.rg=+r.dataset.rg;renderList();save();return}
    if(t){st.sel=t.dataset.k;list.querySelectorAll(".ars-tile").forEach(x=>{const on=x===t;x.classList.toggle("on",on);x.setAttribute("aria-selected",on)});renderDetail();save();
      if(matchMedia("(max-width:800px)").matches)det.scrollIntoView({behavior:"smooth",block:"nearest"});return}
    if(n){const v=visible(),i=v.findIndex(x=>x.k===st.sel),j=(i+(+n.dataset.step)+v.length)%v.length;st.sel=v[j].k;
      list.querySelectorAll(".ars-tile").forEach(x=>{const on=x.dataset.k===st.sel;x.classList.toggle("on",on);x.setAttribute("aria-selected",on);if(on)x.scrollIntoView({block:"nearest",inline:"nearest"})});renderDetail();save()}
  });
  list.addEventListener("keydown",e=>{
    if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"].includes(e.key))return;
    const ts=[...list.querySelectorAll(".ars-tile")],i=ts.indexOf(document.activeElement);if(i<0)return;
    e.preventDefault();const j=(i+(e.key==="ArrowDown"||e.key==="ArrowRight"?1:-1)+ts.length)%ts.length;ts[j].focus();ts[j].click();
  });
  renderList();
})();

/* ===== guia de acessórios: abas + ligação com o arsenal ===== */
(function(){
  const box=document.getElementById("acTabs");if(!box)return;
  const tabs=[...box.querySelectorAll('[role="tab"]')];
  function open(i,focus){
    tabs.forEach((t,j)=>{const on=j===i;t.classList.toggle("active",on);t.setAttribute("aria-selected",on);t.tabIndex=on?0:-1;
      document.getElementById(t.getAttribute("aria-controls")).hidden=!on});
    if(focus)tabs[i].focus();
  }
  tabs.forEach((t,i)=>t.addEventListener("click",()=>open(i)));
  box.addEventListener("keydown",e=>{const i=tabs.indexOf(document.activeElement);if(i<0)return;
    if(e.key==="ArrowRight"){e.preventDefault();open((i+1)%tabs.length,true)}
    if(e.key==="ArrowLeft"){e.preventDefault();open((i-1+tabs.length)%tabs.length,true)}});
  /* "Ver no guia" a partir de um encaixe do arsenal */
  document.addEventListener("click",e=>{
    const a=e.target.closest("[data-actab]");if(!a)return;e.preventDefault();
    open(+a.dataset.actab);
    const t=document.getElementById(a.dataset.acitem)||document.getElementById("acessorios");
    t.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});
    t.classList.remove("flash");void t.offsetWidth;t.classList.add("flash");
  });
})();

/* ===== guia de veículos: filtro por situação ===== */
(function(){
  const g=document.getElementById("vehGrid");if(!g)return;
  const bs=[...document.querySelectorAll(".vf")],cs=[...g.querySelectorAll(".veh")];
  bs.forEach(b=>b.addEventListener("click",()=>{
    const t=b.dataset.tag;
    bs.forEach(x=>{const on=x===b;x.classList.toggle("on",on);x.setAttribute("aria-pressed",on)});
    cs.forEach(c=>{c.hidden=t!=="all"&&!c.dataset.tags.split(" ").includes(t)});
  }));
})();

/* ===== TKS ACADEMY · visualizador de mapas com planejador de rota ===== */
(function(){
  const dlg=document.getElementById("mapDlg"),dataEl=document.getElementById("mapData");
  if(!dlg||!dataEl)return;
  let MAPS;try{MAPS=JSON.parse(dataEl.textContent)}catch(e){return}
  const $=id=>document.getElementById(id);
  const view=$("mvView"),stage=$("mvStage"),img=$("mvImg"),svg=$("mvSvg"),load=$("mvLoad"),hint=$("mvHint");
  const names=$("mvNames"),namesWrap=$("mvNamesWrap"),distEl=$("mvDist");
  const KEY="tksMapPlans";
  let plans={};try{plans=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(plans))}catch(e){}};
  let cur=null,tool="move",S=0,z=1,tx=0,ty=0,hist=[],lastFocus=null;
  const plan=()=>plans[cur]||(plans[cur]={d:null,r:[],a:[]});

  /* ---------- geometria ---------- */
  function fit(){
    const r=view.getBoundingClientRect();S=Math.min(r.width,r.height);
    stage.style.width=stage.style.height=S+"px";z=1;tx=(r.width-S)/2;ty=(r.height-S)/2;apply();
  }
  function clamp(){
    const r=view.getBoundingClientRect(),w=S*z;
    tx=w<=r.width?(r.width-w)/2:Math.min(0,Math.max(r.width-w,tx));
    ty=w<=r.height?(r.height-w)/2:Math.min(0,Math.max(r.height-w,ty));
  }
  function apply(){clamp();stage.style.transform=`translate(${tx}px,${ty}px) scale(${z})`;draw()}
  function zoomAt(f,cx,cy){
    const r=view.getBoundingClientRect(),nz=Math.min(8,Math.max(1,z*f));if(nz===z)return;
    const px=cx-r.left,py=cy-r.top;tx=px-(px-tx)*nz/z;ty=py-(py-ty)*nz/z;z=nz;apply();
    if(hint)hint.classList.add("gone");
  }
  const toMap=(cx,cy)=>{const r=view.getBoundingClientRect();return[(cx-r.left-tx)/(S*z),(cy-r.top-ty)/(S*z)]};

  /* ---------- desenho ---------- */
  const K=1000,f=v=>(v*K).toFixed(1);
  function km(){
    const p=plan(),pts=(p.d?[p.d]:[]).concat(p.r);let d=0;
    for(let i=1;i<pts.length;i++)d+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
    return d*MAPS[cur].km;
  }
  function draw(){
    if(!cur)return;const p=plan(),s=1/z,pts=(p.d?[p.d]:[]).concat(p.r);let h="";
    if(pts.length>1)h+=`<polyline points="${pts.map(q=>f(q[0])+","+f(q[1])).join(" ")}" class="mv-route"/>`;
    p.r.forEach((q,i)=>{h+=`<g transform="translate(${f(q[0])} ${f(q[1])}) scale(${s})"><circle r="9" class="mv-rp"/><text y="4" class="mv-rn">${i+1}</text></g>`});
    p.a.forEach(q=>{h+=`<g transform="translate(${f(q[0])} ${f(q[1])}) scale(${s})" class="mv-al"><path d="M0-13 12 9H-12Z"/><path d="M0-4v6M0 5.5v.5" class="mv-alx"/></g>`});
    if(p.d)h+=`<g transform="translate(${f(p.d[0])} ${f(p.d[1])}) scale(${s})" class="mv-drop"><path d="M0 0c-7-9-12-14-12-21a12 12 0 1 1 24 0c0 7-5 12-12 21z"/><circle cy="-21" r="4.5"/></g>`;
    svg.innerHTML=h;
    const d=km();distEl.textContent="Rota: "+(d<1?Math.round(d*1000)+" m":d.toFixed(1).replace(".",",")+" km");
  }

  /* ---------- ferramentas ---------- */
  function setTool(t){tool=t;dlg.querySelectorAll(".mv-tool").forEach(b=>{const on=b.dataset.tool===t;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});view.dataset.tool=t}
  dlg.querySelectorAll(".mv-tool").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
  function addAt(cx,cy){
    const q=toMap(cx,cy);if(q[0]<0||q[0]>1||q[1]<0||q[1]>1)return;
    q[0]=+q[0].toFixed(4);q[1]=+q[1].toFixed(4);const p=plan();
    if(tool==="drop"){hist.push({t:"d",prev:p.d});p.d=q}
    else if(tool==="route"){p.r.push(q);hist.push({t:"r"})}
    else if(tool==="alert"){p.a.push(q);hist.push({t:"a"})}
    else return;
    save();draw();
  }
  $("mvUndo").addEventListener("click",()=>{const h=hist.pop(),p=plan();
    if(!h){if(p.r.length)p.r.pop();else if(p.a.length)p.a.pop();else p.d=null}
    else if(h.t==="d")p.d=h.prev;else if(h.t==="r")p.r.pop();else p.a.pop();
    save();draw()});
  const clr=$("mvClear");
  clr.addEventListener("click",()=>{
    if(clr.dataset.armed){plans[cur]={d:null,r:[],a:[]};hist=[];save();draw();delete clr.dataset.armed;clr.textContent="Limpar";return}
    clr.dataset.armed="1";clr.textContent="Confirmar limpar";setTimeout(()=>{delete clr.dataset.armed;clr.textContent="Limpar"},3000)});

  /* ---------- gestos ---------- */
  const ptrs=new Map();let start=null,pinch=null;
  view.addEventListener("pointerdown",e=>{
    if(e.target.closest(".mv-zoom"))return;
    view.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(ptrs.size===1)start={x:e.clientX,y:e.clientY,tx,ty,moved:false};
    if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z};if(start)start.moved=true}
  });
  view.addEventListener("pointermove",e=>{
    if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(ptrs.size===2&&pinch){const [a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);zoomAt(pinch.z*d/pinch.d/z,(a.x+b.x)/2,(a.y+b.y)/2);return}
    if(start){const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)+Math.abs(dy)>6)start.moved=true;
      if(start.moved){tx=start.tx+dx;ty=start.ty+dy;apply();view.classList.add("dragging");if(hint)hint.classList.add("gone")}}
  });
  const up=e=>{
    if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);
    if(ptrs.size<2)pinch=null;
    if(ptrs.size===0){if(start&&!start.moved&&e.type==="pointerup")addAt(e.clientX,e.clientY);start=null;view.classList.remove("dragging")}
  };
  view.addEventListener("pointerup",up);view.addEventListener("pointercancel",up);
  view.addEventListener("wheel",e=>{e.preventDefault();zoomAt(Math.exp(-e.deltaY*.0018),e.clientX,e.clientY)},{passive:false});
  const zc=f=>{const r=view.getBoundingClientRect();zoomAt(f,r.left+r.width/2,r.top+r.height/2)};
  $("mvIn").addEventListener("click",()=>zc(1.5));$("mvOut").addEventListener("click",()=>zc(1/1.5));$("mvFit").addEventListener("click",fit);
  dlg.addEventListener("keydown",e=>{if(e.target.tagName==="INPUT")return;if(e.key==="+"||e.key==="=")zc(1.4);if(e.key==="-")zc(1/1.4);if(e.key==="0")fit()});

  /* ---------- abrir / fechar ---------- */
  function setImg(){
    const m=MAPS[cur],src=(names.checked||!m.nt)?m.tx:m.nt;
    if(img.getAttribute("src")===src)return;
    load.hidden=false;img.style.opacity=0;
    img.onload=()=>{load.hidden=true;img.style.opacity=1};
    img.onerror=()=>{load.hidden=false;load.textContent="Não foi possível carregar o mapa."};
    img.src=src;
  }
  names.addEventListener("change",setImg);
  function open(k){
    if(!MAPS[k])return;cur=k;hist=[];lastFocus=document.activeElement;
    $("mvTitle").textContent=MAPS[k].n;$("mvSub").textContent=MAPS[k].km+" × "+MAPS[k].km+" km";
    namesWrap.hidden=!MAPS[k].nt;img.alt="Mapa de "+MAPS[k].n;
    if(typeof dlg.showModal==="function")dlg.showModal();else dlg.setAttribute("open","");
    document.documentElement.classList.add("mv-lock");setTool("move");
    requestAnimationFrame(()=>{fit();setImg()});
  }
  function close(){if(dlg.open&&dlg.close)dlg.close();else dlg.removeAttribute("open")}
  dlg.addEventListener("close",()=>{document.documentElement.classList.remove("mv-lock");if(lastFocus)lastFocus.focus()});
  $("mvClose").addEventListener("click",close);
  addEventListener("resize",()=>{if(dlg.open)fit()});
  document.addEventListener("click",e=>{
    const b=e.target.closest(".map-open,.has-map .mh");if(!b)return;
    const card=b.closest(".has-map");if(card)open(card.dataset.map);
  });
})();

/* ===== TKS ACADEMY · Diagnóstico de mira (minigame) ===== */
(function(){
  const root=document.getElementById("diagnostico");if(!root)return;
  const KEY="tksDiag",T=matchMedia("(pointer:coarse)").matches,DEV=T?"mobile":"mouse";
  let db={};try{db=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
  const saveDb=()=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}};
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const lin=(v,worst,best)=>Math.round(100*clamp((v-worst)/(best-worst)));
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const SK=[
    {k:"reacao",n:"Reação",u:"Tempo de reação"},
    {k:"precisao",n:"Precisão",u:"Acertos e velocidade"},
    {k:"rastreio",n:"Rastreamento",u:"Tempo no alvo",sn:"Rastreio"},
    {k:"recuo",n:"Controle de recuo",u:"Desvio da mira",sn:"Recuo"}
  ];
  const REC={
    reacao:["Treine a reação","Aqueça antes de jogar e faça duelos curtos em MDM, com a mira já posicionada onde o inimigo vai aparecer.","#mdm","Ver MDM e prática"],
    precisao:["Treine a precisão","No campo de treino, troque de alvo em várias distâncias. Se a mira passa do alvo, reveja a sensibilidade de câmera e ADS.","#sensibilidade","Ver sensibilidades TKS"],
    rastreio:["Treine o rastreamento","Siga alvos em movimento: use o dia de spray lateral do plano semanal e o exercício de movimento lateral.","#plano","Ver plano semanal"],
    recuo:["Treine o controle de recuo","Comece com rajadas curtas e aumente aos poucos. O simulador de spray mostra o efeito da compensação.","#recoil","Ver recuo e spray"]
  };

  /* ---------- arena (tela cheia) ---------- */
  const ov=document.createElement("div");ov.className="dg-arena";ov.hidden=true;ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label","Diagnóstico de mira");
  ov.innerHTML=`<canvas></canvas><div class="dg-hud"><b class="dg-title"></b><span class="dg-prog"></span><button type="button" class="dg-x" aria-label="Sair do diagnóstico">×</button></div><div class="dg-screen" hidden></div><div class="dg-rot" role="status"><svg viewBox="0 0 64 64" aria-hidden="true"><rect class="ph" x="20" y="8" width="24" height="44" rx="5"/><path class="ar" d="M50 40a20 20 0 0 1-14 14m0 0 5-1m-5 1 2-5"/></svg><b>Gire o celular</b><p>O diagnóstico funciona com o celular deitado, como no jogo.</p><div class="dg-rot-help" hidden><p class="dg-rh-t">Girou e nada mudou?</p><p class="dg-rh-ios">O bloqueio de rotação deve estar ligado. Abra a <b>Central de Controle</b> (deslize do canto superior direito para baixo) e toque no ícone do <b>cadeado com a seta</b> para desligá-lo.</p><p class="dg-rh-and">O bloqueio de rotação deve estar ligado. Deslize de cima para baixo para abrir as configurações rápidas e ative <b>Girar automaticamente</b> (em alguns aparelhos aparece como <b>Rotação automática</b> ou <b>Retrato</b>).</p><button type="button" class="btn dg-rot-try" hidden>Girar automaticamente</button><p class="dg-rh-msg" aria-live="polite"></p></div></div>`;
  if(T)ov.classList.add("mob");
  /* bloqueio de rotação: depois de alguns segundos em retrato, explica como liberar */
  const IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  const rh=ov.querySelector(".dg-rot-help"),rTry=ov.querySelector(".dg-rot-try"),rMsg=ov.querySelector(".dg-rh-msg");
  rh.classList.add(IOS?"is-ios":"is-and");
  const canLock=!IOS&&!!(window.screen&&window.screen.orientation&&window.screen.orientation.lock)&&!!ov.requestFullscreen;
  let pSince=0;
  setInterval(()=>{if(ov.hidden||!T){pSince=0;return}const pt=innerHeight>innerWidth;
    if(!pt){pSince=0;rh.hidden=true;return}if(!pSince)pSince=Date.now();
    if(Date.now()-pSince>3000&&rh.hidden){rh.hidden=false;rTry.hidden=!canLock;rMsg.textContent=""}},500);
  rTry.addEventListener("click",()=>{rMsg.textContent="";
    const lock=()=>window.screen.orientation.lock("landscape");
    (document.fullscreenElement?Promise.resolve():ov.requestFullscreen()).then(lock).catch(()=>{rMsg.textContent="Não deu para girar automaticamente neste navegador. Desligue o bloqueio de rotação como explicado acima."})});
  document.body.appendChild(ov);
  const cv=ov.querySelector("canvas"),cx=cv.getContext("2d"),hudT=ov.querySelector(".dg-title"),hudP=ov.querySelector(".dg-prog"),scr=ov.querySelector(".dg-screen");
  let W=0,H=0,M=0,dpr=1,abort=false,P={x:-999,y:-999,down:false},onDown=null,onUp=null;
  function size(){dpr=Math.min(2,devicePixelRatio||1);W=ov.clientWidth;H=ov.clientHeight;M=Math.min(W,H);cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
  addEventListener("resize",()=>{if(!ov.hidden)size()});
  const pos=e=>{const r=cv.getBoundingClientRect();P.x=e.clientX-r.left;P.y=e.clientY-r.top};
  const xy=e=>{const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  /* modo celular: mira fixa no centro, o dedo direito move a câmera (como no PUBG) */
  const IN={fire:false,fireId:null,aimId:null,ax:0,ay:0},cam={x:0,y:0};
  let SENS=clamp(+((db.cfg||{}).sens)||100,50,200),onFire=null;
  const GAIN=()=>1.1*SENS/100;
  const portrait=()=>T&&innerHeight>innerWidth;
  const fireZone=x=>x<W*.42;
  const FIRE=()=>({x:Math.max(92,W*.14),y:H*.68,r:Math.max(42,M*.14)});
  const AIM=()=>({x:cam.x+W/2,y:cam.y+H/2});
  const S=w=>({x:w.x-cam.x,y:w.y-cam.y});
  function relAll(){IN.fire=false;IN.fireId=IN.aimId=null}
  cv.addEventListener("pointerdown",e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}
    if(T){if(portrait())return;const q=xy(e);
      if(fireZone(q.x)){if(IN.fireId===null){IN.fireId=e.pointerId;IN.fire=true;if(onFire)onFire()}}
      else if(IN.aimId===null){IN.aimId=e.pointerId;IN.ax=q.x;IN.ay=q.y;IN.downs=(IN.downs||0)+1}
      return}
    pos(e);P.down=true;if(onDown)onDown(e)});
  cv.addEventListener("pointermove",e=>{
    if(T){if(e.pointerId===IN.aimId){const q=xy(e),g=GAIN();cam.x+=(q.x-IN.ax)*g;cam.y+=(q.y-IN.ay)*g;IN.ax=q.x;IN.ay=q.y}return}
    pos(e)});
  const up=e=>{
    if(T){if(e.pointerId===IN.fireId){IN.fireId=null;IN.fire=false}if(e.pointerId===IN.aimId)IN.aimId=null;return}
    pos(e);P.down=false;if(onUp)onUp(e)};
  cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  cv.addEventListener("pointerleave",()=>{if(!P.down&&!T){P.x=P.y=-999}});
  const DBG={};
  class Abort extends Error{}
  const chk=()=>{if(abort)throw new Abort()};
  let pausedMs=0;const clk=()=>performance.now()-pausedMs;
  const raf=()=>new Promise(r=>requestAnimationFrame(r)).then(t=>{chk();return t});
  async function frame(){const t=await raf();
    if(portrait()){const p0=performance.now();relAll();DBG.paused=true;while(portrait())await raf();pausedMs+=performance.now()-p0;DBG.paused=false;size()}
    return t}
  async function wait(ms){const t0=clk();while(clk()-t0<ms)await frame()}
  function bg(){cx.fillStyle="#07090d";cx.fillRect(0,0,W,H);const g=Math.max(40,M/10);
    const ox=T?-(((cam.x%g)+g)%g):g,oy=T?-(((cam.y%g)+g)%g):g;
    cx.strokeStyle=`rgba(255,255,255,${T?.06:.035})`;cx.lineWidth=1;
    cx.beginPath();for(let x=ox;x<W;x+=g){cx.moveTo(x,0);cx.lineTo(x,H)}for(let y=oy;y<H;y+=g){cx.moveTo(0,y);cx.lineTo(W,y)}cx.stroke();
    if(T){const g2=g*4,o2x=-(((cam.x%g2)+g2)%g2),o2y=-(((cam.y%g2)+g2)%g2);cx.fillStyle="rgba(242,189,82,.16)";
      for(let x=o2x;x<W+g2;x+=g2)for(let y=o2y;y<H+g2;y+=g2){cx.beginPath();cx.arc(x,y,2,0,7);cx.fill()}}}
  function textAt(s,x,y,size=16,col="#f4f5f7",font="Barlow"){cx.fillStyle=col;cx.font=`700 ${size}px "${font}",sans-serif`;cx.textAlign="center";cx.textBaseline="middle";cx.fillText(s,x,y)}
  /* controles desenhados por cima da cena (só no celular) */
  function ctrls(hint,col){if(!T)return;const f=FIRE();cx.save();
    cx.fillStyle=IN.fire?"rgba(255,48,72,.5)":"rgba(16,20,27,.6)";cx.strokeStyle=IN.fire?"#ff3048":"rgba(244,245,247,.55)";cx.lineWidth=2.5;
    cx.beginPath();cx.arc(f.x,f.y,f.r,0,7);cx.fill();cx.stroke();
    const u=f.r/40;cx.fillStyle="#f4f5f7";cx.beginPath();cx.moveTo(f.x-6*u,f.y+16*u);cx.lineTo(f.x-6*u,f.y-4*u);cx.quadraticCurveTo(f.x,f.y-20*u,f.x+6*u,f.y-4*u);cx.lineTo(f.x+6*u,f.y+16*u);cx.closePath();cx.fill();
    cx.fillRect(f.x-8*u,f.y+18*u,16*u,4*u);
    const c=col||"#f4f5f7",k=M*.032;cross(W/2,H/2,k,c);cx.fillStyle=c;cx.beginPath();cx.arc(W/2,H/2,2,0,7);cx.fill();
    if(hint){textAt("Segure para atirar",f.x,f.y+f.r+18,Math.round(M*.04),"#f2bd52");
      const zx=W*.71,zy=H*.66;cx.setLineDash([6,6]);cx.strokeStyle="rgba(242,189,82,.45)";cx.lineWidth=2;cx.beginPath();cx.roundRect?cx.roundRect(W*.47,H*.42,W*.48,H*.5,18):cx.rect(W*.47,H*.42,W*.48,H*.5);cx.stroke();cx.setLineDash([]);
      textAt("Arraste aqui para mirar",zx,zy,Math.round(M*.042),"#f2bd52");textAt("← →   ↑ ↓",zx,zy+M*.07,Math.round(M*.04),"rgba(242,189,82,.7)")}
    cx.restore()}
  function text(s,y,size=22,col="#f4f5f7",font="Barlow Condensed"){cx.fillStyle=col;cx.font=`700 ${size}px "${font}",sans-serif`;cx.textAlign="center";cx.textBaseline="middle";cx.fillText(s,W/2,y)}
  function target(x,y,r,on){
    cx.save();cx.translate(x,y);
    const g=cx.createRadialGradient(0,0,0,0,0,r*1.8);g.addColorStop(0,on?"rgba(101,223,154,.35)":"rgba(255,48,72,.35)");g.addColorStop(1,"rgba(0,0,0,0)");cx.fillStyle=g;cx.beginPath();cx.arc(0,0,r*1.8,0,7);cx.fill();
    cx.lineWidth=2.5;cx.strokeStyle=on?"#65df9a":"#ff3048";cx.beginPath();cx.arc(0,0,r,0,7);cx.stroke();
    cx.fillStyle=on?"#65df9a":"#f2bd52";cx.beginPath();cx.arc(0,0,r*.38,0,7);cx.fill();
    cx.restore();
  }
  function cross(x,y,s,col="#f4f5f7"){cx.strokeStyle=col;cx.lineWidth=2;cx.beginPath();cx.moveTo(x-s,y);cx.lineTo(x-s*.35,y);cx.moveTo(x+s*.35,y);cx.lineTo(x+s,y);cx.moveTo(x,y-s);cx.lineTo(x,y-s*.35);cx.moveTo(x,y+s*.35);cx.lineTo(x,y+s);cx.stroke()}
  let curRej=null;
  function screen(html){return new Promise((res,rej)=>{scr.innerHTML=html;scr.hidden=false;curRej=rej;
    scr.querySelectorAll("[data-go]").forEach(x=>x.onclick=()=>{curRej=null;scr.hidden=true;res(x.dataset.go)});
    const b=scr.querySelector("[data-go]");if(b)b.focus({preventScroll:true});const c=scr.querySelector(".dg-card");if(c)c.scrollTop=0})}
  async function countdown(){for(let i=3;i>0;i--){const t0=clk();while(clk()-t0<600){await frame();bg();text(String(i),T?H*.3:H/2,Math.round(M*(T?.16:.22)),"#f2bd52");ctrls(true)}}}
  function open(){abort=false;ov.hidden=false;document.documentElement.classList.add("dg-lock");size();bg();
    cam.x=cam.y=0;relAll();
    if(T&&ov.requestFullscreen)ov.requestFullscreen().then(()=>{const o=window.screen&&window.screen.orientation;if(o&&o.lock)return o.lock("landscape").catch(()=>{})}).catch(()=>{})}
  function close(){abort=true;onDown=onUp=onFire=null;ov.hidden=true;scr.hidden=true;if(curRej){const r=curRej;curRej=null;r(new Abort())}document.documentElement.classList.remove("dg-lock");
    relAll();try{const o=window.screen&&window.screen.orientation;if(o&&o.unlock)o.unlock()}catch(_){}
    if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}
  ov.querySelector(".dg-x").addEventListener("click",close);
  addEventListener("keydown",e=>{if(e.key==="Escape"&&!ov.hidden)close()});

  /* ---------- 1. reação ---------- */
  async function tReaction(){
    const N=5,times=[];let fouls=0;
    while(times.length<N){
      hudP.textContent=`${times.length+1} de ${N}`;
      let state="wait",t0=0,res=null;
      const delay=1100+Math.random()*2400,start=performance.now();
      const tx=W*(.3+Math.random()*.4),ty=H*(.35+Math.random()*.35),r=Math.max(T?40:34,M*.08);
      onDown=()=>{if(state==="wait"){res="foul"}else if(state==="go"){res=performance.now()-t0}};
      while(res===null){await frame();bg();
        if(state==="wait"){text("Aguarde o alvo…",H/2,Math.round(M*.06),"#a8b0bd");if(performance.now()-start>delay){state="go";t0=performance.now()}}
        if(state==="go")target(tx,ty,r,false);
        DBG.t="reacao";DBG.state=state;DBG.x=tx;DBG.y=ty;
      }
      onDown=null;
      if(res==="foul"){fouls++;const f0=performance.now();while(performance.now()-f0<900){await frame();bg();text("Cedo demais",H/2,Math.round(M*.08),"#ff3048");text("Espere o alvo aparecer",H/2+M*.08,Math.round(M*.035),"#a8b0bd","Barlow")}continue}
      times.push(res);const f0=performance.now();
      while(performance.now()-f0<700){await frame();bg();text(Math.round(res)+" ms",H/2,Math.round(M*.1),"#65df9a")}
    }
    const s=[...times].sort((a,b)=>a-b),med=s[Math.floor(s.length/2)];
    const score=Math.max(0,lin(med,T?520:470,T?230:190)-fouls*4);
    return{score,raw:Math.round(med)+" ms"+(fouls?` · ${fouls} ${fouls>1?"antecipações":"antecipação"}`:""),v:Math.round(med)};
  }
  /* ---------- 2. precisão ---------- */
  async function tFlick(){
    const N=15,LIFE=1700,hits=[];let miss=0;
    const r=Math.max(T?20:13,M*(T?.045:.026)),top=70;
    for(let i=0;i<N;i++){
      hudP.textContent=`${i+1} de ${N}`;
      const x=r*2+Math.random()*(W-r*4),y=top+r*2+Math.random()*(H-top-r*4),t0=performance.now();let out=null;
      onDown=()=>{const d=Math.hypot(P.x-x,P.y-y);out=d<=r*1.2?"hit":"miss"};
      DBG.t="precisao";DBG.i=i;DBG.x=x;DBG.y=y;
      while(out===null){const t=await frame();const age=performance.now()-t0;if(age>LIFE){out="late";break}
        bg();target(x,y,r,false);cx.strokeStyle="rgba(242,189,82,.7)";cx.lineWidth=3;cx.beginPath();cx.arc(x,y,r+7,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-age/LIFE));cx.stroke()}
      onDown=null;
      if(out==="hit")hits.push(performance.now()-t0);else miss++;
      const f0=performance.now();while(performance.now()-f0<140){await frame();bg();if(out==="hit")target(x,y,r,true);else{cx.strokeStyle="#ff3048";cx.lineWidth=3;cross(x,y,r)}}
    }
    const acc=hits.length/N,avg=hits.length?hits.reduce((a,b)=>a+b,0)/hits.length:LIFE;
    const speed=clamp((1150-avg)/(1150-(T?430:380)));
    const score=Math.round(100*(.6*acc+.4*speed*(hits.length?1:0)));
    return{score,raw:`${hits.length}/${N} acertos · ${Math.round(avg)} ms`,v:Math.round(acc*100)};
  }
  /* ---------- 3. rastreamento ---------- */
  async function tTrack(){
    const DUR=12000,r=Math.max(T?28:20,M*(T?.055:.034)),cxm=W/2,cym=H/2+20,ax=W*.36,ay=(H-90)*.36;
    const ph=[Math.random()*6,Math.random()*6,Math.random()*6,Math.random()*6];
    hudP.textContent=T?"Mantenha o dedo no alvo":"Mantenha o cursor no alvo";
    let on=0,tot=0,t0=performance.now(),trail=[];
    const path=t=>{const k=t*(1+t/DUR*0.0)/1000,sp=1+t/DUR*.9;return[cxm+ax*(.65*Math.sin(k*.9*sp+ph[0])+.35*Math.sin(k*2.1*sp+ph[1])),cym+ay*(.6*Math.sin(k*1.2*sp+ph[2])+.4*Math.cos(k*2.6*sp+ph[3]))]};
    while(true){await frame();const t=performance.now()-t0;if(t>DUR)break;
      const [x,y]=path(t);DBG.t="rastreio";DBG.x=x;DBG.y=y;const inside=Math.hypot(P.x-x,P.y-y)<=r*1.15&&(!T||P.down);tot++;if(inside)on++;
      trail.push([x,y]);if(trail.length>24)trail.shift();
      bg();cx.strokeStyle="rgba(242,189,82,.25)";cx.lineWidth=2;cx.beginPath();trail.forEach((p,i)=>i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1]));cx.stroke();
      target(x,y,r,inside);
      cx.fillStyle="rgba(255,255,255,.08)";cx.fillRect(W*.2,H-26,W*.6,6);cx.fillStyle="#f2bd52";cx.fillRect(W*.2,H-26,W*.6*(t/DUR),6);
      hudP.textContent=`${Math.round(on/tot*100)}% no alvo`;
    }
    const pct=on/Math.max(1,tot);
    return{score:lin(pct,.25,.9),raw:Math.round(pct*100)+"% do tempo no alvo",v:Math.round(pct*100)};
  }
  /* ---------- 4. controle de recuo ---------- */
  async function tRecoil(){
    const SPRAYS=3,SHOTS=28,RATE=95,devs=[];
    for(let s=0;s<SPRAYS;s++){
      hudP.textContent=`Spray ${s+1} de ${SPRAYS}`;
      const ox=W/2,oy=H/2+30;let fired=0,holes=[],dsum=0,rx=0,ry=0,armed=false,d0=null,last=0,done=false;
      onDown=()=>{if(!armed){armed=true;d0={x:P.x,y:P.y};last=performance.now()}};
      onUp=()=>{if(armed)done=true};
      while(!done){await frame();
        const now=performance.now();
        if(armed&&P.down){while(now-last>=RATE&&fired<SHOTS){last+=RATE;fired++;
          ry-=M*(.011+fired*.0006);rx+=(Math.random()-.5)*M*.012+(fired>8?M*.0016*Math.sin(fired*.5):0);
          const px=ox+rx+(P.x-d0.x),py=oy+ry+(P.y-d0.y);holes.push([px,py]);dsum+=Math.hypot(px-ox,py-oy)/M}
          if(fired>=SHOTS)done=true}
        bg();
        [M*.04,M*.1,M*.18].forEach((rr,i)=>{cx.strokeStyle=`rgba(255,255,255,${.22-i*.05})`;cx.lineWidth=1.5;cx.beginPath();cx.arc(ox,oy,rr,0,7);cx.stroke()});
        cx.fillStyle="#ff3048";holes.forEach(([x,y],i)=>{cx.globalAlpha=.35+.65*i/Math.max(1,holes.length);cx.beginPath();cx.arc(x,y,Math.max(3,M*.008),0,7);cx.fill()});cx.globalAlpha=1;
        DBG.t="recuo";DBG.rx=rx;DBG.ry=ry;DBG.ox=ox;DBG.oy=oy;DBG.armed=armed;DBG.fired=fired;
        const ax=armed?ox+rx+(P.x-d0.x):ox,ay=armed?oy+ry+(P.y-d0.y):oy;cross(ax,ay,M*.035,"#f2bd52");
        if(!armed){text(T?"Segure o dedo na tela para atirar":"Segure o botão do mouse para atirar",H*.18,Math.round(M*.045),"#f4f5f7","Barlow");
          text("Arraste para baixo para segurar a mira no centro",H*.18+M*.06,Math.round(M*.032),"#a8b0bd","Barlow")}
        else text(`${fired}/${SHOTS}`,H-40,Math.round(M*.04),"#f2bd52");
      }
      onDown=onUp=null;
      if(fired<10){const f0=performance.now();while(performance.now()-f0<1100){await frame();bg();text("Segure até o fim do spray",H/2,Math.round(M*.06),"#ff3048")}s--;continue}
      devs.push(dsum/fired);
      const f0=performance.now();while(performance.now()-f0<800){await frame()}
    }
    const avg=devs.reduce((a,b)=>a+b,0)/devs.length;
    return{score:lin(avg,.24,.035),raw:"desvio médio de "+Math.round(avg*100)+"% da tela",v:Math.round(avg*1000)/10};
  }

  /* =========== modo celular: mira fixa, câmera no dedo direito, tiro no botão esquerdo =========== */
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  /* medições usadas nas dicas de sensibilidade (só no celular) */
  let MET={flick:[],track:null,recoil:[],fouls:0,med:0};
  async function flash(ms,draw){const f0=clk();while(clk()-f0<ms){await frame();bg();draw();ctrls()}}
  /* 1. reação: o alvo surge na mira; atire o mais rápido possível */
  async function mReaction(){
    const N=5,times=[];let fouls=0;
    while(times.length<N){
      hudP.textContent=`${times.length+1} de ${N}`;
      let state="wait",t0=0,res=null,tw=null;
      const delay=1100+Math.random()*2400,start=clk(),r=Math.max(26,M*.075);
      onFire=()=>{if(state==="wait")res="foul";else if(state==="go")res=clk()-t0};
      while(res===null){await frame();bg();
        if(state==="wait"){text("Aguarde o alvo…",H*.28,Math.round(M*.06),"#a8b0bd");if(clk()-start>delay){state="go";t0=clk();const a=AIM();tw={x:a.x,y:a.y}}}
        if(state==="go"){const q=S(tw);target(q.x,q.y,r,false)}
        ctrls();DBG.t="reacao";DBG.state=state;
      }
      onFire=null;
      if(res==="foul"){fouls++;await flash(900,()=>{text("Cedo demais",H*.28,Math.round(M*.08),"#ff3048");text("Espere o alvo aparecer",H*.28+M*.09,Math.round(M*.04),"#a8b0bd","Barlow")});continue}
      times.push(res);await flash(700,()=>text(Math.round(res)+" ms",H*.28,Math.round(M*.1),"#65df9a"));
    }
    const s=[...times].sort((a,b)=>a-b),med=s[Math.floor(s.length/2)];
    MET.fouls=fouls;MET.med=med;
    const score=Math.max(0,lin(med,540,240)-fouls*4);
    return{score,raw:Math.round(med)+" ms"+(fouls?` · ${fouls} ${fouls>1?"antecipações":"antecipação"}`:""),v:Math.round(med)};
  }
  /* 2. precisão: arraste para pôr a mira no alvo e atire */
  function spot(r){const f=FIRE();
    for(let k=0;k<30;k++){const a=Math.random()*Math.PI*2,d=M*(.2+Math.random()*.24);
      const x=clamp(W/2+Math.cos(a)*d*1.35,r*2,W-r*2),y=clamp(H/2+Math.sin(a)*d,70+r,H-r*2);
      if(Math.hypot(x-f.x,y-f.y)>f.r+r*2&&Math.hypot(x-W/2,y-H/2)>M*.16)return{x,y}}
    return{x:W*.75,y:H*.3}}
  async function mFlick(){
    const N=15,LIFE=2600,hits=[];let miss=0;const r=Math.max(18,M*.05);
    for(let i=0;i<N;i++){
      hudP.textContent=`${i+1} de ${N}`;
      const q0=spot(r),tw={x:q0.x+cam.x,y:q0.y+cam.y},t0=clk();let out=null;
      const a0=AIM(),d0=dist(a0,tw),u={x:(tw.x-a0.x)/d0,y:(tw.y-a0.y)/d0},dn0=IN.downs||0;let over=false,reach=null;
      onFire=()=>{out=dist(AIM(),tw)<=r*1.15?"hit":"miss"};
      while(out===null){await frame();const age=clk()-t0;if(age>LIFE){out="late";break}
        {const a=AIM(),pr=(a.x-a0.x)*u.x+(a.y-a0.y)*u.y;if(pr>d0+r*1.5)over=true;if(reach===null&&dist(a,tw)<=r)reach=age}
        bg();const q=S(tw);target(q.x,q.y,r,dist(AIM(),tw)<=r*1.15);cx.strokeStyle="rgba(242,189,82,.7)";cx.lineWidth=3;cx.beginPath();cx.arc(q.x,q.y,r+7,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-age/LIFE));cx.stroke();
        ctrls();DBG.t="precisao";DBG.i=i;DBG.tw=tw;}
      onFire=null;
      MET.flick.push({over,reach,drags:(IN.downs||0)-dn0,moved:dist(AIM(),a0)>r});
      if(out==="hit")hits.push(clk()-t0);else miss++;
      await flash(160,()=>{const q=S(tw);if(out==="hit")target(q.x,q.y,r,true);else{cx.strokeStyle="#ff3048";cx.lineWidth=3;cross(q.x,q.y,r)}});
    }
    const acc=hits.length/N,avg=hits.length?hits.reduce((a,b)=>a+b,0)/hits.length:LIFE;
    const speed=clamp((2200-avg)/(2200-750));
    const score=Math.round(100*(.6*acc+.4*speed*(hits.length?1:0)));
    return{score,raw:`${hits.length}/${N} acertos · ${Math.round(avg)} ms`,v:Math.round(acc*100)};
  }
  /* 3. rastreamento: segure o tiro e mantenha a mira no alvo em movimento */
  async function mTrack(){
    const DUR=12000,r=Math.max(24,M*.065),c0=AIM(),ax=W*.3,ay=(H-90)*.3;
    const ph=[Math.random()*6,Math.random()*6,Math.random()*6,Math.random()*6];
    let on=0,tot=0,t0=clk(),trail=[],prev=null,lags=[],cross=0,lastSg=0;
    const path=t=>{const k=t/1000*.8,sp=1+t/DUR*.8;return{x:c0.x+ax*(.65*Math.sin(k*.9*sp+ph[0])+.35*Math.sin(k*2.1*sp+ph[1])),y:c0.y+ay*(.6*Math.sin(k*1.2*sp+ph[2])+.4*Math.cos(k*2.6*sp+ph[3]))}};
    while(true){await frame();const t=clk()-t0;if(t>DUR)break;
      const tw=path(t),near=dist(AIM(),tw)<=r*1.15,inside=near&&IN.fire;tot++;if(inside)on++;
      if(prev){const a=AIM(),vx=tw.x-prev.x,vy=tw.y-prev.y,vm=Math.hypot(vx,vy);
        if(vm>.3&&dist(a,tw)<r*3&&IN.fire){const al=((a.x-tw.x)*vx+(a.y-tw.y)*vy)/vm/r;lags.push(al);const sg=al>.2?1:al<-.2?-1:0;if(sg&&lastSg&&sg!==lastSg)cross++;if(sg)lastSg=sg}}
      prev=tw;
      DBG.t="rastreio";DBG.tw=tw;
      trail.push(tw);if(trail.length>24)trail.shift();
      bg();cx.strokeStyle="rgba(242,189,82,.25)";cx.lineWidth=2;cx.beginPath();trail.forEach((w,i)=>{const q=S(w);i?cx.lineTo(q.x,q.y):cx.moveTo(q.x,q.y)});cx.stroke();
      const q=S(tw);target(q.x,q.y,r,inside);
      if(near&&!IN.fire)text("Segure o tiro",H*.2,Math.round(M*.045),"#f2bd52","Barlow");
      cx.fillStyle="rgba(255,255,255,.08)";cx.fillRect(W*.3,H-22,W*.4,6);cx.fillStyle="#f2bd52";cx.fillRect(W*.3,H-22,W*.4*(t/DUR),6);
      ctrls(false,inside?"#65df9a":null);
      hudP.textContent=`${Math.round(on/tot*100)}% no alvo`;
    }
    const pct=on/Math.max(1,tot);
    MET.track={lag:mean(lags),cross:cross/(DUR/1000),n:lags.length};
    return{score:lin(pct,.2,.85),raw:Math.round(pct*100)+"% do tempo no alvo",v:Math.round(pct*100)};
  }
  /* 4. recuo: segure o tiro; a câmera sobe com o coice e o dedo direito puxa para baixo */
  async function mRecoil(){
    const SPRAYS=3,SHOTS=28,RATE=95,devs=[];
    for(let s=0;s<SPRAYS;s++){
      hudP.textContent=`Spray ${s+1} de ${SPRAYS}`;
      let fired=0,holes=[],dsum=0,armed=false,last=0,done=false,board=AIM();
      while(IN.fire){await frame();bg();text("Solte o tiro para começar o spray",H*.25,Math.round(M*.05),"#f2bd52","Barlow");ctrls(false,"#f2bd52");DBG.t="recuo-espera"}
      while(!done){await frame();const now=clk();
        if(!armed){board=AIM();if(IN.fire){armed=true;last=now}}
        if(armed){if(!IN.fire)done=true;else{while(now-last>=RATE&&fired<SHOTS){last+=RATE;fired++;
          cam.y-=M*(.011+fired*.0006);cam.x+=(Math.random()-.5)*M*.012+(fired>8?M*.0016*Math.sin(fired*.5):0);
          const a=AIM(),h={x:a.x+(Math.random()-.5)*M*.006,y:a.y+(Math.random()-.5)*M*.006};holes.push(h);dsum+=dist(h,board)/M}
          if(fired>=SHOTS)done=true}}
        bg();const b=S(board);
        [M*.04,M*.1,M*.18].forEach((rr,i)=>{cx.strokeStyle=`rgba(255,255,255,${.3-i*.07})`;cx.lineWidth=1.5;cx.beginPath();cx.arc(b.x,b.y,rr,0,7);cx.stroke()});
        cx.fillStyle="#ff3048";cx.beginPath();cx.arc(b.x,b.y,3,0,7);cx.fill();
        holes.forEach((h,i)=>{const q=S(h);cx.globalAlpha=.35+.65*i/Math.max(1,holes.length);cx.beginPath();cx.arc(q.x,q.y,Math.max(3,M*.008),0,7);cx.fill()});cx.globalAlpha=1;
        if(!armed){text("Segure o tiro até o fim do spray",H*.18,Math.round(M*.05),"#f4f5f7","Barlow");text("Puxe o dedo direito para baixo para manter a mira no centro",H*.18+M*.07,Math.round(M*.036),"#a8b0bd","Barlow")}
        else text(`${fired}/${SHOTS}`,H-30,Math.round(M*.045),"#f2bd52");
        ctrls(false,"#f2bd52");DBG.t="recuo";DBG.board=board;DBG.armed=armed;DBG.fired=fired;
      }
      if(fired<10){await flash(1100,()=>text("Segure até o fim do spray",H*.3,Math.round(M*.06),"#ff3048"));s--;continue}
      devs.push(dsum/fired);
      {const late=holes.slice(8);MET.recoil.push({vy:mean(late.map(h=>(h.y-board.y)/M)),vx:mean(late.map(h=>Math.abs(h.x-board.x)/M))})}
      await flash(800,()=>{const b=S(board);cx.fillStyle="#ff3048";holes.forEach(h=>{const q=S(h);cx.beginPath();cx.arc(q.x,q.y,Math.max(3,M*.008),0,7);cx.fill()});[M*.04,M*.1,M*.18].forEach(rr=>{cx.strokeStyle="rgba(255,255,255,.2)";cx.beginPath();cx.arc(b.x,b.y,rr,0,7);cx.stroke()})});
    }
    const avg=devs.reduce((a,b)=>a+b,0)/devs.length;
    return{score:lin(avg,.24,.035),raw:"desvio médio de "+Math.round(avg*100)+"% da tela",v:Math.round(avg*1000)/10};
  }
  const RUN=T?{reacao:mReaction,precisao:mFlick,rastreio:mTrack,recuo:mRecoil}:{reacao:tReaction,precisao:tFlick,rastreio:tTrack,recuo:tRecoil};
  const HOW=T?{
    reacao:["Reação","O alvo aparece em cima da mira. Aperte o botão de tiro o mais rápido possível. Atirar antes conta como antecipação.","5 rodadas"],
    precisao:["Precisão","Alvos surgem fora do centro. Arraste o dedo direito para levar a mira até o alvo e atire antes de o anel dourado acabar.","15 alvos"],
    rastreio:["Rastreamento","Um alvo vai se mover. Segure o tiro e mantenha a mira em cima dele arrastando o dedo direito.","12 segundos"],
    recuo:["Controle de recuo","Segure o tiro até o fim do spray. A câmera sobe e balança com o coice: puxe o dedo direito para baixo para manter a mira no centro.","3 sprays"]
  }:{
    reacao:["Reação","Quando o alvo aparecer, clique o mais rápido possível. Clicar antes conta como antecipação.","5 rodadas"],
    precisao:["Precisão","Alvos aparecem um de cada vez em lugares diferentes. Acerte cada um antes de o anel dourado acabar.","15 alvos"],
    rastreio:["Rastreamento","Um alvo vai se mover pela tela. Mantenha o cursor sobre ele o tempo todo.","12 segundos"],
    recuo:["Controle de recuo","Segure o botão do mouse para atirar. A mira sobe e balança como num spray: arraste para baixo para mantê-la no centro.","3 sprays"]
  };
  const CTRL=`<div class="dg-ctrl"><span><i class="f" aria-hidden="true"></i>Esquerda: botão de tiro</span><span><i class="a" aria-hidden="true"></i>Direita: arraste para mirar</span></div>`;
  const sensUI=()=>`<label class="dg-sens"><span>Sensibilidade do teste <output>${SENS}%</output></span><input type="range" min="50" max="200" step="10" value="${SENS}" aria-label="Sensibilidade do teste"></label>`;
  function bindSens(){const i=scr.querySelector(".dg-sens input");if(!i)return;const o=scr.querySelector(".dg-sens output");
    i.oninput=()=>{SENS=+i.value;o.textContent=SENS+"%";db.cfg=Object.assign({},db.cfg,{sens:SENS});saveDb()}}
    /* ---------- dicas: direção do ajuste, nunca um número ---------- */
  const SETS={cam:"Câmera",ads:"ADS",tec:"Técnica"};
  function genTips(keys){if(!T)return[];const t=[];
    if(keys.includes("precisao")){const f=MET.flick.filter(x=>x.moved);
      if(f.length>=6){const ov=f.filter(x=>x.over).length/f.length,sl=f.filter(x=>!x.over&&(x.reach===null||x.reach>1300||x.drags>=3)).length/f.length;
        if(ov>=.4&&ov>sl)t.push({k:"precisao",s:"cam",d:"down",c:ov>=.6?"alta":"média",w:`A mira passou do alvo em ${Math.round(ov*100)}% das vezes antes do tiro.`});
        else if(sl>=.35&&ov<.2)t.push({k:"precisao",s:"cam",d:"up",c:sl>=.6?"alta":"média",w:`Em ${Math.round(sl*100)}% dos alvos você chegou devagar ou precisou de várias arrastadas.`});
        else t.push({k:"precisao",s:"cam",d:"keep",c:"média",w:"Você chegou aos alvos sem passar muito nem ficar curto."})}}
    let ads=null;
    if(keys.includes("recuo")&&MET.recoil.length){const vy=mean(MET.recoil.map(x=>x.vy)),vx=mean(MET.recoil.map(x=>x.vx)),same=MET.recoil.filter(x=>Math.sign(x.vy)===Math.sign(vy)&&Math.abs(x.vy)>.02).length;
      if(vy<-.03)ads={k:"recuo",s:"ads",d:"up",c:same>=3?"alta":"média",w:"No spray os tiros terminaram acima do centro: faltou puxar. Se você já puxa o máximo confortável, suba a ADS; se não, puxe mais firme antes de mexer."};
      else if(vy>.03)ads={k:"recuo",s:"ads",d:"down",c:same>=3?"alta":"média",w:"No spray os tiros terminaram abaixo do centro: você puxou demais."};
      else ads={k:"recuo",s:"ads",d:"keep",c:"média",w:"No spray os tiros ficaram na altura do centro."};
      if(vx>.035)t.push({k:"recuo",s:"tec",d:"tip",c:"média",w:"Os tiros espalharam para os lados. Isso é controle lateral, não sensibilidade: faça sprays curtos corrigindo para a esquerda e a direita."})}
    if(keys.includes("rastreio")&&MET.track&&MET.track.n>60){const {lag,cross}=MET.track;
      const tr=lag<-.45?"up":(lag>.25||cross>1.4)?"down":"keep";
      const why=tr==="up"?"No rastreamento a mira ficou atrás do alvo.":tr==="down"?"No rastreamento a mira passou na frente do alvo e voltou várias vezes.":"No rastreamento a mira acompanhou bem o alvo.";
      if(!ads)ads={k:"rastreio",s:"ads",d:tr,c:"média",w:why};
      else if(ads.d===tr){ads.c="alta";ads.w+=" "+why.replace("No rastreamento","O rastreamento confirma:").replace(" a mira"," a mira")}
      else if(tr!=="keep"&&ads.d!=="keep"){ads.d="keep";ads.c="baixa";ads.w="Spray e rastreamento apontaram direções opostas. Mantenha a ADS e refaça os dois testes para confirmar."}}
    if(ads)t.push(ads);
    if(keys.includes("reacao")){if(MET.fouls>=2)t.push({k:"reacao",s:"tec",d:"tip",c:"alta",w:`Você atirou antes do alvo ${MET.fouls} vezes. Espere ver o inimigo: no jogo, atirar cedo entrega sua posição.`});
      else if(MET.med>380)t.push({k:"reacao",s:"tec",d:"tip",c:"média",w:"Reação acima de 380 ms. Deixe a mira já na altura onde o inimigo vai aparecer e jogue com o FPS mais alto que o aparelho aguentar."})}
    return t}
  const DIR={up:["▲","Aumentar"],down:["▼","Diminuir"],keep:["●","Manter"],tip:["!","Dica"]};
  function tipsHTML(list,foot){if(!list||!list.length)return"";
    return `<div class="dg-tips"><small>Ajuste sugerido</small><ul>${list.map(x=>`<li class="t-${x.d}"><span class="t-dir"><i>${DIR[x.d][0]}</i>${DIR[x.d][1]}</span><div><b>${x.s==="tec"?"Técnica":"Sensibilidade "+SETS[x.s]}${x.s==="cam"?" <em>mover a mira sem atirar</em>":x.s==="ads"?" <em>mover a mira atirando</em>":""}</b><p>${esc(x.w)}</p><span class="t-conf">Confiança ${x.c}</span></div></li>`).join("")}</ul>
      ${foot?`<p class="dg-tnote">Mude 5 a 10 pontos, uma sensibilidade por vez, e refaça o teste. A sensibilidade do teste não é a do jogo: siga a direção, não o número. Se você joga com giroscópio, estas dicas valem para o arraste na tela.</p>`:""}</div>`}
  /* ---------- gráfico de evolução ---------- */
  function hist(list,k){return list.filter(e=>k==="all"?Object.keys(e.s).length===4:e.s[k]!=null).slice(-10).map(e=>({v:k==="all"?Math.round(Object.values(e.s).reduce((a,b)=>a+b,0)/4):e.s[k],d:e.d}))}
  function evoChart(pts,title){
    if(pts.length<2)return `<div class="dg-evo"><small>${title}</small><p class="dg-evo-empty">${pts.length?`Primeira nota: <b>${pts[0].v}</b>. Refaça depois de treinar para ver a evolução.`:"Ainda sem resultados."}</p></div>`;
    const w=420,h=150,px=30,py=16,X=i=>px+i*(w-px-14)/(pts.length-1),Y=v=>py+(h-py-24)*(1-v/100);
    let g=`<svg viewBox="0 0 ${w} ${h}" class="dg-chart" role="img" aria-label="${title}: ${pts.map(p=>p.v).join(", ")}">`;
    [0,50,100].forEach(v=>{g+=`<line x1="${px}" x2="${w-8}" y1="${Y(v)}" y2="${Y(v)}" class="cg"/><text x="${px-6}" y="${Y(v)+4}" class="ct" text-anchor="end">${v}</text>`});
    const d=pts.map((p,i)=>`${i?"L":"M"}${X(i).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(" ");
    g+=`<path d="${d} L${X(pts.length-1).toFixed(1)} ${Y(0)} L${X(0)} ${Y(0)}Z" class="ca"/><path d="${d}" class="cl"/>`;
    pts.forEach((p,i)=>{const last=i===pts.length-1;g+=`<circle cx="${X(i)}" cy="${Y(p.v)}" r="${last?5:3.5}" class="${last?"cdl":"cd"}"/>`;if(last||i===0)g+=`<text x="${X(i)}" y="${Y(p.v)-10}" class="cv" text-anchor="${i===0?"start":"end"}">${p.v}</text>`});
    const f=s=>new Date(s).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
    g+=`<text x="${X(0)}" y="${h-4}" class="ct">${f(pts[0].d)}</text><text x="${X(pts.length-1)}" y="${h-4}" class="ct" text-anchor="end">${f(pts[pts.length-1].d)}</text></svg>`;
    const dv=pts[pts.length-1].v-pts[0].v;
    return `<div class="dg-evo"><small>${title}</small>${g}<p class="dg-evo-d ${dv>0?"up":dv<0?"down":""}">${dv>0?"▲ +"+dv:dv<0?"▼ "+dv:"="} desde ${f(pts[0].d)} · ${pts.length} rodadas</p></div>`}
  /* ---------- execução ---------- */
  let pcOk=false;
  async function run(keys){
    open();const out={};MET={flick:[],track:null,recoil:[],fouls:0,med:0};
    try{
      if(!T&&!pcOk){hudT.textContent="Diagnóstico";hudP.textContent="";bg();
        const g=await screen(`<div class="dg-card dg-pc"><p class="dg-step">Feito para celular</p><h3>Melhor no celular</h3><p>No celular, com o aparelho deitado, o botão de tiro fica à esquerda e o dedo direito move a câmera, como no PUBG Mobile. Abra este site no celular para o resultado que vale.</p><p class="dg-dur">No computador você joga com o mouse, e o resultado fica separado do celular.</p><div class="dg-acts"><button type="button" class="btn" data-go="1">Jogar com o mouse</button><button type="button" class="btn secondary" data-go="x">Voltar</button></div></div>`);
        if(g==="x"){close();return}pcOk=true}
      for(const k of keys){
        hudT.textContent=HOW[k][0];hudP.textContent="";bg();
        const pr=screen(`<div class="dg-card"><p class="dg-step">${keys.length>1?`Teste ${keys.indexOf(k)+1} de ${keys.length}`:"Teste"}</p><h3>${HOW[k][0]}</h3><p>${HOW[k][1]}</p>${T?CTRL:""}<p class="dg-dur">${HOW[k][2]}</p>${T?sensUI():""}<button type="button" class="btn" data-go="1">Começar</button></div>`);
        bindSens();await pr;
        cam.x=cam.y=0;DBG.t="contagem";await countdown();out[k]=await RUN[k]();
        if(keys.length>1&&keys.indexOf(k)<keys.length-1){
          const pv=[...(db[DEV]||[])].reverse().find(e=>e.s[k]!=null),dl=pv?out[k].score-pv.s[k]:null,sc=out[k].score;
          hudT.textContent=HOW[k][0];hudP.textContent="Concluído";bg();
          await screen(`<div class="dg-card dg-one"><p class="dg-step">Teste ${keys.indexOf(k)+1} de ${keys.length} concluído</p><h3>${HOW[k][0]}</h3>
            <div class="dg-big"><b>${sc}</b><span>/100</span></div><i class="dg-bar"><em style="width:${sc}%"></em></i>
            <p class="dg-lvl">${level(sc)}</p>${dl!==null?`<p class="dg-dl"><span class="dg-d ${dl>0?"up":dl<0?"down":""}">${dl>0?"▲ +"+dl:dl<0?"▼ "+dl:"= igual"}</span> em relação ao teste anterior</p>`:""}<p class="dg-raw">${esc(out[k].raw)}</p>
            ${tipsHTML(genTips([k]),false)}<button type="button" class="btn" data-go="1">Próximo teste</button></div>`)}
      }
      const entry={d:new Date().toISOString(),s:{},r:{}};keys.forEach(k=>{entry.s[k]=out[k].score;entry.r[k]=out[k].raw});
      const tips=genTips(keys);if(tips.length)entry.t=tips;
      (db[DEV]=db[DEV]||[]).push(entry);db[DEV]=db[DEV].slice(-30);saveDb();render();
      hudT.textContent="Resultado";hudP.textContent="";bg();
      const tot=keys.length===4?Math.round(keys.reduce((a,k)=>a+out[k].score,0)/4):null;
      const one=keys.length===1?keys[0]:null,evo=evoChart(hist(db[DEV],one||(tot!==null?"all":keys[0])),one?"Sua evolução em "+HOW[one][0]:"Evolução da nota geral");
      const go=await screen(`<div class="dg-card dg-sum"><div class="dg-sum-a"><h3>${tot!==null?`Nota geral <b>${tot}</b>`:one?`${HOW[one][0]} <b>${out[one].score}</b>`:"Resultado"}</h3>${tot!==null?`<p class="dg-lvl">${level(tot)}</p>`:one?`<p class="dg-lvl">${level(out[one].score)} · nota de 0 a 100</p>`:""}
        <ul>${keys.map(k=>`<li><span>${HOW[k][0]}</span><i><em style="width:${out[k].score}%"></em></i><b>${out[k].score}</b><small>${esc(out[k].raw)}</small></li>`).join("")}</ul>${evo}</div>
        <div class="dg-sum-b">${tipsHTML(tips,true)||(T?"":`<div class="dg-tips"><small>Ajuste sugerido</small><p class="dg-tnote">As dicas de sensibilidade aparecem quando você faz o teste no celular, no modo jogo.</p></div>`)}</div>
        <div class="dg-acts"><button type="button" class="btn" data-go="see">Ver perfil completo</button><button type="button" class="btn secondary" data-go="again">Refazer</button></div></div>`);
      close();
      if(go==="again")setTimeout(()=>run(keys),60);else document.getElementById("dgResult").scrollIntoView({behavior:"smooth",block:"start"});
    }catch(e){if(!(e instanceof Abort))throw e;close()}
  }
  root.addEventListener("click",e=>{const b=e.target.closest("[data-dg]");if(!b)return;const k=b.dataset.dg;run(k==="all"?SK.map(s=>s.k):[k])});

  /* ---------- perfil na seção ---------- */
  const level=v=>v>=70?"Avançado":v>=40?"Intermediário":"Iniciante";
  function profile(list){const p={},prev={};
    for(let i=list.length-1;i>=0;i--)for(const k in list[i].s){if(p[k]===undefined){p[k]={v:list[i].s[k],r:list[i].r[k],i}}else if(prev[k]===undefined&&i<p[k].i)prev[k]=list[i].s[k]}
    return{p,prev}}
  function radar(vals,prev){
    const R=110,c=140,ang=i=>-Math.PI/2+i*Math.PI/2,pt=(i,v)=>[c+Math.cos(ang(i))*R*v/100,c+Math.sin(ang(i))*R*v/100];
    let g=`<svg class="dg-radar" viewBox="-30 0 340 290" role="img" aria-label="Perfil: ${SK.map((s,i)=>s.n+" "+(vals[i]??"sem teste")).join(", ")}">`;
    [25,50,75,100].forEach(l=>{g+=`<polygon points="${SK.map((_,i)=>pt(i,l).join(",")).join(" ")}" class="rg${l===100?" o":""}"/>`});
    SK.forEach((_,i)=>{const [x,y]=pt(i,100);g+=`<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" class="rg"/>`});
    if(prev&&prev.every(v=>v!=null))g+=`<polygon points="${prev.map((v,i)=>pt(i,v).join(",")).join(" ")}" class="rp"/>`;
    if(vals.some(v=>v!=null)){g+=`<polygon points="${vals.map((v,i)=>pt(i,v??0).join(",")).join(" ")}" class="rv"/>`;vals.forEach((v,i)=>{if(v!=null){const [x,y]=pt(i,v);g+=`<circle cx="${x}" cy="${y}" r="4" class="rd"/>`}})}
    const lab=[[c,16,"middle"],[c+R+10,c+4,"start"],[c,c+R+24,"middle"],[c-R-10,c+4,"end"]];
    SK.forEach((s,i)=>{g+=`<text x="${lab[i][0]}" y="${lab[i][1]}" text-anchor="${lab[i][2]}">${s.sn||s.n}</text>`});
    return g+"</svg>";
  }
  function render(){
    const el=document.getElementById("dgResult");if(!el)return;
    const list=db[DEV]||[];
    if(!list.length){el.innerHTML=`<div class="dg-empty">${radar([null,null,null,null])}<h3>Seu perfil aparece aqui</h3><p class="muted">Faça o diagnóstico completo para ver a nota de cada habilidade, o nível geral e o que treinar primeiro.</p></div>`;return}
    const {p,prev}=profile(list),vals=SK.map(s=>p[s.k]?p[s.k].v:null),pv=SK.map(s=>prev[s.k]??null);
    const all=vals.every(v=>v!=null),tot=all?Math.round(vals.reduce((a,b)=>a+b,0)/4):null;
    const weak=all?SK.reduce((a,s)=>p[s.k].v<p[a.k].v?s:a,SK[0]):null;
    const full=list.filter(e=>Object.keys(e.s).length===4).slice(-6).reverse();
    el.innerHTML=`<div class="dg-top"><div>${radar(vals,pv)}<p class="dg-leg"><i class="v"></i>Atual ${pv.some(v=>v!=null)?'<i class="p"></i>Anterior':""}</p></div>
      <div class="dg-score">${tot!==null?`<small>Nota geral</small><b>${tot}</b><span class="dg-badge">${level(tot)}</span>`:`<small>Perfil parcial</small><p class="muted">Faça os 4 testes para ter a nota geral.</p>`}
      <p class="dg-dev">${T?"Resultados do celular (modo jogo)":"Resultados do computador (mouse)"} · ${new Date(list[list.length-1].d).toLocaleDateString("pt-BR")}</p></div></div>
      <ul class="dg-skills">${SK.map((s,i)=>{const v=vals[i],d=v!=null&&pv[i]!=null?v-pv[i]:null;return `<li><span>${s.n}</span><i><em style="width:${v??0}%"></em></i><b>${v??"—"}</b>${d?`<em class="dg-d ${d>0?"up":"down"}">${d>0?"▲":"▼"} ${Math.abs(d)}</em>`:""}<small>${v!=null?esc(p[s.k].r):"Ainda não testado"}</small></li>`}).join("")}</ul>
      ${weak?`<div class="dg-rec"><small>Ponto a treinar primeiro</small><b>${REC[weak.k][0]}</b><p>${REC[weak.k][1]}</p><a href="${REC[weak.k][2]}">${REC[weak.k][3]}</a></div>`:""}
      <div class="dg-evo-wrap"><div class="dg-evo-tabs" role="tablist" aria-label="Ver evolução de">${[["all","Nota geral"],...SK.map(s=>[s.k,s.sn||s.n])].map(([k,n],i)=>`<button type="button" role="tab" class="chipbtn${i===0?" on":""}" data-evo="${k}" aria-selected="${i===0}">${n}</button>`).join("")}</div><div id="dgEvo">${evoChart(hist(list,"all"),"Evolução da nota geral")}</div></div>
      ${(()=>{const lt=[...list].reverse().find(e=>e.t);return lt?`<div class="dg-ptips">${tipsHTML(lt.t,true)}<p class="dg-tlinks"><a href="#sensibilidade">Ver sensibilidades TKS</a> · <a href="#lab">Abrir o laboratório</a></p></div>`:""})()}
      <button type="button" class="chipbtn dg-clear" id="dgClear">Apagar resultados deste aparelho</button>`;
    el.querySelectorAll("[data-evo]").forEach(b=>b.onclick=()=>{el.querySelectorAll("[data-evo]").forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-selected",x===b)});
      const k=b.dataset.evo,n=k==="all"?"Evolução da nota geral":"Evolução em "+SK.find(s=>s.k===k).n;document.getElementById("dgEvo").innerHTML=evoChart(hist(list,k),n)});
    const c=document.getElementById("dgClear");
    c.onclick=()=>{if(!c.dataset.armed){c.dataset.armed="1";c.textContent="Confirmar: apagar resultados";setTimeout(()=>{if(c.isConnected){delete c.dataset.armed;c.textContent="Apagar resultados deste aparelho"}},3000);return}
      db[DEV]=[];saveDb();render()};
  }
  const devEl=document.getElementById("dgDevice");if(devEl)devEl.textContent=T?"Celular · tiro à esquerda, mira à direita":"Computador (mouse) · feito para celular";
  render();
  window.__tksDiag={run,db:()=>db,dev:DEV,dbg:DBG,cam,met:()=>MET,aim:()=>AIM(),fire:()=>FIRE()};
})();
