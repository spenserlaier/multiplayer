import WebSocket from "ws";
import http from "http";
import fs from "fs";
import path from "path";
import { Player, Position, playerUpdateMessage } from "./common";

const server = new WebSocket.Server({ port: 8080 }, () => {
    console.log("WebSocket server is listening on ws://localhost:8080");
});
class gameState {
    players: Player[];
    constructor() {
        this.players = [];
    }
}

let socketMappings = new Map<WebSocket, Player>();
const colors = ["red", "green", "blue"];

server.on("error", console.error);
let currentGameState = new gameState();

server.on("connection", (socket) => {
    console.log("New client connected");
    let player = new Player("brown", new Position(0, 0));
    socketMappings.set(socket, player);
    //since this is the first connection, send all of the game state to the client.
    for (let player of socketMappings.values()) {
        //iterate through each player and send an update containing that player's position
        let msg = new playerUpdateMessage(player);
        socket.send(JSON.stringify(msg));
    }

    socket.on("message", (message) => {
        console.log("Received:", message);
        // Echo the message back
        //socket.send(`Echo: ${message}`);
    });

    socket.on("close", () => {
        console.log("Client disconnected");
    });
});

const httpServer = http.createServer((req, res) => {
    if (req.url) {
        if (req.url === "/") {
            req.url = "./index.html";
        }
        const filePath = path.join(__dirname, req.url);
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
