window.onload = async () => {
  const isEpisode = document.querySelector(".myWrapper") !== null;
  const isIframe = document.querySelector("video") !== null;

  await initStorage();

  if (isEpisode) await episode();
  if (isIframe) await iframe();
};

async function updateHistory(id, info) {
  const history = await historyStorage.get();
  const itemIdx = history.findIndex((item) => item.id === id);

  if (itemIdx === -1) {
    const newItem = { id, ...info };
    history.push(newItem);
  } else {
    const item = history[itemIdx];
    const mergedItem = { ...item, id, ...info };
    history[itemIdx] = mergedItem;
  }

  historyStorage.set(history);
}

async function episode() {
  const title = document.title;
  const url = document.URL;
  const id = document.querySelector("option").value.split("=").at(-1);

  await updateHistory(id, { title, url });

  window.addEventListener("message", (e) => {
    if (e.data === "next") document.querySelector(".nav-next > a").click();
  });
}

async function iframe() {
  const settings = await settingsStorage.get();
  const history = await historyStorage.get();
  const id = document.URL.split("=").at(-1);
  const videoElem = document.querySelector("video");

  const item = history.find((i) => i.id === id);
  let lastTime = 0;

  videoElem.oncanplay = () => {
    console.log("hi");
    if (settings.auto || settings.autoPlay) videoElem.play();
  }

  videoElem.onloadeddata = () => {
    console.log("hi");
    if (settings.auto || settings.autoPlay) videoElem.play();
    if (item !== undefined && settings.save) {
      videoElem.currentTime = item.time ? item.time : 0;
    }
  };

  videoElem.ontimeupdate = (e) => {
    const currentTime = Math.floor(e.target.currentTime);

    if (Math.abs(lastTime - currentTime) >= 5) {
      updateHistory(id, { time: currentTime });
      lastTime = currentTime;
    }
  };

  videoElem.onended = () => {
    updateHistory(id, { ended: true });
    if (settings.auto) {
      parent.postMessage("next", "*");
    }
  };
}
