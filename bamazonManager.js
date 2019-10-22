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

function managerInput(){
    connection.query('SELECT item_id, product_name, price, stock_quantity FROM products', function (err, products){
        if (err) throw err;
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
                choices: function() {
                    const output = products.map(product => `${product.item_id}) ${product.product_name} Stock: ${product.stock_quantity}`);
                    return output
                },
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
            console.log(answers);
            connection.end();
        });
    });
};
managerInput();