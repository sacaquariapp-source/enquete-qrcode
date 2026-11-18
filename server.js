const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const CONFIG = require("./public/config.json");
const DATA_FILE = path.join(__dirname, "data", "votes.json");

let votes = {};
CONFIG.opcoes.forEach((op) => (votes[op.id] = 0));

if (fs.existsSync(DATA_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    Object.keys(saved).forEach((k) => {
      if (k in votes) votes[k] = saved[k];
    });
  } catch (e) {
    console.error("Erro ao ler votes.json, iniciando zerado:", e.message);
  }
}

function saveVotes() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(votes));
}

function total() {
  return Object.values(votes).reduce((a, b) => a + b, 0);
}

function payload() {
  const t = total();
  return {
    pergunta: CONFIG.pergunta,
    opcoes: CONFIG.opcoes.map((op) => ({
      id: op.id,
      rotulo: op.rotulo,
      cor: op.cor,
      votos: votes[op.id] || 0,
      percentual: t === 0 ? 0 : Math.round(((votes[op.id] || 0) / t) * 1000) / 10,
    })),
    total: t,
  };
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/resultados", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "resultados.html"));
});

app.get("/api/resultados", (req, res) => res.json(payload()));

app.post("/api/votar", (req, res) => {
  const { opcao } = req.body || {};
  if (!opcao || !(opcao in votes)) {
    return res.status(400).json({ erro: "Opção inválida" });
  }
  votes[opcao] += 1;
  saveVotes();
  io.emit("resultados", payload());
  res.json({ ok: true, ...payload() });
});

app.post("/api/zerar", (req, res) => {
  CONFIG.opcoes.forEach((op) => (votes[op.id] = 0));
  saveVotes();
  io.emit("resultados", payload());
  res.json({ ok: true, ...payload() });
});

io.on("connection", (socket) => {
  socket.emit("resultados", payload());
});

server.listen(PORT, () => {
  console.log(`Enquete rodando em http://localhost:${PORT}`);
  console.log(`Votação:  http://localhost:${PORT}/`);
  console.log(`Resultados (projetar): http://localhost:${PORT}/resultados`);
});
