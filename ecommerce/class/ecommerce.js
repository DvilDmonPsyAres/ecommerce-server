const { Item } = require('./item');

class Ecommerce {
    constructor(name) {
        this.name = name;
        this.items = [];
    }

    addItems(name, price, categorie) {
        let id = this.items.length + 1;
        const newItem = new Item(name, price, categorie, id);
        this.items.push(newItem);
        return;
    }

    removeItem(name) {
        for(let i = 0; i < this.items.length; i++) {
            if(this.items[i].name === name) {
                this.items.splice(i, 1)
            }
        }
        return this.items;
    }

    getItemsString() {
        let itemString = '';
        for(let product of this.items) {
            itemString += `<form method='post' action='${this.name}/handleStoreItem/${product.name}'><div class="items__section-item"><div class='item__categorie'>${product.categorie}</div><div class="item__name">${product.name}</div><div class='item__price'>${product.price}</div>
            <div class='item__buttons-profile'><button type="submit" action="storeRemove">Remove</button></div></form><form method='post' action='/handleCartItem/add'><div class='item__buttons-store'><button type="submit" action="cartAdd">Add to Cart</button></form><form method='post' action='/handleCartItem/remove'>
            <button type="submit" action="cartRemove">Remove from Cart</button></div></div></form>`
        }
        return itemString;
    }
}


module.exports = {
    Ecommerce,
};
