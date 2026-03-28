document.addEventListener("DOMContentLoaded", () => {
    // localStorage.setItem("firstKey", "Control");
    // localStorage.setItem("secondKey", "q");
    // localStorage.setItem("thirdKey", false);

    const buttons = document.querySelectorAll(".key, .empty");


    // Loading Buttons with correct key from LocalStorage
    for(let i = 0; i < 3; i++)
    {
      let arg = buttons[i].dataset.id + "Key";
      console.log(arg);
      let curr = localStorage.getItem(arg);
      console.log(curr)
      console.log(curr, typeof curr);
      if(curr === "false") 
        {
          buttons[i].className = "empty"
          console.log("Empty key not taken")
        }
      else
      {
        buttons[i].innerHTML = curr;
        buttons[i].className = "key";
      }
    }
    console.log(buttons);
    console.log("hi");

    let active = buttons[0];
    buttons.forEach((element) => {
        element.addEventListener('click', focus);
        // element.addEventListener("keydown", changeKey);

    });



  function focus(event)
  {
        const btn = event.target;
        active = btn;
        btn.className = "empty";
  }

  // function changeKey(event)
  // {
  //   const key = event.key.toLowerCase();
  //   let arg = active.dataset.id + "Key";
  //   console.log(arg);
  //   localStorage.setItem(arg, key);
  //   console.log("set ", arg, "to ", key, "successfully");
  //   active.innerHTML = key;
  //   active.className = "key";
  // }

  
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) return;

    const port = chrome.tabs.connect(tab.id, { name: "popup" });
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

    buttons.forEach((element) => {
        element.addEventListener('keydown', sendUpdate);
    });

  });
});


