const origFetch = window.fetch;
var thinking = false;

document.addEventListener("keydown", function(e){
    if(e.ctrlKey && e.key == 'q')
    {
        e.preventDefault();
        thinking = !thinking;
        setGlow(thinking);
        console.log("Thinking mode: " + thinking);
    }
});

const style = document.createElement('style');
style.textContent = `
    .thinking-active {
        box-shadow: 0 0 9px 3px rgba(37, 99, 235, 0.8) !important;
    }
`;
document.head.appendChild(style);

if(window.navigation){
    window.navigation.addEventListener("navigate", (event) => {
        thinking = false;
        setGlow(false);
        console.log('location changed!');
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
        console.log('location changed!');
    })

}


function setGlow(on) {
    const composer = document.querySelector('[data-composer-surface="true"]');
    if(!composer) return;
    if(on) {
        composer.classList.add('thinking-active');
    } else {
        composer.classList.remove('thinking-active');
    }
}

window.fetch = function(...args){
    const [resource, options] = args;

    if(typeof resource == "string" && resource.includes("backend-api") && resource.includes("conversation"))
    // Has both resource and option
    {
    // console.log("The URL:");
    // console.log(resource);
    console.log("The payload:");
    // console.log(options);
    const json = JSON.parse(options.body);
    console.log(JSON.stringify(json));
    if(thinking)
    {
        json.system_hints = ["reason"];
        json.messages[0].metadata.system_hints = ["reason"];
    }
    else
    {
        json.system_hints = [];
        delete json.messages[0].metadata.system_hints; // Cuz the thinking mode might've been on during typing, and it needs to be switched off
    }
    console.log("Modified payload:")
    console.log(JSON.stringify(json));
    options.body = JSON.stringify(json);
    }

    return origFetch.apply(this, args);
}