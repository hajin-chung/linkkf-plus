function $(selector) {
  return document.querySelector(selector);
}

async function addHistoryItemElem(title, time, url) {
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

  Idelete.onclick = async () => {
    Ihistory.removeChild(newItem);
    const history = await historyStorage.get();
    const itemIdx = history.findIndex((i) => i.title === title);
    if (itemIdx !== -1) {
      history.splice(itemIdx, 1);
      historyStorage.set(history);
    }
  };

  Ihistory.insertBefore(newItem, Ihistory.firstChild);
}

function addHistoryEmpty() {}

async function init() {
  const settings = await settingsStorage.get();
  const history = await historyStorage.get();

  $("#auto").checked = settings.auto;
  $("#save").checked = settings.save;
  $("#autoPlay").checked = settings.autoPlay;

  $("#auto").onchange = (e) => {
    settings.auto = e.target.checked;
    settingsStorage.set(settings);
  };
  $("#save").onchange = (e) => {
    settings.save = e.target.checked;
    settingsStorage.set(settings);
  };
  $("#autoPlay").onchange = (e) => {
    settings.autoPlay = e.target.checked;
    settingsStorage.set(settings);
  };

  if (history.length > 0) {
    history.forEach((v) => {
      let time = v.time ? v.time : 0;
      addHistoryItemElem(v.title, time, v.url);
    });
  } else if (history.length == 0) addHistoryEmpty();
}

window.onload = async () => {
  await initStorage();
  await init();
};
