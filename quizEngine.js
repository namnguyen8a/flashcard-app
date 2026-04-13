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

window.startQuiz = function(mode) {
  document.getElementById("quizContainer").classList.remove("hidden");
  
  if (mode === "all") currentQuiz = shuffle([...allQuestions]);
  else if (mode === "exam") currentQuiz = generateExam();
  else if (mode === "topic1") currentQuiz = shuffle(allQuestions.filter(q => q.topic === "cloud"));
  else if (mode === "topic2") currentQuiz = shuffle(allQuestions.filter(q => q.topic === "tech"));
  else currentQuiz = shuffle(allQuestions.filter(q => q.topic === "security"));

  currentIndex = 0;
  window.renderQuestion();
};

window.renderQuestion = function() {
  if (currentQuiz.length === 0) return;
  
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
    btn.dataset.label = label; // Lưu label vào data attribute để dễ tìm

    // Bắt sự kiện click bằng addEventListener an toàn hơn onclick
    btn.addEventListener("click", function() {
      window.selectAnswer(btn, label === q.correct, q.id, q.topic, q.correct);
    });

    optDiv.appendChild(btn);
  });

  document.getElementById("explain").innerHTML = `<strong>Giải thích:</strong> ${q.explain || "Không có"}`;
  document.getElementById("note").innerHTML = `<strong>Ghi chú:</strong> ${q.note || "Không có"}`;
  document.getElementById("explain").classList.add("hidden");
  document.getElementById("note").classList.add("hidden");
};

window.selectAnswer = function(btn, isCorrect, qId, topic, correctLabel) {
  if (hasAnswered) return; 
  hasAnswered = true; // Khóa không cho chọn lại

  if (isCorrect) {
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    // Tự động tìm và bôi xanh đáp án đúng
    const allOptions = document.querySelectorAll(".option");
    allOptions.forEach(opt => {
      if (opt.dataset.label === correctLabel) {
        opt.classList.add("correct");
      }
    });
  }

  document.getElementById("explain").classList.remove("hidden");
  
  if (window.updateProgress && window.renderProgress) {
    window.updateProgress(qId, isCorrect, topic);
    window.renderProgress();
  }
};

window.nextQuestion = function() {
  currentIndex++;
  if (currentIndex >= currentQuiz.length) {
    alert("Bạn đã hoàn thành bài thi!");
    return;
  }
  window.renderQuestion();
};

window.toggleExplain = function() { document.getElementById("explain").classList.toggle("hidden"); };
window.toggleNote = function() { document.getElementById("note").classList.toggle("hidden"); };