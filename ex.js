const origFetch = window.fetch;
var thinking = false;
let isBlock = false;
let reqHeaders = {};
let first = true;
let vConfirm = true;

// let missing = ["authorization", "oai-client-build-number", "oai-client-version","oai-device-id", "oai-language", "oai-session-id", "x-openai-target-path", "x-openai-target-route"];

console.log("Hey, its ex.js");
window.addEventListener("message", (event) => {
// important safety check
if (event.source !== window) return;

if (event.data.type === "FROM_PAGE") {
    // console.log("Got from page:", event.data.payload);
    let delivery = event.data.payload;
    let msg = delivery.msg;
    // console.log(msg);
    thinking = !thinking;
    setGlow(thinking); 
    // console.log("Thinking mode: " + thinking);
}
});

const style = document.createElement('style');
style.textContent = `
    .thinking-active {
        box-shadow: 0 0 9px 3px rgba(37, 99, 235, 0.8) !important;
    }

    .limitReached{
        box-shadow: 0 0 9px 3px rgba(227, 43, 43, 0.93) !important;
    }
`;
document.head.appendChild(style);

// If window.navgivation API doesn't exists, use fallback
if(window.navigation){
    window.navigation.addEventListener("navigate", (event) => {
        thinking = false;
        setGlow(false);
        // console.log('location changed!');
    });
    }
else{
    // Create modifications
    (() => {
        let oldPushState = history.pushState;
        history.pushState = function pushState() {
            let ret = oldPushState.apply(this, arguments);
            window.dispatchEvent(new Event('pushstate'));
            window.dispatchEvent(new Event('locationchange'));
            return ret;
        };

        let oldReplaceState = history.replaceState;
        history.replaceState = function replaceState() {
            let ret = oldReplaceState.apply(this, arguments);
            window.dispatchEvent(new Event('replacestate'));
            window.dispatchEvent(new Event('locationchange'));
            return ret;
        };

        window.addEventListener('popstate', () => {
            window.dispatchEvent(new Event('locationchange'));
        });
    })();

    window.addEventListener('locationchange', () => {
        thinking = false;
        setGlow(false);
        // console.log('location changed!');
    })

}


function setGlow(on) {
    const composer = document.querySelector('[data-composer-surface="true"]');
    if(!composer) return;
    
    composer.classList.remove('thinking-active');
    composer.classList.remove('limitReached');
    
    if(on && !isBlock) composer.classList.add('thinking-active');
    else if(on && isBlock) composer.classList.add('limitReached');
}


//  Every single fetch req is here.
// Type we care about:
// first fetch ever
// prompts
// Everything else? Send back
//  Looks like all requests to backend are with request object with Header instance for header and no options
// ALl prompt requests have resource string and options
//  We also care about an IN ping to https://chatgpt.com/backend-api/checkout_pricing_config/configs/IN cuz we check for version after that :3
// Its just a random request that happens to run towards the end of the page load so.... yeah

