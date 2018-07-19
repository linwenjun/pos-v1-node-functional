const getInventoryItems = require('./pos')

module.exports = function printInventory(inputs) {
    return getInventoryItems(inputs);
};
