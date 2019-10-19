DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;
CREATE TABLE products (
	item_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    stock_quantity INT NOT NULL,
    product_sales FLOAT
);
CREATE TABLE departments (
	department_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL,
    over_head_costs FLOAT NOT NULL
);
INSERT INTO products (
	product_name,
	department_name,
	price,
	stock_quantity
) VALUES (
    'Toothpaste',
    'Essentials',
    3.50,
    8
), (
    'Hairbrush',
    'Essentials',
    4.00,
    3
), (
    'Dog',
    'Pets',
    25.00,
    10
), (
    'Cat',
    'Pets',
    20.00,
    10
), (
    'Pizza',
    'Food',
    10.00,
    7
), (
    'Hamburger',
    'Food',
    7.50,
    6
), (
    'Zelda',
    'Games',
    100.00,
    50
), (
    'Mario',
    'Games',
    125.00,
    34
), (
    'Javascript',
    'Languages',
    500.00,
    100
), (
    'Python',
    'Languages',
    1000.00,
    50
);
INSERT INTO departments (
    department_name,
    over_head_costs
) VALUES (
    'Essentials',
    5000
), (
    'Pets',
    10000
), (
    'Food',
    2500
), (
    'Games',
    7500
), (
    'Languages',
    6000
);