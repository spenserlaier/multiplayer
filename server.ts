import WebSocket from "ws";
import { WebSocketServer } from "ws";
import http from "http";
import fs from "fs";
import path from "path";
import {
    KeyPress,
    Player,
    Position,
    normalizeVector,
    playerDisconnectMessage,
    playerInputMessage,
    playerUpdateMessage,
} from "./common.js";
const PLAYER_SPEED = 800;

const server = new WebSocketServer({ port: 8080 }, () => {
    console.log("WebSocket server is listening on ws://localhost:8080");
});
class gameState {
    players: Player[];
    constructor() {
        this.players = [];
    }
}
let socketsToPlayers = new Map<WebSocket, Player>();
const colors = ["red", "green", "blue", "yellow", "purple", "pink"];

server.on("error", console.error);
let currentGameState = new gameState();

server.on("connection", (socket) => {
    console.log("New client connected");
    let player = new Player(
        colors[Math.floor(Math.random() * colors.length)],
        new Position(0, 0)
    );
    socketsToPlayers.set(socket, player);
    //since this is the first connection, send all of the game state to the client.
    for (let socket of server.clients) {
        //TODO: this could most likely be optimized
        for (let player of socketsToPlayers.values()) {
            //iterate through each player and send an update containing that player's position
            let msg = new playerUpdateMessage(player);
            socket.send(JSON.stringify(msg));
        }
    }

    socket.on("message", (message) => {
        console.log("Received:", message.toString());
        try {
            let msgJSON = JSON.parse(message.toString());
            if (msgJSON.kind) {
                switch (msgJSON.kind) {
                    case "keypress":
                        let msg: playerInputMessage = msgJSON;
                        let keyPress: KeyPress = msg.body;
                        if (socketsToPlayers.get(socket) !== undefined) {
                            let player: Player = socketsToPlayers.get(socket)!;
                            let dirDiff = keyPress.isPressed ? 1 : 0;
                            switch (keyPress.key) {
                                case "w":
                                    player.direction.y = -1 * dirDiff;
                                    break;
                                case "a":
                                    player.direction.x = -1 * dirDiff;
                                    break;
                                case "s":
                                    player.direction.y = dirDiff;
                                    break;
                                case "d":
                                    player.direction.x = dirDiff;
                                    break;
                            }
                        }
                        break;
                }
            }
        } catch (error) {
            console.log(
                "Couldn't parse json from message: ",
                message.toString()
            );
            console.error("ERROR: ", error);
        }

        // Echo the message back
        //socket.send(`Echo: ${message}`);
    });

    socket.on("close", () => {
        if (socketsToPlayers.get(socket)) {
            const player = socketsToPlayers.get(socket)!;
            const msg: playerDisconnectMessage = new playerDisconnectMessage(
                player
            );
            for (let socket of server.clients) {
                socket.send(JSON.stringify(msg));
            }
            socketsToPlayers.delete(socket);
        }
        console.log("Client disconnected");
    });
});
let prevTickTime = Date.now();
const serverTick = () => {
    let currentTickTime = Date.now();
    let deltaTime = currentTickTime - prevTickTime;
    prevTickTime = currentTickTime;
    for (let player of socketsToPlayers.values()) {
        if (player.direction.x !== 0 || player.direction.y !== 0) {
            const normalizedDirection = normalizeVector(player.direction);
            player.position.x +=
                (normalizedDirection.x * PLAYER_SPEED) / deltaTime;
            player.position.y +=
                (normalizedDirection.y * PLAYER_SPEED) / deltaTime;
        }
        for (let socket of server.clients) {
            const msg: playerUpdateMessage = new playerUpdateMessage(player);
            socket.send(JSON.stringify(msg));
        }
    }
};
let tickInterval = 100;
setInterval(serverTick, tickInterval);

const httpServer = http.createServer((req, res) => {
    if (req.url) {
        if (req.url === "/") {
            req.url = "./index.html";
        }
        //__dirname = process.cwd();
        // for some reason, dirname is completely undefined
        const filePath = path.join(process.cwd(), req.url);
        const extname = path.extname(filePath);
        let contentType = "text/plain";
        switch (extname) {
            case ".html":
                contentType = "text/html";
                break;
            case ".js":
                contentType = "application/javascript";
                break;
            case ".css":
                contentType = "text/css";
                break;
        }
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(err);
                console.log(req.url);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("500 Internal server error");
            } else {
                res.writeHead(200, { "Content-Type": contentType });
                res.end(data);
            }
        });
    }
});
httpServer.listen(3000, () => {
    console.log("Server is running on http://localhost:3000/");
});
