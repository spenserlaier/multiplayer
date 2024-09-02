import {
    KeyPress,
    Player,
    playerInputMessage,
    playerUpdateMessage,
} from "./common.js";
const socket = new WebSocket("ws://localhost:8080");

// Handle incoming messages from the server
let canvas: HTMLCanvasElement = document.getElementById(
    "gameCanvas"
) as HTMLCanvasElement;
let ctx = canvas.getContext("2d")!;

let idToPlayer: Map<number, Player> = new Map();
const drawPlayer = (player: Player) => {
    ctx.beginPath(); // Start a new path
    ctx.arc(player.position.x, player.position.y, player.size, 0, Math.PI * 2); // Draw a circle
    ctx.fillStyle = player.color; // Set the fill color
    ctx.fill(); // Fill the circle with the color
    ctx.closePath(); // Close the path
};

socket.addEventListener("message", (event) => {
    console.log("Message from server:", event.data);
    let data = JSON.parse(event.data);
    if (data.kind) {
        switch (data.kind) {
            case "playerupdate":
                let player: Player = data.body;
                idToPlayer.set(player.id, player);
                console.log("drawing circle");
                drawPlayer(player);
                break;
        }
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

const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
        case "w":
        case "a":
        case "s":
        case "d":
            let keyPress: KeyPress = new KeyPress(event.key, true);
            let keyPressMessage: playerInputMessage = new playerInputMessage(
                keyPress
            );
            socket.send(JSON.stringify(keyPressMessage));
    }
};
const handleKeyRelease = (event: KeyboardEvent) => {
    switch (event.key) {
        case "w":
        case "a":
        case "s":
        case "d":
            let keyPress: KeyPress = new KeyPress(event.key, false);
            let keyPressMessage: playerInputMessage = new playerInputMessage(
                keyPress
            );
            socket.send(JSON.stringify(keyPressMessage));
    }
};

const drawPlayers = (players: Player[]) => {
    ctx.reset();
    for (let player of players) {
        drawPlayer(player);
    }
};
let prevTick = new Date().getTime();
const clientTick = () => {
    drawPlayers(Array.from(idToPlayer.values()));
};
const tickInterval = 10;
setInterval(clientTick, tickInterval);

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyRelease);
