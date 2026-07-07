"use strict";

const ELS = ["H","He","C","O","Ne","Mg","Si","Fe"];
const CELLS = { H:9, He:11, C:13, O:15, Ne:17, Mg:19, Si:21, Fe:25 };
const SPEED = { H:56, He:38, C:28, O:22, Ne:18, Mg:15, Si:12, Fe:8 };
const WINDOW = { H:60, He:60, C:120, O:120, Ne:300, Mg:300, Si:300, Fe:300 };
const RECIPES = [
  { out:"Fe", parts:{ Si:2 }, r:80 },
  { out:"Si", parts:{ Mg:1, He:5 }, r:76 },
  { out:"Mg", parts:{ Ne:1, He:4 }, r:72 },
  { out:"Ne", parts:{ O:1, He:3 }, r:68 },
  { out:"O",  parts:{ C:1, He:2 }, r:62 },
  { out:"C",  parts:{ He:3 }, r:64 },
  { out:"He", parts:{ H:4 }, r:52 },
];
const RECIPE_OF = {};
for (const r of RECIPES) RECIPE_OF[r.out] = r;
const DRAW_CAP = 100;
const ENT_CAP = 600;
const BASE_SPAWN = 1/3;
const SAVE_KEY = "atomling_v01";
const INKC = "#f2f3ef";
const BGC = "#0b0d10";

const GLYPH = {
  H:["#.#","#.#","###","#.#","#.#"], E:["###","#..","###","#..","###"],
  C:[".##","#..","#..","#..",".##"], O:[".##.","#..#","#..#","#..#",".##."],
  N:["#..#","##.#","#.##","#..#","#..#"], G:[".##","#..","#.#","#.#",".##"],
  M:["#...#","##.##","#.#.#","#...#","#...#"], S:[".##","#..",".#.","..#","##."],
  I:["#","#","#","#","#"], F:["###","#..","##.","#..","#.."],
};
const LETTERS = { H:["H"], He:["H","E"], C:["C"], O:["O"], Ne:["N","E"], Mg:["M","G"], Si:["S","I"], Fe:["F","E"] };
const NAMES = { H:"Hydrogen", He:"Helium", C:"Carbon", O:"Oxygen", Ne:"Neon", Mg:"Magnesium", Si:"Silicon", Fe:"Iron" };
const glyphW = g => GLYPH[g][0].length;

function letterCells(el){
  const gs = LETTERS[el];
  const w = gs.reduce((a,g)=>a+glyphW(g),0) + (gs.length-1);
  const cells = [];
  let x = 0;
  gs.forEach((g,gi)=>{
    GLYPH[g].forEach((row,y)=>{
      for (let i=0;i<row.length;i++) if (row[i]==="#") cells.push([x+i, y+(gi===1?1:0)]);
    });
    x += glyphW(g)+1;
  });
  return { cells, w, h: gs.length>1 ? 6 : 5 };
}
function makeSprite(el){
  const D = CELLS[el];
  const cv = document.createElement("canvas");
  cv.width = D; cv.height = D;
  const x2 = cv.getContext("2d");
  const c = (D-1)/2, rr = D/2 - .15;
  const { cells, w, h } = letterCells(el);
  const ox = Math.round((D-w)/2), oy = Math.round((D-h)/2);
  const lset = new Set(cells.map(([x,y])=>(x+ox)+","+(y+oy)));
  x2.fillStyle = INKC;
  for (let y=0;y<D;y++) for (let x=0;x<D;x++){
    const dx = x-c, dy = y-c;
    if (dx*dx+dy*dy <= rr*rr && !lset.has(x+","+y)) x2.fillRect(x,y,1,1);
  }
  return cv;
}
const SPR = {};
for (const el of ELS) SPR[el] = makeSprite(el);

const S = {
  counts:{}, upgrades:[0,0,0,0], activated:false,
  discovered:{ H:true }, overflowNotified:false, ts:Date.now(),
};
for (const el of ELS) S.counts[el] = 0;

let entities = [];
let flashes = [];
let spawnAcc = 0;
let TSCALE = 1;
let eid = 0;
const hist = {};
for (const el of ELS) hist[el] = [];
let activatedAt = 0;

