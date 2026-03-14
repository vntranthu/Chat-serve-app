import http from "http";
import { readFile } from "fs/promises";
import path from "path";

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
};

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function buildLocalReply(input) {
  const text = (input || "").toLowerCase();

  if (!text.trim()) return "Bạn chưa nhập nội dung. Hãy hỏi mình điều gì đó nhé!";
  if (text.includes("xin chào") || text.includes("hello") || text.includes("hi")) {
    return "Xin chào! Mình là chatbot mini. Bạn muốn thảo luận chủ đề gì?";
  }
  if (text.includes("react") || text.includes("node")) {
    return "Gợi ý nhanh: dùng React cho UI và Node.js cho backend API là combo rất phù hợp cho mini app chat.";
  }
  if (text.includes("kiến trúc") || text.includes("architecture")) {
    return "Kiến trúc tối thiểu: Frontend chat UI -> API /api/chat -> model AI (hoặc fallback cục bộ) -> trả lời theo JSON.";
  }

  return `Mình đã nhận: "${input}". Nếu bạn thêm OPENAI_API_KEY, mình có thể trả lời bằng mô hình AI thực tế.`;
}

async function queryOpenAI(input) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.output_text || "Mình chưa tạo được phản hồi từ AI.";
}

async function handleChat(req, res) {
  let body = "";
  for await (const chunk of req) body += chunk;

  let parsed;
  try {
    parsed = JSON.parse(body || "{}");
  } catch {
    return json(res, 400, { error: "JSON không hợp lệ." });
  }

  const message = parsed?.message;
  if (typeof message !== "string") {
    return json(res, 400, { error: "Trường 'message' phải là chuỗi." });
  }

  try {
    const reply = OPENAI_API_KEY ? await queryOpenAI(message) : buildLocalReply(message);
    return json(res, 200, { reply, mode: OPENAI_API_KEY ? "openai" : "local" });
  } catch (error) {
    return json(res, 500, {
      error: "Không thể gọi AI provider. Đang fallback về local.",
      detail: String(error.message || error),
      reply: buildLocalReply(message),
      mode: "local-fallback",
    });
  }
}

async function handleStatic(req, res) {
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(process.cwd(), "public", filePath.replace(/^\/+/, ""));

  try {
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || "text/plain; charset=utf-8";
    const content = await readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") {
    return handleChat(req, res);
  }

  if (req.method === "GET") {
    return handleStatic(req, res);
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method Not Allowed");
});

server.listen(PORT, () => {
  console.log(`Chat serve app running at http://localhost:${PORT}`);
});
