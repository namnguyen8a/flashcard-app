window.onload = async () => {
  const dashEl = document.getElementById("dashboard");
  const loadingEl = document.getElementById("loadingScreen");
  const statWrong = document.getElementById("statWrong");
  const statToday = document.getElementById("statToday");
  const statTotal = document.getElementById("statTotal");

  // Manage UI
  const manageModal = document.getElementById("manageModal");
  document.getElementById("btnManageFiles").addEventListener("click", openManageModal);
  document.getElementById("btnCloseManage").addEventListener("click", () => manageModal.classList.add("hidden"));
  document.getElementById("btnResetDefault").addEventListener("click", () => {
    if(confirm("Bạn có chắc muốn khôi phục mặc định? Toàn bộ tab bạn tự thêm sẽ bị xoá.")) {
      localStorage.removeItem("USER_QUIZ_CONFIG");
      window.location.reload();
    }
  });

  // Sự kiện trong Dashboard
  document.getElementById("btnReviewWrong").addEventListener("click", () => startQuiz("wrong"));
  document.getElementById("btnReviewToday").addEventListener("click", () => startQuiz("review"));
  document.getElementById("btnModeAll").addEventListener("click", () => startQuiz("all"));

  document.getElementById("btnMock10").addEventListener("click", () => startQuiz("mock", 10));
  document.getElementById("btnMock20").addEventListener("click", () => startQuiz("mock", 20));
  document.getElementById("btnMock30").addEventListener("click", () => startQuiz("mock", 30));
  document.getElementById("btnMock65").addEventListener("click", () => startQuiz("mock", 65));

  // Sự kiện trong Quiz
  document.getElementById("btnToggleExplain").addEventListener("click", toggleExplain);
  document.getElementById("btnToggleNote").addEventListener("click", toggleNote);
  document.getElementById("btnNext").addEventListener("click", nextQuestion);
  
  document.getElementById("btnBackHome").addEventListener("click", () => {
    window.location.reload(); 
  });

  try {
    loadingEl.classList.remove("hidden");
    dashEl.classList.add("hidden");
    
    // Load Data
    await loadAllData(); 
    
    renderTabs();
    updateDashboardStats();

    loadingEl.classList.add("hidden");
    dashEl.classList.remove("hidden");
    
    // Check Session Resume
    if (localStorage.getItem("currentSession")) {
      const session = JSON.parse(localStorage.getItem("currentSession"));
      if (session.quizId === currentActiveQuizId) {
        document.getElementById("resumeBox").classList.remove("hidden");
        document.getElementById("btnResume").addEventListener("click", loadSession);
        document.getElementById("btnClearSession").addEventListener("click", () => {
          clearSession();
          document.getElementById("resumeBox").classList.add("hidden");
        });
      }
    }

  } catch (err) {
    console.error(err);
    loadingEl.innerHTML = `<h2 style="color:red;">Lỗi: ${err.message}</h2>`;
  }
};

function renderTabs() {
  const tabsContainer = document.getElementById("quizTabs");
  tabsContainer.innerHTML = "";
  
  let userConfig = JSON.parse(localStorage.getItem("USER_QUIZ_CONFIG")) || DEFAULT_QUIZZES;

  userConfig.forEach(quiz => {
    const btn = document.createElement("button");
    btn.className = `nav-tab ${quiz.id === currentActiveQuizId ? "active" : ""}`;
    btn.innerText = quiz.name;
    btn.onclick = () => {
      currentActiveQuizId = quiz.id;
      document.getElementById("dashboardTitle").innerText = `🚀 ${quiz.name} Dashboard`;
      renderTabs();
      updateDashboardStats();
    };
    tabsContainer.appendChild(btn);
  });
  
  const activeQuiz = userConfig.find(q => q.id === currentActiveQuizId);
  if (activeQuiz) {
    document.getElementById("dashboardTitle").innerText = `🚀 ${activeQuiz.name} Dashboard`;
  }
}

function updateDashboardStats() {
  const allQs = getAllQuestions();
  const wrongQs = getWrongQuestions(allQs);
  const reviewQs = getReviewTodayQuestions(allQs);
  const general = getGeneralStats(currentActiveQuizId);

  document.getElementById("statWrong").innerText = wrongQs.length;
  document.getElementById("statToday").innerText = reviewQs.length;
  document.getElementById("statTotal").innerText = `${general.accuracy}% (Đã làm: ${general.attempts})`;
}

// Manage config UI
function openManageModal() {
  const pass = prompt("🔒 Vui lòng nhập mật khẩu quản trị viên để tiếp tục:");
  if (pass !== ADMIN_PASSWORD) {
    alert("❌ Sai mật khẩu!");
    return;
  }
  const modal = document.getElementById("manageModal");
  modal.classList.remove("hidden");
  renderManageList();
}

function renderManageList() {
  const list = document.getElementById("configList");
  list.innerHTML = "";
  let userConfig = JSON.parse(localStorage.getItem("USER_QUIZ_CONFIG")) || DEFAULT_QUIZZES;

  userConfig.forEach((quiz, index) => {
    const div = document.createElement("div");
    div.className = "config-item";
    div.innerHTML = `
      <div>
        <strong>${quiz.name}</strong> <span style="color:var(--text-muted);font-size:0.85rem">(${quiz.files.length} files)</span>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
          ${quiz.files.map(f => f.path).join(", ")}
        </div>
      </div>
      <button class="btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" onclick="deleteTab(${index})">Xóa</button>
    `;
    list.appendChild(div);
  });

  // Setup Add New logic
  const btnAdd = document.getElementById("btnAddNewTab");
  // Only bind once
  const newBtnAdd = btnAdd.cloneNode(true);
  btnAdd.parentNode.replaceChild(newBtnAdd, btnAdd);
  
  newBtnAdd.addEventListener("click", () => {
    const name = document.getElementById("newTabName").value.trim();
    const pathsStr = document.getElementById("newTabPaths").value.trim();
    const parser = document.getElementById("newTabParser").value;

    if (!name || !pathsStr) return alert("Vui lòng nhập tên và đường dẫn file!");

    const paths = pathsStr.split(",").map(s => s.trim()).filter(s => s);
    const newTab = {
      id: "tab_" + Date.now(),
      name: name,
      files: paths.map(p => ({ path: p, type: parser }))
    };

    userConfig.push(newTab);
    localStorage.setItem("USER_QUIZ_CONFIG", JSON.stringify(userConfig));
    alert("Thêm thành công! Trang web sẽ tự tải lại.");
    window.location.reload();
  });
}

window.deleteTab = function(index) {
  if(!confirm("Xóa tab này?")) return;
  let userConfig = JSON.parse(localStorage.getItem("USER_QUIZ_CONFIG")) || DEFAULT_QUIZZES;
  userConfig.splice(index, 1);
  localStorage.setItem("USER_QUIZ_CONFIG", JSON.stringify(userConfig));
  renderManageList();
  alert("Vui lòng tải lại trang để áp dụng thay đổi.");
};