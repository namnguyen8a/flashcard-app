let currentQuiz = [];
let currentIndex = 0;
let hasAnswered = false; // Ngăn chặn user đổi đáp án khi đã chọn

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function generateExam() {
  let cloud = allQuestions.filter(q => q.topic === "cloud");
  let tech = allQuestions.filter(q => q.topic === "tech");
  let sec = allQuestions.filter(q => q.topic === "security");

  return [
    ...shuffle(cloud).slice(0, Math.floor(65 * 0.24)),
    ...shuffle(tech).slice(0, Math.floor(65 * 0.34)),
    ...shuffle(sec).slice(0, 65 - Math.floor(65 * 0.24) - Math.floor(65 * 0.34))
  ];
}

function startQuiz(mode) {
  document.getElementById("quizContainer").classList.remove("hidden");
  document.getElementById("nextBtn").classList.remove("hidden");
  document.querySelector(".tabs").classList.remove("hidden");

  if (mode === "all") currentQuiz = shuffle([...allQuestions]);
  else if (mode === "exam") currentQuiz = generateExam();
  else if (mode === "topic1") currentQuiz = shuffle(allQuestions.filter(q => q.topic === "cloud"));
  else if (mode === "topic2") currentQuiz = shuffle(allQuestions.filter(q => q.topic === "tech"));
  else currentQuiz = shuffle(allQuestions.filter(q => q.topic === "security"));

  currentIndex = 0;
  renderQuestion();
}

function renderQuestion() {
  if (!currentQuiz || currentQuiz.length === 0) {
    document.getElementById("question").innerText = "Không có câu hỏi nào trong mục này.";
    document.getElementById("options").innerHTML = "";
    return;
  }

  hasAnswered = false;
  let q = currentQuiz[currentIndex];
  
  // Hiển thị vị trí câu hỏi
  document.getElementById("question").innerText = `Câu ${currentIndex + 1}/${currentQuiz.length}: ${q.question}`;

  let optDiv = document.getElementById("options");
  optDiv.innerHTML = "";

  ["A","B","C","D"].forEach((label, i) => {
    if (!q.options[i]) return; // Nếu option rỗng thì bỏ qua

    let btn = document.createElement("div");
    btn.className = "option";
    btn.innerText = `${label}. ${q.options[i]}`;

    btn.onclick = () => selectAnswer(btn, label === q.correct, q.id, q.topic);
    optDiv.appendChild(btn);
  });

  document.getElementById("explain").innerHTML = `<strong>Giải thích:</strong> ${q.explain || "Không có giải thích"}`;
  document.getElementById("note").innerHTML = `<strong>Ghi chú:</strong> ${q.note || "Không có ghi chú"}`;

  document.getElementById("explain").classList.add("hidden");
  document.getElementById("note").classList.add("hidden");
}

function selectAnswer(btn, isCorrect, qId, topic) {
  if (hasAnswered) return; // Chỉ cho phép chọn 1 lần
  hasAnswered = true;

  btn.classList.add(isCorrect ? "correct" : "wrong");

  // Hiển thị luôn giải thích khi đã trả lời xong
  document.getElementById("explain").classList.remove("hidden");

  updateProgress(qId, isCorrect, topic);
  renderProgress();
}

function nextQuestion() {
  currentIndex++;

  if (currentIndex >= currentQuiz.length) {
    alert("Bạn đã hoàn thành bài thi!");
    return;
  }

  renderQuestion();
}

function toggleExplain() {
  document.getElementById("explain").classList.toggle("hidden");
}

function toggleNote() {
  document.getElementById("note").classList.toggle("hidden");
}