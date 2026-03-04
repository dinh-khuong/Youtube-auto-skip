import { clickElement, checkQuerries, dettachDebugger } from './perform';
import { type MacroEvent, type Macro, type App } from './macro';

var macros: Array<Macro> = [];
var app: App = {
  createIdx: 0,
  onNewEvent: false,
  view: "macro-list",
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

var stopingId = -1;

function runMacro(macro: Macro) {
  function oneEvent(index: number) {
    if (macro.id === stopingId) {
      stopingId = -1;
      return;
    }

    if (index >= macro.events.length) {
      setTimeout(() => {
        oneEvent(0);
      }, 500);
      return;
    }

    const event = macro.events[index];
    clickElement({
      event, button: "left",
    });
    
    setTimeout(() => {
      oneEvent(index + 1);
    }, 500);
  }

  oneEvent(0);
}

macros.filter((ele) => ele.active).forEach(runMacro);

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
  } else if (message.type === "play.Macro") {
    runMacro(message.macro);
  } else if (message.type == "stop.Macro") {
    stopingId = message.macro.id;
  }
})

function addNewMacro(event: PointerEvent) {
  if (!event.target) {
    return;
  }
  const currentElement = event.target as HTMLElement;

  const eleId = currentElement.id;
  const eleClasses = currentElement.classList.toString();

  let macroEvent: MacroEvent = {
    type: "element",
    id: eleId,
    className: eleClasses,
    index: 0,
  };
  
  if (macroEvent.id === "") {
    const candidates = document.getElementsByClassName(eleClasses);
    for (const candidate of candidates) {
      if (candidate === currentElement) {
        break;
      }
      macroEvent.index += 1;
    }
  }

  boxElement.style.width = "0"
  boxElement.style.height = "0";
  boxElement.style.left =  "0";
  boxElement.style.top = "0";
  console.log("New event: ", macroEvent);

  chrome.runtime.sendMessage({
    type: "popup.MacroEvent",
    macro: macroEvent,
  })

  document.removeEventListener('mouseover', drawBoundingBox);
  document.removeEventListener('click', addNewMacro);
}


