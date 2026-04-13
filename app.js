window.onload = async () => {
  try {
    await loadAllData();
    renderProgress();
    startQuiz("all");
  } catch (err) {
    console.error(err);
    document.getElementById("question").innerText =
      "Failed to load .xlsx files. Check console and repo upload.";
  }
};