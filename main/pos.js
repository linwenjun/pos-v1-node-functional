const flow = require('lodash/flow');
const { loadAllItems, loadPromotions } = require('./datbase')

const getInventoryItems = (inputs) => {
    return flow([
        chainConsole("raw"),
        groupItems,
        chainConsole("grouped"),
        toOrderItems,
        chainConsole("Order items"),
        toInventoryItems,
        chainConsole("Inventory items"),
        toInventoryStrs,
        chainConsole("Inventory strings")
    ])(inputs)
}

const chainConsole = (title) => {
    return (info) => {
        console.log("============================")
        console.log(title)
        console.log("============================")
        console.log(info)
        return info;
    }
}

/**
 *  
 */
const groupItems = (inputs) => {
    return inputs
        .map(input => toRawItem(input))
        .reduce((pre, itemObj) => {
            let existItem = pre.find(item=> item.barcode === itemObj.barcode)
            
            if(!existItem) {
                pre.push(itemObj)
            } else {
                existItem.count += itemObj.count
            }

            return pre
        }, [])
}

const toOrderItems = (cartItems) => {
    return cartItems
        .map(toOrderItem)
}

const toInventoryItems = (orderItems) => {
    return orderItems
        .map(toInventoryItem)
}

const toInventoryStrs = (inventoryItems) => {
    return inventoryItems
        .map(toInventoryStr)
}

const toRawItem = (input) => {
    const [barcode, count = 1] = input.split('-');
    return {
        barcode,
        count: parseInt(count, 10)
    }
}

const toOrderItem = (cartItem) => {
    const allItems = loadAllItems()
    const goodsItem = allItems
                        .find((item) => item.barcode === cartItem.barcode)
    return Object.assign({}, goodsItem, cartItem)
}

const toInventoryItem = (orderItem) => {
    const [ promotion ] = loadPromotions()
    const { count, price } = orderItem
    
    let realCount = count
    let promotionType
    
    if(promotion.barcodes.includes(orderItem.barcode)) {
        realCount = count - Math.floor(count / 3)
        promotionType = promotion.type
    }

    const subTotalPrice = price * realCount

    return Object.assign({}, orderItem, {
        realCount,
        promotionType,
        subTotalPrice
    })
}

const toInventoryStr = (inventoryItem) => {
    const { name, count, unit, price, subTotalPrice } = inventoryItem
    const formattedPrice = price.toFixed(2)
    const formattedSubTotalPrice = subTotalPrice.toFixed(2)
    
    return `名称：${name}，数量：${count}${unit}，单价：${formattedPrice}(元)，小计：${formattedSubTotalPrice}(元)\n`
}

module.exports = getInventoryItems
