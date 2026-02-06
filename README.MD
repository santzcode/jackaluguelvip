# 🚗 VIP Car Rental

Sistema de **aluguel de veículos VIP** para FiveM, com interface **NUI estilo tablet**, integração com o mundo (blip + zona de interação) e controle completo via client/server.

---

## 📌 Funcionalidades

- 📱 Interface NUI moderna (tablet)
- 🚘 Veículos VIP em exibição no mapa
- 📍 Blip + zona de interação
- 🧾 Catálogo de veículos com pesquisa
- 🕒 Aluguel com período fixo (30 dias)
- 🎮 Test-drive
- 🔐 Verificação de jogador logado
- 🧠 Comunicação Client ↔ Server via Events
- 🐞 Sistema de debug para desenvolvimento

---

## 🧰 Tecnologias Utilizadas

### 🔹 FiveM
- **Lua** (client.lua / server.lua)
- **NUI** integrada ao jogo
- **SetNuiFocus / SendNUIMessage**

### 🔹 Front-end (NUI)
- **HTML5**
- **CSS3**
- **JavaScript (Vanilla JS)**

### 🔹 Integrações
- Blips no mapa
- Zona de interação (target / distância)
- Comunicação por `RegisterNetEvent`

---

## 📂 Estrutura do Resource

vip_car_rental/
│
├── client/
│ └── client.lua
│
├── server/
│ └── server.lua
│
├── nui/
│ ├── index.html
│ ├── style.css
│ └── script.js
│
├── fxmanifest.lua
└── README.md

yaml
Copiar código

---

## ▶️ Como Usar

1. Coloque o resource na pasta `resources`
2. Adicione no `server.cfg`:
ensure vip_car_rental

yaml
Copiar código
3. Entre no servidor
4. Vá até o **blip da Concessionária VIP**
5. Interaja para abrir o tablet

---

## 🧪 Comandos de Debug (opcional)

- Testar abertura da NUI
- Verificar comunicação Client ↔ NUI
- Logs detalhados no F8

---

## ⚠️ Observações

- A NUI **abre primeiro**, os dados são carregados depois via servidor
- O sistema evita travar o menu caso o servidor não responda
- Estrutura preparada para futuras integrações com banco de dados

---

## 📄 Licença

Uso livre para estudos e projetos pessoais.  
Não revenda este script sem autorização.

---