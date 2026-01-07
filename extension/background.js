// ==========================================
// background.js - Service Worker (MV3)
// ==========================================

console.log("✅ background.js loaded (Service Worker)");

// --- Message Router ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("📩 background.js received:", msg);
  console.log("📤 From:", sender.tab ? `Tab ${sender.tab.id}` : "Extension popup");

  // Route: GET_PAGE_CONTEXT
  if (msg.action === "GET_PAGE_CONTEXT") {
    handleGetPageContext(sendResponse);
    return true; // 🔴 CRITICAL: Keep channel open for async response
  }

  // Route: BACKEND_QUERY (for future backend integration)
  if (msg.action === "BACKEND_QUERY") {
    handleBackendQuery(msg.query, msg.pageContext, sendResponse);
    return true;
  }

  // Route: HIGHLIGHT_ELEMENT
  if (msg.action === "HIGHLIGHT_ELEMENT") {
    handleHighlightElement(msg.selector, sendResponse);
    return true;
  }

  console.warn("⚠️ Unknown action:", msg.action);
  sendResponse({ success: false, error: "Unknown action" });
});

// --- Handler: Get Page Context ---
function handleGetPageContext(sendResponse) {
  console.log("🔍 Getting active tab...");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Validate tab exists
    if (!tabs || tabs.length === 0) {
      console.error("❌ No active tab found");
      sendResponse({ success: false, error: "No active tab" });
      return;
    }

    const activeTab = tabs[0];
    console.log("📄 Active tab:", activeTab.title, activeTab.url);

    // Check if content script can run on this tab
    if (activeTab.url.startsWith("chrome://") || 
        activeTab.url.startsWith("chrome-extension://") ||
        activeTab.url.startsWith("edge://")) {
      console.warn("⚠️ Cannot inject into browser pages");
      sendResponse({ 
        success: false, 
        error: "Cannot access browser internal pages" 
      });
      return;
    }

    // Send message to content script
    chrome.tabs.sendMessage(
      activeTab.id,
      { action: "EXTRACT_DOM" },
      (response) => {
        // Handle content script not responding
        if (chrome.runtime.lastError) {
          console.error("❌ Content script error:", chrome.runtime.lastError.message);
          sendResponse({ 
            success: false, 
            error: "Content script not responding. Try refreshing the page." 
          });
          return;
        }

        // Forward response from content script
        console.log("✅ Got response from content script:", response);
        sendResponse(response);
      }
    );
  });
}

// --- Handler: Backend Query (Future Integration) ---
function handleBackendQuery(query, pageContext, sendResponse) {
  console.log("🤖 Backend query:", query);

  // TODO: Implement when backend is fully integrated
  // For now, return a placeholder response
  
  fetch("http://localhost:5000/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: query,
      page_context: pageContext
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("✅ Backend response:", data);
    sendResponse({ success: true, data: data });
  })
  .catch(error => {
    console.error("❌ Backend error:", error);
    sendResponse({ 
      success: false, 
      error: "Backend unavailable. Using local processing." 
    });
  });
}

// --- Handler: Highlight Element ---
function handleHighlightElement(selector, sendResponse) {
  console.log("✨ Highlighting element:", selector);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      sendResponse({ success: false, error: "No active tab" });
      return;
    }

    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "HIGHLIGHT_ELEMENT", selector: selector },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Highlight error:", chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        sendResponse(response);
      }
    );
  });
}

// --- Extension Icon Click (Optional) ---
chrome.action.onClicked.addListener((tab) => {
  console.log("🖱️ Extension icon clicked on tab:", tab.id);
  
  // Send message to content script to toggle overlay
  chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_OVERLAY" }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn("⚠️ Could not toggle overlay:", chrome.runtime.lastError.message);
    }
  });
});

// --- Service Worker Lifecycle ---
chrome.runtime.onInstalled.addListener((details) => {
  console.log("🎉 Extension installed/updated:", details.reason);
  
  if (details.reason === "install") {
    console.log("📦 First-time installation");
    // Optional: Open welcome page or setup instructions
  } else if (details.reason === "update") {
    console.log("🔄 Extension updated to version:", chrome.runtime.getManifest().version);
  }
});

// Keep service worker alive (prevent premature shutdown)
chrome.runtime.onSuspend.addListener(() => {
  console.log("⏸️ Service worker suspending...");
});

console.log("✅ background.js ready");