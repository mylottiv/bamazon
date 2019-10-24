// Initialize Modules
const cTable = require('console.table');
const inquirer = require('inquirer');
const mysqlDB = require('mysql-promise')();

// Initialize MySQL DB connection
mysqlDB.configure({
    host: 'localhost',
    user: 'root',
    password: 'porpoise',
    database: 'bamazon_db'
});

managerInput();
function managerInput(){
    inquirer.prompt([
        // Main input question
        {
            type: 'list',
            name: 'chooseAction',
            message: 'Choose an action',
            choices: ['View all products', 'View low inventory', 'Add to inventory', 'Add new product']
        },
        // If adding to inventory prompt user to select a product
        {
            type: 'list',
            name: 'chooseProduct',
            message: 'Choose a product',
            when: function(answers) {
                return answers.chooseAction === 'Add to inventory'
            },
            choices: () => populateInventory('Add to inventory'),
            filter: choice => parseInt(choice.charAt(0))
        },
        // If adding to inventory after inputting product prompt for quantity
        {
            type: 'number',
            name: 'addStock',
            message: 'How much to restock?',
            when: function(answers) {
                return answers.chooseProduct !== undefined;
            },
            default: 1,
            validate: function(answer){
                return (Number.isNaN(answer)) ? 'Please enter a valid number' : true;
            }
        },
        // Prompt user for new product name if Add new product chosen
        {
            type: 'input',
            name: 'newProductName',
            message: 'Name of product to add?',
            when: function(answers) {
                return answers.chooseAction === 'Add new product';
            },
        },
        // Prompt user for new product department if relevant
        {
            type: 'input',
            name: 'newProductDepartment',
            message: 'Department of product to add?',
            when: function(answers) {
                return answers.newProductName !== undefined;
            }
        },
        // Prompt user for new product price if relevant
        {
            type: 'number',
            name: 'newProductPrice',
            message: 'Price of product to add?',
            when: function(answers){
                return answers.newProductDepartment !== undefined;
            },
            default: 1.00,
            validate: function(answer){
                return (Number.isNaN(answer)) ? 'Please enter a valid number' : true;
            }
        },
        // Prompt user for new product stock if relevant
        {
            type: 'number',
            name: 'newProductStock',
            message: 'Stock of product to add?',
            when: function(answers){
                return answers.newProductPrice !== undefined;
            },
            default: 1,
            validate: function(answer){
                return (Number.isNaN(answer)) ? 'Please enter a valid number' : true;
            }
        }
    ]).then(function(answers){

        // If adding new product
        if (answers.chooseAction === 'Add new product') {
            const queryURL = `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)`
            mysqlDB.query(queryURL, [answers.newProductName, answers.newProductDepartment, answers.newProductPrice, answers.newProductStock])
            .then(function(res){
                console.log(`Added ${answers.newProductName} to product database \n`);
                startOver();
            }).catch((err) => console.log(err));
        }

        // If updating inventory of existing product
        else if (answers.chooseAction === 'Add to inventory') {
            const queryURL = `UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?`
            mysqlDB.query(queryURL, [answers.addStock, answers.chooseProduct])
            .then(function(res){
                console.log(`Added ${answers.addStock} to stock of product with ID:${answers.chooseProduct} \n`);
                startOver();
            }).catch((err) => console.log(err));
        }
        
        // If viewing all products or just low stock products
        else {
            populateInventory(answers.chooseAction).then((res) => {console.table(res); startOver()});
        };

        function startOver(){
            inquirer.prompt([
                // Prompt user to restart interface
                {
                    type: 'confirm',
                    name: 'startOver',
                    message: 'Take another action?',
                }
            ]).then(function(answer){
                if (answer.startOver === true) {
                    managerInput();
                }
                else {
                    mysqlDB.end();
                }; 
            });
        };
    });
};
async function populateInventory(action) {
    const queryURL = `SELECT item_id, product_name, price, stock_quantity FROM products ${(action === 'View low inventory') ? 'WHERE stock_quantity <= 5' : ''}`
    const output = await mysqlDB.query(queryURL).catch(err => console.log('error: ', err));
    if (action === 'Add to inventory') {
        return output[0].map(product => `${product.item_id}) ${product.product_name} Stock: ${product.stock_quantity}`);
    }
    else {
        return output[0];
    };
};