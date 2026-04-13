window.onload = async () => {
  const questionEl = document.getElementById("question");
  
  // Gắn sự kiện trực tiếp vào hàm (không dùng window. nữa)
  document.getElementById("btnModeAll").addEventListener("click", () => startQuiz("all"));
  document.getElementById("btnModeExam").addEventListener("click", () => startQuiz("exam"));
  document.getElementById("btnModeCloud").addEventListener("click", () => startQuiz("cloud"));
  document.getElementById("btnModeTech").addEventListener("click", () => startQuiz("tech"));
  document.getElementById("btnModeSec").addEventListener("click", () => startQuiz("security"));

  document.getElementById("btnToggleExplain").addEventListener("click", () => toggleExplain());
  document.getElementById("btnToggleNote").addEventListener("click", () => toggleNote());
  document.getElementById("btnNext").addEventListener("click", () => nextQuestion());

  try {
    questionEl.innerText = "Đang tải dữ liệu câu hỏi, vui lòng đợi...";
    document.getElementById("quizContainer").classList.remove("hidden");
    
    await loadAllData();
    renderProgress();
    startQuiz("all"); 
  } catch (err) {
    console.error(err);
    document.getElementById("options").innerHTML = "";
    document.querySelector(".tabs").classList.add("hidden");
    document.getElementById("btnNext").classList.add("hidden");
    questionEl.innerHTML = `<span style="color:red;">❌ Lỗi: ${err.message}</span>`;
  }
};