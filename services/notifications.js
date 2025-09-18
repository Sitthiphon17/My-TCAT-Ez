
$("#enableNoti").onclick = async () => {
  if (!("Notification" in window)) return alert("เบราว์เซอร์ไม่รองรับการแจ้งเตือน");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return alert("ไม่ได้รับอนุญาตแจ้งเตือน");
  new Notification("เปิดใช้งานแจ้งเตือนเรียบร้อย ✅", { body: "ระบบจะเตือนเวลาเริ่มอ่าน/กำหนดการสำคัญ" });
};
