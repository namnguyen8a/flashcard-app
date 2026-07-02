const ADMIN_PASSWORD = "Crazyl0ve#"; // Đổi mật khẩu này theo ý bạn

const DEFAULT_QUIZZES = [
  {
    id: "aws_quiz",
    name: "AWS Quiz",
    files: [
      { path: "raw_csv_quiz/Quiz_Week01.xlsx", type: "default" },
      { path: "raw_csv_quiz/Quiz_Week02.xlsx", type: "default" },
      { path: "raw_csv_quiz/Quiz_Week03.xlsx", type: "default" },
      { path: "raw_csv_quiz/Quiz_Week04.xlsx", type: "default" }
    ]
  },
  {
    id: "vt_construct_nv",
    name: "VT Construct - NV Hỗ trợ đối tác",
    files: [
      { path: "raw_quiz_vt_construct/Ngan hang cau hoi NV ho tro doi tac.xlsx", type: "color-highlight" }
    ]
  },
  {
    id: "vt_construct_vhls",
    name: "VT Construct - VHLS",
    files: [
      { path: "raw_quiz_vt_construct/1.2. CTr_ Ket cau NHCH thi trac nghiem VHLS_thi het han HDTV 2025 (1).xls", type: "number-answer" }
    ]
  }
];
