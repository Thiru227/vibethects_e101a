# BrowseGPT - Universal AI Website Assistant

A Chrome browser extension that provides AI-powered navigation and accessibility assistance for **any website** without prior configuration or site-specific code.
Built in 24 hrs in a hackathon by Amrita University

## 🎯 Core Concept

This is an **assistive agent, not an autonomous one**. The system:
- Observes only what's **visible** on the current page
- Explains what it **can see**
- Guides users **step-by-step**
- Performs only **safe, confirmed** navigation actions
- Works across **multiple diverse websites** without hardcoding

## 🚀 Key Features

### Universal Operation
- ✅ Works on ANY website without configuration
- ✅ No site-specific assumptions or hardcoding
- ✅ Runtime learning from visible DOM elements
- ✅ No website building or backend access required

### Intelligent Assistance
- 🧠 Natural language understanding (text and voice)
- 🔍 Real-time page structure interpretation
- 📍 Element highlighting and guidance
- 🎯 Context-aware recommendations

### Voice Capabilities
- 🎤 Push-to-talk mode
- 🗣️ Hands-free accessibility mode
- 🔊 Text-to-speech responses
- ♿ Full accessibility support

### Safety & Transparency
- ⚠️ No form submission or data entry
- ✋ Explicit confirmation before navigation
- 👁️ Only observes visible elements
- 🚫 No hallucination or overclaiming

## 📁 Project Structure

```
universal-ai-assistant/
├── extension/
│   ├── manifest.json              # Chrome Extension manifest (v3)
│   ├── background.js              # Service worker + session memory
│   ├── content-script.js          # DOM observation logic
│   ├── config.js                  # Configuration
│   ├── overlay/
│   │   ├── overlay.html          # UI template
│   │   ├── overlay.css           # Styling (dark/light mode)
│   │   └── overlay.js            # UI logic + voice handling
│   └── icons/                    # Extension icons
├── backend/
│   ├── app.py                    # Flask API server
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # API keys (not in repo)
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Chrome browser (v88+)
- Python 3.8+
- Anthropic API key
- ElevenLabs API key

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Create `.env` file:**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

4. **Start the Flask server:**
```bash
python app.py
```

Server will start on `http://localhost:5000`

### Extension Installation

1. **Update configuration:**
   - Open `extension/config.js`
   - Verify `BACKEND_URL` points to your Flask server
   - Add your ElevenLabs API key if needed

2. **Load extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)
   - Click "Load unpacked"
   - Select the `extension/` folder

3. **Verify installation:**
   - Extension icon should appear in toolbar
   - Visit any website and click the icon
   - Assistant panel should open

## 🎮 How to Use

### Basic Interaction

1. **Open the assistant:**
   - Click the extension icon, or
   - Click the floating purple button (bottom-right)

2. **Ask questions:**
   - Type: "What's on this page?"
   - Type: "Where can I find my results?"
   - Type: "Show me the navigation menu"

3. **Voice interaction:**
   - Click microphone icon to speak
   - Say your question clearly
   - Wait for response (text + voice)

### Hands-Free Accessibility Mode

Perfect for users with limited mobility:

1. **Enable hands-free mode:**
   - Click the microphone icon in header
   - Mode indicator will show "🎤 Hands-Free"

2. **What happens:**
   - Assistant reads page summary aloud
   - Lists available navigation options verbally
   - Continuously listens for commands
   - Asks verbal confirmation before actions

3. **Sample interaction:**
   ```
   Assistant: "You are currently on Student Portal. 
              The main sections are: Dashboard, Academics, Results.
              Available navigation options include: View Results,
              Download Reports, Academic Calendar.
              What would you like to do?"
   
   You: "Take me to results"
   
   Assistant: "I found a link called 'View Results' in the navigation.
              Would you like to navigate there? Say yes to confirm."
   
   You: "Yes"
   
   Assistant: "Navigating now"
   ```

### Example Queries

**Information Queries:**
- "What information is on this page?"
- "What are the main sections?"
- "Is there a table with scores?"
- "Read me the navigation options"

**Navigation Queries:**
- "Where is the login button?"
- "Show me how to get to settings"
- "Take me to the contact page"
- "I need to find my account info"

**Guidance Queries:**
- "How do I download my results?"
- "Where can I update my profile?"
- "What should I do next?"

## 🧠 How It Works: Runtime Learning

### 1. DOM Observation (Zero Knowledge Start)

The system starts with **no knowledge** of any website. When you open the assistant:

```javascript
// content-script.js extracts ONLY visible, semantic information:
{
  "url": "https://example.com/dashboard",
  "title": "Student Dashboard",
  "headings": ["Welcome Back", "Recent Activity", "Quick Links"],
  "navigation": [
    {
      "text": "View Results",
      "type": "link",
      "href": "/results",
      "selector": "a.nav-link"
    }
  ],
  "buttons": [
    {
      "text": "Download Report",
      "selector": "button.download-btn"
    }
  ],
  "content_summary": [
    {
      "type": "table",
      "title": "Recent Grades",
      "headers": ["Subject", "Score", "Grade"],
      "rows": [
        {"Subject": "Math", "Score": "85", "Grade": "A"}
      ]
    }
  ]
}
```

