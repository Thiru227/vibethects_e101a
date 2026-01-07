from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize AI clients
anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
anthropic_client = None

if anthropic_api_key:
    try:
        from anthropic import Anthropic
        anthropic_client = Anthropic(api_key=anthropic_api_key)
        print("✅ Anthropic client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Anthropic client: {e}")

# ENHANCED System Prompt with Better Navigation Detection
SYSTEM_PROMPT = """You are a powerful website navigation AI assistant. Your job is to help users navigate and interact with websites by analyzing the DOM structure.

**YOUR CAPABILITIES:**
1. Analyze page structure (headings, buttons, links, forms, tables)
2. Guide users to specific elements they're looking for
3. Explain what actions are available on the current page
4. Provide step-by-step navigation instructions
5. Highlight elements to help users find them
6. **Navigate to sites automatically when users request**
7. **Search for and find links to external sites**

**RESPONSE STYLE:**
- Be direct and actionable
- Focus on what the user can DO right now
- Always reference specific elements you see in the DOM
- Use bullet points sparingly - prefer natural conversation
- When users ask "where is X", tell them location AND highlight it

**TAKING ACTIONS:**

1. **For Highlighting (ALWAYS include text explanation):**
   Format: [HIGHLIGHT: exact_text_of_element]
   
   Example: "The login button is in the top-right corner. [HIGHLIGHT: Login]"
   
   IMPORTANT: Always describe WHERE the element is (top-right, bottom-left, navigation bar, etc.) before highlighting.

2. **For INSTANT Navigation (no confirmation needed):**
   Use [AUTO_NAVIGATE: url] when user uses DIRECT COMMANDS:
   - "take me to X"
   - "open X"
   - "go to X"
   - "show me X" (when X is a website)
   - "navigate to X"
   - Single-word site requests: "youtube", "gmail", "twitter"
   
   Example: 
   User: "take me to youtube"
   You: "Taking you to YouTube! [AUTO_NAVIGATE: https://youtube.com]"
   
   User: "youtube"
   You: "Opening YouTube! [AUTO_NAVIGATE: https://youtube.com]"

3. **For Search-Based Navigation:**
   Format: [SEARCH_NAVIGATE: query]
   Use when user wants to search for something
   
   Example: "I'll search for that! [SEARCH_NAVIGATE: AI news]"

**NAVIGATION RULES:**
- Bold/direct commands ("take me to", "open", "go to", "youtube") = AUTO NAVIGATE IMMEDIATELY
- Questions ("where can I find", "how do I get to") = Explain first, offer navigation
- Confirmations ("yes", "ok", "sure", "go") = AUTO NAVIGATE to last offered URL
- Single word site names = AUTO NAVIGATE

**COMMON SITES (know these URLs):**
- YouTube: youtube.com
- Gmail: mail.google.com
- Google Docs: docs.google.com
- Google Drive: drive.google.com
- Twitter/X: twitter.com
- Facebook: facebook.com
- Instagram: instagram.com
- LinkedIn: linkedin.com
- GitHub: github.com
- Reddit: reddit.com
- Wikipedia: wikipedia.org
- Amazon: amazon.com
- Netflix: netflix.com
- Outlook: outlook.com
- Stack Overflow: stackoverflow.com

**HIGHLIGHTING EXAMPLES:**

User: "where is the login button"
You: "The login button is in the top-right corner of the page, next to the search icon. [HIGHLIGHT: Login]"

User: "show me settings"
You: "The Settings option is in the main menu on the left side. [HIGHLIGHT: Settings]"

User: "find the search box"
You: "The search box is at the center of the page, below the Google logo. [HIGHLIGHT: Search Google or type a URL]"

**IMPORTANT:**
- Always describe element location BEFORE highlighting
- For navigation requests, check if it's a DIRECT command (instant navigate) or QUESTION (explain first)
- Bold commands = no confirmation needed
- Keep responses concise but informative"""


