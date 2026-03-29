const script = document.createElement('script');
script.src = chrome.runtime.getURL('ex.js');
document.documentElement.appendChild(script);
let target = 2;
let f = localStorage.getItem("firstKey");
if(f === null)
{
    // Set defaults:
    localStorage.setItem("firstKey", "control");
    localStorage.setItem("secondKey", "q");
    target = 2;
}
console.log("Hi, I'm content.js")
let t = localStorage.getItem("thirdKey");

let keys = {
    "firstKey": localStorage.getItem("firstKey"),
    "secondKey": localStorage.getItem("secondKey"),
    "thirdKey": null
}
if (t) {
    keys.thirdKey = t;
    target = 3;
}
console.log("Keys: ", keys);
// Update to wrapper:
let pressed = new Set();
let triggered = false;
document.addEventListener("keydown", function(e){
    console.log(keys);
    console.log("Pressed ", pressed);
    if(hasVal(e.key.toLowerCase())) pressed.add(e.key.toLowerCase());
    console.log("Pressed Keys: ", pressed);

    if(pressed.size === target && !triggered)
    {
        triggered = true;
        e.preventDefault();
        window.postMessage({
        type: "FROM_PAGE",
        payload: { msg: "keyPressed"}
        }, "*");
    }
});

document.addEventListener("keyup", (e) => {
  pressed.delete(e.key.toLowerCase());

    if (pressed.size < target) {
        triggered = false;
    }
});

console.log("test2")

// Receieving keybind updates
chrome.runtime.onConnect.addListener((port) => {
//   if (port.name !== "popup") return;
  if(port.name == "popup")
    {
        chrome.runtime.sendMessage({ status: "connected" });
        port.onMessage.addListener((msg) => {
            let arg = msg.arg;
            let key = msg.key;
            console.log("Got from popup:", msg.arg, msg.key);
            localStorage.setItem(arg, key);
            keys[arg] = key;
            if(arg == "thirdKey") target = 3;
        });
    }
  else if(port.name == "reset")
  {
        chrome.runtime.sendMessage({ status: "connected" });
        port.onMessage.addListener((msg) => {
            console.log("Got message");
        localStorage.setItem("firstKey", "control");
        localStorage.setItem("secondKey", "q");
        localStorage.removeItem("thirdKey");
        keys = {
            "firstKey": localStorage.getItem("firstKey"),
            "secondKey": localStorage.getItem("secondKey"),
            "thirdKey": null
        }
        target = 2;
        });
  }
  else return;
});

function hasVal(value)
{
    return Object.values(keys).includes(value);
}