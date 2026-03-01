# 🚗 VIP Car Rental

Sistema de **aluguel de veículos VIP** para FiveM, com interface **NUI estilo tablet**, integração completa com o mapa (blip + zona de interação) e controle estruturado via **client/server**.

> 🔒 Este projeto recebeu um pull request com melhorias significativas de segurança, remoção de possíveis backdoors e otimizações gerais de desempenho, mantendo a base original do desenvolvedor.

---

## 👨‍💻 Créditos

Desenvolvedor original:  
👉 Diego Ximenes  
🔗 https://github.com/DiegoXimenes99/jackaluguelvip  

Este projeto mantém os créditos ao autor original.  

Pull request aplicado com as seguintes melhorias:

- 🔐 Reforço na segurança do código
- 🛡️ Remoção de possíveis backdoors e trechos inseguros
- ⚡ Otimização de performance (client/server)
- 🧹 Refatoração e organização estrutural
- 📦 Melhor tratamento de eventos e validações

---

## 📌 Funcionalidades

- 📱 Interface NUI moderna (estilo tablet)
- 🚘 Veículos VIP exibidos no mapa
- 📍 Blip + zona de interação
- 🧾 Catálogo de veículos com sistema de pesquisa
- 🕒 Aluguel com período fixo (30 dias)
- 🎮 Sistema de test-drive
- 🔐 Verificação de jogador autenticado
- 🧠 Comunicação Client ↔ Server via Events
- 🐞 Sistema de debug para desenvolvimento

---

## 🧰 Tecnologias Utilizadas

### 🔹 FiveM
- **Lua** (client.lua / server.lua)
- **NUI integrada**
- **SetNuiFocus / SendNUIMessage**

### 🔹 Front-end (NUI)
- **HTML5**
- **CSS3**
- **JavaScript (Vanilla JS)**

### 🔹 Integrações
- Blips no mapa
- Zona de interação (target / distância)
- Comunicação via `RegisterNetEvent`

---

## 📂 Estrutura do Resource

```
vip_car_rental/
│
├── client/
│   └── client.lua
│
├── server/
│   └── server.lua
│
├── nui/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── fxmanifest.lua
└── README.md
```

---

## ▶️ Como Usar

1. Coloque o resource na pasta `resources`
2. Adicione no `server.cfg`:

```
ensure vip_car_rental
```

3. Inicie o servidor
4. Vá até o **blip da Concessionária VIP**
5. Interaja para abrir o tablet

---

## 🧪 Comandos de Debug (Opcional)

- Teste manual de abertura da NUI
- Verificação da comunicação Client ↔ NUI
- Logs detalhados via console (F8)

---

## ⚠️ Observações Técnicas

- A NUI é aberta antes do carregamento dos dados para evitar travamentos
- O sistema possui fallback caso o servidor não responda
- Estrutura preparada para futuras integrações com banco de dados
- Código revisado com foco em segurança e estabilidade

---

## 📄 Licença

Uso permitido para estudos e projetos pessoais.  
É proibida a revenda ou redistribuição sem autorização do autor original.
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
