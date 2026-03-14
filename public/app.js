const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");

function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

appendMessage("bot", "Xin chào! Mình là chatbot mini. Hãy đặt câu hỏi để bắt đầu.");

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  messageInput.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    if (!response.ok) {
      appendMessage("bot", `⚠️ ${data.error || "Có lỗi xảy ra."}\n${data.reply || ""}`);
      return;
    }

    appendMessage("bot", data.reply || "(Không có phản hồi)");
  } catch (error) {
    appendMessage("bot", `❌ Không thể kết nối server: ${String(error.message || error)}`);
  }
});
