let currentQuiz = [];
let currentIndex = 0;
let hasAnswered = false;

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function generateExam() {
  let cloud = allQuestions.filter(q => q.topic === "cloud");
  let tech = allQuestions.filter(q => q.topic === "tech");
  let sec = allQuestions.filter(q => q.topic === "security");

  return [
    ...shuffle(cloud).slice(0, 15),
    ...shuffle(tech).slice(0, 22),
    ...shuffle(sec).slice(0, 28)
  ];
}

function startQuiz(mode) {
  document.getElementById("quizContainer").classList.remove("hidden");
  document.getElementById("btnNext").classList.remove("hidden");
  document.querySelector(".tabs").classList.remove("hidden");

  if (mode === "all") {
    currentQuiz = shuffle([...allQuestions]);
  } else if (mode === "exam") {
    currentQuiz = generateExam();
  } else {
    currentQuiz = shuffle(allQuestions.filter(q => q.topic === mode));
  }

  currentIndex = 0;
  renderQuestion();
}

function renderQuestion() {
  if (currentQuiz.length === 0) {
    document.getElementById("question").innerText = "Không có câu hỏi nào trong mục này.";
    document.getElementById("options").innerHTML = "";
    return;
  }

  hasAnswered = false;
  let q = currentQuiz[currentIndex];
  
  document.getElementById("question").innerText = `Câu ${currentIndex + 1}/${currentQuiz.length}: ${q.question}`;
  
  let optDiv = document.getElementById("options");
  optDiv.innerHTML = "";

  ["A","B","C","D"].forEach((label, i) => {
    if (!q.options[i]) return;

    let btn = document.createElement("div");
    btn.className = "option";
    btn.innerText = `${label}. ${q.options[i]}`;
    btn.dataset.label = label;

    btn.addEventListener("click", () => {
      selectAnswer(btn, label === q.correct, q.id, q.topic, q.correct);
    });

    optDiv.appendChild(btn);
  });

  document.getElementById("explain").innerHTML = `<strong>Giải thích:</strong> ${q.explain || "Không có"}`;
  document.getElementById("note").innerHTML = `<strong>Ghi chú:</strong> ${q.note || "Không có"}`;
  
  document.getElementById("explain").classList.add("hidden");
  document.getElementById("note").classList.add("hidden");
}

function selectAnswer(btn, isCorrect, qId, topic, correctLabel) {
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