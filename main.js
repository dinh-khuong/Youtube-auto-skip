console.log("extention loaded");
// ytp-skip-ad-button

function skipAdd() {
  const skipAddBtn = document.querySelector(".ytp-skip-ad-button");
  if (skipAddBtn) {
    skipAdd.click()
  }
}

const videoEl = document.querySelector(".video-stream.html5-main-video");
// console.log(videoEl)
// videoEl.addEventListener("play", () => {
//   console.log("play: Extention");
// })

videoEl.addEventListener("pause", () => {
  console.log("pause: Extention");
  skipAdd();
})

