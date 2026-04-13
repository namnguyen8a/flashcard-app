let currentQuiz = [];
let currentIndex = 0;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
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

  if (mode === "all") currentQuiz = shuffle([...allQuestions]);
  else if (mode === "exam") currentQuiz = generateExam();
  else if (mode === "topic1") currentQuiz = shuffle(allQuestions.filter(q => q.topic === "cloud"));
  else if (mode === "topic2") currentQuiz = shuffle(allQuestions.filter(q => q.topic === "tech"));
  else currentQuiz = shuffle(allQuestions.filter(q => q.topic === "security"));

  currentIndex = 0;

  if (currentQuiz.length === 0) {
    document.getElementById("question").innerText = "No questions available for this mode.";
    document.getElementById("options").innerHTML = "";
    return;
  }

  renderQuestion();
}

function renderQuestion() {
  const q = currentQuiz[currentIndex];
  if (!q) {
    document.getElementById("question").innerText = "No question found.";
    document.getElementById("options").innerHTML = "";
    return;
  }

  document.getElementById("question").innerText = q.question;

  const optDiv = document.getElementById("options");
  optDiv.innerHTML = "";

  ["A", "B", "C", "D"].forEach((label, i) => {
    const btn = document.createElement("div");
    btn.className = "option";
    btn.innerText = `${label}. ${q.options[i] || ""}`;
    btn.onclick = () => selectAnswer(btn, label === q.correct, q.id, q.topic);
    optDiv.appendChild(btn);
  });

  document.getElementById("explain").innerText = q.explain || "";
  document.getElementById("note").innerText = q.note || "";

  document.getElementById("explain").classList.add("hidden");
  document.getElementById("note").classList.add("hidden");
}