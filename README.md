# Facebook Job Capture v1.0.2

Chrome Extension (Manifest V3) สำหรับ Facebook Feed / Groups โดยใช้โครง Job Fast Capture ที่แนบมา

## ติดตั้ง
1. แตก ZIP ไปยังโฟลเดอร์ถาวร
2. เปิด chrome://extensions แล้วเปิด Developer mode
3. กด Load unpacked เลือกโฟลเดอร์ facebook-job-capture ที่มี manifest.json
4. เปิด Facebook ด้วยบัญชีของคุณ เข้า Feed หรือกลุ่ม แล้วรีเฟรชหน้า
5. เปิด Extension กด Auto scroll + scan ปล่อยแท็บ Facebook เปิดไว้

## ใช้งาน
- สแกนข้อความประกาศงานภาษาไทย/อังกฤษ พร้อมเลื่อนหน้าอัตโนมัติ สูงสุด 40 รอบ และหยุดเมื่อไม่พบโพสต์ใหม่ 5 รอบ
- เก็บเฉพาะบริษัท / recruiter รับคน โดยตัด Open to Work, มองหาโอกาสใหม่, หางาน, Expected Salary และยินดีส่ง Resume ออก
- ฟิลเตอร์เป็นกฎจากข้อความ อาจตัดโพสต์ผสม/กำกวม และไม่อ่านตัวอักษรในรูปภาพ
- ปุ่ม Stop scan หยุดหลังการประมวลผลปัจจุบัน
- บันทึกทีละรอบ ปิด popup ได้ สแกนต่อในแท็บ; เปิด popup อีกครั้งเพื่อดูสถานะ
- เก็บผู้โพสต์ ลิงก์โปรไฟล์/ติดต่อ DM อีเมล โทรศัพท์ LINE รูปภาพที่โหลดแล้ว เงินเดือน เทคโนโลยี และลิงก์โพสต์
- DM เป็นข้อมูลลิงก์ติดต่อ ไม่ได้อ่านหรือส่งข้อความ Messenger
- company/location ไม่คาดเดา; postedAt มีค่าเฉพาะ DOM ที่มี time[datetime]
- รองรับ Export JSON/CSV และ API localhost/127.0.0.1: POST {"jobs": [...]} ตามโครงเดิม
- Auto Send ส่งรายการจากการสแกนรอบนั้นเมื่อจบ แม้ปิด popup
- source = facebook, pageType = feed; backend ต้องรองรับ source facebook

## ข้อจำกัด
อ่านเฉพาะ DOM ของหน้า Desktop ที่เปิดอยู่ ไม่ดึง API ภายใน ไม่อ่านข้อมูลหลังสิทธิ์ที่บัญชีเข้าไม่ถึง ไม่ทำ OCR รูปประกาศ และไม่อ่าน comments เป็นเนื้อหาประกาศ
Facebook เปลี่ยน DOM ได้ จึงอาจต้องปรับ selector เมื่อพบรูปแบบอื่น หากไม่มี permalink จะใช้ URL หน้าปัจจุบันและ hash ผู้โพสต์+ข้อความแทน ID (อาจเปลี่ยนเมื่อข้อความเปลี่ยน)
ภาพเป็น URL ที่อาจหมดอายุ ไม่ใช่ไฟล์ภาพที่ดาวน์โหลดเก็บถาวร
การกด See more/ดูเพิ่มเติมจำกัดภายในเนื้อหาโพสต์

## การตรวจสอบ
ผ่าน JavaScript syntax check และ unit checks สำหรับ concurrent saves / duplicate storage merge / email merge / DM fields ด้วยข้อมูลจำลอง
ยังไม่ได้ทดสอบ end-to-end บน Facebook ที่ล็อกอินจริง และ runtime นี้ไม่มี Chromium สำหรับรันทดสอบ DOM ใน browser

## v1.0.2
ข้ามโพสต์ที่ถูก Facebook ถอดออกจาก DOM หรือไม่มีเนื้อหาแล้วระหว่าง Auto Scan เพื่อป้องกัน null.querySelectorAll

## v1.0.2
กรอง employer-only ก่อนเก็บ ส่ง API และ Export แม้ข้อมูลเก่ามีโพสต์คนหางาน
เมื่อ Reload/ติดตั้งเวอร์ชันใหม่ กรองรายการเดิมใน storage โดยเก็บรายการที่ตัดออกใน filteredPostsBackup
