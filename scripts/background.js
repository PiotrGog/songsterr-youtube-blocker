const songsterr_url = "https://www.songsterr.com"

chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "OFF",
    });
});

let observer = null

let registerObserver = async () => {
    const callback = (mutationList, observer) => {
        let element = document.getElementById("cancelAudio")
        if (element !== null) {
            element.click()
            console.log("Disabling songsterr popup");
        }
    };
    observer = new MutationObserver(callback)
    const targetNode = document.getElementById("root")
    const config = { attributes: true, childList: true, subtree: true }
    observer.observe(targetNode, config)
}

let unregisterObserver = async () => {
    observer.disconnect()
    observer = null
}

chrome.action.onClicked.addListener(async (tab) => {
    if (tab.url.startsWith(songsterr_url)) {
        const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON'

        await chrome.action.setBadgeText({
            tabId: tab.id,
            text: nextState,
        });
        if (nextState === "ON") {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: registerObserver,
            }).then(() => {
                console.log("Observer registered")
            });
        } else if (nextState === "OFF") {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: unregisterObserver,
            }).then(() => {
                console.log("Observer unregistered")
            });
        }
    }
});
