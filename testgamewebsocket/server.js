const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

// Handle all routes with index.html
const indexPath = path.join(__dirname, "public/index.html");
app.get(/^\/(game|players)$/, (req, res) => {
  res.sendFile(indexPath);
});

let players = new Map();

wss.on("connection", (ws) => {
  const playerId = Math.floor(Math.random() * 10000);
  players.set(playerId, { x: 0, y: 0 });

  ws.send(JSON.stringify({ type: "init", playerId }));

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "move") {
        if (players.has(playerId)) {
          players.get(playerId).x = data.x;
          players.get(playerId).y = data.y;
        }

        const snapshot = Array.from(players.entries()).map(([id, pos]) => ({
          id,
          x: pos.x,
          y: pos.y,
        }));

        const update = JSON.stringify({ type: "update", players: snapshot });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(update);
          }
        });
      }
    } catch (e) {
      console.error("Invalid message", e);
    }
  });

  ws.on("close", () => {
    players.delete(playerId);

    const update = JSON.stringify({ type: "remove", playerId });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(update);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