const UPS = [
  { icon:"u0", desc:"deeper well · hydrogen arrives faster",
    mult:l=>Math.pow(1.5,l), cost:l=>Math.floor(20*Math.pow(2.6,l)) },
  { icon:"u1", desc:"wider mouth · the well drinks more of the dark",
    mult:l=>Math.pow(1.4,l), cost:l=>Math.floor(60*Math.pow(2.8,l)) },
  { icon:"u2", desc:"steeper fall · gravity works overtime",
    mult:l=>Math.pow(1.6,l), cost:l=>Math.floor(180*Math.pow(3,l)) },
  { icon:"u3", desc:"second throat · a parallel drip",
    mult:l=>Math.pow(1.35,l), cost:l=>Math.floor(400*Math.pow(3.2,l)) },
];
function spawnRate(){
  let r = BASE_SPAWN;
  UPS.forEach((u,i)=>{ r *= u.mult(S.upgrades[i]); });
  return r;
}
const baseRate = spawnRate;

let cv, ctx, W, H, DPR;
let SC = 3;
let STAGEK = 1;
const VES = { x0:0, y0:0, x1:0, y1:0 };
function resize(){
  DPR = Math.min(2, window.devicePixelRatio||1);
  W = cv.offsetWidth; H = cv.offsetHeight;
  const px = DPR * STAGEK;
  cv.width = Math.round(W*px); cv.height = Math.round(H*px);
  ctx.setTransform(px,0,0,px,0,0);
  ctx.imageSmoothingEnabled = false;
  SC = H < 240 ? 2 : 3;
  const bw = W-28, bh = H-28;
  VES.x0 = Math.round((W-bw)/2); VES.y0 = Math.round((H-bh)/2);
  VES.x1 = VES.x0 + bw; VES.y1 = VES.y0 + bh;
}
function fitStage(){
  let k = Math.min(window.innerWidth/960, window.innerHeight/540);
  k = k >= 1 ? Math.floor(k) : Math.max(.3, k);
  STAGEK = k;
  document.getElementById("game").style.transform =
    `translate(-50%,-50%) scale(${k.toFixed(4)})`;
}

function record(el){
  hist[el].push(performance.now());
  if (hist[el].length > 4000) hist[el].splice(0, 1000);
}
function ratePerMin(el){
  const now = performance.now();
  const Wms = WINDOW[el]*1000;
  const arr = hist[el];
  let i = arr.length;
  while (i > 0 && arr[i-1] >= now - Wms) i--;
  const n = arr.length - i;
  const elapsed = activatedAt ? Math.min(now - activatedAt, Wms) : Wms;
  if (elapsed < 1000) return 0;
  return n / (elapsed/1000) * 60;
}

function virtualCount(el){
  let ec = 0;
  for (const p of entities) if (p.el === el && !p.lock) ec++;
  for (const p of entities) if (p.el === el && p.lock) ec++;
  return S.counts[el] - ec;
}
function spawnEntity(el, x, y){
  const a = Math.random()*7;
  entities.push({
    id: eid++, el,
    x: x ?? VES.x0+20, y: y ?? (VES.y0+20+Math.random()*(VES.y1-VES.y0-40)),
    vx: x===undefined ? 40+Math.random()*40 : Math.cos(a)*30,
    vy: x===undefined ? (Math.random()-.5)*60 : Math.sin(a)*30,
    jx:0, jy:0, jn:0, pri: ELS.indexOf(el),
  });
}
function consume(el, n){
  let need = n;
  const vc = virtualCount(el);
  const fromVirtual = Math.min(vc, need);
  need -= fromVirtual;
  if (need > 0){
    for (let i=entities.length-1; i>=0 && need>0; i--){
      if (entities[i].el === el && !entities[i].lock){ entities.splice(i,1); need--; }
    }
  }
  S.counts[el] -= n - need;
}

function simSpawn(dt){
  if (!S.activated) return;
  spawnAcc += spawnRate()*dt;
  while (spawnAcc >= 1){
    spawnAcc--;
    S.counts.H++;
    record("H");
    if (entities.length < ENT_CAP) spawnEntity("H");
  }
}

