// ==========================================
// BrowseGPT - Professional UI (Complete Fixed Version)
// ==========================================

console.log("✅ BrowseGPT loaded on:", window.location.href);

// PERSISTENT conversation history
let conversationHistory = [];

// Load conversation history
chrome.storage.local.get(['conversationHistory'], (result) => {
  if (result.conversationHistory) {
    conversationHistory = result.conversationHistory;
    console.log("📚 Loaded conversation history:", conversationHistory.length, "messages");
  }
});

// Save conversation history
function saveConversationHistory() {
  chrome.storage.local.set({ conversationHistory: conversationHistory });
}

// Get extension icons
const iconPath = chrome.runtime.getURL('icons/icon48.png');
const icon32Path = chrome.runtime.getURL('icons/icon32.png');
const icon48Path = chrome.runtime.getURL('icons/icon48.png');

// --- Inject Professional Overlay ---
(function injectOverlay() {
  if (document.getElementById("browsegpt-container")) {
    return;
  }

  console.log("🚀 Injecting BrowseGPT overlay...");

  const container = document.createElement("div");
  container.id = "browsegpt-container";
  
  container.innerHTML = `
    <div class="browsegpt-root">
      <button id="browsegpt-toggle" class="browsegpt-toggle" title="Open BrowseGPT">
        <img src="${iconPath}" alt="BrowseGPT" class="toggle-icon" />
      </button>

      <div id="browsegpt-panel" class="browsegpt-panel">
        
        <!-- Header -->
        <div class="browsegpt-header">
          <div class="header-left">
            <img src="${icon32Path}" alt="BrowseGPT" class="header-logo" />
            <h3>BrowseGPT</h3>
          </div>
          <div class="header-controls">
            <button id="browsegpt-clear" title="Clear conversation" class="header-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <button id="browsegpt-theme" title="Toggle theme" class="header-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
            <button id="browsegpt-close" title="Close" class="header-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="browsegpt-status">
          <span id="browsegpt-status-text">Ready</span>
        </div>

        <!-- Messages -->
        <div id="browsegpt-messages" class="browsegpt-messages">
          <div class="ai-message welcome-message">
            <img src="${icon32Path}" class="message-avatar" />
            <div class="message-content">
              <strong>Welcome to BrowseGPT!</strong>
              <p>I can help you navigate and understand this page.</p>
              <div class="quick-actions">
                <span class="quick-action">Navigate anywhere</span>
                <span class="quick-action">Find elements</span>
                <span class="quick-action">Search content</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="browsegpt-input-area">
          <button id="browsegpt-mic" title="Voice input" class="input-btn mic-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>
          <input 
            id="browsegpt-input" 
            type="text" 
            placeholder="Ask or command..." 
            autocomplete="off"
          />
          <button id="browsegpt-send" title="Send" class="input-btn send-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>

      </div>
    </div>
  `;

  // Professional CSS - IMPROVED with better padding and formatting
  const style = document.createElement("style");
  style.textContent = `
    /* ==========================================
       BrowseGPT - Professional Styles (Complete)
       ========================================== */
    
    #browsegpt-container * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif;
    }

    .browsegpt-root {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      font-size: 14px;
    }

    /* ===== Toggle Button - Logo with white background ===== */
    .browsegpt-toggle {
      all: unset;
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3), 0 0 0 3px rgba(99, 102, 241, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 2147483647;
      pointer-events: auto;
      padding: 10px;
    }

    .browsegpt-toggle:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4), 0 0 0 4px rgba(99, 102, 241, 0.15);
    }

    .browsegpt-toggle:active {
      transform: scale(0.95);
    }

    .toggle-icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* ===== Panel ===== */
    .browsegpt-panel {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 440px;
      height: 660px;
      background: #FFFFFF;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483646;
      animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .browsegpt-panel.open {
      display: flex;
    }

    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .browsegpt-panel.dark {
      background: #1F2937;
      color: #F9FAFB;
    }

    /* ===== Header ===== */
    .browsegpt-header {
      padding: 20px 24px;
      background: linear-gradient(135deg, #6366F1 0%, #EC4899 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-logo {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: white;
      padding: 3px;
    }

    .browsegpt-header h3 {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .header-controls {
      display: flex;
      gap: 8px;
    }

    .header-btn {
      all: unset;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
      color: white;
    }

    .header-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    /* ===== Status Bar ===== */
    .browsegpt-status {
      padding: 14px 24px;
      background: #F3F4F6;
      border-bottom: 1px solid #E5E7EB;
      font-size: 13px;
      color: #6B7280;
      font-weight: 500;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .browsegpt-panel.dark .browsegpt-status {
      background: #374151;
      border-bottom-color: #4B5563;
      color: #9CA3AF;
    }

    .browsegpt-status.thinking::before {
      content: '';
      width: 18px;
      height: 18px;
      background-image: url('${iconPath}');
      background-size: contain;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .browsegpt-status.navigating {
      background: linear-gradient(90deg, #DBEAFE 0%, #FCE7F3 100%);
      color: #1E40AF;
    }

    /* ===== Messages - IMPROVED PADDING ===== */
    .browsegpt-messages {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-height: 0;
    }

    .browsegpt-messages::-webkit-scrollbar {
      width: 6px;
    }

    .browsegpt-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .browsegpt-messages::-webkit-scrollbar-thumb {
      background: #D1D5DB;
      border-radius: 3px;
    }

    /* AI Message - Logo without white filter */
    .ai-message {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      max-width: 90%;
    }

    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: white;
      padding: 6px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
    }

    .message-content {
      background: #F9FAFB;
      padding: 16px 18px;
      border-radius: 16px;
      border-top-left-radius: 4px;
      line-height: 1.7;
      color: #1F2937;
      flex: 1;
    }

    .browsegpt-panel.dark .message-content {
      background: #374151;
      color: #F9FAFB;
    }

    /* Message text formatting */
    .message-content strong {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #6366F1;
    }

    .browsegpt-panel.dark .message-content strong {
      color: #A78BFA;
    }

    .message-content p {
      margin: 10px 0;
      line-height: 1.7;
    }

    .message-content ul,
    .message-content ol {
      margin: 12px 0;
      padding-left: 24px;
    }

    .message-content li {
      margin: 8px 0;
      line-height: 1.6;
    }

    .message-content ol li {
      padding-left: 4px;
    }

    /* User Message */
    .user-message {
      align-self: flex-end;
      background: linear-gradient(135deg, #6366F1, #EC4899);
      color: white;
      padding: 16px 18px;
      border-radius: 16px;
      border-top-right-radius: 4px;
      max-width: 80%;
      line-height: 1.7;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }

    /* Welcome Message */
    .welcome-message .message-content {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(236, 72, 153, 0.08));
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }

    .quick-action {
      background: white;
      border: 1px solid #E5E7EB;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      color: #6366F1;
      font-weight: 500;
    }

    /* ===== Input Area - IMPROVED PADDING ===== */
    .browsegpt-input-area {
      padding: 20px 24px;
      border-top: 1px solid #E5E7EB;
      background: white;
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .browsegpt-panel.dark .browsegpt-input-area {
      background: #1F2937;
      border-top-color: #4B5563;
    }

    #browsegpt-input {
      all: unset;
      flex: 1;
      padding: 16px 18px;
      border-radius: 12px;
      border: 2px solid #E5E7EB;
      background: #F9FAFB;
      font-size: 14px;
      color: #1F2937;
      transition: all 0.2s;
      line-height: 1.5;
    }

    #browsegpt-input:focus {
      border-color: #6366F1;
      background: white;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .browsegpt-panel.dark #browsegpt-input {
      background: #374151;
      border-color: #4B5563;
      color: #F9FAFB;
    }

    .input-btn {
      all: unset;
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .mic-btn {
      background: #F3F4F6;
      color: #6B7280;
    }

    .mic-btn:hover {
      background: #E5E7EB;
      color: #1F2937;
    }

    .mic-btn.listening {
      background: linear-gradient(135deg, #EF4444, #DC2626);
      color: white;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }

    .send-btn {
      background: linear-gradient(135deg, #6366F1, #EC4899);
      color: white;
    }

    .send-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    /* ===== Highlight Styles - FIXED ===== */
    .browsegpt-highlight {
      outline: 5px solid #6366F1 !important;
      outline-offset: 6px !important;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.15)) !important;
      border-radius: 10px !important;
      position: relative !important;
      animation: browsegpt-glow 2.5s ease-in-out infinite !important;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3),
                  0 0 35px rgba(99, 102, 241, 0.5),
                  0 0 65px rgba(236, 72, 153, 0.4) !important;
      z-index: 999998 !important;
      transition: all 0.3s ease !important;
    }
    
    @keyframes browsegpt-glow {
      0%, 100% { 
        outline-color: #6366F1;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.4),
                    0 0 35px rgba(99, 102, 241, 0.6),
                    0 0 65px rgba(236, 72, 153, 0.4);
      }
      50% { 
        outline-color: #EC4899;
        box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.4),
                    0 0 45px rgba(236, 72, 153, 0.7),
                    0 0 75px rgba(99, 102, 241, 0.5);
      }
    }
  `;

  function appendOverlay() {
    if (document.body) {
      document.head.appendChild(style);
      document.body.appendChild(container);
      console.log("✅ BrowseGPT overlay injected");
      setTimeout(initializeOverlay, 100);
    } else {
      setTimeout(appendOverlay, 100);
    }
  }

  appendOverlay();
})();

