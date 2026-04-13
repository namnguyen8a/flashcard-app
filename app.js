window.onload = async () => {
  const questionEl = document.getElementById("question");
  try {
    questionEl.innerText = "Đang tải dữ liệu...";
    await window.loadAllData();
    window.renderProgress();
    window.startQuiz("all");
  } catch (err) {
    questionEl.innerHTML = `<span style="color:red;">Lỗi: ${err.message}</span>`;
  }
};