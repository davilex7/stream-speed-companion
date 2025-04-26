(() => {
  // Check if script is already running (e.g., due to multiple injections)
  if (window.streamSpeedCompanionLoaded) {
      console.log("StreamSpeed Companion: Already loaded, exiting.");
      return;
  }
  window.streamSpeedCompanionLoaded = true;
  console.log("StreamSpeed Companion: Content script v1.5 loaded (Context Checks).");

  let currentVideo = null;
  let speedControlContainer = null;
  let speedIndicator = null;
  let speedSlider = null;
  let speedButtonsContainer = null;
  let closeButton = null;
  let isDragging = false;
  let offsetX, offsetY;
  let lastSavedSpeed = 1.0;
  let isControllerVisible = true;
  let interactionTimeout = null;

  // --- UI Creation (sin cambios) ---
  function createSpeedControlUI() {
    // ... (código de createSpeedControlUI sin cambios desde v1.4) ...
    let container = document.getElementById('streamspeed-container');
    if (container) {
      speedIndicator = document.getElementById('streamspeed-indicator');
      speedSlider = document.getElementById('streamspeed-slider');
      speedButtonsContainer = container.querySelector('.streamspeed-buttons');
      closeButton = container.querySelector('.streamspeed-close-btn');
      return container;
    }
    container = document.createElement('div');
    container.id = 'streamspeed-container';
    container.className = 'streamspeed-control-container';
    const header = document.createElement('div');
    header.className = 'streamspeed-header';
    closeButton = document.createElement('button');
    closeButton.className = 'streamspeed-close-btn';
    closeButton.innerHTML = '&times;';
    closeButton.title = 'Ocultar Controlador';
    header.appendChild(closeButton);
    const titleSpan = document.createElement('span');
    titleSpan.textContent = ' Speed: ';
    titleSpan.style.flexGrow = '1';
    titleSpan.style.textAlign = 'center';
    header.appendChild(titleSpan);
    speedIndicator = document.createElement('span');
    speedIndicator.id = 'streamspeed-indicator';
    speedIndicator.textContent = `${lastSavedSpeed.toFixed(2)}x`;
    header.appendChild(speedIndicator);
    const controlsArea = document.createElement('div');
    controlsArea.className = 'streamspeed-controls-area';
    speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.id = 'streamspeed-slider';
    speedSlider.min = '0.10';
    speedSlider.max = '5.0';
    speedSlider.step = '0.05';
    speedSlider.value = lastSavedSpeed.toString();
    speedSlider.title = "Ajustar velocidad";
    controlsArea.appendChild(speedSlider);
    speedButtonsContainer = document.createElement('div');
    speedButtonsContainer.className = 'streamspeed-buttons';
    const speeds = [0.5, 1.0, 1.5, 2.0, 2.5];
    speeds.forEach(speed => { /* ... create buttons ... */
        const btn = document.createElement('button');
        btn.textContent = `${speed}x`;
        btn.dataset.speed = speed;
        btn.title = `Establecer velocidad a ${speed}x`;
        speedButtonsContainer.appendChild(btn);
    });
    controlsArea.appendChild(speedButtonsContainer);
    container.appendChild(header);
    container.appendChild(controlsArea);
    document.body.appendChild(container);

    // --- Event Listeners ---
    header.addEventListener('mousedown', (e) => { /* ... drag logic ... */
      if (e.target === closeButton || e.button !== 0) return;
      isDragging = true;
      offsetX = e.clientX - container.getBoundingClientRect().left;
      offsetY = e.clientY - container.getBoundingClientRect().top;
      container.style.cursor = 'grabbing';
      container.classList.add('dragging');
      e.preventDefault();
    });
     document.addEventListener('mousemove', (e) => { /* ... drag logic ... */
      if (!isDragging) return;
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;
      const containerRect = container.getBoundingClientRect();
      newX = Math.max(0, Math.min(newX, window.innerWidth - containerRect.width));
      newY = Math.max(0, Math.min(newY, window.innerHeight - containerRect.height));
      container.style.left = `${newX}px`;
      container.style.top = `${newY}px`;
    });
     document.addEventListener('mouseup', (e) => { /* ... drag logic ... */
      if (e.button !== 0) return;
      if (isDragging) {
        isDragging = false;
        container.style.cursor = 'grab';
        container.classList.remove('dragging');
        // Check runtime before accessing storage API
        if (chrome.runtime?.id) {
             chrome.storage.local.set({ controlPosition: { top: container.style.top, left: container.style.left } });
        } else {
             console.warn("StreamSpeed: Context invalid, cannot save position after drag.");
        }
      }
    });
    closeButton.addEventListener('click', hideController);
    speedSlider.addEventListener('input', handleSpeedChangeFromUI);
    speedSlider.addEventListener('change', saveSpeed);
    speedButtonsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.speed) {
            const speed = parseFloat(e.target.dataset.speed);
            updateSpeed(speed, true);
        }
    });

    loadInitialSettings();
    return container;
  }

  // --- Visibility Control (sin cambios) ---
  function showController() {
      if (!speedControlContainer) return;
      isControllerVisible = true;
      speedControlContainer.style.display = 'block';
  }
  function hideController() {
      if (!speedControlContainer) return;
      isControllerVisible = false;
      speedControlContainer.style.display = 'none';
      // Check runtime before saving state
      if (chrome.runtime?.id) {
          chrome.storage.local.set({ isControllerVisible: false });
      } else {
          console.warn("StreamSpeed: Context invalid, cannot save hidden state.");
      }
  }

  // --- Settings Loading (con comprobación de contexto) ---
  function loadInitialSettings() {
     // Check runtime before accessing storage
     if (!chrome.runtime?.id) {
         console.warn("StreamSpeed: Context invalid during initial settings load.");
         // Set defaults manually if context is gone
         isControllerVisible = true; // Assume visible by default if storage can't be read
         lastSavedSpeed = 1.0;
         if (speedControlContainer) speedControlContainer.style.display = 'block';
         if(speedSlider) speedSlider.value = lastSavedSpeed.toString();
         if(speedIndicator) speedIndicator.textContent = `${lastSavedSpeed.toFixed(2)}x`;
         return;
     }

     chrome.storage.local.get(['controlPosition', 'lastSpeed', 'isControllerVisible'], (localResult) => {
        // *** Check runtime context *inside* the callback ***
        if (!chrome.runtime?.id) {
            console.warn("StreamSpeed: Context became invalid before initial settings could be applied.");
            return; // Exit if context is gone
        }

        // Position
        if (localResult.controlPosition && speedControlContainer) {
            speedControlContainer.style.top = localResult.controlPosition.top || '15px';
            speedControlContainer.style.left = localResult.controlPosition.left || '15px';
        } else if (speedControlContainer) {
            speedControlContainer.style.top = '15px';
            speedControlContainer.style.left = '15px';
        }
        // Speed
        lastSavedSpeed = localResult.lastSpeed !== undefined ? localResult.lastSpeed : 1.0;
        if(speedSlider) speedSlider.value = lastSavedSpeed.toString();
        if(speedIndicator) speedIndicator.textContent = `${lastSavedSpeed.toFixed(2)}x`;

        // Visibility
        isControllerVisible = localResult.isControllerVisible !== false;
        // console.log("StreamSpeed: Initial controller visibility loaded:", isControllerVisible);
        if (speedControlContainer) {
            speedControlContainer.style.display = isControllerVisible ? 'block' : 'none';
        }
    });

     // Listen for storage changes (con comprobación de contexto)
     chrome.storage.onChanged.addListener((changes, namespace) => {
        // *** Check runtime context *inside* the callback ***
        if (!chrome.runtime?.id) {
            console.warn("StreamSpeed: Context invalid in storage.onChanged listener.");
            // Consider removing the listener if context is permanently gone?
            // chrome.storage.onChanged.removeListener(arguments.callee);
            return;
        }

        // Visibility listener remains
        if (namespace === 'local' && changes.isControllerVisible) {
            const shouldBeVisible = changes.isControllerVisible.newValue;
            // console.log("StreamSpeed: Detected visibility change in local storage:", shouldBeVisible);
            if (shouldBeVisible) {
                showController();
            } else {
                hideController(); // hideController now also checks runtime before saving
            }
        }
     });
  }


  // --- Video Handling (sin cambios funcionales) ---
   function findVideos() { /* ... no changes ... */
    const videos = Array.from(document.querySelectorAll('video'));
    videos.sort((a, b) => { /* ... */ return sizeB - sizeA; });
    return videos;
   }
   function handleSpeedChangeFromUI() { /* ... no changes ... */
    const speed = parseFloat(speedSlider.value);
    updateSpeed(speed, false);
    clearTimeout(interactionTimeout);
    interactionTimeout = setTimeout(() => { interactionTimeout = null; }, 500);
   }
   function updateSpeed(speed, shouldSave = false) { /* ... no changes ... */
    const minSpeed = parseFloat(speedSlider?.min || "0.1");
    const maxSpeed = parseFloat(speedSlider?.max || "5.0");
    const safeSpeed = Math.max(minSpeed, Math.min(speed, maxSpeed));
    lastSavedSpeed = safeSpeed;
    if(speedIndicator) speedIndicator.textContent = `${safeSpeed.toFixed(2)}x`;
    if(speedSlider && speedSlider.value !== safeSpeed.toString()) { speedSlider.value = safeSpeed.toString(); }
    if (currentVideo) { if (Math.abs(currentVideo.playbackRate - safeSpeed) > 0.01) { /* console.log(`StreamSpeed: Setting video playbackRate to ${safeSpeed.toFixed(2)}x`); */ currentVideo.playbackRate = safeSpeed; } }
    if (shouldSave) saveSpeed();
   }
   function saveSpeed() {
     // Check runtime before saving
     if (!chrome.runtime?.id) {
         console.warn("StreamSpeed: Context invalid, cannot save speed.");
         return;
     }
     const speedToSave = parseFloat(lastSavedSpeed);
     chrome.storage.local.set({ lastSpeed: speedToSave });
     chrome.storage.sync.set({ speed: speedToSave });
     // console.log(`StreamSpeed: Speed ${speedToSave.toFixed(2)}x saved.`);
   }
   function activateUIForVideo(video) { /* ... no changes, respects isControllerVisible ... */
     if (!isControllerVisible) return;
     if (!speedControlContainer) {
         speedControlContainer = createSpeedControlUI();
         if (!speedControlContainer) return;
         speedControlContainer.style.display = isControllerVisible ? 'block' : 'none';
     } else {
         speedControlContainer.style.display = isControllerVisible ? 'block' : 'none';
     }
     if (currentVideo !== video) {
         if (currentVideo) { currentVideo.removeEventListener('ratechange', onVideoRateChange); }
         currentVideo = video;
         console.log("StreamSpeed: Activating controls for video:", currentVideo);
         // Check runtime before getting storage
         if (chrome.runtime?.id) {
             chrome.storage.local.get({ lastSpeed: 1.0 }, (result) => {
                 // Check again inside callback
                 if (!chrome.runtime?.id) return;
                 lastSavedSpeed = result.lastSpeed;
                 // console.log(`StreamSpeed: Applying stored speed ${lastSavedSpeed.toFixed(2)}x to new video.`);
                 updateSpeed(lastSavedSpeed, false);
             });
         } else {
             // Fallback if context is gone
             lastSavedSpeed = 1.0;
             updateSpeed(lastSavedSpeed, false);
         }
         currentVideo.addEventListener('ratechange', onVideoRateChange);
     } else {
         if (Math.abs(currentVideo.playbackRate - lastSavedSpeed) > 0.01) {
             // console.log(`StreamSpeed: Re-applying desired speed ${lastSavedSpeed.toFixed(2)}x as current video rate is ${currentVideo.playbackRate.toFixed(2)}x.`);
             currentVideo.playbackRate = lastSavedSpeed;
         }
         updateSpeed(lastSavedSpeed, false);
     }
   }

 // --- Event Listeners & Observers (sin cambios funcionales) ---
 function setupVideoHoverListeners() { /* ... no changes ... */
      document.body.addEventListener('mouseover', (event) => { if (event.target.tagName === 'VIDEO' && !isDragging) activateUIForVideo(event.target); });
      document.body.addEventListener('play', (event) => { if (event.target.tagName === 'VIDEO' && !isDragging) activateUIForVideo(event.target); }, true);
      document.body.addEventListener('focusin', (event) => { if (event.target.tagName === 'VIDEO' && !isDragging) activateUIForVideo(event.target); });
 }
 function onVideoRateChange() { /* ... insistent logic remains ... */
      if (currentVideo && !isDragging && !interactionTimeout) {
          const currentRate = currentVideo.playbackRate;
          if (Math.abs(currentRate - lastSavedSpeed) > 0.01) {
              console.warn(`StreamSpeed: Video rate changed externally to ${currentRate.toFixed(2)}x. Re-applying desired speed ${lastSavedSpeed.toFixed(2)}x.`);
              currentVideo.playbackRate = lastSavedSpeed;
              if(speedIndicator) speedIndicator.textContent = `${lastSavedSpeed.toFixed(2)}x`;
              if(speedSlider) speedSlider.value = lastSavedSpeed.toString();
          }
      }
 }
 const observer = new MutationObserver((mutationsList) => { /* ... no changes ... */ });
 observer.observe(document.body, { childList: true, subtree: true });

  // --- Message Handling (con comprobación de contexto) ---
  // Check if the listener is already attached
  if (!chrome.runtime.onMessage.hasListener(messageListener)) {
      chrome.runtime.onMessage.addListener(messageListener);
  }

  function messageListener(message, sender, sendResponse) {
    // *** Check runtime context at the beginning of the listener ***
    if (!chrome.runtime?.id) {
        console.warn("StreamSpeed: Message received, but context is invalid. Ignoring.");
        // Optionally return true if you might have sent an async response before invalidation
        // return true;
        return false; // Indicate synchronous handling (or none)
    }

    // console.log("StreamSpeed Content Script: Message received:", message);
    let responsePayload = { status: "OK" };
    switch (message.type) {
        case 'SET_SPEED':
             if (typeof message.speed === 'number') { updateSpeed(message.speed, true); responsePayload = { status: "Speed set/saved", speed: lastSavedSpeed }; }
             else { responsePayload = { status: "Error: Invalid speed value" }; }
            break;
        case 'CHANGE_SPEED_RELATIVE':
             if (typeof message.change === 'number') { const currentSpeedVal = currentVideo ? currentVideo.playbackRate : lastSavedSpeed; updateSpeed(currentSpeedVal + message.change, true); responsePayload = { status: "Speed changed/saved", speed: lastSavedSpeed }; }
             else { responsePayload = { status: "Error: Invalid change value" }; }
            break;
        case 'GET_SPEED':
             const speedToSend = currentVideo ? currentVideo.playbackRate : lastSavedSpeed; responsePayload = { status: "Current speed", speed: speedToSend };
            break;
        case 'SHOW_CONTROLLER':
            isControllerVisible = true; chrome.storage.local.set({ isControllerVisible: true }); showController(); if(currentVideo) activateUIForVideo(currentVideo); responsePayload = { status: "Controller shown" };
            break;
        case 'HIDE_CONTROLLER':
             isControllerVisible = false; chrome.storage.local.set({ isControllerVisible: false }); hideController(); responsePayload = { status: "Controller hidden" };
            break;
        default:
            console.warn("StreamSpeed Content Script: Received unknown message type:", message.type);
            responsePayload = { status: `Unknown message type: ${message.type}` };
            break;
    }
    // It's generally safe to call sendResponse even if context might become invalid immediately after,
    // but checking runtime.id before complex async operations within the handler is wise.
    sendResponse(responsePayload);
    // Return true only if you have async operations *within this listener* that need to complete
    // before the channel potentially closes. In this case, we don't.
    return false;
  }

  // --- Initialization ---
  // Check context before initial setup
  if (chrome.runtime?.id) {
      speedControlContainer = createSpeedControlUI();
      setupVideoHoverListeners();
      const initialVideos = findVideos();
      // Logging done inside loadInitialSettings
  } else {
      console.error("StreamSpeed: Extension context invalid on script initialization. Cannot proceed.");
  }

})();

// Cleanup function in case the script context is invalidated later
window.addEventListener('unload', () => {
    console.log("StreamSpeed Companion: Unloading content script context.");
    // Remove listeners if they were added
    if (chrome.runtime?.onMessage?.hasListener(messageListener)) {
        chrome.runtime.onMessage.removeListener(messageListener);
    }
    if (chrome.storage?.onChanged?.hasListener) {
       // Need to store the listener function reference to remove it correctly
       // For simplicity now, we rely on the context check inside the listener
    }
    // Clean up UI? Maybe not necessary as the page might reload anyway.
    window.streamSpeedCompanionLoaded = false; // Allow re-injection if needed
});
