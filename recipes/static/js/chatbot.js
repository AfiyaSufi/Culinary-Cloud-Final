document.addEventListener("DOMContentLoaded", () => {
  const messagesDiv = document.getElementById("messages");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message
    const userPrompt = document.createElement("div");
    userPrompt.className = "user-prompt";
    userPrompt.innerHTML = `
      <p>${message}</p>
      <img src="${USER_PROFILE_IMAGE}" alt="User" />
    `;
    messagesDiv.appendChild(userPrompt);
    userInput.value = "";

    // Fetch AI response
    fetch(CHATBOT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ message }),
    })
      .then((response) => response.json())
      .then((data) => {
        const aiPrompt = document.createElement("div");
        aiPrompt.className = "ai-prompt";
        aiPrompt.innerHTML = `
          <img src="${AI_IMAGE_URL}" alt="AI" />
          <p>${data.response}</p>
        `;
        messagesDiv.appendChild(aiPrompt);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      })
      .catch((error) => {
        console.error("Error:", error);
        const aiPrompt = document.createElement("div");
        aiPrompt.className = "ai-prompt";
        aiPrompt.innerHTML = `
          <img src="${AI_IMAGE_URL}" alt="AI" />
          <p>Sorry, something went wrong. Please try again.</p>
        `;
        messagesDiv.appendChild(aiPrompt);
      });
  }

  // Get CSRF token
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
});