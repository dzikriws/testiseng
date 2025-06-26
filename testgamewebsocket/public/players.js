document.title = "Daftar Pemain Aktif";

const app = document.getElementById("app");
app.innerHTML = `
  <h3>Daftar Pemain Aktif (Realtime)</h3>
  <ul id="list"></ul>
`;

const list = document.getElementById("list");
const players = new Map();

const ws = new WebSocket(`ws://${location.host}`);

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "update") {
    data.players.forEach((p) => {
      players.set(p.id, { x: p.x, y: p.y });
    });
    renderList();
  } else if (data.type === "remove") {
    players.delete(data.playerId);
    renderList();
  }
});

function renderList() {
  list.innerHTML = "";
  players.forEach((p, id) => {
    const li = document.createElement("li");
    li.textContent = `Player ${id} - Posisi: (${p.x}, ${p.y})`;
    list.appendChild(li);
  });
}