**What's extracted:**
- ✅ Visible text and structure
- ✅ Clickable elements (links, buttons)
- ✅ Tables, lists, headings
- ✅ ARIA labels for accessibility

**What's NOT extracted:**
- ❌ CSS styles
- ❌ JavaScript source code
- ❌ Hidden elements
- ❌ Network requests
- ❌ Cookies or storage
- ❌ Screenshots or pixels

### 2. Intent Understanding (Claude)

Claude receives:
- User query: "Where are my test results?"
- DOM summary (structured JSON above)
- Session history (previous pages visited)

Claude's system prompt enforces strict rules:
```
CRITICAL RULES:
1. You do NOT know the website
2. You ONLY reason over the provided DOM summary
3. You MUST NOT hallucinate pages or actions
4. If something is not visible, say so
5. Navigation requires explicit user confirmation
```

Claude responds:
```
"I can see a link called 'View Results' in the navigation menu. 
This appears to be what you're looking for. Would you like me 
to highlight it for you?"
```

### 3. Action Execution (Safe & Confirmed)

**Highlight Action:**
```javascript
// Scroll element into view
element.scrollIntoView({ behavior: 'smooth', block: 'center' });

// Apply visual highlight
element.classList.add('ai-assistant-highlight');

// Auto-remove after 3 seconds
setTimeout(() => element.classList.remove('ai-assistant-highlight'), 3000);
```

**Navigation Action:**
```javascript
// ONLY after explicit user confirmation:
if (userConfirmed) {
  window.location.href = targetUrl;
}
```

### 4. Session Memory (Temporary)

Background script maintains:
```javascript
{
  visitedPages: [
    { url: "/dashboard", title: "Dashboard", timestamp: 1234567890 }
  ],
  navigationHistory: [
    { from: "/dashboard", to: "/results", action: "click_link" }
  ]
}
```

Memory is:
- ✅ Session-only (resets on browser restart)
- ✅ Used to understand navigation context
- ✅ Never sent to external servers
- ❌ Not persistent across sessions

## 🔒 Safety & Limitations

### What It CAN Do
✅ Read visible page content
✅ Explain page structure
✅ Highlight elements
✅ Navigate to visible links (with confirmation)
✅ Answer questions about visible content
✅ Provide step-by-step guidance

### What It CANNOT Do
❌ Submit forms
❌ Enter text or passwords
❌ Click buttons automatically
❌ Access hidden content
❌ Read backend data
❌ Perform multi-step workflows
❌ Guarantee complete understanding of any site

### Safety Guarantees
1. **No Autonomous Actions**: All navigation requires explicit confirmation
2. **No Data Entry**: Cannot submit forms or enter information
3. **Visible Only**: Only observes what users can already see
4. **No Hallucination**: Admits when it can't find something
5. **Privacy First**: No data sent to external servers except AI APIs

## 🎨 UI/UX Features

### Clean, Modern Interface
- Floating assistant button (purple gradient)
- Expandable side panel (380px)
- Smooth CSS animations
- No layout interference
- Keyboard navigation support

### Accessibility
- High contrast mode
- Screen reader compatible
- ARIA labels on all controls
- Keyboard shortcuts
- Voice-first interaction option

### Dark/Light Mode
- Automatic theme toggle
- Smooth transitions
- Preserved across sessions

### Visual Feedback
- Listening indicator (pulsing red mic)
- Processing status
- Element highlighting (purple outline with pulse)
- Smooth scrolling to elements

## 🧪 Testing on Real Websites

### Recommended Test Sites

1. **Simple News Sites** (e.g., BBC, CNN)
   - Test: "What are today's top stories?"
   - Test: "Show me the world news section"

2. **E-commerce** (e.g., Amazon product pages)
   - Test: "What information is shown about this product?"
   - Test: "Where can I see reviews?"

3. **Documentation Sites** (e.g., MDN, Wikipedia)
   - Test: "What sections are available?"
   - Test: "Is there a table of contents?"

4. **Dashboard/Portal** (e.g., email, social media)
   - Test: "What options are in the navigation?"
   - Test: "Where can I change settings?"

### Demo Flow Example

**Website: GitHub Repository Page**
1. **User opens assistant**
   - System extracts visible DOM
   - No prior knowledge of GitHub

2. **User asks: "What's on this page?"**
   - Assistant: "This page shows a GitHub repository called 'universal-ai-assistant'. I can see tabs for Code, Issues, Pull requests, Actions, Projects, Wiki, and Settings. There's also a README visible with project documentation."

3. **User asks: "Where can I see the issues?"**
   - Assistant: "I found a tab called 'Issues' in the main navigation. Would you like me to highlight it?"

4. **User says: "Yes"**
   - System scrolls to and highlights the Issues tab
   - Purple pulsing outline appears

