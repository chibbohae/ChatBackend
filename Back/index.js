require("dotenv").config(); // ✅ .env 불러오기 (이거 빠졌었음)
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const cors = require("cors");
const app = express(); // ← 이 줄이 없어!


// app.use(cors()); // ✅ CORS 허용
app.use(cors({
  origin: "https://c4h-front.vercel.app", // or ["https://c4h-front.vercel.app"] for more secure setting
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const server = http.createServer(app);


// ✅ CORS 허용
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// ✅ Socket 이벤트 등록
require("./utils/io")(io);

// ✅ API 라우트 등록
app.post("/call/request", (req, res) => {
  const { caller_id, receiver_id } = req.body;

  console.log("📞 통화 요청 수신:", caller_id, "→", receiver_id);

  // 간단한 call_id 생성
  const callId = `${caller_id}_${Date.now()}`;

  res.json({ call_id: callId });
});

app.post("/call/end", (req, res) => {
  const { call_id } = req.body;
  console.log("📴 통화 종료 요청 수신:", call_id);
  res.json({ success: true });
});


// ✅ 서버 실행
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
