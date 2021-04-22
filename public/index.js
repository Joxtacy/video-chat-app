const socket = io();

socket.on("connect", () => console.log("connect", socket.id));

socket.on("disconnect", () => console.log("disconnect", socket.id));

const input = document.getElementById("input");
const messages = document.getElementById("messages");
const sendButton = document.getElementById("send-button");

sendButton.addEventListener("click", () => {
    console.log("sending message", input.value);
    socket.send(input.value);
});

socket.on("message", (message) => {
    console.log("receiving message", message);
    messages.innerText += "\n" + message;
});
