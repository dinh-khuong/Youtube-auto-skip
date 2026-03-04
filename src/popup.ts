import type { Macro, MacroEvent } from "./content/macro";

var macros: Array<Macro> = [];
var app: {
	onNewMacro: boolean,
	currentMacro: number,
} = {
	onNewMacro: false,
	currentMacro: -1,
};


function updateGlobal() {
	chrome.storage.local.set({ macros, app }, () => {
		console.log("Save data", macros, app);
	});
}

document.addEventListener("DOMContentLoaded", () => {
	console.log("DOM Loaded");
	chrome.storage.local.get(["macros", "app"], (result) => {
		if (result.macros) {
			//@ts-ignore
			macros = result.macros;
		}
		if (result.app) {
			//@ts-ignore
			app = result.app;
		}

		console.log(macros);

		if (app.onNewMacro) {
			createMacro();
		} else {
			macroList();
		}
	});


	document.getElementById("macro-item").addEventListener("click", macroList);
	document.getElementById("create-macro-item").addEventListener("click", createMacro);

})

function macroList() {
	const element = document.getElementById("main-content");

	element.innerHTML = `
<div id="macro-list" class="column-list">
</div>
`;

	const macroList = document.getElementById("macro-list");
	for (const macro of macros) {
		addMacroItem(macroList, macro);
	}
}

function addMacroItem(macrosList: HTMLElement, macro: Macro) {
	let newItem = document.createElement("div");
	newItem.classList.add("macro-item");
	newItem.innerHTML = `
<input value="${macro.name}"></input>
`;
	macrosList.appendChild(newItem);
}

function addEventItem(eventList: HTMLElement, event: MacroEvent) {
	let newItem = document.createElement("div");
	newItem.classList.add("macro-item");
	newItem.innerHTML = `
<div>${event.type}</div>
`;
	eventList.appendChild(newItem);
}


function createMacro() {
	const element = document.getElementById("main-content");
	element.innerHTML = `
<div class="create-macro">
	<div class="create-macro-btn-holder">
		${app.onNewMacro ?
		`<button id="pickup-btn">Pickup</button><button id="stop-btn">Stop</button>` :
		`<button id="new-macro">New Macro</button>`
		}
	</div>
	<div id="events-list" class="column-list">
	</div>
</div>
`;
	if (!app.onNewMacro) {
		document.getElementById("new-macro").addEventListener('click', () => {
			macros.push({
				name: "new macro",
				events: [],
			});
			app.onNewMacro = true;
			app.currentMacro += 1;
			createMacro();
			updateGlobal();
		});
	} else {
		if (app.currentMacro >= 0) {
			const eventsList = document.getElementById("events-list");
			for (const event of macros[app.currentMacro].events) {
				addEventItem(eventsList, event);
			}
		}
		document.getElementById("pickup-btn").addEventListener('click', () => {
			chrome.tabs.query({ active: true, currentWindow: true },
				(tabs) => {
					const currentTab = tabs[0];
					if (!currentTab.id) {
						return;
					}
					chrome.tabs.sendMessage(currentTab.id, {
						type: "element.Highting",
					});
				}
			);

		});

		document.getElementById("stop-btn").addEventListener('click', () => {
			app.onNewMacro = false;
			createMacro();
			updateGlobal();
		});
	}
}

