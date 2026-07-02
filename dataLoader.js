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

  const isXls = fileObj.path && fileObj.path.toLowerCase().endsWith(".xls");

  // ExcelJS chỉ hỗ trợ .xlsx. Nếu là .xls hoặc có type là number-answer, ta dùng SheetJS (XLSX)
  if (fileObj.type === "color-highlight" && !isXls) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    
    const worksheet = workbook.worksheets[0];
    const questions = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Header

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
    });

    return questions;

  } else {
    // Dùng SheetJS (XLSX) cho các trường hợp còn lại và file .xls
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
    const questions = [];

    if (fileObj.type === "number-answer" || isXls) {
      let startRow = 0;
      // Tìm dòng chứa câu hỏi đầu tiên
      for (let i = 0; i < Math.min(rows.length, 15); i++) {
        const row = rows[i];
        if (row && (row[0] === 1 || String(row[0]).trim() === "1")) {
          startRow = i;
          break;
        }
      }

      const optionLabels = ["A", "B", "C", "D", "E", "F"];

      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 10) continue;

        const qText = String(row[7] || "").trim(); // Cột 7 (Unnamed: 7): Nội dung câu hỏi
        const qType = String(row[8] || "").trim(); // Cột 8 (Unnamed: 8): Dạng câu hỏi (SC/MC)
        const qAnsRaw = String(row[9] || "").trim(); // Cột 9 (Unnamed: 9): Đáp án số
        
        if (!qText || qText === "Nội dung câu hỏi" || !qType || (qType !== "SC" && qType !== "MC")) continue;

        // Các phương án lựa chọn từ cột 10 đến 14
        const options = [];
        for (let c = 10; c <= 14; c++) {
          const optVal = String(row[c] || "").trim();
          if (optVal) {
            options.push(optVal);
          }
        }

        if (options.length === 0) continue;

        // Parse đáp án số: ví dụ "12" -> "A, B", "3" -> "C"
        const correctAnswers = [];
        for (let j = 0; j < qAnsRaw.length; j++) {
          const char = qAnsRaw[j];
          if (char >= '1' && char <= '6') {
            const letter = optionLabels[parseInt(char) - 1];
            if (letter && !correctAnswers.includes(letter)) {
              correctAnswers.push(letter);
            }
          }
        }

        questions.push({
          id: `${quizId}-${fileIndex}-${i}`,
          question: qText,
          options: options,
          correct: correctAnswers.join(", "),
          explain: "",
          note: String(row[5] || "").trim(), // Kiến thức / chủ đề
          topic: "general"
        });
      }

    } else {
      // Default SheetJS parser
      const rowsJson = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      rowsJson.forEach((row, index) => {
        const question = getCellRobust(row, ["Question", "question", "Câu hỏi"]);
        if (!question) return;

        questions.push({
          id: `${quizId}-${fileIndex}-${index}`,
          question: question,
          options: [
            getCellRobust(row, ["Option A", "A"]),
            getCellRobust(row, ["Option B", "B"]),
            getCellRobust(row, ["Option C", "C"]),
            getCellRobust(row, ["Option D", "D"])
          ].filter(x => x),
          correct: cleanCorrectAnswer(getCellRobust(row, ["Correct Answer", "Answer", "Đáp án"])),
          explain: getCellRobust(row, ["Detail Explaination", "Detail Explanation", "Explain", "Giải thích"]),
          note: getCellRobust(row, ["Note", "Ghi chú"]),
          topic: detectTopic(fileObj, row)
        });
      });
    }

    return questions;
  }
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