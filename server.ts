import WebSocket from "ws";
import http from "http";
import fs from "fs";
import path from "path";
//const ws = new WebSocket("ws://www.host.com/path");
const server = new WebSocket.Server({ port: 8080 }, () => {
    console.log("WebSocket server is listening on ws://localhost:8080");
});

server.on("error", console.error);

server.on("connection", (socket) => {
    console.log("New client connected");

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
