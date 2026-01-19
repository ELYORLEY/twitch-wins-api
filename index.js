const express = require("express");
const fs = require("fs");

const app = express();

// ===== ARCHIVOS =====
const DATA_FILE = "./data.json";
const QUEUE_FILE = "./queue.json";

// ===== RUTA RAÍZ =====
app.get("/", (req, res) => {
  res.send("API Twitch OK");
});

// ===== SUMAR WIN (NORMAL) =====
app.get("/win", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  let data = {};
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  }

  data[user] = (data[user] || 0) + 1;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.send(`🏆 ${user} ganó una win (total: ${data[user]})`);
});

// ===== SUMAR WIN (MODS) =====
app.get("/addwin", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  let data = {};
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  }

  data[user] = (data[user] || 0) + 1;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.send(`➕ ${user} suma 1 win (total: ${data[user]})`);
});

// ===== RESTAR WIN =====
app.get("/removewin", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  let data = {};
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  }

  if (!data[user] || data[user] <= 0) {
    return res.send(`${user} no tiene wins`);
  }

  data[user]--;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.send(`➖ ${user} ahora tiene ${data[user]} wins`);
});

// ===== VER WINS =====
app.get("/wins", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  let data = {};
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  }

  res.send(`🏆 ${user} tiene ${data[user] || 0} wins`);
});

// ===== RANKING WINS (TOP 30) =====
app.get("/ranking", (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.send("Sin datos");

  const data = JSON.parse(fs.readFileSync(DATA_FILE));

  const ranking = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([u, v], i) => `${i + 1}. ${u} (${v})`)
    .join(" | ");

  res.send(ranking || "Sin ranking");
});

// ===== RESET RANKING =====
app.get("/reset", (req, res) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
  res.send("🔄 Ranking reseteado");
});

// ===== ENTRAR A LA COLA =====
app.get("/play", (req, res) => {
  const user = req.query.user?.toLowerCase();
  const isSub = req.query.sub === "1";

  if (!user) return res.send("Usuario inválido");

  const queue = fs.existsSync(QUEUE_FILE)
    ? JSON.parse(fs.readFileSync(QUEUE_FILE))
    : { subs: [], viewers: [] };

  if (queue.subs.includes(user) || queue.viewers.includes(user)) {
    return res.send(`${user} ya está en la cola`);
  }

  if (isSub) {
    queue.subs.push(user);
    res.send(`🔴 ${user} entró a la cola SUBS`);
  } else {
    queue.viewers.push(user);
    res.send(`🔵 ${user} entró a la cola`);
  }

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
});

// ===== VER COLA =====
app.get("/queue", (req, res) => {
  if (!fs.existsSync(QUEUE_FILE)) {
    return res.send("La cola está vacía");
  }

  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE));
  const subs = queue.subs.join(", ") || "-";
  const viewers = queue.viewers.join(", ") || "-";

  res.send(`🎮 COLA | 🔴 Subs: ${subs} | 🔵 Viewers: ${viewers}`);
});

// ===== SIGUIENTE JUGADOR =====
app.get("/next", (req, res) => {
  if (!fs.existsSync(QUEUE_FILE)) {
    return res.send("La cola está vacía");
  }

  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE));
  let next = null;

  if (queue.subs.length > 0) {
    next = queue.subs.shift();
  } else if (queue.viewers.length > 0) {
    next = queue.viewers.shift();
  }

  if (!next) return res.send("No hay jugadores en cola");

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  res.send(`➡️ Entra ${next}`);
});

// ===== RESET COLA =====
app.get("/reset-queue", (req, res) => {
  fs.writeFileSync(
    QUEUE_FILE,
    JSON.stringify({ subs: [], viewers: [] }, null, 2)
  );
  res.send("♻️ Cola reseteada");
});

// ===== SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