// --- Initialize Overlay ---
function initializeOverlay() {
  console.log("🔧 Initializing BrowseGPT...");

  const toggleBtn = document.getElementById("browsegpt-toggle");
  const panel = document.getElementById("browsegpt-panel");
  const closeBtn = document.getElementById("browsegpt-close");
  const themeBtn = document.getElementById("browsegpt-theme");
  const clearBtn = document.getElementById("browsegpt-clear");
  const micBtn = document.getElementById("browsegpt-mic");
  const sendBtn = document.getElementById("browsegpt-send");
  const userInput = document.getElementById("browsegpt-input");
  const messageContainer = document.getElementById("browsegpt-messages");
  const statusText = document.getElementById("browsegpt-status-text");
  const statusBar = document.querySelector(".browsegpt-status");

  if (!toggleBtn || !panel) {
    console.error("❌ Critical elements not found");
    return;
  }

  let isDarkMode = false;
  let isListening = false;
  let recognition = null;

  // Restore previous messages
  if (conversationHistory.length > 0) {
    messageContainer.innerHTML = '';
    conversationHistory.forEach(msg => {
      addMessageToUI(msg.content, msg.role === 'user' ? 'user' : 'ai');
    });
  }

  // Toggle panel
  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      userInput.focus();
    }
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
  });

  themeBtn.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    panel.classList.toggle("dark", isDarkMode);
  });

  clearBtn.addEventListener("click", () => {
    if (confirm("Clear conversation history?")) {
      conversationHistory = [];
      saveConversationHistory();
      messageContainer.innerHTML = `
        <div class="ai-message welcome-message">
          <img src="${icon32Path}" class="message-avatar" />
          <div class="message-content">
            <strong>Conversation cleared</strong>
            <p>How can I help you navigate?</p>
          </div>
        </div>
      `;
    }
  });

  // Send message
  function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessageToUI(text, "user");
    conversationHistory.push({ role: "user", content: text });
    saveConversationHistory();

    userInput.value = "";
    statusText.textContent = "Thinking...";
    statusBar.classList.add("thinking");

    chrome.runtime.sendMessage(
      { action: "GET_PAGE_CONTEXT" },
      (response) => {
        if (chrome.runtime.lastError || !response?.success) {
          sendToBackend(text, null);
          return;
        }
        sendToBackend(text, response.data);
      }
    );
  }

  function sendToBackend(query, pageContext) {
    fetch("http://localhost:5000/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
        page_context: pageContext || {
          url: window.location.href,
          title: document.title
        },
        conversation_history: conversationHistory
      })
    })
    .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))
    .then(data => {
      const replyText = data.text || "No response";
      addMessageToUI(replyText, "ai");
      
      conversationHistory.push({ role: "assistant", content: replyText });
      saveConversationHistory();
      
      statusText.textContent = "Ready";
      statusBar.classList.remove("thinking");
      
      if (data.action === 'highlight' && data.selector) {
        console.log("✨ Attempting to highlight:", data.selector);
        highlightElement(data.selector, data.element_text);
      } else if (data.action === 'navigate' && data.url && data.auto_execute) {
        statusText.textContent = "Navigating...";
        statusBar.classList.add("navigating");
        setTimeout(() => window.location.href = data.url, 800);
      }
    })
    .catch(error => {
      addMessageToUI(`⚠️ Connection failed: ${error.message}`, "ai");
      statusText.textContent = "Backend Offline";
      statusBar.classList.remove("thinking");
    });
  }

  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Format message with markdown-like features
  function formatMessage(text) {
    let formatted = text;
    
    // Bold text between **
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Create proper lists
    const lines = formatted.split('\n');
    let inList = false;
    let listType = null;
    let result = [];
    
    for (let line of lines) {
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
      const bulletMatch = line.match(/^[-*]\s+(.+)$/);
      
      if (numberedMatch) {
        if (!inList || listType !== 'ol') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        result.push(`<li>${numberedMatch[2]}</li>`);
      } else if (bulletMatch) {
        if (!inList || listType !== 'ul') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        result.push(`<li>${bulletMatch[1]}</li>`);
      } else {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
          listType = null;
        }
        if (line.trim()) {
          result.push(`<p>${line}</p>`);
        }
      }
    }
    
    if (inList) {
      result.push(`</${listType}>`);
    }
    
    return result.join('\n');
  }

  function addMessageToUI(text, type) {
    const msgDiv = document.createElement("div");
    if (type === "user") {
      msgDiv.className = "user-message";
      msgDiv.textContent = text;
    } else {
      msgDiv.className = "ai-message";
      const formattedContent = formatMessage(text);
      msgDiv.innerHTML = `
        <img src="${icon48Path}" class="message-avatar" />
        <div class="message-content">${formattedContent}</div>
      `;
    }
    messageContainer.appendChild(msgDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  // IMPROVED highlight function with multiple strategies
  function highlightElement(selector, elementText) {
    try {
      // Remove existing highlights
      document.querySelectorAll('.browsegpt-highlight').forEach(el => {
        el.classList.remove('browsegpt-highlight');
      });
      
      let element = null;
      
      console.log("🔍 Searching for:", selector, "Text:", elementText);
      
      // Strategy 1: Direct selector
      element = document.querySelector(selector);
      
      // Strategy 2: If selector has href, try finding by href
      if (!element && selector.includes('href=')) {
        const hrefMatch = selector.match(/href="([^"]+)"/);
        if (hrefMatch) {
          element = document.querySelector(`a[href="${hrefMatch[1]}"]`);
        }
      }
      
      // Strategy 3: Search by exact text content
      if (!element && elementText) {
        const allElements = document.querySelectorAll('a, button, [role="button"], input[type="button"], input[type="submit"]');
        for (let el of allElements) {
          if (el.closest('#browsegpt-container')) continue; // Skip BrowseGPT elements
          
          const text = (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().toLowerCase();
          if (text === elementText.toLowerCase() || text.includes(elementText.toLowerCase())) {
            element = el;
            console.log("✅ Found by text match:", text);
            break;
          }
        }
      }
      
      // Strategy 4: Partial keyword match
      if (!element && elementText) {
        const keywords = elementText.toLowerCase().split(' ').filter(w => w.length > 3);
        const allElements = document.querySelectorAll('a, button, [role="button"], input[type="button"], input[type="submit"], div[onclick], span[onclick]');
        for (let el of allElements) {
          if (el.closest('#browsegpt-container')) continue;
          
          const text = (el.textContent || el.value || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim().toLowerCase();
          const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
          if (matchCount >= Math.max(1, Math.floor(keywords.length / 2))) {
            element = el;
            console.log("✅ Found by keyword match:", text);
            break;
          }
        }
      }
      
      if (!element) {
        console.warn("⚠️ Element not found after all strategies");
        addMessageToUI("⚠️ I described the element's location, but couldn't highlight it on this page.", "ai");
        return;
      }
      
      console.log("✅ Found element:", element);
      
      element.classList.add('browsegpt-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      
      // Remove highlight after 7 seconds
      setTimeout(() => {
        element.classList.remove('browsegpt-highlight');
      }, 7000);
      
      addMessageToUI("✨ Element highlighted! Look for the purple glow.", "ai");
      
    } catch (error) {
      console.error("❌ Highlight error:", error);
      addMessageToUI("⚠️ Couldn't highlight the element. Try asking me to describe its location instead.", "ai");
    }
  }

  // Speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      micBtn.classList.add("listening");
      statusText.textContent = "Listening...";
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;
      sendMessage();
    };

    recognition.onend = () => {
      isListening = false;
      micBtn.classList.remove("listening");
      if (statusText.textContent === "Listening...") {
        statusText.textContent = "Ready";
      }
    };

    micBtn.addEventListener("click", () => {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  }

  console.log("✅ BrowseGPT ready");
}

// DOM Extraction - EXCLUDE BrowseGPT elements
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "EXTRACT_DOM") {
    try {
      sendResponse({ success: true, data: extractPageData() });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
});

function extractPageData() {
  // Helper function to check if element is part of BrowseGPT
  function isBrowseGPTElement(el) {
    return el.closest('#browsegpt-container') !== null ||
           el.id === 'browsegpt-container' ||
           el.classList.contains('browsegpt-highlight');
  }
  
  return {
    url: window.location.href,
    title: document.title,
    headings: Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"))
      .filter(el => !isBrowseGPTElement(el))
      .map(el => el.innerText.trim())
      .filter(text => text && text.length < 200),
    navigation: Array.from(document.querySelectorAll("a[href]"))
      .filter(el => !isBrowseGPTElement(el))
      .map((el, index) => ({
        text: el.innerText.trim() || el.getAttribute('aria-label') || el.getAttribute('title'),
        href: el.href,
        selector: `a[href="${el.href}"]:nth-of-type(${index + 1})`
      }))
      .filter(item => item.text && item.href?.startsWith('http')),
    buttons: Array.from(document.querySelectorAll("button, input[type='button'], input[type='submit'], [role='button']"))
      .filter(el => !isBrowseGPTElement(el))
      .map((el, i) => ({
        text: (el.innerText || el.value || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim(),
        selector: el.id ? `#${el.id}` : el.className ? `.${el.className.split(' ')[0]}` : `button:nth-of-type(${i + 1})`
      }))
      .filter(item => item.text && item.text.length < 150),
    shortcuts: Array.from(document.querySelectorAll('a[title], [aria-label]'))
      .filter(el => !isBrowseGPTElement(el))
      .map(el => ({
        text: el.innerText.trim() || el.getAttribute('title') || el.getAttribute('aria-label'),
        href: el.href,
        selector: el.href ? `a[href="${el.href}"]` : null
      }))
      .filter(item => item.text && item.href)
  };
}