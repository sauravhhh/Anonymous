const socket = io("https://anonymous-2dqg.onrender.com");

let secretKey = "chat-secret";

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
  socket.emit("join", { gender, preference });
}

socket.on("matched", () => {
  document.getElementById("status").innerText = "Stranger connected!";
});

socket.on("receive_message", (data) => {
  const div = document.createElement("div");
  div.innerText = "Stranger: " + decrypt(data);
  document.getElementById("chat-box").appendChild(div);
});

socket.on("typing", () => {
  document.getElementById("typing").innerText = "Stranger typing...";
  setTimeout(() => {
    document.getElementById("typing").innerText = "";
  }, 1000);
});

socket.on("stranger_disconnected", () => {
  document.getElementById("status").innerText = "Stranger disconnected";
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
    document.getElementById("chat-box").appendChild(div);

    input.value = "";
  }
}

function sendTyping() {
  socket.emit("typing");
}

function nextStranger() {
  socket.emit("next");
}