window.fetch = async function(...args){
    const [resource, options] = args;



    let convo = false;
    if(first)
    {
        // Extract headers

        // small check
        console.log("THIS IS V2");
        if(resource instanceof Request)
        {
            console.log(resource.url);
            resource.headers.forEach((value, key) => {
            console.log(key, ":", value);
            reqHeaders[key] = value;
            });

        first = false;
        // Run check:
        const result = origFetch.apply(this, args);
        result.then(() => checkBlock());
        return result;
        }
        else return origFetch.apply(this, args);
    }
    if(vConfirm)
    {
        let url;
        if(resource instanceof Request) url = resource.url;
        else url = resource;
        // console.log("The url: ", url);
        if(url.includes("https://chatgpt.com/backend-api/checkout_pricing_config/configs"))
        {
            vConfirm = false;
            console.log("RUNNING vConfirm! ")
            // {
            //     if(vCheck())
            //     {
            //         setupObserver(document.querySelector("#composer-submit-button").parentElement.parentElement);
            //     }
            //     else
            //     {
            //         setupObserver(document.querySelector('[class*="composer-submit-button"]').parentElement.parentElement.parentElement.parentElement);
            //     }
            // }
            setTimeout(temp, 2000);
        }
    }
    else if(resource instanceof Request)   return  origFetch.apply(this, args);
    else
    {
        let url = resource;
        convo = isConvo(url);
    }
    if(convo)
    {
    if(!options?.body) return origFetch.apply(this, args);
    const json = JSON.parse(options.body);
    if(thinking && !isBlock)
    {
        // ADD CHECK HERE
        json.system_hints = ["reason"];
        json.messages[0].metadata.system_hints = ["reason"];
    }
    else
    {
        if(isBlock) console.log("We've run out :(");
        json.system_hints = [];
        delete json.messages[0].metadata.system_hints; // Cuz the thinking mode might've been on during typing, and it needs to be switched off
    }

    options.body = JSON.stringify(json);

    const result = origFetch.apply(this, args);
    // result.then(() => checkBlock());
    return result;

    }
    return  origFetch.apply(this, args);
}


async function checkBlock()
{
    // Later: Add backend-anon for non logged in users
    const url = "https://chatgpt.com/backend-api/conversation/init";
    reqHeaders["x-openai-target-path"] = "/backend-api/conversation/init";
    reqHeaders["x-openai-target-route"] = "/backend-api/conversation/init";
    reqHeaders["content-type"] = "application/json";
    // console.log(reqHeaders);
    try{
        const response = await origFetch(url, {
            method: "POST",
            headers: reqHeaders,
            body: JSON.stringify({
                gizmo_id: null,
                requested_default_model: null,
                conversation_id: null,
                timezone_offset_min: new Date().getTimezoneOffset()
            }),
        });
        if(!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        const features = result.blocked_features;
        isBlock = features.some(f => f.name === "reason");
        setGlow(thinking);
        console.log("isBlock: ", isBlock);
    }catch (error){
        console.error(error.message);
    }
}

function isConvo(url)
{
    if((url.includes("/backend-api/f/conversation") || url.includes("/backend-anon/f/conversation")) && !url.includes("prepare")) return true;
    return false;
}


//  Mutation observer for checkBlock
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("composer-submit-button");
    console.log("btn:", btn);
    const observer = new MutationObserver(() => {
        if(!first && (btn.getAttribute("aria-label") === "Send prompt" || btn.getAttribute("aria-label") === "Start Voice") ) {
            checkBlock();
        }
    });
    observer.observe(btn, { attributeFilter: ["aria-label"] });
});


function vCheck()
{

    if(document.querySelector('[class*="composer-submit-button"]').ariaLabel == "Send prompt")
    {
        console.log("Its da normal version");
        return 1;
    }

    if(document.querySelector('[class*="composer-submit-button"]').ariaLabel == "Start Voice")
    {
        console.log("Its da voice version");
        return 0;
    }
}


let observer = null;

function setupObserver(target) {
    const observer = new MutationObserver((mutations) => {
        for(let mutation of mutations)
        {
            if(mutation.type == "attributes" && mutation.oldValue == "Stop streaming")
            {
                console.log("reply over");
                if(!first) checkBlock();
            }
            else if(mutation.type == "childList" && mutation.addedNodes.length > 0 && mutation.addedNodes[0].tagName === "SPAN")
            {
                console.log("Reply over");
                if(!first) checkBlock();
            }
        }
    });

    observer.observe(target, {
        subtree: true,
        attributes: true,
        childList: true,
        attributeOldValue: true
    });
}


function temp()
{
    let res = vCheck();
    if(res)
    {
        setupObserver(document.querySelector("#composer-submit-button").parentElement.parentElement);
    }
    else
    {
        setupObserver(document.querySelector('[class*="composer-submit-button"]').parentElement.parentElement.parentElement.parentElement);
    }
}