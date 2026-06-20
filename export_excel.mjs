import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "./src/firebaseConfig.js";
import * as XLSX from "xlsx";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function sortClasses(classes) {
  return Array.from(classes).sort((a, b) => {
    const regex = /^(\d+)(.*)$/;
    const matchA = a.match(regex);
    const matchB = b.match(regex);
    
    if (matchA && matchB) {
      const numA = parseInt(matchA[1], 10);
      const numB = parseInt(matchB[1], 10);
      if (numA !== numB) {
        return numA - numB; // Khối nhỏ đứng trước (6, 7, 8...)
      }
      return matchA[2].localeCompare(matchB[2]); // Cùng khối thì sắp xếp theo chữ (A, B, C...)
    } else if (matchA) {
      return -1; // Có số (khối) đứng trước
    } else if (matchB) {
      return 1;
    } else {
      return a.localeCompare(b); // Nếu không có số thì sắp xếp chữ cái bình thường
    }
  });
}

async function exportExcel() {
  const docRef = doc(db, "timetables", "main");
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    console.log("No such document!");
    process.exit(0);
  }

  const data = docSnap.data();
  const items = data.items || {};
  
  const teacherStats = {};

  for (const key in items) {
    const item = items[key];
    if (item.teacher && item.subject) {
      const teacher = item.teacher.trim();
      const subject = item.subject.trim();

      if (!teacherStats[teacher]) {
        teacherStats[teacher] = new Set();
      }
      teacherStats[teacher].add(subject);
    }
  }

  const excelData = [];
  let stt = 1;

  for (const [teacher, classes] of Object.entries(teacherStats)) {
    const sortedClasses = sortClasses(classes);
    excelData.push({
      "STT": stt++,
      "Tên": teacher,
      "Môn": "", 
      "Các lớp được phân công": sortedClasses.join(", ")
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "PhanCongChuyenMon");

  // Adjust column widths
  worksheet["!cols"] = [
    { wch: 5 },  // STT
    { wch: 20 }, // Tên
    { wch: 20 }, // Môn
    { wch: 50 }  // Các lớp
  ];

  XLSX.writeFile(workbook, "PhanCongChuyenMon_Moi.xlsx");
  console.log("Đã tạo lại file PhanCongChuyenMon_Moi.xlsx với thứ tự khối lớp tăng dần!");
  process.exit(0);
}

exportExcel();
