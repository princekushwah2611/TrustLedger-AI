const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '../data/reasoningStore.json');

function readStore() {
  if (!fs.existsSync(storePath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(storePath, 'utf8'));
  } catch (err) {
    return {};
  }
}

function writeStore(data) {
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
}

function saveVerdict(txId, verdictData) {
  const store = readStore();
  store[txId] = {
    ...verdictData,
    updatedAt: new Date().toISOString()
  };
  writeStore(store);
}

function getVerdict(txId) {
  const store = readStore();
  return store[txId] || null;
}

function getAllVerdicts() {
  return readStore();
}

module.exports = {
  readStore,
  saveVerdict,
  getVerdict,
  getAllVerdicts
};
