let progress = JSON.parse(localStorage.getItem("progress")) || {};

function updateProgress(questionId, isCorrect, topic) {
  if (!progress[questionId]) {
    progress[questionId] = {
      attempts: 0,
      correct: 0,
      topic: topic
    };
  }

  progress[questionId].attempts++;
  if (isCorrect) progress[questionId].correct++;

  localStorage.setItem("progress", JSON.stringify(progress));
}

function getStatsByTopic() {
  let stats = {
    cloud: { correct: 0, total: 0 },
    tech: { correct: 0, total: 0 },
    security: { correct: 0, total: 0 }
  };

  Object.values(progress).forEach(p => {
    stats[p.topic].total += p.attempts;
    stats[p.topic].correct += p.correct;
  });

  return stats;
}

function renderProgress() {
  let stats = getStatsByTopic();
  let output = "";

  for (let topic in stats) {
    let s = stats[topic];
    let acc = s.total ? ((s.correct / s.total) * 100).toFixed(1) : 0;

    output += `${topic.toUpperCase()}:
Accuracy: ${acc}%
Attempts: ${s.total}

`;
  }

  document.getElementById("progress").innerText = output;
}