function physics(dt){
  for (const p of entities){
    if (p.lock) continue;
    p.x += p.vx*dt; p.y += p.vy*dt;
    const sv = SPEED[p.el], m = Math.hypot(p.vx,p.vy)||1, want = sv/m;
    p.vx += p.vx*(want-1)*dt*1.6; p.vy += p.vy*(want-1)*dt*1.6;
    const r = CELLS[p.el]*SC/2 + 4;
    if (p.x < VES.x0+r){ p.x=VES.x0+r; p.vx=Math.abs(p.vx); }
    if (p.x > VES.x1-r){ p.x=VES.x1-r; p.vx=-Math.abs(p.vx); }
    if (p.y < VES.y0+r){ p.y=VES.y0+r; p.vy=Math.abs(p.vy); }
    if (p.y > VES.y1-r){ p.y=VES.y1-r; p.vy=-Math.abs(p.vy); }
  }
}

function tryReactions(){
  for (const rec of RECIPES){
    const pools = {};
    let ok = true;
    for (const el in rec.parts){
      pools[el] = entities.filter(p=>p.el===el && !p.lock);
      if (pools[el].length < rec.parts[el]){ ok = false; break; }
    }
    if (!ok) continue;
    const seedEl = Object.keys(rec.parts).find(el=>el!=="He") || "He";
    for (const seed of pools[seedEl]){
      const group = [seed];
      let fail = false;
      for (const el in rec.parts){
        let need = rec.parts[el] - (el===seedEl ? 1 : 0);
        if (need <= 0) continue;
        const near = pools[el]
          .filter(p=>p!==seed && !group.includes(p) && Math.hypot(p.x-seed.x,p.y-seed.y) < rec.r)
          .sort((a,b)=>Math.hypot(a.x-seed.x,a.y-seed.y)-Math.hypot(b.x-seed.x,b.y-seed.y));
        if (near.length < need){ fail = true; break; }
        for (let k=0;k<need;k++) group.push(near[k]);
      }
      if (!fail){
        const grp = { set:group, out:rec.out, t:0 };
        group.forEach(p=>{ p.lock = true; p.grp = grp; });
        return;
      }
    }
  }
}

function resolveReactions(dt){
  const done = new Set();
  for (const p of entities) if (p.lock && !done.has(p.grp)){ p.grp.t += dt; done.add(p.grp); }
  for (const p of entities){
    if (!p.lock) continue;
    const g = p.grp;
    const cx = g.set.reduce((a,q)=>a+q.x,0)/g.set.length;
    const cy = g.set.reduce((a,q)=>a+q.y,0)/g.set.length;
    p.x += (cx-p.x)*dt*10; p.y += (cy-p.y)*dt*10;
  }
  for (const grp of done){
    if (grp.t < .4) continue;
    const cx = grp.set.reduce((a,q)=>a+q.x,0)/grp.set.length;
    const cy = grp.set.reduce((a,q)=>a+q.y,0)/grp.set.length;
    for (const q of grp.set){
      const i = entities.indexOf(q);
      if (i>=0) entities.splice(i,1);
      S.counts[q.el]--;
    }
    S.counts[grp.out]++;
    record(grp.out);
    if (!S.discovered[grp.out]){ S.discovered[grp.out] = true; buildFormationRows(); }
    spawnEntity(grp.out, cx, cy);
    flashes.push({ x:cx, y:cy, t:0 });
  }
  for (const f of flashes) f.t += dt;
  flashes = flashes.filter(f=>f.t<.45);
}

function refill(){
  const vh = virtualCount("H");
  let room = ENT_CAP - entities.length;
  for (let i=0;i<Math.min(vh, room, 5);i++) spawnEntity("H");
}

