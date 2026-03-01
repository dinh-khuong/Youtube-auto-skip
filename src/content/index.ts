
console.log("extention loaded");
// ytp-skip-ad-button


setInterval(() => {
  const skipAddBtn = document.querySelector(".ytp-skip-ad-button");
  if (skipAddBtn) {
    console.log("Debugger Attach")
    chrome.runtime.sendMessage({
      type: "debug.attach",
    })
  } else {
    console.log("Debugger detach")
    chrome.runtime.sendMessage({
      type: "debug.detach",
    })
  }
}, 500)

function skipAdd() {
  const skipAddBtn = document.querySelector(".ytp-skip-ad-button") as HTMLButtonElement;
  // const skipAddBtn = document.querySelector("#logo") as HTMLLinkElement;

  if (skipAddBtn) {
    const rect = skipAddBtn.getBoundingClientRect();

    chrome.runtime.sendMessage({
      type: "click",
      position: {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
    }})
    // skipAddBtn.click()
  }
}

const videoEl = document.querySelector(".video-stream.html5-main-video") as HTMLVideoElement;
// videoEl.addEventListener("play", () => {
//   console.log("play: Extention");
// })

videoEl.addEventListener("pause", () => {
  console.log("pause: Extention");
  skipAdd();
})

