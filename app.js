window.onload = async () => {
  const dashEl = document.getElementById("dashboard");
  const statWrong = document.getElementById("statWrong");
  const statToday = document.getElementById("statToday");
  const statTotal = document.getElementById("statTotal");

  // Gán sự kiện cho Dashboard
  document.getElementById("btnReviewWrong").addEventListener("click", () => startQuiz("wrong"));
  document.getElementById("btnReviewToday").addEventListener("click", () => startQuiz("review"));
  document.getElementById("btnModeAll").addEventListener("click", () => startQuiz("all"));
  
  document.getElementById("btnModeCloud").addEventListener("click", () => startQuiz("cloud"));
  document.getElementById("btnModeTech").addEventListener("click", () => startQuiz("tech"));
  document.getElementById("btnModeSec").addEventListener("click", () => startQuiz("security"));

  document.getElementById("btnMock10").addEventListener("click", () => startQuiz("mock", 10));
  document.getElementById("btnMock20").addEventListener("click", () => startQuiz("mock", 20));
  document.getElementById("btnMock30").addEventListener("click", () => startQuiz("mock", 30));
  document.getElementById("btnMock65").addEventListener("click", () => startQuiz("mock", 65));

  // Sự kiện trong Quiz
  document.getElementById("btnToggleExplain").addEventListener("click", toggleExplain);
  document.getElementById("btnToggleNote").addEventListener("click", toggleNote);
  document.getElementById("btnNext").addEventListener("click", nextQuestion);
  
  document.getElementById("btnBackHome").addEventListener("click", () => {
    window.location.reload(); // Cách sạch sẽ nhất để về Dashboard
  });

  try {
    dashEl.innerHTML = `<h2>Đang tải dữ liệu từ Excel...</h2>`;
    await loadAllData(); 
    
    // Khôi phục lại HTML của Dashboard
    window.location.reload; 
    
    // Cập nhật thống kê "Hôm nay học gì"
    const wrongQs = getWrongQuestions(allQuestions);
    const reviewQs = getReviewTodayQuestions(allQuestions);
    const general = getGeneralStats();

    statWrong.innerText = wrongQs.length;
    statToday.innerText = reviewQs.length;
    statTotal.innerText = `${general.accuracy}% (Đã làm: ${general.attempts})`;

    // Check Session Resume
    if (localStorage.getItem("currentSession")) {
      document.getElementById("resumeBox").classList.remove("hidden");
      document.getElementById("btnResume").addEventListener("click", loadSession);
      document.getElementById("btnClearSession").addEventListener("click", () => {
        clearSession();
        document.getElementById("resumeBox").classList.add("hidden");
      });
    }

  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<h2 style="color:red;text-align:center;">Lỗi: ${err.message}</h2>`;
  }
};