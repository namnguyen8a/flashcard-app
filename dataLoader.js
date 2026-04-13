let allQuestions = [];

function detectTopic(file) {
  if (file.includes("Week01")) return "cloud";
  if (file.includes("Week02") || file.includes("Week03")) return "tech";
  return "security";
}

// Hàm này giúp tìm dữ liệu bất kể tên cột viết hoa/thường hay bị dư khoảng trắng
function getCellRobust(row, possibleNames) {
  const lowerNames = possibleNames.map(n => n.toLowerCase());
  for (let key in row) {
    if (lowerNames.includes(key.trim().toLowerCase())) {
      return String(row[key]).trim();
    }
  }
  return "";
}

async function loadAllData() {
  allQuestions = [];

  const files = [
    "raw_csv_quiz/Quiz_Week01.xlsx",
    "raw_csv_quiz/Quiz_Week02.xlsx",
    "raw_csv_quiz/Quiz_Week03.xlsx",
    "raw_csv_quiz/Quiz_Week04.xlsx"
  ];

  for (const file of files) {
    try {
      // cache: "no-store" giúp Github Pages luôn tải file Excel mới nhất
      const res = await fetch(file, { cache: "no-store" });

      if (!res.ok) {
        console.warn(`[Cảnh báo] Không thể tải ${file} (Mã lỗi: ${res.status}) - Bỏ qua file này.`);
        continue; // Bỏ qua file lỗi, tiếp tục load file khác
      }

      const data = await res.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      rows.forEach((row, index) => {
        // Tìm cột chứa câu hỏi (chấp nhận các tên cột biến thể)
        const question = getCellRobust(row, ["Question", "question", "Câu hỏi"]);
        if (!question) return; // Nếu dòng không có câu hỏi thì bỏ qua

        const optionA = getCellRobust(row, ["Option A", "A"]);
        const optionB = getCellRobust(row, ["Option B", "B"]);
        const optionC = getCellRobust(row, ["Option C", "C"]);
        const optionD = getCellRobust(row, ["Option D", "D"]);
        const correct = getCellRobust(row, ["Correct Answer", "Answer", "Đáp án"]);
        const explain = getCellRobust(row, ["Detail Explaination", "Detail Explanation", "Explain", "Giải thích"]);
        const note = getCellRobust(row, ["Note", "Ghi chú"]);

        allQuestions.push({
          id: `${file}-${index}`,
          question: question,
          options: [optionA, optionB, optionC, optionD],
          correct: correct,
          explain: explain,
          note: note,
          topic: detectTopic(file)
        });
      });
    } catch (error) {
      console.error(`Lỗi khi xử lý file ${file}:`, error);
    }
  }

  if (allQuestions.length === 0) {
    throw new Error("Không có dữ liệu câu hỏi nào! Hãy kiểm tra lại file Excel (Sheet đầu tiên, Tên các cột ở dòng 1).");
  }

  console.log(`✅ Đã tải thành công ${allQuestions.length} câu hỏi.`);
}