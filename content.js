window.onload = async () => {
  const isEpisode = document.querySelector(".myWrapper") !== null;
  const isIframe = document.querySelector("video") !== null;

  await initStorage();

  if (isEpisode) await episode();
  if (isIframe) await iframe();
};

async function initStorage() {
  const history = await getHistory();
  if (history === null || history === undefined) await setHistory([]);

  const { settings } = await chrome.storage.sync.get(["settings"]);
  if (settings === null || settings === undefined)
    await chrome.storage.sync.set({ settings: { auto: false } });
}

async function getHistory() {
  const { history } = await chrome.storage.sync.get(["history"]);
  return history;
}

async function setHistory(history) {
  await chrome.storage.sync.set({ history });
}

async function updateHistory(id, info) {
  const history = await getHistory();
  const itemIdx = history.findIndex((item) => item.id === id);

  if (itemIdx === -1) {
    const newItem = { id, ...info };
    history.push(newItem);
  } else {
    const item = history[itemIdx];
    const mergedItem = { ...item, id, ...info };
    history[itemIdx] = mergedItem;
  }

  setHistory(history);
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
  const { settings } = await chrome.storage.sync.get(["settings"]);
  const id = document.URL.split("=").at(-1);
  const videoElem = document.querySelector("video");

  let lastTime = 0;

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
