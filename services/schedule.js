
const sparkIcon=$("#sparkIcon"); const buildBtn=$("#buildPlan"); const planBody=$("#planBody"); const todayTasks=$("#todayTasks");
function buildPlanRows(target, examDate, hpd){
  const topics=["TGAT1","TGAT2","TGAT3","TPAT1","TPAT3","A-Level"]; const days=Math.max(14, dayjs(examDate).diff(dayjs(),"day")); const rows=[]; let d=dayjs();
  for(let i=0;i<days;i++){ const topic=topics[i%topics.length]; rows.push({ date:d.add(i,"day").format("YYYY-MM-DD"), topic:`${target}: ${topic}`, hours:hpd, done:false }); }
  return rows;
}
buildBtn.onclick=()=>{
  const target=$("#targetProgram").value||"เป้าหมาย"; const examDate=$("#examDate").value||dayjs().add(45,"day").format("YYYY-MM-DD"); const hpd=Math.max(1,parseInt($("#hoursPerDay").value,10)||2);
  const rows=buildPlanRows(target,examDate,hpd); localStorage.setItem("PLAN",JSON.stringify(rows)); localStorage.setItem("PLAN_TARGET",target); renderPlan(); updateToday(); switchTab("schedule");
};
function renderPlan(){ const rows=JSON.parse(localStorage.getItem("PLAN")||"[]"); planBody.innerHTML=rows.map(r=>`<tr><td class="p-2">${r.date}</td><td class="p-2">${r.topic}</td><td class="p-2">${r.hours}</td><td class="p-2">${r.done?"✅":"—"}</td></tr>`).join(""); }
function updateToday(){ const rows=JSON.parse(localStorage.getItem("PLAN")||"[]"); const today=dayjs().format("YYYY-MM-DD"); const list=rows.filter(r=>r.date===today); todayTasks.innerHTML=list.length?list.map(r=>`<li>${r.topic} — ${r.hours} ชม.</li>`).join(""):"<li>ยังไม่ได้ตั้งแผนสำหรับวันนี้</li>"; const off=parseInt(localStorage.getItem("OFF_DAYS")||"0",10); sparkIcon.classList.toggle("off",off>0); }
$("#completeDay").onclick=()=>{
  const rows=JSON.parse(localStorage.getItem("PLAN")||"[]"); const today=dayjs().format("YYYY-MM-DD"); rows.forEach(r=>{ if(r.date===today) r.done=true; }); localStorage.setItem("PLAN",JSON.stringify(rows)); renderPlan(); updateToday();
  const lastDone=localStorage.getItem("LAST_DONE"); const todayStr=today; if(!lastDone || dayjs(todayStr).diff(dayjs(lastDone),"day")===1){ const s=(parseInt(localStorage.getItem("STREAK")||"0",10))+1; localStorage.setItem("STREAK",String(s)); localStorage.setItem("OFF_DAYS","0"); } else { localStorage.setItem("STREAK","1"); localStorage.setItem("OFF_DAYS","0"); } localStorage.setItem("LAST_DONE",todayStr); sparkIcon.classList.remove("off"); alert("เยี่ยมมาก! ไฟยังสว่าง ✨");
};
(function dailyCheck(){ const lastDone=localStorage.getItem("LAST_DONE"); if(lastDone){ const diff=dayjs().diff(dayjs(lastDone),"day"); if(diff>=2){ localStorage.setItem("OFF_DAYS",String(diff-1)); sparkIcon.classList.add("off"); } } })();
renderPlan(); updateToday();
