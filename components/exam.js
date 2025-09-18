
const EXAM_CATEGORIES = [
  { id: "TGAT1", name: "TGAT1 การสื่อสารภาษาอังกฤษ" },
  { id: "TGAT2", name: "TGAT2 การคิดอย่างมีเหตุผล" },
  { id: "TGAT3", name: "TGAT3 สมรรถนะการทำงาน" },
  { id: "TPAT1", name: "TPAT1 ถนัดแพทย์" },
  { id: "TPAT2", name: "TPAT2 ถนัดศิลปกรรม" },
  { id: "TPAT3", name: "TPAT3 ถนัดวิทย์-วิศวะ" },
  { id: "TPAT4", name: "TPAT4 ถนัดสถาปัตย์" },
  { id: "TPAT5", name: "TPAT5 ถนัดครุศาสตร์" },
];
const examCategorySel = $("#examCategory");
EXAM_CATEGORIES.forEach(c => { const opt=document.createElement("option"); opt.value=c.id; opt.textContent=c.name; examCategorySel.appendChild(opt); });
const flashCategorySel = $("#flashCategory");
EXAM_CATEGORIES.forEach(c => { const opt=document.createElement("option"); opt.value=c.id; opt.textContent=c.name; flashCategorySel.appendChild(opt); });

async function loadQuestions(cat) {
  const res = await fetch(`data/questions/${cat}.json`);
  if (!res.ok) throw new Error("ไม่พบไฟล์คำถามของ " + cat);
  return res.json();
}

let examState = { cat:null, items:[], idx:0, answers:{}, startTs:0 };

$("#startExam").onclick = async () => {
  const cat = examCategorySel.value;
  const count = parseInt($("#examCount").value,10);
  try {
    const bank = await loadQuestions(cat);
    const items = bank.slice(0, Math.min(count, bank.length));
    if (items.length < count) alert(`ชุดตัวอย่างมี ${items.length} ข้อ — เพิ่มได้ที่ /data/questions/${cat}.json`);
    examState = { cat, items, idx:0, answers:{}, startTs: Date.now() };
    $("#examMeta").textContent = `${EXAM_CATEGORIES.find(c=>c.id===cat).name} • ${items.length} ข้อ`;
    $("#examResult").classList.add("hidden");
    renderQuestion();
  } catch (e) { alert(e.message); }
};

function renderQuestion() {
  const q = examState.items[examState.idx];
  const qArea = $("#questionArea");
  qArea.innerHTML = `
    <div class="border rounded-xl p-3">
      <div class="text-sm text-slate-500">ข้อ ${examState.idx+1} / ${examState.items.length}</div>
      <div class="font-medium mt-1">${q.stem}</div>
      <div class="mt-2 grid gap-2">
        ${q.choices.map((c,i)=>`
          <label class="flex items-center gap-2">
            <input type="radio" name="choice" value="${i}" ${examState.answers[examState.idx]==i?"checked":""}/>
            <span>${c}</span>
          </label>`).join("")}
      </div>
    </div>`;
  $$("input[name='choice']").forEach(r => r.onchange = () => { examState.answers[examState.idx]=parseInt(r.value,10); });
}
$("#prevQ").onclick = () => { if (examState.idx>0){ examState.idx--; renderQuestion(); } };
$("#nextQ").onclick = () => { if (examState.idx<examState.items.length-1){ examState.idx++; renderQuestion(); } };

$("#submitExam").onclick = () => {
  const durMin = Math.max(1, Math.round((Date.now()-examState.startTs)/60000));
  let correct = 0;
  const review = examState.items.map((q,i)=>{
    const ans = examState.answers[i];
    const ok = ans===q.answer;
    if (ok) correct++;
    return { i, ok, explain:q.explain, chosen:ans, correct:q.answer, topic:q.topic||"ทั่วไป" };
  });
  const score = Math.round(100*correct/examState.items.length);
  const weak = Object.entries(review.reduce((acc,r)=>{ if(!r.ok){ acc[r.topic]=(acc[r.topic]||0)+1; } return acc; },{}))
               .sort((a,b)=>b[1]-a[1]).map(([t,c])=>`${t} (${c} ข้อ)`).slice(0,3).join(", ") || "—";
  $("#examResult").classList.remove("hidden");
  $("#examResult").innerHTML = `
    <div class="mt-3 border rounded-xl p-3">
      <div class="text-lg font-semibold">คะแนน: ${score} / 100</div>
      <div class="text-sm text-slate-600">เวลาที่ใช้: ~${durMin} นาที • จุดอ่อน: ${weak}</div>
      <details class="mt-2">
        <summary class="cursor-pointer">ดูเฉลยแบบละเอียด</summary>
        <div class="mt-2 grid gap-2">
          ${review.map(r=>`
            <div class="border rounded-lg p-2 ${r.ok?'bg-emerald-50':'bg-rose-50'}">
              <div class="text-sm">ข้อ ${r.i+1} • หัวข้อ: ${r.topic||"ทั่วไป"}</div>
              <div class="text-xs">คำตอบของคุณ: ${r.chosen!=null? String.fromCharCode(65+r.chosen):"—"} • คำตอบที่ถูก: ${String.fromCharCode(65+r.correct)}</div>
              <div class="text-xs text-slate-700 mt-1">อธิบาย: ${r.explain||"-"}</div>
            </div>`).join("")}
        </div>
      </details>
    </div>`;
  const prog = JSON.parse(localStorage.getItem("EXAMS")||"[]");
  prog.push({ ts: Date.now(), cat: examState.cat, score, n: examState.items.length });
  localStorage.setItem("EXAMS", JSON.stringify(prog));
  buildExamChart();
};
