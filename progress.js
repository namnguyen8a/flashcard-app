// Khởi tạo an toàn
function getProgressData() {
  try {
    return JSON.parse(localStorage.getItem("progress")) || {};
  } catch (e) {
    return {};
  }
}

// 1. Lưu tracking theo từng câu hỏi
function updateProgress(qid, isCorrect) {
  const data = getProgressData();

  if (!data[qid]) {
    data[qid] = { seen: 0, correct: 0, last: 0 };
  }

  data[qid].seen += 1;
  if (isCorrect) data[qid].correct += 1;
  data[qid].last = Date.now();

  localStorage.setItem("progress", JSON.stringify(data));
}

// 2. Thuật toán Spaced Repetition & Lấy câu sai
function getWrongQuestions(allQs) {
  const data = getProgressData();
  return allQs.filter(q => {
    const p = data[q.id];
    // Nếu đã làm và tỉ lệ đúng < 60%
    return p && (p.correct / p.seen) < 0.6;
  });
}

function getReviewTodayQuestions(allQs) {
  const data = getProgressData();
  return allQs.filter(q => {
    const p = data[q.id];
    if (!p) return true; // Chưa làm bao giờ -> Nên học

    const days = (Date.now() - p.last) / (1000 * 60 * 60 * 24);
    
    if ((p.correct / p.seen) < 0.6) return true; // Sai nhiều -> Ôn
    if (days > 3) return true; // Để lâu quên -> Ôn

    return false;
  });
}

function getGeneralStats() {
  const data = getProgressData();
  let totalSeen = 0;
  let totalCorrect = 0;
  
  Object.values(data).forEach(p => {
    totalSeen += p.seen;
    totalCorrect += p.correct;
  });

  const accuracy = totalSeen === 0 ? 0 : Math.round((totalCorrect / totalSeen) * 100);
  return { attempts: totalSeen, accuracy: accuracy };
}