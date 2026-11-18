# Enquete com QR Code e gráfico de pizza

Apresentação corporativa: participantes escaneiam um QR code, votam em uma escolha única e o gráfico de pizza atualiza em tempo real na tela projetada.

## Rodar localmente

```bash
cd enquete-qrcode
npm install
npm start
```

- Votação (participante): http://localhost:3000/
- Resultados (projetar): http://localhost:3000/resultados

## Editar a pergunta

Edite `public/config.json`:

```json
{
  "pergunta": "Sua pergunta aqui?",
  "opcoes": [
    { "id": "a", "rotulo": "Opção 1", "cor": "#2563eb" },
    { "id": "b", "rotulo": "Opção 2", "cor": "#16a34a" }
  ]
}
```

Reinicie o servidor após editar.

## Telas

- **`/`** — participante vota (1 voto por dispositivo via localStorage).
- **`/resultados`** — gráfico de pizza em tempo real + QR code apontando para a tela de voto + botão **Zerar votos**.

## Deploy no Render

1. Crie um repositório no GitHub e envie o projeto:
   ```bash
   cd enquete-qrcode
   git init
   git add .
   git commit -m "Enquete QR Code"
   # crie o repo no GitHub e:
   git remote add origin https://github.com/SEU_USUARIO/enquete-qrcode.git
   git push -u origin main
   ```
2. No Render: **New → Web Service** → conecte o repositório.
3. Configure:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Clique **Create Web Service**. A Render gera uma URL pública (ex.: `https://enquete-qrcode.onrender.com`).
5. Abra `https://SUA_URL/resultados` na apresentação — o QR code já aponta para a URL correta.

### Avisos do plano grátis do Render
- A instância **dorme após ~15 min sem acesso** (acessando de novo, ela volta em ~1 min).
- Os votos ficam em `data/votes.json`; **são perdidos no redeploy/ reinício**. Para votações longas, faça login na tela de resultados antes do evento para mantê-la acordada.

## Estrutura

```
enquete-qrcode/
├── server.js          # Express + Socket.IO + votos em memória/arquivo
├── package.json
├── data/votes.json    # backup local dos votos
└── public/
    ├── index.html     # tela do participante
    ├── resultados.html# pizza + QR code
    ├── config.json    # pergunta e opções
    ├── app.js
    ├── resultados.js
    └── style.css
```
