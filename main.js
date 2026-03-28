var x = true;
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open-popup") {
            await chrome.action.openPopup();
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.status === "connected") {
    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "green" });
  }
});
