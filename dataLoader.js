let allQuestions = [];

function detectTopic(file) {
  if (file.includes("Week01")) return "cloud";
  if (file.includes("Week02") || file.includes("Week03")) return "tech";
  return "security";
}

function getCellRobust(row, possibleNames) {
  const lowerNames = possibleNames.map(n => n.toLowerCase());
  for (let key in row) {
    if (lowerNames.includes(key.trim().toLowerCase())) {
      return String(row[key]).trim();
    }
  }
  return "";
}

// Hàm này đảm bảo lấy ra đúng chữ cái A, B, C, D dù Excel có viết "Option A", "A ", hay " a "
function cleanCorrectAnswer(rawAnswer) {
  if (!rawAnswer) return "";
  const str = String(rawAnswer).toUpperCase();
  if (str.includes("A")) return "A";
  if (str.includes("B")) return "B";
  if (str.includes("C")) return "C";
  if (str.includes("D")) return "D";
  return str.trim();
}

window.loadAllData = async function() {
  allQuestions = [];

  const files = [
    "raw_csv_quiz/Quiz_Week01.xlsx",
    "raw_csv_quiz/Quiz_Week02.xlsx",
    "raw_csv_quiz/Quiz_Week03.xlsx",
    "raw_csv_quiz/Quiz_Week04.xlsx"
  ];

  for (const file of files) {
    try {
      const res = await fetch(file, { cache: "no-store" });
      if (!res.ok) continue;

      const data = await res.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      rows.forEach((row, index) => {
        const question = getCellRobust(row, ["Question", "question", "Câu hỏi"]);
        if (!question) return;

        allQuestions.push({
          id: `${file}-${index}`,
          question: question,
          options: [
            getCellRobust(row, ["Option A", "A"]),
            getCellRobust(row, ["Option B", "B"]),
            getCellRobust(row, ["Option C", "C"]),
            getCellRobust(row, ["Option D", "D"])
          ],
          correct: cleanCorrectAnswer(getCellRobust(row, ["Correct Answer", "Answer", "Đáp án"])),
          explain: getCellRobust(row, ["Detail Explaination", "Detail Explanation", "Explain"]),
          note: getCellRobust(row, ["Note", "Ghi chú"]),
          topic: detectTopic(file)
        });
      });
    } catch (error) {
      console.error(`Lỗi file ${file}:`, error);
    }
  }

  if (allQuestions.length === 0) throw new Error("Không có câu hỏi nào được tải.");
};