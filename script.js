const socket = io("https://YOUR_BACKEND_URL");

let secretKey = "chat-secret";

const chatBox = document.getElementById("chat-box");
const emojiPicker = document.getElementById("emoji-picker");

function encrypt(text) {
  return btoa(text + secretKey);
}

function decrypt(text) {
  const decoded = atob(text);
  return decoded.replace(secretKey, "");
}

function startChat() {
  const gender = document.getElementById("gender").value;
  const preference = document.getElementById("preference").value;

  document.getElementById("status").innerText = "Looking for stranger...";
  socket.emit("join", { gender, preference });
}

socket.on("matched", () => {
  document.getElementById("status").innerText = "Stranger Connected!";
});

socket.on("receive_message", (data) => {
  const div = document.createElement("div");
  div.innerText = "Stranger: " + decrypt(data);
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("typing", () => {
  document.getElementById("typing").innerText = "Stranger typing...";
  setTimeout(() => {
    document.getElementById("typing").innerText = "";
  }, 1000);
});

socket.on("stranger_disconnected", () => {
  document.getElementById("status").innerText = "Stranger disconnected.";
});

socket.on("rematch", () => {
  startChat();
});

function sendMessage() {
  const input = document.getElementById("message");

  if (input.value.trim()) {
    socket.emit("send_message", encrypt(input.value));

    const div = document.createElement("div");
    div.innerText = "You: " + input.value;
    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;
    input.value = "";
  }
}

function sendTyping() {
  socket.emit("typing");
}

function nextStranger() {
  socket.emit("next");
}

function toggleEmoji() {
  emojiPicker.style.display =
    emojiPicker.style.display === "none" ? "block" : "none";
}

emojiPicker.addEventListener("emoji-click", event => {
  document.getElementById("message").value += event.detail.unicode;
});
