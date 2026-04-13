let cards = JSON.parse(localStorage.getItem("cards")) || [
  { question: "What is AI?", answer: "Artificial Intelligence" }
];

let current = 0;

function save() {
  localStorage.setItem("cards", JSON.stringify(cards));
}

function render() {
  if (cards.length === 0) return;

  document.getElementById("question").innerText = cards[current].question;
  document.getElementById("answer").innerText = cards[current].answer;
  document.getElementById("answer").classList.add("hidden");
}

function showAnswer() {
  document.getElementById("answer").classList.remove("hidden");
}

function nextCard() {
  current = (current + 1) % cards.length;
  render();
}

function addCard() {
  let q = document.getElementById("qInput").value;
  let a = document.getElementById("aInput").value;

  if (!q || !a) return;

  cards.push({ question: q, answer: a });
  save();

  document.getElementById("qInput").value = "";
  document.getElementById("aInput").value = "";

  render();
}

render();