5. **User asks: "Take me there"**
   - Assistant: "I can navigate to the Issues page. Click 'Navigate' to confirm."
   - Confirmation buttons appear
   - User clicks "Navigate"
   - Page navigates to Issues

### Testing Voice Mode

**Enable microphone permissions when prompted**

**Push-to-Talk:**
1. Click mic icon
2. Speak: "What's on this page?"
3. Wait for transcription
4. Receive voice + text response

**Hands-Free:**
1. Click microphone in header
2. Listen to page summary
3. Speak commands continuously
4. Verbal confirmations for navigation

## 🐛 Troubleshooting

### Extension Not Loading
- Check Chrome version (v88+)
- Verify all files in `extension/` folder
- Check browser console for errors
- Try reloading extension in `chrome://extensions/`

### Voice Not Working
- Grant microphone permissions
- Check browser supports MediaRecorder API
- Verify ElevenLabs API key
- Falls back to text-only if voice fails

### Backend Connection Failed
- Verify Flask server is running (`http://localhost:5000`)
- Check `config.js` has correct `BACKEND_URL`
- Check CORS is enabled
- Verify API keys in `.env`

### "I cannot see that" Response
- Element might not be visible (check DOM inspector)
- Element might be in dropdown/hidden menu
- Try scrolling or expanding sections first
- Ask assistant "What can you see?" for debugging

## 🔧 Configuration

### config.js Options

```javascript
const CONFIG = {
  BACKEND_URL: 'http://localhost:5000',
  ELEVENLABS_API_KEY: 'your_key_here',
  HIGHLIGHT_DURATION: 3000,        // ms to show highlight
  MAX_NAVIGATION_ITEMS: 50,        // max nav elements to extract
  MAX_CONTENT_BLOCKS: 20           // max content blocks to extract
};
```

### Customization

**Change colors:**
- Edit `overlay/overlay.css`
- Look for gradient values (e.g., `#667eea`, `#764ba2`)

**Adjust voice settings:**
- Edit `app.py`
- Change `voice_id` in `text_to_speech` function
- Available voices: https://elevenlabs.io/docs

**Modify highlight style:**
- Edit `.ai-assistant-highlight` class in `overlay.css`

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       Browser Tab                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │            Visible Website Content                  │ │
│  │  (Any website - no prior knowledge)                │ │
│  └─────────────────┬──────────────────────────────────┘ │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────────┐ │
│  │         content-script.js (DOM Observer)           │ │
│  │  • Extracts visible elements only                  │ │
│  │  • No HTML, CSS, or JavaScript source              │ │
│  │  • Semantic structure extraction                   │ │
│  └─────────────────┬──────────────────────────────────┘ │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────────┐ │
│  │         overlay.js (UI + Voice Handler)            │ │
│  │  • Chat interface                                  │ │
│  │  • Voice input/output                              │ │
│  │  • Element highlighting                            │ │
│  └─────────────────┬──────────────────────────────────┘ │
└────────────────────┼──────────────────────────────────────┘
                     │
      ┌──────────────▼──────────────┐
      │   background.js             │
      │   (Service Worker)          │
      │   • Session memory          │
      │   • API communication       │
      │   • Navigation history      │
      └──────────────┬──────────────┘
                     │
           ┌─────────▼──────────┐
           │   Flask Backend    │
           │   (Python/Flask)   │
           │                    │
           │  ┌──────────────┐  │
           │  │   Claude AI  │  │
           │  │   (Anthropic)│  │
           │  └──────────────┘  │
           │                    │
           │  ┌──────────────┐  │
           │  │  ElevenLabs  │  │
           │  │  (STT + TTS) │  │
           │  └──────────────┘  │
           └────────────────────┘
```

## 🎓 Key Technical Decisions

### Why No Screenshots/Vision?
- Respects user privacy
- Faster processing
- More reliable than OCR
- Works with screen readers

### Why Semantic DOM Only?
- Clean, structured data
- No unnecessary noise
- Works across all websites
- Respects invisible content

### Why Confirmation Required?
- User safety and control
- Prevents unintended actions
- Builds trust
- Accessibility requirement

### Why Session-Only Memory?
- Privacy by design
- No persistent tracking
- Fresh start each session
- Lightweight implementation

## 🚀 Future Enhancements

Potential improvements (not yet implemented):
- Multi-language support
- Custom voice selection
- Keyboard shortcuts configuration
- Export conversation history
- Integration with screen readers
- Offline mode (cached responses)

## 📜 License

MIT License - feel free to use and modify

## 🤝 Contributing

This is a hackathon project designed for educational purposes. Contributions welcome!

**Contribution by Praveen Raj**

## ⚠️ Disclaimer

This is an assistive tool, not a replacement for proper website navigation. Always verify important actions manually. The system cannot guarantee complete understanding of any website.

---

**Built with:** Chrome Manifest v3, Vanilla JavaScript, Flask, Claude (Anthropic), ElevenLabs

**Hackathon Ready:** ✅ Working demo, clean code, full documentation

