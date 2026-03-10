const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
    const filePath = getFilePath(collection);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
};

const writeData = (collection, data) => {
    const filePath = getFilePath(collection);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const insert = (collection, item) => {
    const data = readData(collection);
    const newItem = { _id: uuidv4(), createdAt: new Date().toISOString(), ...item };
    data.push(newItem);
    writeData(collection, data);
    return newItem;
};

const find = (collection, query = {}) => {
    const data = readData(collection);
    return data.filter(item => {
        return Object.entries(query).every(([key, value]) => item[key] === value);
    });
};

const findOne = (collection, query) => {
    const results = find(collection, query);
    return results.length > 0 ? results[0] : null;
};

const findById = (collection, id) => {
    return findOne(collection, { _id: id });
};

const findByIdAndUpdate = (collection, id, updates) => {
    const data = readData(collection);
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;

    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    writeData(collection, data);
    return data[index];
};

const findByIdAndDelete = (collection, id) => {
    const data = readData(collection);
    const newData = data.filter(item => item._id !== id);
    writeData(collection, newData);
    return true;
};

module.exports = {
    readData,
    writeData,
    insert,
    find,
    findOne,
    findById,
    findByIdAndUpdate,
    findByIdAndDelete
};
