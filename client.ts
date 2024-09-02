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

let idsToPlayers: Map<number, Player> = new Map();
const drawPlayer = (player: Player) => {
    ctx.beginPath(); // Start a new path
    ctx.arc(player.position.x, player.position.y, player.size, 0, Math.PI * 2); // Draw a circle
    ctx.fillStyle = player.color; // Set the fill color
    ctx.fill(); // Fill the circle with the color
    ctx.closePath(); // Close the path
};

socket.addEventListener("message", (event) => {
    //console.log("Message from server:", event.data);
    let data = JSON.parse(event.data);
    if (data.kind) {
        switch (data.kind) {
            case "playerupdate":
                let player: Player = data.body;
                idsToPlayers.set(player.id, player);
                drawPlayer(player);
                break;
            case "playerdisconnect":
                let playerId = data.body.id;
                console.log("received player id: ", playerId);
                if (idsToPlayers.get(playerId)) {
                    idsToPlayers.delete(playerId);
                }
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
    drawPlayers(Array.from(idsToPlayers.values()));
};
const tickInterval = 10;
setInterval(clientTick, tickInterval);

document.addEventListener("keydown", handleKeyDown);
//TODO: normally, a key that is pressed and held down will continue sending signals.
//however, if another key is pressed while one is already pressed, that key will
//override the original. This means that, when moving, if one direction is pressed,
//then the opposite direction is pressed (while the first is still held down), and
//the opposite direction is released, the player will simply stop, even though
//one direction is still held down.
document.addEventListener("keyup", handleKeyRelease);
