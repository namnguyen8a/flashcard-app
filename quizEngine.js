let currentQuizIds = []; // Chỉ lưu ID để tối ưu localStorage
let currentIndex = 0;
let hasAnswered = false;
let currentMode = "";

// 3. Ưu tiên câu yếu thay vì random hoàn toàn
function smartShuffle(questions) {
  const progress = getProgressData();
  
  // Trộn nhẹ trước để các câu cùng điểm không ra theo thứ tự fix
  let shuffled = questions.sort(() => Math.random() - 0.5);

  return shuffled.sort((a, b) => {
    const pa = progress[a.id];
    const pb = progress[b.id];

    // Câu chưa làm (null) có điểm -1 để được ưu tiên lên đầu
    const scoreA = pa ? (pa.correct / pa.seen) : -1;
    const scoreB = pb ? (pb.correct / pb.seen) : -1;

    return scoreA - scoreB; // Từ yếu đến giỏi
  });
}

// 5. Tính năng Resume cực mượt
function saveSession() {
  localStorage.setItem("currentSession", JSON.stringify({
    mode: currentMode,
    quizIds: currentQuizIds,
    index: currentIndex
  }));
}

function loadSession() {
  const session = JSON.parse(localStorage.getItem("currentSession"));
  if (session && session.quizIds && session.quizIds.length > 0 && session.index < session.quizIds.length) {
    currentMode = session.mode;
    currentQuizIds = session.quizIds;
    currentIndex = session.index;
    
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("quizContainer").classList.remove("hidden");
    renderQuestion();
    return true;
  }
  return false;
}

function clearSession() {
  localStorage.removeItem("currentSession");
  currentQuizIds = [];
  currentIndex = 0;
}

// Bắt đầu chế độ học
function startQuiz(mode, size = null) {
  clearSession();
  currentMode = mode;
  let rawQs = [];

  if (mode === "wrong") rawQs = getWrongQuestions(allQuestions);
  else if (mode === "review") rawQs = getReviewTodayQuestions(allQuestions);
  else if (mode === "all") rawQs = allQuestions;
  else if (mode === "cloud" || mode === "tech" || mode === "security") {
    rawQs = allQuestions.filter(q => q.topic === mode);
  } else if (mode.startsWith("mock")) {
    rawQs = allQuestions; // Mock lấy toàn bộ để smart shuffle
  }

  // 4. Nếu không có câu nào (ví dụ ấn ôn câu sai mà chưa có)
  if (rawQs.length === 0) {
    alert("Tuyệt vời! Bạn không có câu hỏi nào cần ôn trong mục này.");
    return;
  }

  // Luôn luôn dùng Smart Shuffle để tối ưu hiệu suất não bộ
  let sortedQs = smartShuffle(rawQs);
  if (size) sortedQs = sortedQs.slice(0, size);

  currentQuizIds = sortedQs.map(q => q.id);
  currentIndex = 0;
  
  saveSession();

  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("quizContainer").classList.remove("hidden");
  renderQuestion();
}

function getQuestionById(id) {
  return allQuestions.find(q => q.id === id);
}

function renderQuestion() {
  if (currentIndex >= currentQuizIds.length) {
    alert("Hoàn thành! Hãy quay lại Dashboard.");
    clearSession();
    window.location.reload();
    return;
  }

  hasAnswered = false;
  let q = getQuestionById(currentQuizIds[currentIndex]);
  
  document.getElementById("quizProgress").innerText = `Câu ${currentIndex + 1} / ${currentQuizIds.length}`;
  document.getElementById("question").innerText = q.question;
  
  let optDiv = document.getElementById("options");
  optDiv.innerHTML = "";
  document.getElementById("btnNext").classList.add("hidden");

  ["A","B","C","D"].forEach((label, i) => {
    if (!q.options[i]) return;

    let btn = document.createElement("div");
    btn.className = "option";
    btn.innerText = `${label}. ${q.options[i]}`;
    btn.dataset.label = label;

    btn.addEventListener("click", () => {
      selectAnswer(btn, label === q.correct, q.id, q.correct);
    });

    optDiv.appendChild(btn);
  });

  document.getElementById("explain").innerHTML = `<strong>Giải thích:</strong> ${q.explain || "Không có"}`;
  document.getElementById("note").innerHTML = `<strong>Ghi chú:</strong> ${q.note || "Không có"}`;
  document.getElementById("explain").classList.add("hidden");
  document.getElementById("note").classList.add("hidden");
  
  saveSession();
}

function selectAnswer(btn, isCorrect, qId, correctLabel) {
  if (hasAnswered) return;
  hasAnswered = true;

  if (isCorrect) {
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    document.querySelectorAll(".option").forEach(opt => {
      if (opt.dataset.label === correctLabel) {
        opt.classList.add("correct");
      }
    });
  }

  document.getElementById("explain").classList.remove("hidden");
  document.getElementById("btnNext").classList.remove("hidden");
  
  updateProgress(qId, isCorrect);
}

function nextQuestion() {
  currentIndex++;
  renderQuestion();
}

function toggleExplain() { document.getElementById("explain").classList.toggle("hidden"); }
function toggleNote() { document.getElementById("note").classList.toggle("hidden"); }