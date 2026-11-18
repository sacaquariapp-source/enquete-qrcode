let chart = null;

function montarPizza(dados) {
  const labels = dados.opcoes.map((o) => o.rotulo);
  const valores = dados.opcoes.map((o) => o.votos);
  const cores = dados.opcoes.map((o) => o.cor);

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = valores;
    chart.data.datasets[0].backgroundColor = cores;
    chart.update();
    return;
  }

  chart = new Chart(document.getElementById("pizza"), {
    type: "pie",
    data: {
      labels,
      datasets: [{ data: valores, backgroundColor: cores, borderColor: "#fff", borderWidth: 3 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const pct = ctx.dataset.data.reduce((a, b) => a + b, 0)
                ? Math.round((ctx.parsed / ctx.dataset.data.reduce((a, b) => a + b, 0)) * 100)
                : 0;
              return ` ${ctx.label}: ${ctx.parsed} voto(s) (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function montarLegenda(dados) {
  const ul = document.getElementById("legenda");
  ul.innerHTML = "";
  dados.opcoes.forEach((op) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="ponto" style="background:${op.cor}"></span>
      <span class="txt">${op.rotulo}</span>
      <span class="num">${op.votos} · ${op.percentual}%</span>`;
    ul.appendChild(li);
  });
}

function atualizar(dados) {
  document.getElementById("pergunta").textContent = dados.pergunta;
  document.getElementById("total").textContent = dados.total;
  montarPizza(dados);
  montarLegenda(dados);
}

async function carregar() {
  const res = await fetch("/api/resultados");
  atualizar(await res.json());
}

function gerarQR() {
  const url = window.location.origin + "/";
  document.getElementById("qrUrl").textContent = url;
  new QRCode(document.getElementById("qrcode"), {
    text: url,
    width: 180,
    height: 180,
    colorDark: "#0f172a",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M,
  });
}

document.getElementById("btnZerar").addEventListener("click", async () => {
  if (!confirm("Zerar todos os votos?")) return;
  await fetch("/api/zerar", { method: "POST" });
});

carregar();
gerarQR();

const socket = io();
socket.on("resultados", atualizar);
