let allQuestions = [];

function detectTopic(file) {
  if (file.includes("Week01")) return "cloud";
  if (file.includes("Week02") || file.includes("Week03")) return "tech";
  return "security";
}

function normalizeText(v) {
  return String(v ?? "").trim();
}

function getCell(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
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
    const res = await fetch(file, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Cannot fetch ${file} (${res.status})`);
    }

    const data = await res.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    rows.forEach((row, index) => {
      const question = getCell(row, ["Question", "question"]);
      if (!question) return;

      const optionA = getCell(row, ["Option A", "option a"]);
      const optionB = getCell(row, ["Option B", "option b"]);
      const optionC = getCell(row, ["Option C", "option c"]);
      const optionD = getCell(row, ["Option D", "option d"]);
      const correct = getCell(row, ["Correct Answer", "correct answer"]);
      const explain = getCell(row, ["Detail Explaination", "Detail Explanation", "detail explaination", "detail explanation"]);
      const note = getCell(row, ["Note", "note"]);

      allQuestions.push({
        id: `${file}-${index}`,
        question: normalizeText(question),
        options: [optionA, optionB, optionC, optionD],
        correct: normalizeText(correct),
        explain,
        note,
        topic: detectTopic(file)
      });
    });
  }

  if (allQuestions.length === 0) {
    throw new Error("No questions loaded. Check column names and xlsx content.");
  }

  console.log("Loaded questions:", allQuestions.length);
}