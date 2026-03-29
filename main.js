var x = true;
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open-popup") {
            await chrome.action.openPopup();
  }
});