@app.route('/api/query', methods=['POST'])
def process_query():
    """Process user query with page context"""
    try:
        data = request.json
        user_query = data.get('query', '')
        page_context = data.get('page_context', {})
        conversation_history = data.get('conversation_history', [])

        print(f"\n📩 Query: {user_query}")
        print(f"📄 Page: {page_context.get('title', 'Unknown')}")

        if not user_query:
            return jsonify({'error': 'No query provided'}), 400

        if not anthropic_client:
            return jsonify({
                'text': '⚠️ AI backend not available. Please configure ANTHROPIC_API_KEY in .env file.',
                'action': None
            }), 200

        # Detect instant navigation intent
        is_instant_nav = detect_instant_navigation(user_query)
        
        # Build enhanced context
        context = build_enhanced_context(page_context)
        
        # Build conversation with history
        messages = []
        
        # Add conversation history (last 6 messages)
        for msg in conversation_history[-6:]:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add current query with context
        navigation_hint = ""
        if is_instant_nav:
            navigation_hint = "\n\n⚠️ USER WANTS INSTANT NAVIGATION - Use [AUTO_NAVIGATE: url] immediately without asking for confirmation."
        
        current_message = f"""CURRENT PAGE ANALYSIS:
{context}

USER QUERY: {user_query}{navigation_hint}

Provide a helpful, actionable response. 
- For highlighting: describe location first, then use [HIGHLIGHT: text]
- For instant navigation commands: use [AUTO_NAVIGATE: url] immediately
- For questions about locations: explain then offer to navigate
- For confirmations: navigate to last offered URL"""

        messages.append({
            "role": "user",
            "content": current_message
        })

        print(f"🤖 Calling Claude API...")

        # Call Claude
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=messages
        )

        assistant_text = response.content[0].text
        print(f"✅ Claude response: {assistant_text[:150]}...")

        # Parse action commands
        action_result = parse_action_commands(assistant_text, page_context, user_query, conversation_history)

        return jsonify({
            'text': action_result['clean_text'],
            'action': action_result['action'],
            'selector': action_result.get('selector'),
            'url': action_result.get('url'),
            'element_text': action_result.get('element_text'),
            'search_query': action_result.get('search_query'),
            'auto_execute': action_result.get('auto_execute', False)
        })

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'text': f'⚠️ Error: {str(e)}',
            'action': None
        }), 200


def detect_instant_navigation(query):
    """Detect if query is a direct navigation command (no confirmation needed)"""
    query_lower = query.lower().strip()
    
    # Direct command phrases
    instant_phrases = [
        'take me to',
        'take me',
        'open ',
        'go to',
        'navigate to',
        'show me',
        'bring me to'
    ]
    
    # Check for direct commands
    if any(phrase in query_lower for phrase in instant_phrases):
        return True
    
    # Check for single-word site names
    single_word_sites = [
        'youtube', 'gmail', 'twitter', 'facebook', 'instagram',
        'linkedin', 'github', 'reddit', 'wikipedia', 'amazon',
        'netflix', 'outlook', 'docs', 'drive'
    ]
    
    if query_lower in single_word_sites:
        return True
    
    return False


def build_enhanced_context(page_context):
    """Build rich context that helps Claude understand the page"""
    parts = []
    
    # Page identity
    url = page_context.get('url', 'unknown')
    parts.append(f"**WEBSITE:** {url}")
    parts.append(f"**PAGE TITLE:** {page_context.get('title', 'unknown')}")
    
    # Note if it's a Chrome/special page
    if 'chrome://' in url or 'edge://' in url:
        parts.append("**NOTE:** This is a browser internal page (new tab/settings). DOM access may be limited.")
    
    # Navigation elements
    navigation = page_context.get('navigation', [])
    if navigation:
        parts.append(f"\n**CLICKABLE LINKS ({len(navigation)} available):**")
        for i, nav in enumerate(navigation[:30], 1):
            text = nav.get('text', '').strip()
            href = nav.get('href', '')
            if text and len(text) < 100:
                parts.append(f"{i}. '{text}' → {href}")
    
    # Buttons
    buttons = page_context.get('buttons', [])
    if buttons:
        parts.append(f"\n**BUTTONS ({len(buttons)} available):**")
        for i, btn in enumerate(buttons[:20], 1):
            btn_text = btn.get('text', '') if isinstance(btn, dict) else btn
            if btn_text:
                parts.append(f"{i}. {btn_text}")
    
    # Headings
    headings = page_context.get('headings', [])
    if headings:
        parts.append(f"\n**PAGE STRUCTURE ({len(headings)} headings):**")
        for i, heading in enumerate(headings[:10], 1):
            parts.append(f"{i}. {heading}")
    
    # Shortcuts (Chrome new tab page)
    shortcuts = page_context.get('shortcuts', [])
    if shortcuts:
        parts.append(f"\n**QUICK SHORTCUTS ({len(shortcuts)} available):**")
        for i, shortcut in enumerate(shortcuts[:15], 1):
            parts.append(f"{i}. {shortcut.get('text', '')} → {shortcut.get('href', '')}")
    
    return "\n".join(parts)


