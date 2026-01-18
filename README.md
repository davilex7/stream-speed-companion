<p align="center">
  <img src="icons/icon-128.png" alt="Stream Speed Companion Logo" width="128" height="128">
</p>

<h1 align="center">🎬 Stream Speed Companion</h1>

<p align="center">
  <strong>Control the playback speed of any HTML5 video on the web</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.2.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/manifest-v3-green.svg" alt="Manifest V3">
  <img src="https://img.shields.io/badge/chrome-extension-yellow.svg" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/license-MIT-purple.svg" alt="License">
  <img src="https://img.shields.io/badge/dependencies-none-brightgreen.svg" alt="No Dependencies">
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-user-guide">User Guide</a> •
  <a href="#-developer-documentation">Developer Docs</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

# 📖 Table of Contents

## Part 1: User Guide
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Installation](#-installation)
- [How to Use](#-how-to-use)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [FAQ](#-frequently-asked-questions)

## Part 2: Developer Documentation
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Component Deep Dive](#-component-deep-dive)
- [Message Protocol](#-message-protocol)
- [Storage Schema](#-storage-schema)
- [Development Guide](#-development-guide)
- [Contributing](#-contributing)

---

<br>

# 👤 PART 1: USER GUIDE

<br>

## 🚀 Quick Start

1. **Install** the extension in Chrome
2. **Navigate** to any website with videos (YouTube, Netflix, Vimeo, etc.)
3. **Use** the floating control panel or keyboard shortcuts to adjust speed
4. **Enjoy** your videos at your preferred pace!

---

## ✨ Features

### 🎛️ Floating Speed Controller
A sleek, draggable control panel that appears on any page with videos.

```
┌─────────────────────────────────────┐
│  Speed: 1.50x              [−]      │
├─────────────────────────────────────┤
│  ○────────────●─────────────○       │
│  0.1x                      5.0x     │
├─────────────────────────────────────┤
│  [0.5x] [1.0x] [1.5x] [2.0x] [2.5x] │
└─────────────────────────────────────┘
```

### ⌨️ Keyboard Shortcuts
Control speed without touching your mouse - perfect for power users.

### 💾 Persistent Settings
Your preferred speed and panel position are saved automatically.

### 🔄 Sync Across Devices
Your settings follow you across all your Chrome browsers.

### 🎯 Universal Compatibility
Works on virtually any website with HTML5 videos.

---

## 📥 Installation

### Method 1: From Source (Developer Mode)

1. **Download** or clone this repository
   ```bash
   git clone https://github.com/your-username/stream-speed-companion.git
   ```

2. **Open Chrome** and navigate to:
   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode** using the toggle in the top-right corner

4. **Click "Load unpacked"** and select the extension folder

5. **Done!** The extension icon will appear in your toolbar

### Method 2: Chrome Web Store
*(Coming soon)*

---

## 🎮 How to Use

### The Floating Controller

When you visit a page with videos, a floating control panel appears automatically.

| Element | Function |
|---------|----------|
| **Speed Display** | Shows current playback speed (e.g., "1.50x") |
| **Slider** | Drag to adjust speed from 0.10x to 5.0x |
| **Preset Buttons** | Quick access to common speeds |
| **Minimize Button** | Hide the controller (−) |

### Moving the Controller

- **Click and drag** the panel header to reposition it anywhere on screen
- Position is **automatically saved** and restored on page reload

### Using the Popup

Click the extension icon in Chrome's toolbar to:

| Option | Description |
|--------|-------------|
| **Toggle Controller** | Show or hide the floating panel |
| **Reload Extension** | Refresh the extension if issues occur |

---

## ⌨️ Keyboard Shortcuts

Master these shortcuts for lightning-fast control:

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| **Increase Speed** (+0.10x) | `Ctrl + Shift + .` | `Cmd + Shift + .` |
| **Decrease Speed** (-0.10x) | `Ctrl + Shift + ,` | `Cmd + Shift + ,` |
| **Reset to 1.0x** | `Ctrl + Shift + 0` | `Cmd + Shift + 0` |

> 💡 **Tip:** The period (.) and comma (,) keys are next to each other, making speed adjustments intuitive!

---

## ❓ Frequently Asked Questions

<details>
<summary><strong>Q: The controller doesn't appear on a video site</strong></summary>

**A:** Some sites use non-standard video players. Try:
1. Refresh the page
2. Wait for the video to fully load
3. Click the "Reload Extension" button in the popup

</details>

<details>
<summary><strong>Q: Can I change the keyboard shortcuts?</strong></summary>

**A:** Yes! Go to `chrome://extensions/shortcuts` and customize them to your liking.

</details>

<details>
<summary><strong>Q: Does it work on Netflix/Disney+/Prime Video?</strong></summary>

**A:** Yes! The extension works on most streaming platforms that use HTML5 video, including:
- YouTube
- Netflix
- Disney+
- Amazon Prime Video
- Vimeo
- Twitch
- And many more!

</details>

<details>
<summary><strong>Q: Why does the speed sometimes reset?</strong></summary>

**A:** Some video players override the playback rate when switching videos or chapters. The extension will automatically reapply your preferred speed.

</details>

<details>
<summary><strong>Q: How do I completely hide the controller?</strong></summary>

**A:** Click the minimize button (−) on the controller, or use the toggle in the extension popup.

</details>

---

<br>

# 🛠️ PART 2: DEVELOPER DOCUMENTATION

<br>

## 🏗️ Architecture Overview

Stream Speed Companion follows the standard Chrome Extension architecture with three main components:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHROME BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    Messages    ┌────────────────────────┐ │
│  │                  │◄──────────────►│                        │ │
│  │  Background.js   │                │   Content Script       │ │
│  │  (Service Worker)│                │   (Injected per tab)   │ │
│  │                  │                │                        │ │
│  │  • Commands API  │                │  • Video detection     │ │
│  │  • Initialization│                │  • UI rendering        │ │
│  │  • Key handling  │                │  • Speed control       │ │
│  │                  │                │  • Drag & drop         │ │
│  └────────┬─────────┘                └────────────┬───────────┘ │
│           │                                       │              │
│           │ Messages                              │              │
│           ▼                                       │              │
│  ┌──────────────────┐                             │              │
│  │                  │        Storage API          │              │
│  │    Popup.js      │◄────────────────────────────┘              │
│  │  (Extension UI)  │                                            │
│  │                  │                                            │
│  │  • Toggle ctrl   │     ┌─────────────────────┐               │
│  │  • Reload ext    │◄───►│   Chrome Storage    │               │
│  │  • State display │     │   (Local + Sync)    │               │
│  │                  │     └─────────────────────┘               │
│  └──────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
stream-speed-companion/
│
├── 📄 manifest.json          # Extension configuration (Manifest V3)
│
├── 🎯 Content Scripts
│   ├── content_script.js     # Main logic injected into web pages (374 lines)
│   └── content_style.css     # Floating controller styles (154 lines)
│
├── ⚡ Background
│   └── background.js         # Service worker for commands (79 lines)
│
├── 🖼️ Popup Interface
│   ├── popup.html            # Popup markup (28 lines)
│   ├── popup.js              # Popup functionality (89 lines)
│   └── popup.css             # Popup styles (140 lines)
│
├── 🎨 Assets
│   └── icons/
│       ├── icon-48.png       # Toolbar icon
│       └── icon-128.png      # Large icon
│
└── 📚 Documentation
    └── README.md             # This file
```

### File Size Summary

| File | Lines | Purpose |
|------|-------|---------|
| `content_script.js` | 374 | Video detection, UI management, event handling |
| `content_style.css` | 154 | Floating panel styling |
| `popup.js` | 89 | Extension popup logic |
| `popup.css` | 140 | Popup styling |
| `background.js` | 79 | Keyboard shortcuts, initialization |
| `popup.html` | 28 | Popup markup |
| `manifest.json` | 62 | Extension configuration |
| **Total** | **~926** | |

---

## 🔧 Technology Stack

| Technology | Version/Standard | Purpose |
|------------|------------------|---------|
| **Chrome Extensions API** | Manifest V3 | Core extension framework |
| **JavaScript** | ES6+ (Vanilla) | Application logic |
| **HTML5** | Semantic | Markup structure |
| **CSS3** | Flexbox, Transitions | Styling and animations |
| **Chrome Storage API** | Local + Sync | Data persistence |
| **Chrome Commands API** | — | Keyboard shortcuts |
| **Chrome Tabs API** | — | Cross-tab communication |
| **Chrome Scripting API** | — | Content script injection |

### Why No Dependencies?

- ⚡ **Performance:** Zero overhead, instant load
- 🔒 **Security:** No supply chain vulnerabilities
- 📦 **Size:** Minimal extension footprint
- 🛠️ **Simplicity:** Easy to maintain and debug

---

## 🔍 Component Deep Dive

### Content Script (`content_script.js`)

The heart of the extension, responsible for all video interaction.

#### Key Functions

```javascript
// Creates the floating speed control UI
function createSpeedControlUI()

// Applies speed to the current video
function updateSpeed(speed, shouldSave = true)

// Persists speed to Chrome storage
function saveSpeed()

// Binds the controller to a detected video
function activateUIForVideo(video)

// Finds all video elements, sorted by size
function findVideos()

// Loads saved preferences on initialization
function loadInitialSettings()

// Validates Chrome runtime context
function isRuntimeValid()
```

#### Video Detection Strategy

```javascript
// Priority-based video detection
1. Find all <video> elements on page
2. Filter visible videos (width > 0, height > 0)
3. Sort by area (largest first)
4. Attach to the largest visible video
5. Monitor for new videos via MutationObserver
```

#### Drag & Drop Implementation

```javascript
// Drag state management
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// Mouse events on header element
header.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', onDrag);
document.addEventListener('mouseup', endDrag);

// Position saved on drag end
function endDrag() {
  saveControlPosition();
}
```

### Background Service Worker (`background.js`)

Handles system-level events and keyboard commands.

#### Command Processing

```javascript
chrome.commands.onCommand.addListener((command) => {
  switch(command) {
    case 'increase-speed':
      sendToTab({ type: 'CHANGE_SPEED_RELATIVE', change: 0.10 });
      break;
    case 'decrease-speed':
      sendToTab({ type: 'CHANGE_SPEED_RELATIVE', change: -0.10 });
      break;
    case 'reset-speed':
      sendToTab({ type: 'SET_SPEED', speed: 1.0 });
      break;
  }
});
```

#### First-Run Initialization

```javascript
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default values
    chrome.storage.local.set({
      lastSpeed: 1.0,
      isControllerVisible: true,
      controlPosition: { top: '15px', left: '15px' }
    });
  }
});
```

### Popup Interface (`popup.js`)

Simple UI for toggling controller visibility.

#### Toggle Logic

```javascript
async function toggleController() {
  const { isControllerVisible } = await chrome.storage.local.get('isControllerVisible');
  const newState = !isControllerVisible;

  await chrome.storage.local.set({ isControllerVisible: newState });
  updateToggleUI(newState);

  // Notify content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, {
    type: newState ? 'SHOW_CONTROLLER' : 'HIDE_CONTROLLER'
  });
}
```

---

## 📡 Message Protocol

### Message Types

Communication between components uses a typed message system:

| Type | Direction | Payload | Description |
|------|-----------|---------|-------------|
| `SET_SPEED` | Background → Content | `{ speed: number }` | Set absolute speed |
| `CHANGE_SPEED_RELATIVE` | Background → Content | `{ change: number }` | Adjust speed by delta |
| `GET_SPEED` | Any → Content | — | Request current speed |
| `SHOW_CONTROLLER` | Popup → Content | — | Show floating panel |
| `HIDE_CONTROLLER` | Popup → Content | — | Hide floating panel |

### Message Flow Examples

```
┌──────────────┐                    ┌─────────────────┐
│  Background  │                    │  Content Script │
└──────┬───────┘                    └────────┬────────┘
       │                                     │
       │  { type: 'CHANGE_SPEED_RELATIVE',   │
       │    change: 0.10 }                   │
       │────────────────────────────────────►│
       │                                     │
       │                                     │ Update video.playbackRate
       │                                     │ Update UI display
       │                                     │ Save to storage
       │                                     │
```

### Response Handling

```javascript
// Content script responds to GET_SPEED
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SPEED') {
    sendResponse({ speed: currentSpeed });
    return true; // Async response
  }
});
```

---

## 💾 Storage Schema

### Local Storage

Persisted per-device settings:

```typescript
interface LocalStorage {
  lastSpeed: number;           // Range: 0.10 - 5.0, Default: 1.0
  isControllerVisible: boolean; // Default: true
  controlPosition: {
    top: string;               // CSS value, e.g., "15px"
    left: string;              // CSS value, e.g., "15px"
  };
}
```

### Sync Storage

Settings synchronized across Chrome browsers:

```typescript
interface SyncStorage {
  speed: number;               // Synced playback speed
  presets?: number[];          // Custom preset speeds (future)
  theme?: 'dark' | 'light';    // UI theme (future)
}
```

### Storage Access Patterns

```javascript
// Read with defaults
const { lastSpeed = 1.0 } = await chrome.storage.local.get('lastSpeed');

