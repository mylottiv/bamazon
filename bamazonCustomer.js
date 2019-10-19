// Initialize Modules
const cTable = require('console.table');
const inquirer = require('inquirer');
const mysql = require('mysql');

// Initialize MySQL DB connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'porpoise',
    database: 'bamazon_db'
});

connection.connect(err => (err) ? console.log('Error:',err) : console.log('Connected successfully'));

// Query DB for list of all products to be printed to console as a table
connection.query('SELECT item_id, product_name, price FROM products', function (err, products){

    if (err) throw err;
    console.table(products)
    
    // Main user Input loop
    function buyProduct(){
        inquirer.prompt([
            // Asks user to choose a product from the list returned from DB
            {
                type: 'list',
                name: 'chooseProduct',
                message: 'Choose a product to purchase',
                choices: function() {
                    const output = products.map((product) => `${product.item_id}) ${product.product_name}`);
                    return output;
                },
                filter: choice => parseInt(choice.charAt(0)),
            },
            // Asks user for the quantity of product to be purchased
            {
                type: 'number',
                name: 'chooseQuantity',
                message: 'How many do you want to buy?',
                default: 1,
                validate: input => (!isNaN(input)) ? true : 'Please enter a valid number!'
            }
        ]).then(function(answers) {
            // Selects stock and sales information for chosen product from SQL DB
            connection.query('SELECT stock_quantity, product_sales FROM products WHERE item_id = ?', [answers.chooseProduct], function (err, res){
                
                if (err) throw err;

                // Assigns returned product information into semantically relevant variables
                const currentQuantity = res[0].stock_quantity;
                const currentSales = res[0].product_sales;
                const purchaseQuantity = answers.chooseQuantity;
                const productID = answers.chooseProduct - 1;
                const productPrice = products[productID].price;
                const totalPrice = purchaseQuantity * productPrice;

                // Checks if there is enough stock_quantity to fulfill the user's purchase
                if (currentQuantity >= purchaseQuantity) {
                    // Updates the product entry in DB with the post-purchase quantity and new total sales
                    connection.query('UPDATE products SET stock_quantity = ?, product_sales = ? WHERE item_id = ?',
                        [currentQuantity - purchaseQuantity, currentSales + totalPrice, productID + 1],
                        function(err) {
                            if (err) throw err;
                            // Outputs summmary of user order to console
                            console.log(`Buying ${purchaseQuantity} ${products[productID].product_name}s for ${productPrice} each for a total price of ${totalPrice}`);
                            startOver();
                        }
                    );
                }
                else {
                    console.log('Not enough quantity!')
                    startOver();
                };
                // Check called at end of main input loop to see if user wishes to exit or make another purchase
                function startOver() {
                    inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'startOver',
                            message: 'Purchase another product?'
                        }
                    ]).then(function(answer){
                        if (answer.startOver === true) {
                            buyProduct();
                        }
                        else {
                            connection.end();
                        };
                    });
                };
            });
        });
    };

    // Call main input loop
    buyProduct();
});