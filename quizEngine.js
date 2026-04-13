let currentQuiz = [];
let currentIndex = 0;

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
    ...shuffle(sec).slice(0, Math.floor(65 * 0.42))
  ];
}

function startQuiz(mode) {
  document.getElementById("quizContainer").classList.remove("hidden");

  if (mode === "all") currentQuiz = shuffle([...allQuestions]);
  else if (mode === "exam") currentQuiz = generateExam();
  else if (mode === "topic1") currentQuiz = shuffle(allQuestions.filter(q => q.topic === "cloud"));
  else if (mode === "topic2") currentQuiz = shuffle(allQuestions.filter(q => q.topic === "tech"));
  else currentQuiz = shuffle(allQuestions.filter(q => q.topic === "security"));

  currentIndex = 0;
  renderQuestion();
}

function renderQuestion() {
  let q = currentQuiz[currentIndex];

  document.getElementById("question").innerText = q.question;

  let optDiv = document.getElementById("options");
  optDiv.innerHTML = "";

  ["A","B","C","D"].forEach((label, i) => {
    let btn = document.createElement("div");
    btn.className = "option";
    btn.innerText = `${label}. ${q.options[i]}`;

    btn.onclick = () => selectAnswer(btn, label === q.correct, currentIndex);

    optDiv.appendChild(btn);
  });

  document.getElementById("explain").innerText = q.explain;
  document.getElementById("note").innerText = q.note;
}

function selectAnswer(btn, isCorrect, index) {
  btn.classList.add(isCorrect ? "correct" : "wrong");
  updateProgress(index, isCorrect);
  renderProgress();
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= currentQuiz.length) {
    alert("Done!");
    return;
  }
  renderQuestion();
}