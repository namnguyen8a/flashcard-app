let allQuestionsMap = {}; // { quizId: [questions...] }
let currentActiveQuizId = null;

function getCellValue(cell) {
  if (!cell) return "";
  if (cell.value && cell.value.richText) {
    return cell.value.richText.map(rt => rt.text).join("");
  }
  return cell.text || String(cell.value || "").trim();
}

function detectTopic(fileObj, rowData) {
  if (fileObj.path.includes("Week01")) return "cloud";
  if (fileObj.path.includes("Week02") || fileObj.path.includes("Week03")) return "tech";
  if (fileObj.path.includes("Week04")) return "security";
  return "general";
}

function getCellRobust(rowValues, possibleNames) {
  const lowerNames = possibleNames.map(n => n.toLowerCase());
  for (let key in rowValues) {
    if (lowerNames.includes(key.trim().toLowerCase())) {
      return String(rowValues[key]).trim();
    }
  }
  return "";
}

function cleanCorrectAnswer(raw) {
  if (!raw) return "";
  const str = String(raw).toUpperCase();
  if (str.includes("A")) return "A";
  if (str.includes("B")) return "B";
  if (str.includes("C")) return "C";
  if (str.includes("D")) return "D";
  return str.trim();
}

async function loadFileWithExcelJS(fileObj, quizId, fileIndex) {
  // If file is an object from the file input
  let arrayBuffer;
  if (fileObj.fileBlob) {
    arrayBuffer = await fileObj.fileBlob.arrayBuffer();
  } else {
    const res = await fetch(fileObj.path, { cache: "no-store" });
    if (!res.ok) throw new Error("File not found: " + fileObj.path);
    arrayBuffer = await res.arrayBuffer();
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  
  const worksheet = workbook.worksheets[0];
  const questions = [];

  let headerMap = {}; // colNum -> headerName

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        headerMap[colNumber] = getCellValue(cell) || `col_${colNumber}`;
      });
      return;
    }

    if (fileObj.type === "color-highlight") {
      // Logic đặc biệt cho file VT Construct (Highlight màu)
      const qText = getCellValue(row.getCell(5)); // Cột 5: Nội dung câu hỏi (chỉ số 1-based)
      if (!qText || qText === "Nội dung câu hỏi") return; // Skip sub-headers

      const options = [];
      let correctAns = "";
      const optionLabels = ["A", "B", "C", "D", "E", "F"];
      
      // Các cột phương án bắt đầu từ cột 7 đến 11
      let optIdx = 0;
      for (let c = 7; c <= 11; c++) {
        const cell = row.getCell(c);
        const text = getCellValue(cell);
        if (text) {
          options.push(text);
          // Check fill color
          if (cell.fill && cell.fill.type === "pattern" && cell.fill.fgColor && cell.fill.fgColor.argb) {
            const color = cell.fill.fgColor.argb.toUpperCase();
            if (color !== "00000000" && color !== "FFFFFFFF") {
              correctAns = optionLabels[optIdx];
            }
          }
          optIdx++;
        }
      }

      if (options.length > 0) {
        questions.push({
          id: `${quizId}-${fileIndex}-${rowNumber}`,
          question: qText,
          options: options,
          correct: correctAns,
          explain: "",
          note: getCellValue(row.getCell(14)), // Cột 14: Căn cứ/Nguồn
          topic: "general"
        });
      }

    } else {
      // Default parser (Tương thích với form cũ)
      let rowValues = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        rowValues[headerMap[colNumber]] = getCellValue(cell);
      });

      const question = getCellRobust(rowValues, ["Question", "question", "Câu hỏi"]);
      if (!question) return;

      questions.push({
        id: `${quizId}-${fileIndex}-${rowNumber}`,
        question: question,
        options: [
          getCellRobust(rowValues, ["Option A", "A"]),
          getCellRobust(rowValues, ["Option B", "B"]),
          getCellRobust(rowValues, ["Option C", "C"]),
          getCellRobust(rowValues, ["Option D", "D"])
        ].filter(x => x), // Remove empty options
        correct: cleanCorrectAnswer(getCellRobust(rowValues, ["Correct Answer", "Answer", "Đáp án"])),
        explain: getCellRobust(rowValues, ["Detail Explaination", "Detail Explanation", "Explain", "Giải thích"]),
        note: getCellRobust(rowValues, ["Note", "Ghi chú"]),
        topic: detectTopic(fileObj, rowValues)
      });
    }
  });

  return questions;
}

async function loadAllData() {
  allQuestionsMap = {};
  
  let userConfig = JSON.parse(localStorage.getItem("USER_QUIZ_CONFIG"));
  if (!userConfig || userConfig.length === 0) {
    userConfig = DEFAULT_QUIZZES;
  }

  for (const quiz of userConfig) {
    allQuestionsMap[quiz.id] = [];
    let fileIdx = 0;
    for (const fileObj of quiz.files) {
      try {
        const questions = await loadFileWithExcelJS(fileObj, quiz.id, fileIdx);
        allQuestionsMap[quiz.id].push(...questions);
      } catch (error) {
        console.error(`Lỗi load file ${fileObj.path || "Uploaded File"}:`, error);
      }
      fileIdx++;
    }
  }

  // Set default active quiz to the first one
  if (userConfig.length > 0) {
    currentActiveQuizId = userConfig[0].id;
  }
}

function getAllQuestions() {
  return allQuestionsMap[currentActiveQuizId] || [];
}