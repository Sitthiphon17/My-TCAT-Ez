
let examChart;
function buildExamChart(){
  const ctx=document.getElementById('examChart'); if(!ctx) return;
  const data=JSON.parse(localStorage.getItem("EXAMS")||"[]").slice(-20);
  const labels=data.map(d=> new Date(d.ts).toLocaleDateString()); const scores=data.map(d=> d.score);
  if(examChart) examChart.destroy();
  examChart = new Chart(ctx, { type:'line', data:{ labels, datasets:[{ label:'คะแนน', data:scores }] }, options:{ responsive:true, scales:{ y:{ suggestedMin:0, suggestedMax:100 } } } });
}
function updateSummary(){ const plan=JSON.parse(localStorage.getItem("PLAN")||"[]"); const done=plan.filter(p=>p.done).length; const total=plan.length; $("#progressSummary").innerHTML = total? `ทำแล้ว ${done}/${total} วัน (${Math.round(100*done/total)}%)` : "ยังไม่มีแผน"; }
buildExamChart(); updateSummary();
