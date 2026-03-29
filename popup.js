document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".key, .empty");


    // Loading Buttons with correct key from LocalStorage
    function loadBtn()
    {
      for(let i = 0; i < 3; i++)
      {
        let arg = buttons[i].dataset.id + "Key";
        console.log(arg);
        let curr = localStorage.getItem(arg);
        console.log(curr)
        console.log(curr, typeof curr);
        if(curr === null) 
          {
            buttons[i].className = "empty";
            console.log("Empty key not taken");
          }
        else
        {
          buttons[i].innerHTML = curr;
          buttons[i].className = "key";
        }
      }
    }
    loadBtn();
    console.log(buttons);
    console.log("hi");

    let active = buttons[0];
    buttons.forEach((element) => {
        element.addEventListener('click', focus);
    });



  function focus(event)
  {
        const btn = event.target;
        active = btn;
        btn.className = "empty";
  }

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) return;

    const port = chrome.tabs.connect(tab.id, { name: "popup" });
    const resetPort = chrome.tabs.connect(tab.id, { name: "reset" });
    function sendUpdate(event)
    {


      let btn = event.target;
      // let arg = btn.dataset.id + "Key";
      let arg = active.dataset.id + "Key"
      console.log(arg);
      localStorage.setItem(arg, event.key.toLowerCase());
      console.log("set ", arg, "to ", event.key.toLowerCase(), "successfully");
      active.innerHTML = event.key.toLowerCase();
      active.className = "key";

      console.log("The key: ", event.key.toLowerCase());
      port.postMessage({ arg: arg, key: event.key.toLowerCase()});
      console.log("Message sent");
    }

    function reset()
    {
        localStorage.setItem("firstKey", "control");
        localStorage.setItem("secondKey", "q");
        localStorage.removeItem("thirdKey");
        loadBtn();

        resetPort.postMessage({msg: "Reset"});
        console.log("Reset message sent");
    }

    buttons.forEach((element) => {
        element.addEventListener('keydown', sendUpdate);
    });

    document.querySelector(".reset").addEventListener('click', reset);

  });
});


