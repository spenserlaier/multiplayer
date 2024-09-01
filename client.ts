import { Player, playerUpdateMessage } from "./common";
const socket = new WebSocket("ws://localhost:8080");

// Handle incoming messages from the server
let canvas: HTMLCanvasElement = document.getElementById(
    "gameCanvas"
) as HTMLCanvasElement;
let ctx = canvas.getContext("2d")!;

const drawCircle = (x: number, y: number, radius: number, color: string) => {
    ctx.beginPath(); // Start a new path
    ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw a circle
    ctx.fillStyle = color; // Set the fill color
    ctx.fill(); // Fill the circle with the color
    ctx.closePath(); // Close the path
};

socket.addEventListener("message", (event) => {
    console.log("Message from server:", event.data);
    if (event.data.kind && event.data.kind === "playerupdate") {
        let playerData: Player = JSON.parse(event.data.body);
        drawCircle(
            playerData.position.x,
            playerData.position.y,
            playerData.size,
            playerData.color
        );
    }
});

// Handle connection open event
socket.addEventListener("open", () => {
    console.log("Connected to server");
});

// Handle connection close event
socket.addEventListener("close", () => {
    console.log("Disconnected from server");
});
