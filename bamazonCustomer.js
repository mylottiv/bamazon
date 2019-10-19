const inquirer = require('inquirer');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'porpoise',
    database: 'bamazon_db'
});

connection.connect(err => (err) ? console.log('Error:',err) : console.log('Connected successfully'));

connection.query('SELECT item_id, product_name, price FROM products', function (error, results){
    results.forEach(product => console.log(
        product.item_id, 
        product.product_name,
        product.price
    ));
});

connection.end();