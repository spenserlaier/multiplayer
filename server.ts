import WebSocket from "ws";
import http from "http";
import fs from "fs";
import path from "path";
//const ws = new WebSocket("ws://www.host.com/path");

const server = new WebSocket.Server({ port: 8080 }, () => {
    console.log("WebSocket server is listening on ws://localhost:8080");
});
class Position {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
let playerIdCount = 0;
const generatePlayerId = () => {
    const cnt = playerIdCount;
    playerIdCount += 1;
    return cnt;
};
class Player {
    color: string = "black";
    position: Position;
    id: number;
    constructor(color: string, position: Position) {
        this.id = generatePlayerId();
        this.color = color;
        this.position = position;
    }
}
class gameState {
    players: Player[];
    constructor() {
        this.players = [];
    }
}

interface message {
    type: string;
    body: string;
}
class playerUpdateMessage implements message {
    type = "playerupdate";
    body = "";
    constructor(body: Player) {
        this.body = JSON.stringify(body);
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
    console.log("trying to send message to client from server...");
    socket.send("testing. this is a new connection");
    for (let player of socketMappings.values()) {
        //iterate through each player and send an update containing that player's position
        let msg = new playerUpdateMessage(player);
        socket.send(JSON.stringify(msg));
    }

    socket.on("message", (message) => {
        console.log("Received:", message);
        // Echo the message back
        socket.send(`Echo: ${message}`);
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
