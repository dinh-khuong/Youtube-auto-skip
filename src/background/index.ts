console.log("Background runing")

let tabs: { [key: number]: boolean } = {}
// Example function to attach to a tab (triggered by some user action, e.g., button click)
function attachToTab(tabId: number) {
  const protocolVersion = '1.3'; // Use an appropriate protocol version

  Reflect.set(tabs, tabId, true);

  chrome.debugger.attach({ tabId: tabId }, protocolVersion, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      return;
    }
  });
}

function deatchToTab(tabId: number) {
  if (tabs[tabId]) {
    chrome.debugger.detach({ tabId });
  }
}

function clickMouse(tabId: number, message: any, button: string) {
  let position = message.position

  chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", {
    type: 'mousePressed',
    x: position.x,
    y: position.y,
    button,
  })
}

chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  let tabId = sender?.tab?.id;

  if (!tabId) {
    return;
  }

  switch (message.type) {
    case "click":
      clickMouse(tabId, message, "left");
    break;
    case "debug.attach":
      attachToTab(tabId);
    break;
    case  "debug.detach":
      deatchToTab(tabId);
    break;
  }
})

// Remember to add chrome.debugger.onDetach listener for cleanup
chrome.debugger.onDetach.addListener((source: chrome._debugger.Debuggee, reason: `${chrome._debugger.DetachReason}`) => {
  console.log(`Debugger detached from ${source.tabId} for reason: ${reason}`);
  Reflect.deleteProperty(tabs, `${source.tabId}`);
});

// chrome.tabs.onActivated.addListener((activeInfo: chrome.tabs.OnActivatedInfo) => {
//   console.log("on current Tab: ", activeInfo)
//   if (!tabs[activeInfo.tabId]) {
//     attachToTab(activeInfo.tabId);
//   }
// })



