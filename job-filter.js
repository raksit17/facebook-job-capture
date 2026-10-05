/* Shared employer-only rules for capture, storage, API and exports. */
(() => {
  function isEmployerPost(value) {
    const text = String(value || '').normalize('NFKC').replace(/[*_]/g, '').toLowerCase();
    if (!text.trim()) return false;
    // Candidate intent wins over incidental hashtags such as #Hiring.
    const seeker = /open\s*to\s*work|opentowork|job\s*seeker|seeking\s+(?:a\s+)?(?:job|employment)|(?:looking|searching)\s+for\s+(?:a\s+|my\s+next\s+)?(?:job|employment|new\s+(?:role|opportunit))|(?:exploring|seeking|looking\s+for)\s+new\s+(?:career\s+)?opportunit|(?:i\s+am|i'm|i’m)\s+(?:currently\s+)?(?:looking|seeking|searching)|(?:ผม|ฉัน|ดิฉัน|กระผม).{0,30}(?:หางาน|มองหาโอกาส|หาตำแหน่ง)|(?:กำลัง|ขออนุญา[ตทิ]*|ฝากตัว|ประกาศ|ต้องการ)\s*หางาน|มองหาโอกาส(?:งาน|ใหม่|ร่วมงาน|ในการทำงาน|เริ่มต้นทำงาน)|หาตำแหน่ง.{0,65}อยู่|เงินเดือน(?:ที่)?คาดหวัง|(?:^|\n)\s*expected\s*salary|ยินดีส่ง\s*(?:cv|resume|เรซูเม่)|ฝาก(?:รับ)?พิจารณา/i;
    if (seeker.test(text)) return false;
    const hiring = /\b(?:hiring|vacanc\w*|recruiting)\b|job\s*(?:opening|opportunit)|open\s*position|apply\s*now|รับสมัคร|เปิดรับ|หาพนักงาน|รับด่วน|ประกาศงาน|ตำแหน่งที่เปิดรับ|ขยายทีม|จำนวน\s*\d+\s*อัตรา|(?:เรา|บริษัท|ทีม).{0,35}(?:กำลัง)?มองหา.{0,65}(?:developer|engineer|พนักงาน|คนร่วมทีม)|สนใจสมัครงาน.{0,30}ส่ง\s*(?:cv|resume|เรซูเม่)/i;
    const recruiter = /recruiter|recruitment\s*consultant|จากบริษัท|ฝ่ายบุคคล|ฝ่ายสรรหา/i.test(text);
    const role = /developer|engineer|programmer|analyst|พนักงาน|เจ้าหน้าที่/i.test(text);
    const terms = /salary|เงินเดือน|budget|สัญญาจ้าง|\d+\s*(?:อัตรา|k\b)|ส่ง\s*(?:cv|resume|เรซูเม่)/i.test(text);
    return hiring.test(text) || (recruiter && role && terms);
  }
  globalThis.EmployerFilter = {isEmployerPost};
})();
