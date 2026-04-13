window.onload = async () => {
  const quizContainer = document.getElementById("quizContainer");
  const questionEl = document.getElementById("question");
  
  try {
    questionEl.innerText = "Đang tải dữ liệu câu hỏi, vui lòng đợi...";
    quizContainer.classList.remove("hidden");
    
    await loadAllData();
    renderProgress();
    startQuiz("all");
  } catch (err) {
    console.error(err);
    // Xóa UI thừa và in lỗi ra màn hình nếu load thất bại
    document.getElementById("options").innerHTML = "";
    document.querySelector(".tabs").classList.add("hidden");
    document.getElementById("nextBtn").classList.add("hidden");
    
    questionEl.innerHTML = `<span style="color:red;">❌ Lỗi: ${err.message}</span><br><br>Vui lòng mở Console (F12) để xem chi tiết.`;
  }
};