/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Store the conversation as an array of messages
let messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant for L'Oréal product and routine advice.",
  },
];

// Add context tracking and show history options
let contextTrackingEnabled = true;
let showHistoryEnabled = true;

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
  while (chatWindow.firstChild) {
    chatWindow.removeChild(chatWindow.firstChild);
  }
}

// Function to render the conversation in the chat window
function renderConversation() {
  clearChatMessages();
  if (showHistoryEnabled) {
    // Show all user and AI messages (skip system)
    let startIdx = 0;
    if (messages.length > 0 && messages[0].role === "system") {
      startIdx = 1;
    }
    for (let i = startIdx; i < messages.length; i++) {
      const msg = messages[i];
      addMessage(msg.content, msg.role === "assistant" ? "ai" : "user");
    }
  } else {
    // Show only the latest user and AI message (if any)
    let lastUser = null;
    let lastAI = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (!lastAI && messages[i].role === "assistant") {
        lastAI = messages[i];
      }
      if (!lastUser && messages[i].role === "user") {
        lastUser = messages[i];
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

  // Prepare the API request
  // Use your Cloudflare Worker endpoint if deployed, otherwise OpenAI API
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const apiKey = OPENAI_API_KEY;

  // Build the request body
  let apiMessages;
  if (!contextTrackingEnabled) {
    // Only send system prompt and latest user message
    apiMessages = [
      messages[0], // system prompt
      messages[messages.length - 1], // latest user message
    ];
  } else {
    // Send the full conversation for context
    apiMessages = [...messages];
  }

  const requestBody = {
    model: "gpt-4o",
    messages: apiMessages,
    max_tokens: 300,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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

    const aiReply =
      data.choices && data.choices[0].message.content
        ? data.choices[0].message.content.trim()
        : "Sorry, I couldn't get a response. Please try again.";

    addMessage(aiReply, "ai");
    messages.push({ role: "assistant", content: aiReply });

    // Re-render if showing history
    if (showHistoryEnabled) renderConversation();
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

  // Get the user's message
  const userMsg = userInput.value.trim();
  if (!userMsg) return;

  // Add user's message to chat window
  addMessage(userMsg, "user");

  // Check if the question is related to L'Oréal products or routines
  if (!isRelatedQuestion(userMsg)) {
    // If not related, show a message and do not call the API
    addMessage(
      "Sorry, I can only answer questions about L'Oréal products and routines. Please ask something related.",
      "ai"
    );
    userInput.value = "";
    return;
  }

  // Add user's message to messages array
  messages.push({ role: "user", content: userMsg });

  // Clear the input box
  userInput.value = "";

  // Get AI response
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
