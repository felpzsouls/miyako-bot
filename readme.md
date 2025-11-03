# 🌸 Miyako Bot

Um bot multifuncional para Discord, desenvolvido por **Felpzsouls** com Node.js e Discord.js.  
Possui dashboard web, comandos de moderação, economia, e integração com Top.gg.

---

## 🚀 Tecnologias
- [Node.js](https://nodejs.org/)
- [Discord.js](https://discord.js.org/)
- [Express](https://expressjs.com/)
- [Pug](https://pugjs.org/)
- [MongoDB](https://www.mongodb.com/)

---

## 📦 Estrutura do projeto
```
src/
├── bot/
│ ├── cmds/ # Comandos do bot
│ ├── events/ # Eventos Discord
│ └── handlers/ # Carregamento dinâmico
├── site/
│ ├── routes/ # Rotas do dashboard
│ ├── handlers/ # Middlewares
│ ├── functions/ # Funções auxiliares
│ └── views (.pug) # Páginas do painel
├── app.js # Inicialização do painel
└── index.js # Inicialização do bot
```

---

## 🧰 Como rodar o projeto localmente
```bash
git clone https://github.com/felpzsouls/miyako-bot
cd miyako-bot
npm install
cp .env.example .env
# Edite o .env com suas variáveis
node .
```

---

## 🧑‍💻 Contribuindo

Pull requests são bem-vindos!
Crie uma nova branch com sua feature e envie um PR.

1. Faça um fork do repositório

2. Crie uma branch (`git checkout -b minha-feature`)

3. Faça suas alterações

4. Envie um pull request 😄

## 📄 Licença
Distribuído sob a licença MIT.
Veja [LICENSE](/license) para mais informações.

---