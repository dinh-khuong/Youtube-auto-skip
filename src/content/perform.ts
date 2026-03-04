
// var debuggerAttached = false

import type { MacroEvent } from "./macro";

function getElement(event: MacroEvent) {
  if (event.type !== "element") {
    return;
  }

  if (event.id !== "") {
    return document.getElementById(event.id);
  } else {
    return document.getElementsByClassName(event.className).item(event.index);
  }
}

function clickElement({ event, button }: { event: MacroEvent, button: string }) {
  const element = getElement(event);
  if (!element) {
    return;
  }

  if (element) {
    chrome.runtime.sendMessage({
      type: "debug.attach",
    });

    const rect = element.getBoundingClientRect();
    chrome.runtime.sendMessage({
      type: "click",
      position: {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      },
      button,
    })
  } 

}

function checkQuerries(querries: Array<string>) {
  for (const query of querries) {
    const ele = document.querySelector(query);
    if (!ele) {
      return false;
    }
  }

  return true;
}

function dettachDebugger() {
  chrome.runtime.sendMessage({
    type: "debug.detach",
  });
}

export { clickElement, dettachDebugger, checkQuerries };

