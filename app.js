window.onload = async () => {
  const questionEl = document.getElementById("question");
  
  // Gọi rõ ràng window.tên_hàm để không bao giờ bị lỗi "not defined"
  document.getElementById("btnModeAll").addEventListener("click", () => window.startQuiz("all"));
  document.getElementById("btnModeExam").addEventListener("click", () => window.startQuiz("exam"));
  document.getElementById("btnModeCloud").addEventListener("click", () => window.startQuiz("cloud"));
  document.getElementById("btnModeTech").addEventListener("click", () => window.startQuiz("tech"));
  document.getElementById("btnModeSec").addEventListener("click", () => window.startQuiz("security"));

  document.getElementById("btnToggleExplain").addEventListener("click", () => window.toggleExplain());
  document.getElementById("btnToggleNote").addEventListener("click", () => window.toggleNote());
  document.getElementById("btnNext").addEventListener("click", () => window.nextQuestion());

  try {
    questionEl.innerText = "Đang tải dữ liệu câu hỏi, vui lòng đợi...";
    document.getElementById("quizContainer").classList.remove("hidden");
    
    await window.loadAllData();
    window.renderProgress();
    window.startQuiz("all"); 
  } catch (err) {
    console.error(err);
    document.getElementById("options").innerHTML = "";
    document.querySelector(".tabs").classList.add("hidden");
    document.getElementById("btnNext").classList.add("hidden");
    questionEl.innerHTML = `<span style="color:red;">❌ Lỗi: ${err.message}</span>`;
  }
};