function jit(j, t){
  if (t > j.jn){
    j.jx = Math.floor(Math.random()*3)-1;
    j.jy = Math.floor(Math.random()*3)-1;
    j.jn = t + .035 + Math.random()*.035;
  }
}
function draw(t){
  ctx.fillStyle = BGC;
  ctx.fillRect(0,0,W,H);
  ctx.fillStyle = "rgba(240,243,239,.03)";
  ctx.fillRect(VES.x0, VES.y0, VES.x1-VES.x0, VES.y1-VES.y0);
  ctx.fillStyle = "rgba(240,243,239,.14)";
  ctx.fillRect(VES.x0, VES.y0, VES.x1-VES.x0, 2);
  ctx.fillRect(VES.x0, VES.y1, VES.x1-VES.x0, 2);
  ctx.fillRect(VES.x0, VES.y0, 2, VES.y1-VES.y0);
  ctx.fillRect(VES.x1, VES.y0, 2, VES.y1-VES.y0+2);
  const sorted = entities.slice().sort((a,b)=> b.pri - a.pri || a.id - b.id);
  const drawn = sorted.slice(0, DRAW_CAP);
  if (sorted.length > DRAW_CAP && !S.overflowNotified){
    S.overflowNotified = true;
    const toast = document.getElementById("toast");
    toast.textContent = "100+ atoms · the smallest keep working unseen";
    toast.hidden = false;
    setTimeout(()=>{ toast.hidden = true; }, 6000);
    save();
  }
  for (const p of drawn){
    jit(p, t);
    const sp = SPR[p.el], s = SC;
    ctx.drawImage(sp, 0, 0, sp.width, sp.height,
      Math.round(p.x - sp.width*s/2) + p.jx, Math.round(p.y - sp.height*s/2) + p.jy,
      sp.width*s, sp.height*s);
  }
  ctx.fillStyle = INKC;
  for (const f of flashes){
    const k = f.t/.45;
    const r = Math.round(6+k*26);
    const cx = Math.round(f.x), cy = Math.round(f.y);
    ctx.globalAlpha = .6*(1-k);
    ctx.fillRect(cx-r, cy-r, r*2, 3);
    ctx.fillRect(cx-r, cy+r, r*2, 3);
    ctx.fillRect(cx-r, cy-r, 3, r*2);
    ctx.fillRect(cx+r, cy-r, 3, r*2+3);
    ctx.globalAlpha = 1;
  }
}

let curTab = 0;
let hBarI = null;
const tabContent = document.getElementById("tabContent");
const tip = document.getElementById("tip");

function recipeText(el){
  if (el === "H") return `<b>${NAMES[el]}</b>`;
  const rec = RECIPE_OF[el];
  const parts = Object.entries(rec.parts).map(([e,n])=>`${n} ${e}`).join(" + ");
  return `<b>${NAMES[el]}</b><br>${parts} -> ${el}`;
}
function showTip(html, x, y){
  tip.innerHTML = html;
  tip.hidden = false;
  const r = tip.getBoundingClientRect();
  tip.style.left = Math.min(x+14, window.innerWidth - r.width - 10) + "px";
  tip.style.top = Math.min(y+14, window.innerHeight - r.height - 10) + "px";
}
function hideTip(){ tip.hidden = true; }

function miniCanvas(el, scale){
  const c = document.createElement("canvas");
  const sp = SPR[el];
  c.width = sp.width*scale; c.height = sp.height*scale;
  const x = c.getContext("2d");
  x.imageSmoothingEnabled = false;
  x.drawImage(sp, 0, 0, c.width, c.height);
  return c;
}

