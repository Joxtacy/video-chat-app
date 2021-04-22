import path from "path";
import express, { Application } from "express";
import { Server as SocketIoServer, Socket } from "socket.io";
import { createServer, Server as HttpServer } from "http";

export class Server {
    private httpServer: HttpServer;
    private app: Application;
    private ioServer: SocketIoServer;
    private activeSockets: Map<string, Socket>;

    private readonly PORT = Number(process.env.PORT) || 3000;

    constructor() {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.ioServer = new SocketIoServer(this.httpServer);
        this.activeSockets = new Map<string, Socket>();

        this.configureApp();
        this.handleRoutes();
        this.handleSocketConnection();
    }

    private handleRoutes() {
        this.app.get("/", (req, res) => {
            res.sendFile("index.html");
        });
    }

    private handleSocketConnection() {
        this.ioServer.on("connection", (socket) => {
            console.info("Socket connected", socket.id);

            socket.on("message", (message) => {
                socket.broadcast.emit("message", message);
            });

            socket.on("disconnect", () => {
                if (this.activeSockets.has(socket.id)) {
                    this.activeSockets.delete(socket.id);
                    console.info("Socket disconnected", socket.id);
                }
            });

            if (!this.activeSockets.has(socket.id)) {
                this.activeSockets.set(socket.id, socket);
            }
        });
    }

    private configureApp() {
        this.app.use(express.static(path.join(__dirname, "../public")));
    }

    public listen(callback: (port: number) => void) {
        this.httpServer.listen(this.PORT, () => callback(this.PORT));
    }
}
