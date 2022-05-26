function $(selector) {
  return document.querySelector(selector);
}

function addHistoryItemElem(title, time, url) {
  let newItem = $("#components > .history-item").cloneNode(true);
  let Ititle = newItem.querySelector("#title");
  let Idelete = newItem.querySelector("#delete");
  let Itime = newItem.querySelector("#time");
  let Ihistory = $("#history");

  Ititle.innerText = title;
  Ititle.onclick = () => {
    chrome.tabs.update({ url });
  };

  let min = Math.floor(time / 60);
  let sec = time % 60;
  if (min < 10) min = "0" + min;
  if (sec < 10) sec = "0" + sec;
  Itime.innerText = `${min}:${sec}`;

  Idelete.onclick = () => {
    Ihistory.removeChild(newItem);
    chrome.storage.sync.get(["history"], ({ history }) => {
      for (const [i, item] of history.entries()) {
        if (item.title === title) {
          history.splice(i, 1);
          break;
        }
      }
      chrome.storage.sync.set({ history });
    });
  };

  Ihistory.insertBefore(newItem, Ihistory.firstChild);
}

function addHistoryEmpty() {}

function test() {
  addHistoryItemElem("test dsalfdjsak 3", 1, "https://linkkf.com");
  addHistoryItemElem("test dsalfdjsak 4", 1, "https://linkkf.com");
  addHistoryItemElem("test dsalfdjsak 2", 1, "https://linkkf.com");
  addHistoryItemElem("test dsalfdjsak 3", 1, "https://linkkf.com");
  addHistoryItemElem("test dsalfdjsak 4", 1, "https://linkkf.com");
  addHistoryItemElem("test dsalfdjsak 2", 1, "https://linkkf.com");
  addHistoryItemElem("test dsalfdjsak 3", 1, "https://linkkf.com");
  addHistoryItemElem("test dsalfdjsak 4", 1, "https://linkkf.com");
}

async function init() {
  const { settings } = await chrome.storage.sync.get(["settings"]);
  if (settings === undefined) settings = { auto: false };

  $("#auto").onchange = (e) => {
    settings.auto = e.target.value === "on";
    chrome.storage.sync.set({ settings });
  };

  const { history } = await chrome.storage.sync.get(["history"]);
  if (history.length) {
    history.forEach((v) => {
      let time = v.time ? v.time : 0;
      addHistoryItemElem(v.title, time, v.url);
    });
  } else if (history.length == 0) addHistoryEmpty();
  else chrome.storage.sync.set({ history: [] });
}

window.onload = async () => {
  await init();
};
