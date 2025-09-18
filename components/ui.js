
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const tabs = ["home","schedule","exam","flashcards","progress","community","settings"];
$$(".tab-btn").forEach(btn => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
function switchTab(key) { tabs.forEach(t => $("#tab-"+t).classList.toggle("hidden", t!==key)); localStorage.setItem("TAB", key); }
switchTab(localStorage.getItem("TAB") || "home");

const regionSel = $("#regionSelect");
TCAS_DATA.regions.forEach(r => { const opt = document.createElement("option"); opt.value=r; opt.textContent=r; regionSel.appendChild(opt); });
regionSel.value = TCAS_DATA.regions[0];

const uniList = $("#uniList");
const resultCount = $("#resultCount");
const searchInput = $("#searchInput");
let activeFilter = new Set();
$$(".filter-chip").forEach(chip => chip.addEventListener("click", () => { const v=chip.dataset.filter; activeFilter.has(v)?activeFilter.delete(v):activeFilter.add(v); renderList(); }));

function renderList() {
  const region = regionSel.value;
  const q = (searchInput.value||"").trim().toLowerCase();
  const filters = Array.from(activeFilter);

  const matched = TCAS_DATA.universities.filter(u => u.region===region).map(u => {
    const faculties = u.faculties.filter(f => {
      const text = (u.name + " " + f.name + " " + (f.majors||[]).join(" ")).toLowerCase();
      const okQ = !q || text.includes(q);
      const okFilter = filters.length===0 || (f.rounds||[]).some(r => filters.some(ft => r.name.includes(ft) || (r.uses||[]).join(" ").includes(ft)));
      return okQ && okFilter;
    });
    return {...u, faculties};
  }).filter(u => u.faculties.length>0);

  uniList.innerHTML = "";
  matched.forEach(u => {
    const wrap = document.createElement("div");
    wrap.className = "border rounded-xl p-3";
    wrap.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="font-semibold">${u.name} <span class="text-xs text-slate-500">(${u.abbreviation})</span></div>
        <button class="pill text-xs bg-indigo-50" data-quick="${u.id}">เพิ่มเป็นเป้าหมาย</button>
      </div>
      <div class="mt-2 grid gap-2">
        ${u.faculties.map(f => `
          <div class="bg-slate-50 rounded-lg p-2">
            <div class="font-medium">${f.name}</div>
            ${f.majors ? `<div class="text-sm text-slate-600">สาขา: ${f.majors.join(", ")}</div>` : ""}
            <div class="text-sm mt-1">ข้อกำหนด: ${(f.requirements||[]).map(r=>r.code).join(", ")}</div>
            <div class="text-xs text-slate-600 mt-1">รอบ: ${(f.rounds||[]).map(r=>r.name).join(" • ")}</div>
            <div class="mt-2 flex gap-2">
              <button class="pill text-xs bg-emerald-50" data-plan='${JSON.stringify({u:u.name,f:f.name})}'>จัดตารางอ่าน</button>
              <button class="pill text-xs bg-amber-50" data-require='${JSON.stringify(f.requirements||[])}'>ดูข้อกำหนด</button>
            </div>
          </div>
        `).join("")}
      </div>`;
    uniList.appendChild(wrap);
  });
  resultCount.textContent = `พบ ${matched.reduce((n,u)=>n+u.faculties.length,0)} คณะ (ใน ${matched.length} มหาวิทยาลัย)`;

  $$("[data-plan]").forEach(btn => btn.onclick = () => { const obj = JSON.parse(btn.dataset.plan); addTargetProgram(`${obj.u} — ${obj.f}`); switchTab("schedule"); });
  $$("[data-require]").forEach(btn => btn.onclick = () => { const reqs = JSON.parse(btn.dataset.require); alert("ข้อกำหนดการสอบ\n" + reqs.map(r=>`${r.code} (${r.weight})`).join("\n")); });
  $$("[data-quick]").forEach(btn => btn.onclick = () => { addTargetProgram(btn.dataset.quick); alert("เพิ่มเป้าหมายแล้ว: " + btn.dataset.quick); });
}
regionSel.addEventListener("change", renderList);
searchInput.addEventListener("input", renderList);
renderList();

const targetSel = $("#targetProgram");
function addTargetProgram(name){ if (![...targetSel.options].some(o=>o.value===name)){ const opt=document.createElement("option"); opt.value=name; opt.textContent=name; targetSel.appendChild(opt);} targetSel.value=name; }
TCAS_DATA.universities.slice(0,3).forEach(u => addTargetProgram(u.name+" — (ตัวอย่าง)"));

const tips = [
  "แบ่งเวลาข้อหนึ่งไม่เกิน 60–90 วินาที ถ้าเกินให้ข้ามแล้วค่อยกลับมา",
  "อ่านคำถามก่อนสแกนบทความ (TGAT1) จะช่วยจับใจความได้เร็วขึ้น",
  "TGAT2 ให้เขียนโจทย์เป็นสัญลักษณ์/ผังงานสั้น ๆ ก่อนคำนวณ",
  "ทำข้อที่ถนัดก่อนเพื่อเก็บคะแนนพื้นฐาน",
  "ฝึก Mock Test แบบจับเวลา สัปดาห์ละ 2–3 ครั้ง"
];
const tipsList=$("#tipsList"); tips.forEach(t=>{ const li=document.createElement("li"); li.textContent=t; tipsList.appendChild(li); });

// Community
const postList = $("#postList");
let posts = JSON.parse(localStorage.getItem("POSTS") || "[]");
function renderPosts(){ postList.innerHTML=posts.slice(-20).reverse().map(p=>`
  <div class="border rounded-xl p-3">
    <div class="font-semibold">${p.title}</div>
    <div class="text-sm text-slate-700 whitespace-pre-wrap mt-1">${p.body}</div>
    <div class="text-xs text-slate-500 mt-1">${new Date(p.ts).toLocaleString()}</div>
  </div>`).join(""); }
$("#createPost").onclick=()=>{ const t=$("#postTitle").value.trim(); const b=$("#postBody").value.trim(); if(!t||!b) return alert("กรอกหัวข้อและเนื้อหา"); posts.push({title:t,body:b,ts:Date.now()}); localStorage.setItem("POSTS",JSON.stringify(posts)); $("#postTitle").value=""; $("#postBody").value=""; renderPosts(); };
renderPosts();