def parse_action_commands(text, page_context, user_query, conversation_history):
    """Parse [HIGHLIGHT], [AUTO_NAVIGATE], and [SEARCH_NAVIGATE] commands"""
    result = {
        'clean_text': text,
        'action': None,
        'selector': None,
        'url': None,
        'element_text': None,
        'search_query': None,
        'auto_execute': False
    }
    
    # Check for AUTO_NAVIGATE command
    auto_nav_match = re.search(r'\[AUTO_NAVIGATE:\s*([^\]]+)\]', text, re.IGNORECASE)
    if auto_nav_match:
        url = auto_nav_match.group(1).strip()
        
        # Ensure URL has protocol
        if not url.startswith('http'):
            url = 'https://' + url
        
        print(f"🚀 Auto-navigate command: {url}")
        
        result['action'] = 'navigate'
        result['url'] = url
        result['auto_execute'] = True
        result['clean_text'] = text.replace(auto_nav_match.group(0), '').strip()
        return result
    
    # Check for SEARCH_NAVIGATE command
    search_nav_match = re.search(r'\[SEARCH_NAVIGATE:\s*([^\]]+)\]', text, re.IGNORECASE)
    if search_nav_match:
        query = search_nav_match.group(1).strip()
        url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
        
        print(f"🔍 Search-navigate command: {query}")
        
        result['action'] = 'navigate'
        result['url'] = url
        result['search_query'] = query
        result['auto_execute'] = True
        result['clean_text'] = text.replace(search_nav_match.group(0), '').strip()
        return result
    
    # Check for HIGHLIGHT command
    highlight_match = re.search(r'\[HIGHLIGHT:\s*([^\]]+)\]', text, re.IGNORECASE)
    if highlight_match:
        element_text = highlight_match.group(1).strip()
        print(f"🎯 Highlight command: {element_text}")
        
        selector = find_element_selector(element_text, page_context)
        if selector:
            result['action'] = 'highlight'
            result['selector'] = selector
            result['element_text'] = element_text
            result['clean_text'] = text.replace(highlight_match.group(0), '').strip()
        else:
            print(f"⚠️ Could not find selector for: {element_text}")
            # Keep the text as-is, don't remove the command
    
    # Check if user is confirming previous navigation offer
    query_lower = user_query.lower().strip()
    confirmations = ['yes', 'ok', 'okay', 'sure', 'go', 'yep', 'yeah']
    
    if query_lower in confirmations and len(conversation_history) > 0:
        # Look for URL in last AI message
        last_ai_message = None
        for msg in reversed(conversation_history):
            if msg['role'] == 'assistant':
                last_ai_message = msg['content']
                break
        
        if last_ai_message:
            # Extract URL from previous message
            url_match = re.search(r'https?://[^\s\)]+', last_ai_message)
            if url_match:
                url = url_match.group(0)
                print(f"✅ User confirmed navigation to: {url}")
                result['action'] = 'navigate'
                result['url'] = url
                result['auto_execute'] = True
    
    return result


def find_element_selector(text, page_context):
    """Find CSS selector for element matching text"""
    text_lower = text.lower().strip()
    
    # Search in shortcuts (Chrome new tab)
    for shortcut in page_context.get('shortcuts', []):
        shortcut_text = shortcut.get('text', '').lower().strip()
        if shortcut_text == text_lower or text_lower in shortcut_text:
            return shortcut.get('selector')
    
    # Search in navigation links
    for nav in page_context.get('navigation', []):
        nav_text = nav.get('text', '').lower().strip()
        if nav_text == text_lower or text_lower in nav_text:
            return nav.get('selector')
    
    # Search in buttons
    for i, btn in enumerate(page_context.get('buttons', [])):
        btn_text = btn.get('text', '') if isinstance(btn, dict) else btn
        if btn_text and btn_text.lower().strip() == text_lower:
            return btn.get('selector') if isinstance(btn, dict) else f'button:nth-of-type({i+1})'
    
    # Fuzzy search
    for nav in page_context.get('navigation', []):
        nav_text = nav.get('text', '').lower()
        if all(word in nav_text for word in text_lower.split() if len(word) > 2):
            return nav.get('selector')
    
    return None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Website Assistant Backend',
        'anthropic': 'ready' if anthropic_client else 'not configured'
    })


if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 AI Website Assistant Backend (Enhanced)")
    print("="*50)
    print(f"Anthropic: {'✓ Ready' if anthropic_client else '✗ Missing API Key'}")
    print(f"Features: Auto-Navigation, Persistent Chat, Smart Highlighting")
    print(f"\n🌐 Server: http://localhost:5000")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)