let allQuestions = [];

async function loadAllData() {
  const files = [
    "raw_csv_quiz/Quiz_Week01.xlsx",
    "raw_csv_quiz/Quiz_Week02.xlsx",
    "raw_csv_quiz/Quiz_Week03.xlsx",
    "raw_csv_quiz/Quiz_Week04.xlsx"
  ];

  for (let i = 0; i < files.length; i++) {
    const res = await fetch(files[i]);
    const data = await res.arrayBuffer();
    const workbook = XLSX.read(data);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    json.forEach(row => {
      allQuestions.push({
        question: row["Question"],
        options: [
          row["Option A"],
          row["Option B"],
          row["Option C"],
          row["Option D"]
        ],
        correct: row["Correct Answer"],
        explain: row["Detail Explaination"] || "",
        note: row["Note"] || "",
        topic: detectTopic(files[i])
      });
    });
  }
}

function detectTopic(file) {
  if (file.includes("Week01")) return "cloud";
  if (file.includes("Week02") || file.includes("Week03")) return "tech";
  return "security";
}