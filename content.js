const script = document.createElement('script');
script.src = chrome.runtime.getURL('ex.js');
document.documentElement.appendChild(script);