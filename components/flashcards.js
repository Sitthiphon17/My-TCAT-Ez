
let flashQueue=[]; let flashIdx=0; let currentFlash=null;
$("#startFlash").onclick = async () => {
  const cat = $("#flashCategory").value;
  try {
    const bank = await (await fetch(`data/questions/${cat}.json`)).json();
    flashQueue = bank.map((q,i)=>({ id:i, front:q.stem, back:`คำตอบ: ${String.fromCharCode(65+q.answer)}\n${q.explain||""}`, ease:2.5, interval:1, due:Date.now() }));
    flashIdx=0; nextFlash();
  } catch(e){ alert("ไม่พบชุดแฟลชการ์ดของ "+cat); }
};
function nextFlash(){ const now=Date.now(); const next=flashQueue.find(f=>f.due<=now)||flashQueue[0]; if(!next) return; currentFlash=next; $("#flashCard").classList.remove("hidden"); $("#flashFront").textContent=next.front; $("#flashBack").classList.add("hidden"); $("#flashBack").textContent=next.back; }
$("#showBack").onclick = ()=>$("#flashBack").classList.remove("hidden");
$$(".flashGrade").forEach(btn => btn.onclick = ()=> gradeFlash(btn.dataset.grade));
function gradeFlash(grade){ const q=currentFlash; if(!q) return; if(grade==="again"){ q.interval=1; q.ease=Math.max(1.3,q.ease-0.2);} if(grade==="good"){ q.interval=Math.round(q.interval*q.ease); q.ease+=0.05;} if(grade==="easy"){ q.interval=Math.round(q.interval*(q.ease+0.2)); q.ease+=0.1;} q.due=Date.now()+q.interval*24*60*60*1000; flashIdx=(flashIdx+1)%flashQueue.length; nextFlash(); }