function buildFormationRows(){
  if (curTab !== 0) return;
  tabContent.innerHTML = "";
  if (!S.activated){
    const row = document.createElement("div");
    row.className = "row locked";
    row.appendChild(miniCanvas("H", 2));
    const lab = document.createElement("span");
    lab.className = "lockLab";
    lab.textContent = "0";
    row.appendChild(lab);
    row.addEventListener("pointerdown", () => {
      S.activated = true;
      activatedAt = performance.now();
      save();
      buildFormationRows();
    });
    row.addEventListener("pointerenter", e => showTip(recipeText("H"), e.clientX, e.clientY));
    row.addEventListener("pointerleave", hideTip);
    tabContent.appendChild(row);
    return;
  }
  for (const el of ELS){
    if (!S.discovered[el]) continue;
    const row = document.createElement("div");
    row.className = "row";
    row.dataset.el = el;
    row.appendChild(miniCanvas(el, 2));
    const cnt = document.createElement("span");
    cnt.className = "cnt";
    row.appendChild(cnt);
    if (el === "H"){
      const bar = document.createElement("div");
      bar.className = "barBox";
      bar.innerHTML = "<i></i>";
      row.appendChild(bar);
      hBarI = bar.querySelector("i");
      const rate = document.createElement("span");
      rate.className = "rateBig";
      rate.hidden = true;
      row.appendChild(rate);
      const pm = document.createElement("span");
      pm.className = "permin";
      row.appendChild(pm);
    }
    row.addEventListener("pointerenter", e =>
      showTip(recipeText(el) + `<br>${ratePerMin(el).toFixed(el==="H"?0:1)}/min`, e.clientX, e.clientY));
    row.addEventListener("pointerleave", hideTip);
    tabContent.appendChild(row);
  }
}

function buildUpgrades(){
  if (curTab !== 1) return;
  tabContent.innerHTML = "";
  const grid = document.createElement("div");
  grid.id = "ups";
  UPS.forEach((u,i)=>{
    const card = document.createElement("div");
    card.className = "up";
    card.innerHTML = `<div class="uic ${u.icon}"></div><div class="ucost"></div>`;
    card.addEventListener("pointerenter", e => {
      const l = S.upgrades[i];
      showTip(`${u.desc}<br><b>x${u.mult(l).toFixed(2)}</b> → <b>x${u.mult(l+1).toFixed(2)}</b><br>cost ${u.cost(l)} H`, e.clientX, e.clientY);
    });
    card.addEventListener("pointerleave", hideTip);
    card.addEventListener("pointerdown", () => {
      const l = S.upgrades[i];
      if (S.counts.H < u.cost(l)) return;
      consume("H", u.cost(l));
      S.upgrades[i]++;
      save();
      hideTip();
    });
    grid.appendChild(card);
  });
  tabContent.appendChild(grid);
}

function refreshTab(){
  if (curTab === 0){
    if (!S.activated) return;
    const rows = tabContent.querySelectorAll(".row[data-el]");
    for (const row of rows){
      const el = row.dataset.el;
      row.querySelector(".cnt").textContent = S.counts[el];
      if (el === "H"){
        const r = spawnRate();
        const bar = row.querySelector(".barBox");
        const rate = row.querySelector(".rateBig");
        row.querySelector(".permin").textContent = (1/r).toFixed(1) + "s";
        if (r > 1.5){
          bar.hidden = true; rate.hidden = false;
          rate.textContent = r.toFixed(1) + "/s";
        } else {
          bar.hidden = false; rate.hidden = true;
        }
      }
    }
  } else if (curTab === 1){
    const cards = tabContent.querySelectorAll(".up");
    cards.forEach((card,i)=>{
      const l = S.upgrades[i];
      const c = UPS[i].cost(l);
      card.querySelector(".ucost").textContent = c + " H";
      card.classList.toggle("afford", S.counts.H >= c);
      card.classList.toggle("dim", S.counts.H < c);
    });
  }
}

document.querySelectorAll(".tab:not(.lock)").forEach(b => {
  b.addEventListener("pointerdown", () => {
    curTab = +b.dataset.tab;
    document.querySelectorAll(".tab").forEach(x => x.classList.toggle("on", x === b));
    hideTip();
    if (curTab === 0) buildFormationRows();
    else buildUpgrades();
  });
});

let wiping = false;
function save(){
  if (wiping) return;
  S.ts = Date.now();
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }catch(e){}
}
function wipe(){
  wiping = true;
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}
function load(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    Object.assign(S, d);
    for (const el of ELS) if (S.counts[el] === undefined) S.counts[el] = 0;
    const away = Math.min(8*3600, (Date.now()-(d.ts||Date.now()))/1000);
    if (away > 30 && S.activated){
      S.counts.H += Math.floor(baseRate()*away);
      const events = Math.floor(away/8);
      for (const rec of RECIPES.slice().reverse()){
        let possible = events;
        for (const el in rec.parts) possible = Math.min(possible, Math.floor(S.counts[el]/rec.parts[el]));
        if (possible > 0){
          for (const el in rec.parts) S.counts[el] -= rec.parts[el]*possible;
          S.counts[rec.out] += possible;
          if (S.counts[rec.out] > 0) S.discovered[rec.out] = true;
        }
      }
    }
  }catch(e){}
}
function materialize(){
  entities = [];
  const order = ELS.slice().reverse();
  for (const el of order){
    for (let i=0;i<S.counts[el] && entities.length < DRAW_CAP*1.5;i++) spawnEntity(el);
  }
}

