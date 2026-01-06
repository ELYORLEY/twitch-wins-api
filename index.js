const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = "./data.json";

app.get("/", (req, res) => {
  res.send("API Twitch Wins OK");
});

app.get("/win", (req, res) => {
  const user = req.query.user?.toLowerCase();
  if (!user) return res.send("Usuario inválido");

  let data = {};
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  }

  data[user] = (data[user] || 0) + 1;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.send(`${user} suma una victoria 🏆 (${data[user]})`);
});

app.get("/ranking", (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.send("Sin datos");

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const ranking = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .map(([u, v], i) => `${i + 1}. ${u}: ${v}`)
    .join(" | ");

  res.send(ranking || "Sin ranking");
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
