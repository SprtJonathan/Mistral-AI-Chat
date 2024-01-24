document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("chatForm");
  const questionTextarea = document.getElementById("question");
  const chatContainer = document.getElementById("chatContainer");
  let history = [];

  form.onsubmit = function (event) {
    event.preventDefault();
    const userMessage = questionTextarea.value.trim();
    if (userMessage) {
      displayMessage("Vous", userMessage);
      askMistral(userMessage);
      questionTextarea.value = "";
    }
  };

  async function askMistral(question) {
    try {
      // Construit le message system en fonction de l'historique
      let systemMessageContent = "Tu es un assistant bot parlant en français.";
      if (history.length > 0) {
        const historyString = history
          .map((h) => `Utilisateur : ${h.user}\nBot : ${h.bot}`)
          .join("\n");
        systemMessageContent += ` Voilà l'historique de la conversation : [HISTORY] ${historyString} [/HISTORY]`;
      }

      const response = await fetch(`${API_URL}/askMistral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          systemMessage: { role: "system", content: systemMessageContent },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let answer = data.answer;

      displayMessage("Chatbot Mistral", answer);
      history.push({ user: question, bot: answer }); // Mise à jour de l'historique
    } catch (error) {
      console.error("Erreur lors de la demande à Mistral:", error);
      displayMessage(
        "Erreur",
        "Erreur lors de la communication avec le serveur."
      );
    }
  }

  function displayMessage(sender, message) {
    // Remplace les retours à la ligne par des balises <br> pour l'affichage HTML
    const formattedMessage = message.replace(/\n/g, "<br>");

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    if (sender === "Vous") {
      messageDiv.classList.add("user-message");
    } else {
      messageDiv.classList.add("bot-message");
    }
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${sanitizeHtml(
      formattedMessage
    )}`;
    chatContainer.appendChild(messageDiv);
    // Assure-toi que le chatContainer défile vers le bas pour le dernier message
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function sanitizeHtml(str) {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML.replace(/&lt;br&gt;/g, "<br>");
  }
});
