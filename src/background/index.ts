import type { Macro } from "../content/macro";

console.log("Background runing")

let tabs: { [key: number]: boolean } = {}
// Example function to attach to a tab (triggered by some user action, e.g., button click)
function attachToTab(tabId: number) {
  if (tabs[tabId]) {
    return;
  }
  const protocolVersion = '1.3'; // Use an appropriate protocol version

  Reflect.set(tabs, tabId, true);

  chrome.debugger.attach({ tabId: tabId }, protocolVersion, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      return;
    }
  });
  console.log("Attach Debugger: ", tabs);
}

function deatchToTab(tabId: number) {
  if (!tabs[tabId]) {
    return;
  }
  Reflect.deleteProperty(tabs, `${tabId}`);
  chrome.debugger.detach({ tabId });

  console.log("Detach Debugger: ", tabs);
}

function clickMouse(tabId: number, message: any) {
  const position = message.position;
  const button = message.button;
  console.log("Mouse click on: ", position)

  console.log("Mouse Pressed");
  chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", {
    type: 'mousePressed',
    x: position.x,
    y: position.y,
    clickCount: 1,
    button,
  }).then(() => {
      setTimeout(() => {
        console.log("Mouse Released")
        chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", {
          type: 'mouseReleased',
          clickCount: 1,
          x: position.x,
          y: position.y,
          button,
        })
      }, 150);
    });
}

chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  let tabId = sender?.tab?.id;

  if (!tabId) {
    return;
  }

  switch (message.type) {
    case "click":
      attachToTab(tabId);
      clickMouse(tabId, message);
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
});

chrome.alarms.create("keepAliveAlarm", { periodInMinutes: 0.40 });

// 2. Listen for the alarm to wake the worker up
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepAliveAlarm") {
    console.log("Alarm woke up the background worker!");
    // You don't actually have to put code here. Just the alarm firing 
    // is enough to boot the Service Worker back up.
  }
});

var macros: Array<Macro> = [];
var app: {
	onNewMacro: boolean,
	currentMacro: number,
} = {
	onNewMacro: false,
	currentMacro: -1,
};

chrome.storage.local.get(["macros", "app"], (result) => {
  if (result.macros) {
    //@ts-ignore
    macros = result.macros;
  }
  if (result.app) {
    //@ts-ignore
    app = result.app;
  }
});

function updateGlobal() {
	chrome.storage.local.set({ macros, app }, () => {
		console.log("Save data", macros, app);
	});
}

chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
	if (message.type == "popup.MacroEvent" && app.onNewMacro) {
		if (app.currentMacro >= 0) {
			macros[app.currentMacro].events.push(message.macro);
			updateGlobal();
		}
	}
});

