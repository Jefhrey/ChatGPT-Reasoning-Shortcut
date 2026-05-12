# ChatGPT-Reasoning-Shortcut

> [!WARNING]  This extension is now obsolete. You can natively enable thinking via the ctrl+shift+M shortcut
<p align="center">
  <img alt="thinkle-icon" width="250px" src="thinkle128.png">
</p>

<table align="center">
    <tr>
      <th align="center">&nbsp;Install on <a href="https://microsoftedge.microsoft.com/addons/detail/thinkle/iaoneianckmpfdlojdbfhnifikabmmpm">Edge</a>&nbsp;</th>
</table>

Isn't it annoying when you have to click 2 buttons to enable thinking mode for every single prompt? Thinkle fixes this issue by allowing you to toggle the thinking/reasoning mode of ChatGPT with a keyboard shortcut. The default shortcut is  `ctrl + Q` but this can be changed any combination of two or three keys via the extension popup.<br>

When thinking mode is active, the textbox has a blue glow around it. The glow turns red when the user runs out of reasoning prompts, and all following prompts will be sent normally, regardless of whether the thinking toggle is on or off.<br>

<!-- insert demo -->

So far the extension has been tested on the free tier and Go tier of ChatGPT. As of now, it sadly does not work if the user is not logged in, but that feature can be implemented if there is enough demand for it. If you run into any issues, reload the page, wait until it is fully loaded and try again. If that does not work, reset the shortcut to default using the <img alt="reset-button" src = "reset2.png" height = 18px width = 18px> button in the popup and rebind your keys.

## How does it works?

Well since ChatGPT doesn't really provide you with any documentation about how its internals work, most of this was achieved from snooping at all the requests coming in and out through the devTools networks tab. It was honestly quite fun, going through all the requests and seeing which ones had the info I needed and slowly piecing it all together.

I intially thought of implementing this via simulating actual user clicks, so the program would click the plus icon, and then click on the "Thinking" button to enable it. But this seemed pretty hacky and also, its kinda hard to pass off your program generated clicks as user generated clicks. So Then I went snooping through the requests and found out that every prompt sends a request to an endpoint with /conversation in it, and when thinking is enabled, it add an item in the system_hints array called reasoning. So all I had to do was to build a wrapper which intercepted all fetch requests, filter out the ones with the /conversation in them, edit the payload and send it back on its way.

Now, finding out when the limit was reached was a little tricky, but I discovered that every time the page is loaded, it sends a list of blocked features, and if reasoning is included in that list, then it is blocked. It was a little tricky sending a fake request to that endpoint without reloading the page after every prompt to check if the limit was reached (my intial attempts ended up with the server deying my requests due to a few missing authentication headers.), but I managed to do it after looking through the request over and over again and copying every single little detail.

This did come with its own set of problems though. To ping the endpoint to check for blocked features after every prompt, I'd need to detect the end of a prompt and since all prompts take different times to finish executing, this is no easy task. But after a lot of tinkering around, I came up with a hacky but functional way to go about it. It basically uses a mutationObserver to check if the button which you click to send the prompt has changed or not. When you hit the button, it changes to a interrupt button while the message is being typed out by chatGPT and once the message is finished, it comes back to its original state. This again made me pour through the html and css for the page to find out which button to track and what not, but yeah, it works now.

ChatGPT has changed how it works though, and none of this info is true now. It's kinda weird rn.

## What I learned

Building this taught me a bunch of stuff I wouldn't have picked up otherwise - reverse engineering undocumented APIs by reading network traffic, intercepting and modifying fetch requests at runtime (monkeypatching is the techincally term for it, I believe), and using MutationObserver to track DOM changes in a React app. It also gave me a pretty good look at how ChatGPT works under the hood, which was cool in its own right. Plus I finally understand the network tab in the devTools now, which kinda makes me feel like a hacker.
<!-- Things to add:
1. What the product does
2. How it works
3. Any bugs and how to deal with them
4. Demo video/gif
 -->