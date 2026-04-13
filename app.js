window.onload = async () => {
  const questionEl = document.getElementById("question");
  
  // Gán sự kiện cho các nút chọn chế độ
  document.getElementById("btnModeAll").addEventListener("click", () => startQuiz("all"));
  document.getElementById("btnModeExam").addEventListener("click", () => startQuiz("exam"));
  document.getElementById("btnModeCloud").addEventListener("click", () => startQuiz("cloud"));
  document.getElementById("btnModeTech").addEventListener("click", () => startQuiz("tech"));
  document.getElementById("btnModeSec").addEventListener("click", () => startQuiz("security"));

  // Gán sự kiện cho các nút điều khiển
  document.getElementById("btnToggleExplain").addEventListener("click", toggleExplain);
  document.getElementById("btnToggleNote").addEventListener("click", toggleNote);
  document.getElementById("btnNext").addEventListener("click", nextQuestion);

  try {
    questionEl.innerText = "Đang tải dữ liệu câu hỏi, vui lòng đợi...";
    document.getElementById("quizContainer").classList.remove("hidden");
    
    await loadAllData();
    renderProgress();
    startQuiz("all"); // Mặc định chạy All Questions
  } catch (err) {
    console.error(err);
    document.getElementById("options").innerHTML = "";
    document.querySelector(".tabs").classList.add("hidden");
    document.getElementById("btnNext").classList.add("hidden");
    questionEl.innerHTML = `<span style="color:red;">❌ Lỗi: ${err.message}</span>`;
  }
};