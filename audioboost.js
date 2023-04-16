var browser = browser || chrome;
var enabled = false;

function setGain(gainValue, thresholdValue, ratioValue) {
  if (!window.__ac) {
    window.__ac = new AudioContext();
  }
  var comp = new DynamicsCompressorNode(window.__ac, { attack: 0.1 release: 0.5 ratio: ratioValue, threshold: thresholdValue });
  var gain = new GainNode(window.__ac, { gain: gainValue });
  if (!window.__source) {
    var element = document.querySelector("video");
    window.__source = new MediaElementAudioSourceNode(window.__ac, { mediaElement: element });
  } else {
    window.__source.disconnect();
  }
  window.__source.connect(gain).connect(comp).connect(window.__ac.destination);
  undefined;
}

function setValues({ gainValue, thresholdValue, ratioValue }) {
  setGain(gainValue, thresholdValue, ratioValue);
}

function toggleEnabled(newEnabled, { gainValue, thresholdValue, ratioValue }) {
  if (newEnabled) {
    setGain(gainValue, thresholdValue, ratioValue);
  } else {
    window.__source.disconnect();
    window.__source.connect(window.__ac.destination);
  }
  enabled = newEnabled;
}

browser.storage.local.get("enabled").then((result) => {
  enabled = result.enabled || false;
});

function doit(e) {
  if (enabled) {
    browser.browserAction.setIcon({
      path: {
        48: "icons/audioboost-disabled.png",
        96: "icons/audioboost-disabled.png"
      }
    });
    browser.tabs.executeScript({
      code: `
        window.__source.disconnect();
        window.__source.connect(window.__ac.destination);
        undefined;
      `
    });
  } else {
    browser.browserAction.setIcon({
      path: {
        48: "icons/audioboost-enabled.png",
        96: "icons/audioboost-enabled.png"
      }
    });
    browser.storage.local.get(["gainValue", "thresholdValue", "ratioValue"]).then((result) => {
      const gainValue = result.gainValue || 10;
      const thresholdValue = result.thresholdValue || -50;
      const ratioValue = result.ratioValue || 10;
      setGain(gainValue, thresholdValue, ratioValue);
    });
  }
  enabled = !enabled;
}
