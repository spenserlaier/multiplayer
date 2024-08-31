const socket = new WebSocket("ws://localhost:8080");

// Handle incoming messages from the server
socket.addEventListener("message", (event) => {
    console.log("Message from server:", event.data);
});

// Handle connection open event
socket.addEventListener("open", () => {
    console.log("Connected to server");
});

// Handle connection close event
socket.addEventListener("close", () => {
    console.log("Disconnected from server");
});
