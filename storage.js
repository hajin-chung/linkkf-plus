class Storage {
  constructor(name, initValue) {
    this.name = name;
    chrome.storage.sync.get([name], (v) => {
      if (v === undefined) chrome.storage.sync.set({ [name]: initValue });
    });
  }

  async get() {
    const value = (await chrome.storage.sync.get([this.name]))[this.name];
    return value;
  }

  async set(value) {
    const setParam = {};
    setParam[this.name] = value;
    await chrome.storage.sync.set(setParam);
  }
}

var settingsStorage;
var historyStorage;

function initStorage() {
  settingsStorage = new Storage("settings", {auto: false, save: false});
  historyStorage = new Storage("history", []);
}