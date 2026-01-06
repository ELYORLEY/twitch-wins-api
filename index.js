const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const DATA_FILE = "data.json";

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 🏆 SUMAR VICTORIA
app.get("/win", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Falta user");

  const data = readData();
  data[user] = (data[user] || 0) + 1;
  saveData(data);

  res.send(`🏆 ${user} ahora tiene ${data[user]} victorias`);
});

// 📊 VER VICTORIAS
app.get("/wins", (req, res) => {
  const user = req.query.user?.toLowerCase();
  const data = readData();

  res.send(`${user} tiene ${data[user] || 0} victorias`);
});

// 🥇 RANKING
app.get("/ranking", (req, res) => {
  const data = readData();

  const ranking = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map((u, i) => `${i + 1}. ${u[0]} - ${u[1]}`)
    .join(" | ");

  res.sen(`🏆 Ranking: ${ranking}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API activa"));