const resetBtn = document.getElementById("reset");
let resetArm = 0;
resetBtn.addEventListener("pointerdown", () => {
  if (Date.now() - resetArm < 2000){
    wipe();
  } else {
    resetArm = Date.now();
    resetBtn.classList.add("arm");
    setTimeout(()=>resetBtn.classList.remove("arm"), 2000);
  }
});

let lastSim = 0;
function stepSim(){
  const now = performance.now();
  if (!lastSim) lastSim = now;
  const dt = Math.min(2, (now-lastSim)/1000) * TSCALE;
  lastSim = now;
  if (dt > 0) simSpawn(dt);
}
let lastF = 0;
function frame(ts){
  if (!lastF) lastF = ts;
  const dt = Math.min(.05, (ts-lastF)/1000) * TSCALE;
  lastF = ts;
  stepSim();
  physics(dt);
  tryReactions();
  resolveReactions(dt);
  refill();
  draw(ts/1000);
  if (hBarI && hBarI.isConnected)
    hBarI.style.transform = `scaleX(${Math.min(1, spawnAcc).toFixed(4)})`;
  requestAnimationFrame(frame);
}

const dbg = document.getElementById("debug");
function dbgToggle(force){
  dbg.hidden = force !== undefined ? !force : !dbg.hidden;
  if (TSCALE !== 1 && dbg.hidden) TSCALE = 1;
}
function dbgInit(){
  const grant = document.getElementById("dgrant");
  for (const el of ELS){
    const b = document.createElement("button");
    b.textContent = "+" + el;
    b.addEventListener("pointerdown", () => {
      const n = el === "H" ? 20 : 5;
      S.counts[el] += n;
      S.discovered[el] = true;
      for (let i=0;i<n && entities.length<ENT_CAP;i++) spawnEntity(el);
      buildFormationRows();
    });
    grant.appendChild(b);
  }
  dbg.querySelectorAll("[data-ts]").forEach(b => {
    b.addEventListener("pointerdown", () => {
      TSCALE = +b.dataset.ts;
      dbg.querySelectorAll("[data-ts]").forEach(x => x.classList.toggle("on", x === b));
    });
  });
  document.getElementById("dsave").addEventListener("pointerdown", save);
  document.getElementById("dwipe").addEventListener("pointerdown", wipe);
  setInterval(() => {
    if (dbg.hidden) return;
    const drawnMax = Math.min(entities.length, DRAW_CAP);
    const lines = [
      `rate ${spawnRate().toFixed(2)}/s  ts x${TSCALE}`,
      `entities ${entities.length}  drawn ${drawnMax}`,
      ...ELS.filter(el=>S.counts[el]>0 || el==="H").map(el =>
        `${el.padEnd(2)} ${String(S.counts[el]).padStart(6)}  ~${ratePerMin(el).toFixed(1)}/min`),
    ];
    document.getElementById("dstats").textContent = lines.join("\n");
  }, 250);
}
dbgInit();
document.addEventListener("keydown", e => { if (e.key === "`") dbgToggle(); });
if (location.hash.includes("debug")) dbgToggle(true);

cv = document.getElementById("chamber");
ctx = cv.getContext("2d");
fitStage();
resize();
window.addEventListener("resize", () => { fitStage(); resize(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });
setInterval(() => { if (S.activated && performance.now()-lastSim > 700) stepSim(); }, 800);
setInterval(refreshTab, 100);
setInterval(save, 15000);

load();
if (S.activated) activatedAt = performance.now();
materialize();
buildFormationRows();
requestAnimationFrame(frame);
