const gainSlider = document.getElementById("gain-slider");
const thresholdSlider = document.getElementById("threshold-slider");
const ratioSlider = document.getElementById("ratio-slider");
const toggleButton = document.getElementById("toggle-button");

const gainValueLabel = document.getElementById("gain-value");
const thresholdValueLabel = document.getElementById("threshold-value");
const ratioValueLabel = document.getElementById("ratio-value");

const leftChannelMeter = document.getElementById("left-channel-meter");
const rightChannelMeter = document.getElementById("right-channel-meter");

updateStatusIndicator(false);

function drawMeter(ctx, value) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (value < 0.7) {
    ctx.fillStyle = "green";
  } else if (value < 0.95) {
    ctx.fillStyle = "orange";
  } else {
    ctx.fillStyle = "red";
  }

  ctx.fillRect(0, 0, ctx.canvas.width * value, ctx.canvas.height);
}

browser.runtime.onMessage.addListener((message) => {
  if (message.type === "updateVUMeters") {
    const leftCtx = leftChannelMeter.getContext("2d");
    const rightCtx = rightChannelMeter.getContext("2d");
    drawMeter(leftCtx, message.leftValue);
    drawMeter(rightCtx, message.rightValue);
  }
});


// Load the stored gain value
browser.storage.local.get(["gainValue", "thresholdValue", "ratioValue", "enabled"]).then((result) => {
    gainSlider.value = result.gainValue || 10;
    thresholdSlider.value = result.thresholdValue || -50;
    ratioSlider.value = result.ratioValue || 10;
    toggleButton.textContent = result.enabled ? "Disable" : "Enable";

    // Update value labels
    gainValueLabel.textContent = gainSlider.value;
    thresholdValueLabel.textContent = thresholdSlider.value;
    ratioValueLabel.textContent = ratioSlider.value;
  });

function updateValues() {
    const gainValue = parseFloat(gainSlider.value);
    const thresholdValue = parseFloat(thresholdSlider.value);
    const ratioValue = parseFloat(ratioSlider.value);

    // Update value labels
    gainValueLabel.textContent = gainValue;
    thresholdValueLabel.textContent = thresholdValue;
    ratioValueLabel.textContent = ratioValue;

    browser.storage.local.set({ gainValue, thresholdValue, ratioValue });

// Update values in the content script
    browser.tabs.executeScript({
        code: `
        setValues({ gainValue: ${gainValue}, thresholdValue: ${thresholdValue}, ratioValue: ${ratioValue} });
        undefined;
        `,
    });
}

function updateStatusIndicator(isEnabled) {
  const statusIndicator = document.getElementById("status-indicator");
  statusIndicator.style.backgroundColor = isEnabled ? "green" : "red";
}

// Update the gain value on slider change
// Update values on slider change
gainSlider.addEventListener("input", updateValues);
thresholdSlider.addEventListener("input", updateValues);
ratioSlider.addEventListener("input", updateValues);

// Toggle the enabled/disabled state
toggleButton.addEventListener("click", () => {
  browser.storage.local.get(["enabled", "gainValue", "thresholdValue", "ratioValue"]).then((result) => {
    const enabled = !result.enabled;
    const gainValue = result.gainValue || 10;
    const thresholdValue = result.thresholdValue || -50;
    const ratioValue = result.ratioValue || 10;

    toggleButton.textContent = enabled ? "Disable" : "Enable";
    updateStatusIndicator(enabled); // Add this line to update the status indicator
    browser.storage.local.set({ enabled });

    // Update the toolbar icon
    browser.browserAction.setIcon({
      path: {
        48: enabled ? "icons/audioboost-enabled.png" : "icons/audioboost-disabled.png",
        96: enabled ? "icons/audioboost-enabled.png" : "icons/audioboost-disabled.png",
      },
    });

    // Update enabled state in the content script
    browser.tabs.executeScript({
      code: `
        toggleEnabled(${enabled}, {gainValue: ${gainValue}, thresholdValue: ${thresholdValue}, ratioValue: ${ratioValue}});
        undefined;
      `,
    });
  });
});