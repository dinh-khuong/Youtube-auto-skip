import { clickElement, checkQuerries, dettachDebugger } from './perform';
import type { MacroEvent } from './macro';

setInterval(() => {
  clickElement({
    query: ".ytp-skip-ad-button",
    button: "left",
  });

  if (!checkQuerries([ ".ytp-skip-ad-button" ])) {
    dettachDebugger();
  }
}, 500)

const boxElement = document.createElement("div");
boxElement.id = "auto-click-box";
boxElement.style.position = "fixed";
boxElement.style.zIndex = "1000";
boxElement.style.border = "2px #26bbd9 solid";
boxElement.style.backgroundColor = 'transparent';
boxElement.style.pointerEvents = "none";

document.body.appendChild(boxElement);

function drawBoundingBox(event: Event) {
  if (!event.target) {
    return;
  }
  const currentElement = event.target as HTMLElement;

  const rectElement = currentElement.getBoundingClientRect();
  boxElement.style.width = `${rectElement.width}px`;
  boxElement.style.height = `${rectElement.height}px`;

  boxElement.style.left =  `${rectElement.x}px`;
  boxElement.style.top = `${rectElement.y}px`;
}

chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.type === "pickup.Element") {
    document.addEventListener('mouseover', drawBoundingBox, { passive: true });
    document.addEventListener('click', addNewMacro);
  }
})

function addNewMacro(event: PointerEvent) {
  if (!event.target) {
    return;
  }
  const currentElement = event.target as HTMLElement;

  const eleId = currentElement.id;
  const eleClasses = currentElement.classList.toString();

  let macro: MacroEvent = {
    type: "element",
    id: eleId,
    className: eleClasses,
    index: 0,
  };
  
  if (macro.id === "") {
    const candidates = document.getElementsByClassName(eleClasses);
    for (const candidate of candidates) {
      if (candidate === currentElement) {
        break;
      }
      macro.index += 1;
    }
  }

  boxElement.style.width = "0"
  boxElement.style.height = "0";
  boxElement.style.left =  "0";
  boxElement.style.top = "0";
  console.log("New event: ", macro);

  chrome.runtime.sendMessage({
    type: "popup.MacroEvent",
    macro,
  })

  document.removeEventListener('mouseover', drawBoundingBox);
  document.removeEventListener('click', addNewMacro);
}


