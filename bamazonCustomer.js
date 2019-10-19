const cTable = require('console.table');
const inquirer = require('inquirer');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'porpoise',
    database: 'bamazon_db'
});

connection.connect(err => (err) ? console.log('Error:',err) : console.log('Connected successfully'));


connection.query('SELECT item_id, product_name, price FROM products', function (err, products){
    if (err) throw err;
    console.table(products)
    inquirer.prompt([
        {
            type: 'list',
            name: 'chooseProduct',
            message: 'Choose a product to purchase',
            choices: function() {
                const output = products.map((product) => `${product.item_id}) ${product.product_name}`);
                return output;
            },
            filter: function(choice) {
                return parseInt(choice.charAt(0));
            }
        },
        {
            type: 'number',
            name: 'chooseQuantity',
            message: 'How many do you want to buy?'
        }
    ]).then(function(answers) {
        connection.query('SELECT stock_quantity FROM products WHERE item_id = ?',
            [answers.chooseProduct],
            function (err, res){
                if (err) throw err;
                const currentQuantity = res[0].stock_quantity;
                const purchaseQuantity = answers.chooseQuantity;
                const productID = answers.chooseProduct - 1;
                const productPrice = products[productID].price
                const totalPrice = purchaseQuantity * productPrice
                if (currentQuantity >= purchaseQuantity) {
                    connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', [currentQuantity - purchaseQuantity, productID + 1],
                        function(err) {
                            if (err) throw err;
                            console.log(`Buying ${purchaseQuantity} ${products[productID].product_name}s for ${productPrice} each for a total price of ${totalPrice}`);
                        }
                    );
                }
                else {
                    console.log('Not enough quantity!')
                };
                connection.end();
            })
    });
});