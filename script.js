/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Option to enable or disable context tracking
let contextTrackingEnabled = true;

// Option to enable or disable showing conversation history
let showHistoryEnabled = true;

// Store the full conversation history
let fullHistory = [
  {
    role: "system",
    content:
      "You are a helpful assistant for L'Oréal product and routine advice. Always remember details the user shares in this conversation (like their name, preferences, and past questions) and use them to give more helpful, personalized answers.",
  },
];

// The messages array sent to OpenAI (changes depending on contextTrackingEnabled)
let messages = [...fullHistory];

// Function to add a message to the chat window
function addMessage(text, sender) {
  // Create a new div for the message
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  // Scroll to the bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to clear all user and AI messages from the chat window
function clearChatMessages() {
  // Remove all .msg.user and .msg.ai elements
  const allMsgs = chatWindow.querySelectorAll(".msg.user, .msg.ai");
  allMsgs.forEach((msg) => chatWindow.removeChild(msg));
}

// Function to render the conversation in the chat window
function renderConversation() {
  clearChatMessages();
  if (showHistoryEnabled) {
    // Show all user and AI messages (skip system)
    let startIdx = 0;
    if (fullHistory.length > 0 && fullHistory[0].role === "system") {
      startIdx = 1;
    }
    for (let i = startIdx; i < fullHistory.length; i++) {
      const msg = fullHistory[i];
      addMessage(msg.content, msg.role === "assistant" ? "ai" : "user");
    }
  } else {
    // Show only the latest user and AI message (if any)
    let lastUser = null;
    let lastAI = null;
    for (let i = fullHistory.length - 1; i >= 0; i--) {
      if (!lastAI && fullHistory[i].role === "assistant") {
        lastAI = fullHistory[i];
      }
      if (!lastUser && fullHistory[i].role === "user") {
        lastUser = fullHistory[i];
      }
      if (lastUser && lastAI) break;
    }
    if (lastUser) addMessage(lastUser.content, "user");
    if (lastAI) addMessage(lastAI.content, "ai");
  }
}

// Function to call OpenAI API
async function getAIResponse() {
  // Show a loading message
  if (showHistoryEnabled) {
    // If showing history, render the conversation and add "Thinking..." at the end
    renderConversation();
    addMessage("Thinking...", "ai");
  } else {
    // If not showing history, just show the latest user message and "Thinking..."
    clearChatMessages();
    // Find the latest user message
    let lastUser = null;
    for (let i = fullHistory.length - 1; i >= 0; i--) {
      if (fullHistory[i].role === "user") {
        lastUser = fullHistory[i];
        break;
      }
    }
    if (lastUser) addMessage(lastUser.content, "user");
    addMessage("Thinking...", "ai");
  }

  // Prepare the API request
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const apiKey = OPENAI_API_KEY;

  // Always set messages based on contextTrackingEnabled before sending
  if (!contextTrackingEnabled) {
    // Only send system prompt and latest user message
    messages = [
      fullHistory[0], // system prompt
      fullHistory[fullHistory.length - 1], // latest user message
    ];
  } else {
    // Send the full conversation
    messages = [...fullHistory];
  }

  const requestBody = {
    model: "gpt-4o",
    messages: messages,
    max_tokens: 300,
  };

  try {
    // Send the request to OpenAI
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Parse the response
    const data = await response.json();

    // Remove the loading message
    const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMsg);
    }

    // Get the AI's reply
    const aiReply =
      data.choices && data.choices[0].message.content
        ? data.choices[0].message.content.trim()
        : "Sorry, I couldn't get a response. Please try again.";

    // Add AI reply to full history
    fullHistory.push({ role: "assistant", content: aiReply });

    // Render conversation based on showHistoryEnabled
    renderConversation();
  } catch (error) {
    const loadingMsg = chatWindow.querySelector(".msg.ai:last-child");
    if (loadingMsg && loadingMsg.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMsg);
    }
    addMessage("Sorry, there was a problem connecting to the AI.", "ai");
  }
}

// Function to check if the question is related to L'Oréal products or routines
function isRelatedQuestion(text) {
  // Convert text to lowercase for easier checking
  const lowerText = text.toLowerCase();
  // Expanded list of keywords to check for relevance
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
    "pimple",
    "pimples",
    "zit",
    "zits",
    "blemishes",
    "acne",
    "breakout",
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
  // Return true if any keyword is found in the user's message
  return keywords.some((keyword) => lowerText.includes(keyword));
}

// Handle form submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const userMsg = userInput.value.trim();
  if (!userMsg) return;

  clearChatMessages();

  addMessage(userMsg, "user");

  if (!isRelatedQuestion(userMsg)) {
    addMessage(
      "Sorry, I can only answer questions about L'Oréal products and routines. Please ask something related.",
      "ai"
    );
    userInput.value = "";
    return;
  }

  fullHistory.push({ role: "user", content: userMsg });

  userInput.value = "";

  getAIResponse();
});

// Context tracking toggle button
const toggleBtn = document.createElement("button");
toggleBtn.textContent = "Toggle Context Tracking";
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

// Show history toggle button
const historyBtn = document.createElement("button");
historyBtn.textContent = "Show Full Conversation";
historyBtn.className = "msg context-toggle";
historyBtn.style.margin = "10px 0 0 0";
historyBtn.onclick = function () {
  showHistoryEnabled = !showHistoryEnabled;
  historyBtn.textContent = showHistoryEnabled
    ? "Show Full Conversation: ON"
    : "Show Full Conversation: OFF";
  renderConversation();
};
// Insert below the context tracking button
toggleBtn.parentNode.insertBefore(historyBtn, toggleBtn.nextSibling);
