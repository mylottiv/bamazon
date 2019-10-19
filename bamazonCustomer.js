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

connection.query('SELECT item_id, product_name, price FROM products', function (error, results){
    console.table(results);
});

connection.end();