// background.js - Service Worker for StreamSpeed Companion

console.log("StreamSpeed Background Script Loaded.");

// Listener for keyboard commands
chrome.commands.onCommand.addListener((command, tab) => {
  console.log(`Command received: ${command}`);

  // Ensure we have an active tab to send the message to
  if (!tab || !tab.id) {
    // Try to query for the active tab as a fallback
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0 && tabs[0].id) {
        sendMessageToContentScript(tabs[0].id, command);
      } else {
        console.error("StreamSpeed Background: Could not find active tab.");
      }
    });
    return; // Exit early
  }

  sendMessageToContentScript(tab.id, command);

});

function sendMessageToContentScript(tabId, command) {
  let messageType = '';
  let payload = {};

  switch (command) {
    case 'increase-speed':
      messageType = 'CHANGE_SPEED_RELATIVE';
      payload = { change: 0.10 }; // Incremento
      break;
    case 'decrease-speed':
      messageType = 'CHANGE_SPEED_RELATIVE';
      payload = { change: -0.10 }; // Decremento
      break;
    case 'reset-speed':
        messageType = 'SET_SPEED';
        payload = { speed: 1.0 }; // Restablecer a 1.0x
        break;
    // Add cases for specific preset commands if implemented later
    default:
      console.warn(`StreamSpeed Background: Unknown command "${command}"`);
      return; // Don't send unknown commands
  }

  console.log(`StreamSpeed Background: Sending message ${messageType} to tab ${tabId}`, payload);

  chrome.tabs.sendMessage(tabId, { type: messageType, ...payload }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("StreamSpeed Background: Error sending message:", chrome.runtime.lastError.message);
      // This often happens if the content script isn't injected on the page (e.g., chrome:// pages)
    } else {
      console.log("StreamSpeed Background: Message sent successfully. Response:", response);
    }
  });
}

// Optional: Listener for when the extension is first installed or updated
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === "install") {
        console.log("StreamSpeed Companion installed.");
        // Set default settings on install
        chrome.storage.sync.set({
            speed: 1.0,
            presets: {}, // Initialize empty presets object
            theme: 'system' // Default theme
        });
         chrome.storage.local.set({
            lastSpeed: 1.0, // Initialize local speed too
            controlPosition: { top: '15px', left: '15px' } // Default position
        });
    } else if (details.reason === "update") {
        console.log("StreamSpeed Companion updated to version " + chrome.runtime.getManifest().version);
        // You might want to check for existing settings and migrate them if needed
    }
});