// Write single value
await chrome.storage.local.set({ lastSpeed: 1.5 });

// Write multiple values
await chrome.storage.local.set({
  lastSpeed: 1.5,
  controlPosition: { top: '100px', left: '200px' }
});

// Listen for changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.isControllerVisible) {
    updateControllerVisibility(changes.isControllerVisible.newValue);
  }
});
```

---

## 🧪 Development Guide

### Setting Up Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/stream-speed-companion.git
   cd stream-speed-companion
   ```

2. **Load in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project folder

3. **Make changes**
   - Edit files directly (no build process needed)
   - Use the "Reload" button in `chrome://extensions/` or the popup's reload button

### Debugging

#### Content Script Logs
```javascript
// Open DevTools on the target page (F12)
// Logs appear in Console tab
console.log('[StreamSpeed]', 'Message here');
```

#### Background Service Worker Logs
```javascript
// In chrome://extensions/, click "Service Worker" link
// Opens dedicated DevTools for background script
```

#### Popup Logs
```javascript
// Right-click popup → "Inspect"
// Opens DevTools for popup context
```

### Testing Checklist

- [ ] Speed slider adjusts video playback
- [ ] Preset buttons work correctly
- [ ] Keyboard shortcuts function
- [ ] Panel position persists after reload
- [ ] Speed persists after reload
- [ ] Toggle visibility works from popup
- [ ] Extension works on YouTube
- [ ] Extension works on Netflix
- [ ] Extension works on Vimeo
- [ ] Multiple videos on same page handled correctly

