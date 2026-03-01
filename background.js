
// chrome.commands.onCommand.addListener((command) => {
//   if (command === "headphone-click") {
//     console.log("Headphone button intercepted by extension!");
//
//     // Find all YouTube tabs
//     chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
//       // Send a message to each YouTube tab
//       for (let tab of tabs) {
//         chrome.tabs.sendMessage(tab.id, { action: "headphone_pressed" });
//       }
//     });
//   }
// });

