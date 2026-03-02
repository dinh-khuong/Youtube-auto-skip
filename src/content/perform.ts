
var debuggerAttached = false

function clickElement({ query, button }: { query: string, button: string }) {
  const eleButton = document.querySelector(query) as HTMLButtonElement;

  if (eleButton && !debuggerAttached) {
    debuggerAttached = true;

    chrome.runtime.sendMessage({
      type: "debug.attach",
    });
    console.log("Debugger Attach")
  } 
  // else if (!eleButton && debuggerAttached) {
  // }

  if (eleButton) {
    const rect = eleButton.getBoundingClientRect();
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
  debuggerAttached = false

  chrome.runtime.sendMessage({
    type: "debug.detach",
  });
  console.log("Debugger detach");
}

export { clickElement, dettachDebugger, checkQuerries };

