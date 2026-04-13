window.onload = async () => {
  try {
    await loadAllData();
    renderProgress();

    if (!allQuestions || allQuestions.length === 0) {
      throw new Error("No questions loaded from xlsx files.");
    }

    startQuiz("all");
  } catch (err) {
    console.error(err);
    const questionEl = document.getElementById("question");
    const optionsEl = document.getElementById("options");

    if (questionEl) questionEl.innerText = "LOAD ERROR: " + err.message;
    if (optionsEl) optionsEl.innerHTML = "";
  }
};