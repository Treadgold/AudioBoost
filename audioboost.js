window.__audioboostInjected = true;
let storedValues = { gainValue: 1, thresholdValue: -50, ratioValue: 10 };
var browser = browser || chrome;
var enabled = false;
let analyser;
let analyserGain;


function updateVUMeters(leftValue, rightValue) {
  browser.runtime.sendMessage({ type: "updateVUMeters", leftValue, rightValue });
}

function initAnalyser() {
  if (!window.__ac) {
    window.__ac = new AudioContext();
  }
  analyser = new AnalyserNode(window.__ac, { fftSize: 32, minDecibels: -90, maxDecibels: -10 });
  analyserGain = new GainNode(window.__ac, { gain: 1 });
  if (!window.__source) {
    var element = document.querySelector("video");
    window.__source = new MediaElementAudioSourceNode(window.__ac, { mediaElement: element });
  }
  window.__source.connect(analyserGain).connect(analyser);
}

function drawVUMeter() {
  function updateMeter() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const leftValue = dataArray[0] / 255;
    const rightValue = dataArray[1] / 255;

    updateVUMeters(leftValue, rightValue);

    requestAnimationFrame(updateMeter);
  }

  updateMeter();
}

initAnalyser();
toggleEnabled(false, { gainValue: 1, thresholdValue: -50, ratioValue: 10 });
drawVUMeter();

function setGain(gainValue, thresholdValue, ratioValue) {
  if (!window.__ac) {
    window.__ac = new AudioContext();
  }
  var comp = new DynamicsCompressorNode(window.__ac, { knee: 10, attack: 0.01, release: 0.15, ratio: ratioValue, threshold: thresholdValue });
  var gain = new GainNode(window.__ac, { gain: gainValue });
  gain.gain.linearRampToValueAtTime(gainValue, window.__ac.currentTime + 0.3); // Add this line to smoothly change gain value
  if (!window.__source) {
    var element = document.querySelector("video");
    window.__source = new MediaElementAudioSourceNode(window.__ac, { mediaElement: element });
  }
  return {
    gainNode: gain,
    compressorNode: comp
  };
}

function setValues({ gainValue, thresholdValue, ratioValue }) {
  const nodes = setGain(gainValue, thresholdValue, ratioValue);
  window.__source.disconnect();
  window.__source.connect(nodes.gainNode).connect(nodes.compressorNode).connect(window.__ac.destination);
  window.__source.connect(analyserGain);
}

function toggleEnabled(newEnabled, { gainValue, thresholdValue, ratioValue }) {
  if (newEnabled) {
    const nodes = setGain(gainValue, thresholdValue, ratioValue);
    window.__source.disconnect();
    window.__source.connect(nodes.gainNode).connect(nodes.compressorNode).connect(window.__ac.destination);
  } else {
    storedValues = { gainValue, thresholdValue, ratioValue };
    window.__source.disconnect();
    window.__source.connect(window.__ac.destination);
  }
  // Keep the analyser connected
  window.__source.connect(analyserGain).connect(analyser);
  enabled = newEnabled;
}

function toggleEnabled(newEnabled, { gainValue, thresholdValue, ratioValue }) {
  if (newEnabled) {
    const nodes = setGain(gainValue, thresholdValue, ratioValue);
    window.__source.disconnect();
    window.__source.connect(nodes.gainNode).connect(nodes.compressorNode).connect(window.__ac.destination);
  } else {
    window.__source.disconnect();
    window.__source.connect(window.__ac.destination);
  }
  // Keep the analyser connected
  window.__source.connect(analyserGain).connect(analyser);
  enabled = newEnabled;
}




// Load the stored gain value
browser.storage.local.get(["gainValue", "thresholdValue", "ratioValue", "enabled"]).then((result) => {
  const gainValue = result.gainValue || 10;
  const thresholdValue = result.thresholdValue || -50;
  const ratioValue = result.ratioValue || 10;
  enabled = result.enabled || false;

  if (enabled) {
      setGain(gainValue, thresholdValue, ratioValue);
  }
});