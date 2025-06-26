document.title = "Game";

const app = document.getElementById("app");
app.innerHTML = `
  <h3>Simple Multiplayer Game</h3>
  <div id="game" style="width:600px;height:400px;border:1px solid black;position:relative;background:#eef;"></div>
`;

const game = document.getElementById("game");
const players = new Map();
let playerId = null;
let pos = { x: 100, y: 100 };

const ws = new WebSocket(`ws://${location.host}`);

ws.addEventListener("open", () => sendPosition());

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "init") {
    playerId = data.playerId;
  } else if (data.type === "update") {
    data.players.forEach((p) => {
      players.set(p.id, { x: p.x, y: p.y });
    });
    renderPlayers();
  } else if (data.type === "remove") {
    players.delete(data.playerId);
    renderPlayers();
  }
});

function renderPlayers() {
  game.innerHTML = "";
  players.forEach((p, id) => {
    const el = document.createElement("div");
    el.className = "player";
    el.style = `
      position:absolute;
      width:20px;height:20px;
      left:${p.x}px;top:${p.y}px;
      background:${id === playerId ? "green" : "red"};
      color:white;font-size:12px;text-align:center;
      line-height:20px;border-radius:50%;
    `;
    el.textContent = id;
    game.appendChild(el);
  });
}

function sendPosition() {
  if (ws.readyState === WebSocket.OPEN && playerId !== null) {
    ws.send(JSON.stringify({ type: "move", x: pos.x, y: pos.y }));
  }
}

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      pos.y = Math.max(0, pos.y - 5);
      break;
    case "ArrowDown":
      pos.y = Math.min(380, pos.y + 5);
      break;
    case "ArrowLeft":
      pos.x = Math.max(0, pos.x - 5);
      break;
    case "ArrowRight":
      pos.x = Math.min(580, pos.x + 5);
      break;
    default:
      return;
  }
  sendPosition();
  renderPlayers();
});
