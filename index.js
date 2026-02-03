const express = require("express");
const fs = require("fs");

const app = express();

// ===== ARCHIVOS =====
const WINS_FILE = "./wins.json";
const GOALS_FILE = "./goals.json";
const ASSISTS_FILE = "./assists.json";
const QUEUE_FILE = "./queue.json";

// ===== RUTA RAÍZ =====
app.get("/", (req, res) => {
  res.send("API Twitch Ranking OK");
});

// =====================
// 🏆 WINS
// =====================

app.get("/win", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  const data = fs.existsSync(WINS_FILE)
    ? JSON.parse(fs.readFileSync(WINS_FILE))
    : {};

  data[user] = (data[user] || 0) + 1;
  fs.writeFileSync(WINS_FILE, JSON.stringify(data, null, 2));

  res.send(`🏆 ${user} suma 1 win`);
});

app.get("/addwin", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  const data = fs.existsSync(WINS_FILE)
    ? JSON.parse(fs.readFileSync(WINS_FILE))
    : {};

  data[user] = (data[user] || 0) + 1;
  fs.writeFileSync(WINS_FILE, JSON.stringify(data, null, 2));

  res.send(`➕ ${user} +1 win`);
});

app.get("/removewin", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  const data = fs.existsSync(WINS_FILE)
    ? JSON.parse(fs.readFileSync(WINS_FILE))
    : {};

  if (!data[user] || data[user] <= 0)
    return res.send(`${user} no tiene wins`);

  data[user]--;
  fs.writeFileSync(WINS_FILE, JSON.stringify(data, null, 2));

  res.send(`➖ ${user} -1 win`);
});

// =====================
// ⚽ GOLES
// =====================

app.get("/goal", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  const data = fs.existsSync(GOALS_FILE)
    ? JSON.parse(fs.readFileSync(GOALS_FILE))
    : {};

  data[user] = (data[user] || 0) + 1;
  fs.writeFileSync(GOALS_FILE, JSON.stringify(data, null, 2));

  res.send(`⚽ Gol para ${user}`);
});

// =====================
// 🅰️ ASISTENCIAS
// =====================

app.get("/assist", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  const data = fs.existsSync(ASSISTS_FILE)
    ? JSON.parse(fs.readFileSync(ASSISTS_FILE))
    : {};

  data[user] = (data[user] || 0) + 1;
  fs.writeFileSync(ASSISTS_FILE, JSON.stringify(data, null, 2));

  res.send(`🅰️ Asistencia para ${user}`);
});

// =====================
// 🧮 RANKING PÚBLICO (SIN PUNTOS)
// =====================

app.get("/ranking", (req, res) => {
  const wins = fs.existsSync(WINS_FILE)
    ? JSON.parse(fs.readFileSync(WINS_FILE))
    : {};
  const goals = fs.existsSync(GOALS_FILE)
    ? JSON.parse(fs.readFileSync(GOALS_FILE))
    : {};
  const assists = fs.existsSync(ASSISTS_FILE)
    ? JSON.parse(fs.readFileSync(ASSISTS_FILE))
    : {};

  const users = new Set([
    ...Object.keys(wins),
    ...Object.keys(goals),
    ...Object.keys(assists),
  ]);

  const ranking = [...users]
    .map(user => {
      const w = wins[user] || 0;
      const g = goals[user] || 0;
      const a = assists[user] || 0;
      const points = w * 1 + g * 0 + a;

      return { user, w, g, a, points };
    })
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)
    .map(
      (u, i) =>
        `${i + 1}. ${u.user} — 🏆 ${u.w} ⚽ ${u.g} 🅰️ ${u.a}`
    )
    .join(" | ");

  res.send(ranking || "Sin ranking");
});

// =====================
// 🔒 RANKING ADMIN (CON PUNTOS)
// =====================

app.get("/ranking-admin", (req, res) => {
  const wins = fs.existsSync(WINS_FILE)
    ? JSON.parse(fs.readFileSync(WINS_FILE))
    : {};
  const goals = fs.existsSync(GOALS_FILE)
    ? JSON.parse(fs.readFileSync(GOALS_FILE))
    : {};
  const assists = fs.existsSync(ASSISTS_FILE)
    ? JSON.parse(fs.readFileSync(ASSISTS_FILE))
    : {};

  const users = new Set([
    ...Object.keys(wins),
    ...Object.keys(goals),
    ...Object.keys(assists),
  ]);

  const ranking = [...users]
    .map(user => {
      const w = wins[user] || 0;
      const g = goals[user] || 0;
      const a = assists[user] || 0;
      const points = w * 1 + g * 0 + a;

      return { user, w, g, a, points };
    })
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)
    .map(
      (u, i) =>
        `${i + 1}. ${u.user} — 🏆 ${u.w} ⚽ ${u.g} 🅰️ ${u.a} → ${u.points} pts`
    )
    .join(" | ");

  res.send(ranking || "Sin ranking");
});

// =====================
// 🎮 COLA
// =====================

app.get("/play", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  const queue = fs.existsSync(QUEUE_FILE)
    ? JSON.parse(fs.readFileSync(QUEUE_FILE))
    : [];

  if (queue.includes(user))
    return res.send(`${user} ya está en cola`);

  queue.push(user);
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

  res.send(`🎮 ${user} entra a la cola`);
});

app.get("/queue", (req, res) => {
  const queue = fs.existsSync(QUEUE_FILE)
    ? JSON.parse(fs.readFileSync(QUEUE_FILE))
    : [];

  res.send(queue.length ? `🎮 Cola: ${queue.join(", ")}` : "Cola vacía");
});

app.get("/next", (req, res) => {
  const queue = fs.existsSync(QUEUE_FILE)
    ? JSON.parse(fs.readFileSync(QUEUE_FILE))
    : [];

  const next = queue.shift();
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

  res.send(next ? `➡️ Entra ${next}` : "Cola vacía");
});

// =====================
// 🔄 RESETS
// =====================

app.get("/reset-ranking", (req, res) => {
  fs.writeFileSync(WINS_FILE, JSON.stringify({}, null, 2));
  fs.writeFileSync(GOALS_FILE, JSON.stringify({}, null, 2));
  fs.writeFileSync(ASSISTS_FILE, JSON.stringify({}, null, 2));
  res.send("🔄 Ranking total reseteado");
});

app.get("/reset-queue", (req, res) => {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify([], null, 2));
  res.send("♻️ Cola reseteada");
});

// =====================
// 🚀 SERVER
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("API corriendo en puerto", PORT);
});