### Building for Production

No build process required! To package for distribution:

```bash
# Create a ZIP for Chrome Web Store
zip -r stream-speed-companion.zip . -x "*.git*" -x "*.DS_Store"
```

### Code Style Guidelines

- **Language:** JavaScript (ES6+), no TypeScript
- **Comments:** Spanish (Español) - maintain consistency
- **Formatting:** 2-space indentation
- **Naming:** camelCase for functions/variables
- **Context Safety:** Always check `chrome.runtime.id` before API calls

```javascript
// Good: Context validation
function isRuntimeValid() {
  return typeof chrome !== 'undefined' &&
         chrome.runtime &&
         chrome.runtime.id;
}

// Usage
if (isRuntimeValid()) {
  chrome.storage.local.get('lastSpeed', callback);
}
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to help:

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Browser version
   - Extension version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)

### Suggesting Features

Open an issue with the "enhancement" label describing:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives considered

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Review Criteria

- [ ] Follows existing code style
- [ ] Includes appropriate comments
- [ ] No console errors or warnings
- [ ] Tested on multiple video sites
- [ ] Maintains backward compatibility

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Chrome Extensions documentation and examples
- The open-source community for inspiration
- All contributors and users

---

<p align="center">
  <strong>Made with ❤️ for video enthusiasts everywhere</strong>
</p>

<p align="center">
  <a href="#-stream-speed-companion">Back to top</a>
</p>
