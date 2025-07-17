// Get DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Show a welcome message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Store the conversation
let messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant for L'Oréal product and routine advice.",
  },
];

// Track context and history
let contextTrackingEnabled = true;
let showHistoryEnabled = true;

// Add a message to the chat window
function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Clear all messages from the chat window
function clearChatMessages() {
  while (chatWindow.firstChild) {
    chatWindow.removeChild(chatWindow.firstChild);
  }
}

// Render the conversation in the chat window
function renderConversation() {
  clearChatMessages();
  if (showHistoryEnabled) {
    // Show all user and AI messages (skip system)
    let startIdx = messages[0].role === "system" ? 1 : 0;
    for (let i = startIdx; i < messages.length; i++) {
      const msg = messages[i];
      addMessage(msg.content, msg.role === "assistant" ? "ai" : "user");
    }
  } else {
    // Show only the latest user and AI message
    let lastUser = null;
    let lastAI = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!lastAI && messages[i].role === "assistant") lastAI = messages[i];
      if (!lastUser && messages[i].role === "user") lastUser = messages[i];
      if (lastUser && lastAI) break;
    }
    if (lastUser) addMessage(lastUser.content, "user");
    if (lastAI) addMessage(lastAI.content, "ai");
  }
}

// Check if the question is related to L'Oréal products or routines
function isRelatedQuestion(text) {
  const lowerText = text.toLowerCase();
  const keywords = [
    "l'oréal",
    "loreal",
    "product",
    "routine",
    "skin",
    "hair",
    "makeup",
    "cosmetic",
    "serum",
    "moisturizer",
    "shampoo",
    "conditioner",
    "cream",
    "cleanser",
    "face",
    "beauty",
    "foundation",
    "lipstick",
    "mascara",
    "eyeliner",
    "blush",
    "concealer",
    "sunscreen",
    "spf",
    "toner",
    "exfoliate",
    "exfoliator",
    "scrub",
    "mask",
    "sheet mask",
    "hydration",
    "hydrating",
    "anti-aging",
    "antiage",
    "wrinkle",
    "acne",
    "blemish",
    "spot",
    "oil",
    "oily",
    "dry",
    "dryness",
    "moisture",
    "frizz",
    "frizzy",
    "curl",
    "curly",
    "straight",
    "color",
    "colour",
    "dye",
    "treatment",
    "repair",
    "renew",
    "regenerate",
    "peel",
    "eye cream",
    "eye serum",
    "night cream",
    "day cream",
    "lotion",
    "body",
    "body wash",
    "body lotion",
    "body cream",
    "body oil",
    "nail",
    "nails",
    "cuticle",
    "scalp",
    "scalp care",
    "hair loss",
    "hair fall",
    "volume",
    "volumizing",
    "shine",
    "glow",
    "brighten",
    "brightening",
    "clarify",
    "clarifying",
    "pore",
    "pores",
    "sunscreen",
    "blackhead",
    "whitehead",
    "sensitive",
    "sensitivity",
    "redness",
    "soothe",
    "soothing",
    "refresh",
    "refreshing",
    "clean",
    "cleansing",
    "wash",
    "rinsing",
    "application",
    "apply",
    "how to use",
    "instructions",
    "ingredients",
    "allergy",
    "allergic",
    "safe",
    "safety",
    "dermatologist",
    "tested",
    "recommend",
    "recommendation",
    "suggest",
    "suggestion",
    "tips",
    "advice",
    "care",
    "self-care",
    "personal care",
  ];
  return keywords.some((keyword) => lowerText.includes(keyword));
}

// Call the OpenAI API using async/await
async function getAIResponse() {
  // Show a loading message
  if (showHistoryEnabled) {
    renderConversation();
    addMessage("Thinking...", "ai");
  } else {
    clearChatMessages();
    let lastUser = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUser = messages[i];
        break;
      }
    }
    if (lastUser) addMessage(lastUser.content, "user");
    addMessage("Thinking...", "ai");
  }

  // Build the request body
  let apiMessages = contextTrackingEnabled
    ? [...messages]
    : [messages[0], messages[messages.length - 1]];

  const requestBody = {
    model: "gpt-4o",
    messages: apiMessages,
    max_tokens: 300,
  };

  // Use your Cloudflare Worker endpoint
  const apiUrl = "https://old-recipe-c21d.jhunt25.workers.dev/";
  //const apiKey = OPENAI_API_KEY; // Not needed for Worker

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Remove the loading message
    const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMsg);
    }

    // Get the AI reply safely
    let aiReply = "Sorry, I couldn't get a response. Please try again.";
    if (
      data.choices &&
      Array.isArray(data.choices) &&
      data.choices.length > 0 &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      aiReply = data.choices[0].message.content.trim();
    }

    // Show the AI reply in the chat window
    addMessage(aiReply, "ai");
    messages.push({ role: "assistant", content: aiReply });

    // Re-render if showing history
    if (showHistoryEnabled) renderConversation();
  } catch (error) {
    // Remove loading message if error
    const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMsg);
    }
    addMessage("Sorry, there was a problem connecting to the AI.", "ai");
  }
}

// Handle form submit
chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const userMsg = userInput.value.trim();
  if (!userMsg) return;

  addMessage(userMsg, "user");

  // Only call the API if the question is related
  if (!isRelatedQuestion(userMsg)) {
    addMessage(
      "Sorry, I can only answer questions about L'Oréal products and routines. Please ask something related.",
      "ai"
    );
    userInput.value = "";
    return;
  }

  messages.push({ role: "user", content: userMsg });
  userInput.value = "";
  getAIResponse();
});

// Add context tracking toggle button
const toggleBtn = document.createElement("button");
toggleBtn.textContent = "Context Tracking: ON";
toggleBtn.className = "msg context-toggle";
toggleBtn.style.margin = "10px 0 0 0";
toggleBtn.onclick = function () {
  contextTrackingEnabled = !contextTrackingEnabled;
  toggleBtn.textContent = contextTrackingEnabled
    ? "Context Tracking: ON"
    : "Context Tracking: OFF";
  renderConversation();
};
chatWindow.parentNode.insertBefore(toggleBtn, chatWindow);

// Add show history toggle button
const historyBtn = document.createElement("button");
historyBtn.textContent = "Show Full Conversation: ON";
historyBtn.className = "msg context-toggle";
historyBtn.style.margin = "10px 0 0 0";
historyBtn.onclick = function () {
  showHistoryEnabled = !showHistoryEnabled;
  historyBtn.textContent = showHistoryEnabled
    ? "Show Full Conversation: ON"
    : "Show Full Conversation: OFF";
  renderConversation();
};
toggleBtn.parentNode.insertBefore(historyBtn, toggleBtn.nextSibling);
