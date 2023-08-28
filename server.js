const http = require('http');
const fs = require('fs');
const {Ecommerce} = require('./ecommerce/class/ecommerce');
const {User} = require('./ecommerce/class/user')
let ecommerce;
let users = [];
let stores = [];

function storesToString(stores) {
    let storesStr = '';
    for(let store of stores) {
        storesStr += `<div class="main__store-div"><div class="main__store-name"><a href="/${store.name}">"${store.name}</a></div></div>`
    }
    return storesStr;
}

const server = http.createServer((req, res) => {
    //assemble request body as a string
  let reqBody = '';
  req.on('data', (data) => {
    reqBody += data;
  });

  req.on('end', () => { // After the assembly of the request body is finished
    /* ==================== PARSE THE REQUEST BODY ====================== */
    if (reqBody) {
      req.body = reqBody
        .split("&")
        .map((keyValuePair) => keyValuePair.split("="))
        .map(([key, value]) => [key, value.replace(/\+/g, " ")])
        .map(([key, value]) => [key, decodeURIComponent(value)])
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
    }


    console.log(req.method, req.url);
    console.log(req.body);
    console.log(reqBody);

    //handling files

    if(req.method === 'GET' && req.url.startsWith('/static/') && req.url.split("/")[2] === 'css') {
        try {
            let file = req.url.split("/")[3]
            let css = fs.readFileSync(`./static/css/${file}`)
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/css');
            return res.end(css)
        } catch {
            console.error('No css file found!');
        }
    }
    console.log('1')
    if(req.method === 'GET' && req.url === '/') {
        const homePage = fs.readFileSync('./static/views/homepage.html', 'utf-8');
        let resBody = homePage.replace(/#{stores}/g, `${storesToString(stores)}`);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(resBody);
        return;
    }
    console.log('2')
    function redirect() {
        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end()
    }
    console.log('3')
    if(req.method === 'POST' && req.url === '/ecommerce') {
        if(reqBody.name = '') {
            console.log('Please assign a Name');
            redirect();
        }
        try {
            ecommerce = new Ecommerce(req.body.name)
            console.log(ecommerce);
            stores.push(ecommerce);
            res.statusCode = 302;
            res.setHeader('Location', `/store/${ecommerce.name}`)
            res.end();
            return;
        } catch {
            console.log('Something wrong creating eccommerce');
            redirect();
        }

    }
    console.log('4')
    //creating Users
    if(req.method === 'POST' && req.url === '/user') {
        newUser = new User(users.length+1, req.body.username, req.body.email);
        users.push(newUser);
        console.log('testing redirection to Stores: ')
        res.statusCode = 302;
        res.setHeader('Location', '/')
        res.end()
        return;

    }
    //Handling invalid Ecommerce Object
    if(ecommerce == undefined) {
        console.log('Please create a Store')
        redirect();
    }
    console.log('5')
    //routing to profile page
    if(req.method === 'GET' && req.url.startsWith('/store/') && req.url.split('/').length < 4) {
        try {
            const htmlPage = fs.readFileSync('./static/views/profilepage.html', 'utf-8');
            const bodyRes = htmlPage.replace(/#{ecommerceName}/g, `${ecommerce.name}`).replace(/#{ecommerceItems}/g, `${ecommerce.getItemsString()}`);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(bodyRes);
            return;
        } catch {
            console.log('Somethings Wrong routing to your adminPanel');
            redirect();
        }

    }
    console.log('6')
    //adding products
    if(req.method === 'POST' && req.url === '/addItems') {
        console.log('testing adding products')
        ecommerce.addItems(req.body.name, req.body.price, req.body.categorie);
        console.log(ecommerce);
        res.statusCode = 302;
        res.setHeader('Location', `/store/${ecommerce.name}`)
        res.end();
        return;
    }

    //store display for customers
    if(req.method === 'GET' && req.url.split('/').length === 2) {
        let storeLink;
        for(let store of stores) {
            if(store.name === req.url.split('/')[1]){
                storeLink = store;
            }
        }
        let htmlPage = fs.readFileSync('./static/views/display-store.html', 'utf-8');
        let bodyRes = htmlPage.replace(/#{ecommerceName}/g, `${storeLink.name}`).replace(/#{ecommerceItems}/g, `${storeLink.getItemsString()}`);
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html');
        res.end(bodyRes);
        return;
    }

    if(req.method === 'POST' && req.url.split('/')[3] === 'handleStoreItem') {
        for(let store of stores) {
            if(store.name === req.url.split('/')[2]) {
                for(item of store.items){
                    if(item.name === req.url.split('/')[4]){
                        store.removeItem(item.name);
                        res.statusCode = 302;
                        res.setHeader('Location', `/store/${req.url.split('/')[2]}`);
                        res.end();
                        return;
                    }
                }
                console.log('item not found');
            }
            console.log('store not found');
        }
        res.statusCode = 302;
        res.setHeader('Location', `/store/${req.url.split('/')[2]}`);
        res.end();
        return;
    }
    //handling invalid routes
    if(req.method === 'GET') {
        console.log('page not Found');
    }

  });
});

const port = 5000;
server.listen(port, () => console.log('Server is listening on port', port));
