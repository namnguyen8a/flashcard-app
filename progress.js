let progress = {};
try {
  progress = JSON.parse(localStorage.getItem("progress")) || {};
} catch (e) {
  progress = {};
}

function updateProgress(questionId, isCorrect, topic) {
  if (!progress[questionId]) {
    progress[questionId] = { attempts: 0, correct: 0, topic: topic };
  }
  progress[questionId].attempts++;
  if (isCorrect) progress[questionId].correct++;
  
  localStorage.setItem("progress", JSON.stringify(progress));
}

function renderProgress() {
  let stats = {
    cloud: { correct: 0, total: 0 },
    tech: { correct: 0, total: 0 },
    security: { correct: 0, total: 0 }
  };

  Object.values(progress).forEach(p => {
    if (stats[p.topic]) {
      stats[p.topic].total += p.attempts;
      stats[p.topic].correct += p.correct;
    }
  });

  let output = "";
  for (let topic in stats) {
    let s = stats[topic];
    let acc = s.total ? ((s.correct / s.total) * 100).toFixed(1) : 0;
    output += `${topic.toUpperCase()}:\nAccuracy: ${acc}%\nAttempts: ${s.total}\n\n`;
  }
  
  const progEl = document.getElementById("progress");
  if (progEl) {
    progEl.innerText = output || "Chưa có dữ liệu";
  }
}