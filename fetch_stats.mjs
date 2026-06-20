import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "./src/firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAssignments() {
  const docRef = doc(db, "timetables", "main");
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    console.log("No such document!");
    process.exit(0);
  }

  const data = docSnap.data();
  const items = data.items || {};
  
  const teacherStats = {};
  const classStats = {};
  const conflicts = [];
  const teacherSchedule = {};

  for (const key in items) {
    const item = items[key];
    const [dayId, slot, room] = key.split('|');

    if (item.teacher && item.subject) {
      const teacher = item.teacher.trim();
      const subject = item.subject.trim();

      // Check conflicts (same teacher, same day, same slot, different room)
      if (!teacherSchedule[teacher]) teacherSchedule[teacher] = {};
      const timeKey = `${dayId}|${slot}`;
      if (teacherSchedule[teacher][timeKey]) {
        conflicts.push(`XUNG ĐỘT: ${teacher} dạy ${subject} (Phòng ${room}) VÀ dạy ${teacherSchedule[teacher][timeKey].subject} (Phòng ${teacherSchedule[teacher][timeKey].room}) vào ${dayId}, Tiết ${slot}`);
      } else {
        teacherSchedule[teacher][timeKey] = { subject, room };
      }

      // Teacher -> Class stats
      if (!teacherStats[teacher]) teacherStats[teacher] = {};
      if (!teacherStats[teacher][subject]) teacherStats[teacher][subject] = 0;
      teacherStats[teacher][subject]++;

      // Class -> Teacher stats
      if (!classStats[subject]) classStats[subject] = {};
      if (!classStats[subject][teacher]) classStats[subject][teacher] = 0;
      classStats[subject][teacher]++;
    }
  }

  console.log("=== XUNG ĐỘT LỊCH GIÁO VIÊN ===");
  if (conflicts.length === 0) {
    console.log("Không phát hiện giáo viên nào bị trùng lịch.");
  } else {
    conflicts.forEach(c => console.log(c));
  }

  console.log("\n=== CÁC LỚP CÓ NHIỀU GIÁO VIÊN DẠY CÙNG MÔN ===");
  let foundMulti = false;
  for (const subject in classStats) {
    const teachers = Object.keys(classStats[subject]);
    if (teachers.length > 1) {
      foundMulti = true;
      console.log(`Lớp ${subject} được dạy bởi: ` + teachers.map(t => `${t} (${classStats[subject][t]} buổi)`).join(", "));
    }
  }
  if (!foundMulti) console.log("Không có lớp nào bị phân công nhiều giáo viên.");

  console.log("\n=== DANH SÁCH LỚP CỦA TỪNG GIÁO VIÊN ===");
  for (const teacher in teacherStats) {
    const classes = [];
    for (const subject in teacherStats[teacher]) {
      classes.push(`${subject} (${teacherStats[teacher][subject]} buổi)`);
    }
    console.log(`${teacher}: ${classes.join(", ")}`);
  }

  process.exit(0);
}

checkAssignments();
