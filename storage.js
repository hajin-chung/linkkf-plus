class Storage {
  constructor(name) {
    this.name = name;
  }

  async init(value) {
    const v = await this.get();
    if (v === undefined) await this.set(value);
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

async function initStorage() {
  settingsStorage = new Storage("settings");
  historyStorage = new Storage("history");

  await settingsStorage.init({auto: false, save: false});
  await historyStorage.init([]);
}