const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = "./data.json";

// Ruta raíz (para probar)
app.get("/", (req, res) => {
  res.send("API Twitch Wins OK");
});

// Sumar victoria
app.get("/win", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  let data = {};
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  }

  data[user] = (data[user] || 0) + 1;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.send(`🏆 ${user} ahora tiene ${data[user]} victorias`);
});

// Ver victorias de un usuario ✅
app.get("/wins", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  let data = {};
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  }

  res.send(`🏆 ${user} tiene ${data[user] || 0} victorias`);
});

// Ranking
app.get("/ranking", (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.send("Sin datos");

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const ranking = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([u, v], i) => `${i + 1}. ${u} - ${v}`)
    .join(" | ");

  res.send(ranking || "Sin ranking");
});

// 🔄 RESET TOTAL
app.get("/reset", (req, res) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
  res.send("🔄 Ranking y victorias reseteadas");
});

app.listen(PORT, () => {
  console.log("API corriendo en puerto", PORT);
});
