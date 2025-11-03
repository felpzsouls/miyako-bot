# 💖 Guia de Contribuição — Miyako Bot

Obrigado por se interessar em contribuir com a **Miyako**! 🌸  
Este guia explica como você pode colaborar de forma organizada e produtiva.

---

## 🧭 Como começar

1. **Faça um fork** do repositório  
   Clique no botão `Fork` no canto superior direito do GitHub e crie sua cópia do projeto.

2. **Clone o fork localmente**
   ```bash
   git clone https://github.com/seu-usuario/miyako-bot.git
   cd miyako-bot
    ```
3. **Instale as dependencias**
    ```bash
    npm install
    ```
4. **Configure as variáveis de ambiente**  
   Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais.
   ```bash
    cp .env.example .env
   ```
5. **Rode o bot localmente**
   ```bash
   node .
   ```
---

## 🛠️ Como contribuir
1. **Crie uma branch para sua feature**
   ```bash
   git checkout -b minha-feature
   ```

2. **Faça suas alterações e commit**
   ```bash
   git add .
   git commit -m "Adiciona minha feature"
   ```

3. **Envie sua branch para o fork**
   ```bash
   git push origin minha-feature
   ```

4. **Crie um Pull Request**
   Vá até o seu fork no GitHub e clique em "Compare & pull request".

---

## 🧩 Boas práticas
- Use nomes claros para variáveis, funções e arquivos.
- Mantenha a identação e o estilo de código já usado no projeto.
- Não suba o arquivo .env nem dados sensíveis.
- Sempre teste suas mudanças antes de abrir o PR.
- Evite commits grandes — divida em partes menores se possível.

---

## 🧑‍💻 Sugestões de contribuição
- Melhorias no dashboard (`Pug, rotas, front-end`)
- Novos comandos de bot (em `src/bot/cmds/`)
- Novos eventos Discord (em `src/bot/events/`)
- Correções de bugs e melhorias de performance
- Ajustes de documentação ou exemplos

---

## 💬 Dúvidas ou ideias?

Abra uma Issue no GitHub explicando seu problema, sugestão ou dúvida.
Toda ajuda é bem-vinda! 💪

---

Feito com 💙 por Felpzsouls