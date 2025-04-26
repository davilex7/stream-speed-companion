document.addEventListener('DOMContentLoaded', () => {
    const visibilityToggle = document.getElementById('visibilityToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const reloadBtn = document.getElementById('reloadBtn');

    // console.log("Popup: Initializing toggle and reload button...");

    // --- Visibilidad del Controlador ---
    // Check chrome.runtime first to avoid errors if popup opens during invalidation
    if (chrome.runtime?.id) {
        chrome.storage.local.get({ isControllerVisible: true }, (result) => {
            // Check again inside the callback
            if (chrome.runtime?.id) {
                const isVisible = result.isControllerVisible;
                // console.log("Popup: Initial controller visibility state:", isVisible);
                visibilityToggle.checked = isVisible;
                updateLabel(isVisible);
            } else {
                 console.warn("Popup: Runtime context became invalid before storage could be read.");
            }
        });
    } else {
         console.warn("Popup: Runtime context invalid on initial load.");
    }


    visibilityToggle.addEventListener('change', () => {
        const shouldBeVisible = visibilityToggle.checked;
        // console.log(`Popup: Toggle changed. Should controller be visible? ${shouldBeVisible}`);
        updateLabel(shouldBeVisible);
        // Check runtime before accessing storage/messaging
        if (chrome.runtime?.id) {
            chrome.storage.local.set({ isControllerVisible: shouldBeVisible });
            const messageType = shouldBeVisible ? 'SHOW_CONTROLLER' : 'HIDE_CONTROLLER';
            sendMessageToContentScript(messageType);
        } else {
             console.warn("Popup: Runtime context invalid during toggle change.");
        }
    });

    function updateLabel(isVisible) {
        toggleLabel.textContent = isVisible ? 'Controlador Visible' : 'Controlador Oculto';
    }

    function sendMessageToContentScript(messageType) {
        // Check runtime before querying tabs
        if (!chrome.runtime?.id) {
             console.warn("Popup: Cannot send message, runtime context invalid.");
             return;
        }
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
             // Check runtime again inside the callback
            if (!chrome.runtime?.id) {
                console.warn("Popup: Runtime context became invalid before message could be sent.");
                return;
            }
            if (tabs.length > 0 && tabs[0].id) {
                const targetTabId = tabs[0].id;
                // console.log(`Popup: Sending ${messageType} to Tab ID ${targetTabId}`);
                chrome.tabs.sendMessage(targetTabId, { type: messageType }, (response) => {
                    // Check runtime.lastError FIRST, as it indicates connection issues or invalid context
                    if (chrome.runtime.lastError) {
                        // Use console.warn for connection errors - less intrusive
                        console.warn(`Popup: Error sending ${messageType}: ${chrome.runtime.lastError.message}`);
                        // No alert needed here
                    } else {
                        // console.log(`Popup: ${messageType} sent successfully. Response:`, response);
                    }
                });
            } else {
                console.warn("Popup: No active tab found to send message.");
            }
        });
    }

    // --- Recargar Extensión ---
    reloadBtn.addEventListener('click', () => {
        console.log("Popup: Reload button clicked. Reloading extension...");
        // Check runtime before reloading (though unlikely to be invalid here)
        if (chrome.runtime?.id) {
            chrome.runtime.reload();
        } else {
             console.warn("Popup: Cannot reload, runtime context invalid.");
        }
        // El popup se cerrará automáticamente al recargar la extensión.
    });

    // console.log("Popup: Initialization complete.");
});
