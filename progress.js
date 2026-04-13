let progress = JSON.parse(localStorage.getItem("progress")) || {};

function updateProgress(qIndex, correct) {
  if (!progress[qIndex]) {
    progress[qIndex] = {
      attempts: 0,
      correct: 0
    };
  }

  progress[qIndex].attempts++;
  if (correct) progress[qIndex].correct++;

  localStorage.setItem("progress", JSON.stringify(progress));
}

function renderProgress() {
  document.getElementById("progress").innerText =
    JSON.stringify(progress, null, 2);
}