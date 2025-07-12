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

// Function to call OpenAI API
async function getAIResponse() {
  // Show a loading message
  addMessage("Thinking...", "ai");

  // Prepare the API request
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  // Use the API key from secrets.js
  const apiKey = OPENAI_API_KEY;

  // Build the request body
  const requestBody = {
    model: "gpt-4o", // Use the gpt-4o model
    messages: messages,
    max_tokens: 300, // Limit the response length
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

    // Add AI reply to chat window
    addMessage(aiReply, "ai");

    // Add AI reply to messages array
    messages.push({ role: "assistant", content: aiReply });
  } catch (error) {
    // Remove the loading message if there's an error
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
