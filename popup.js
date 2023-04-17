const gainSlider = document.getElementById("gain-slider");
const thresholdSlider = document.getElementById("threshold-slider");
const ratioSlider = document.getElementById("ratio-slider");
const toggleButton = document.getElementById("toggle-button");

const gainValueLabel = document.getElementById("gain-value");
const thresholdValueLabel = document.getElementById("threshold-value");
const ratioValueLabel = document.getElementById("ratio-value");

const leftChannelMeter = document.getElementById("left-channel-meter");
const rightChannelMeter = document.getElementById("right-channel-meter");

browser.tabs.executeScript({
  code: "typeof window.__audioboostInjected !== 'undefined'",
}).then(([isInjected]) => {
  if (!isInjected) {
    browser.tabs.executeScript({ file: "audioboost.js" });
  }
});

updateStatusIndicator(false);


function drawMeter(ctx, value, thresholdValue) {
  const marks = [
    { db: 0, pos: 1 },
    { db: -6, pos: 0.75 },
    { db: -12, pos: 0.5 },
    { db: -24, pos: 0.25 },
  ];

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw value marks
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 1;
  for (const mark of marks) {
    const x = ctx.canvas.width * mark.pos;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.stroke();
  }

  if (value < 0.7) {
    ctx.fillStyle = "green";
  } else if (value < 0.95) {
    ctx.fillStyle = "orange";
  } else {
    ctx.fillStyle = "red";
  }

  ctx.fillRect(0, 0, ctx.canvas.width * value, ctx.canvas.height);

  // Draw threshold line
  const thresholdPos = 1 - (thresholdValue / -100);
  const thresholdX = ctx.canvas.width * thresholdPos;
  ctx.strokeStyle = "orange";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(thresholdX, 0);
  ctx.lineTo(thresholdX, ctx.canvas.height);
  ctx.stroke();
}

browser.runtime.onMessage.addListener((message) => {
  if (message.type === "updateVUMeters") {
    const leftCtx = leftChannelMeter.getContext("2d");
    const rightCtx = rightChannelMeter.getContext("2d");
    const thresholdValue = parseFloat(thresholdSlider.value);
    drawMeter(leftCtx, message.leftValue, thresholdValue);
    drawMeter(rightCtx, message.rightValue, thresholdValue);
  }
});

// Update the gain value on slider change
// Update values on slider change

gainSlider.addEventListener("input", updateValues);
thresholdSlider.addEventListener("input", () => {
  updateValues();
  const leftCtx = leftChannelMeter.getContext("2d");
  const rightCtx = rightChannelMeter.getContext("2d");
  const thresholdValue = parseFloat(thresholdSlider.value);
  drawMeter(leftCtx, leftCtx.canvas.width / 200, thresholdValue);
  drawMeter(rightCtx, rightCtx.canvas.width / 200, thresholdValue);
});
ratioSlider.addEventListener("input", updateValues);

// Load the stored gain value
browser.storage.local.get(["gainValue", "thresholdValue", "ratioValue", "enabled"]).then((result) => {
    gainSlider.value = result.gainValue || 7;
    thresholdSlider.value = result.thresholdValue || -20;
    ratioSlider.value = result.ratioValue || 6;
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
    const gainValue = result.gainValue || 7;
    const thresholdValue = result.thresholdValue || -20;
    const ratioValue = result.ratioValue || 6;

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