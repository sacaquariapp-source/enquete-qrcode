const form = document.getElementById("form");
const opcoesEl = document.getElementById("opcoes");
const confirmacao = document.getElementById("confirmacao");
const btnOutro = document.getElementById("btnOutro");
const btnVotar = document.getElementById("btnVotar");

let config = null;
const CHAVE = "voto_enquete";

async function init() {
  const res = await fetch("/config.json");
  config = await res.json();
  document.getElementById("pergunta").textContent = config.pergunta;
  document.title = config.pergunta;

  config.opcoes.forEach((op, i) => {
    const label = document.createElement("label");
    label.className = "opcao";
    label.innerHTML = `
      <input type="radio" name="opcao" value="${op.id}" required />
      <span class="letra" style="background:${op.cor}">${String.fromCharCode(65 + i)}</span>
      <span class="rotulo">${op.rotulo}</span>`;
    opcoesEl.appendChild(label);
  });

  if (localStorage.getItem(CHAVE)) {
    mostrarConfirmacao();
  }
}

function mostrarConfirmacao() {
  form.classList.add("hidden");
  confirmacao.classList.remove("hidden");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const escolhido = new FormData(form).get("opcao");
  if (!escolhido) return;

  btnVotar.disabled = true;
  btnVotar.textContent = "Enviando...";
  try {
    const res = await fetch("/api/votar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opcao: escolhido }),
    });
    if (!res.ok) throw new Error("Falha no voto");
    localStorage.setItem(CHAVE, escolhido);
    mostrarConfirmacao();
  } catch (err) {
    alert("Não foi possível registrar seu voto. Tente novamente.");
  } finally {
    btnVotar.disabled = false;
    btnVotar.textContent = "Votar";
  }
});

btnOutro.addEventListener("click", () => {
  localStorage.removeItem(CHAVE);
  form.reset();
  confirmacao.classList.add("hidden");
  form.classList.remove("hidden");
});

init();
