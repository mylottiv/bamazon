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

// Main Inquirer Input Loop
supervisorInput();

function supervisorInput() {

    inquirer.prompt([

        // View Product Sales by Department
        {
            type: 'list',
            name: 'chooseAction',
            message: 'Choose an action',
            choices: ['View Product Sales by Department', 'Create New Department']
        },

        // If new department then ask user for name
        {
            type: 'input',
            name: 'newDeptName',
            message: 'Name of new Department?',
            when: function(answers) {
                return answers.chooseAction === 'Create New Department';
            },
            filter: function(answer){
                return answer.toString();
            }        
        },

        // If new department then ask user for overhead
        {
            type: 'number',
            name: 'newDeptOverhead',
            message: 'New Department Overhead Costs?',
            when: function(answers) {
                return answers.newDeptName !== undefined;
            },
            validate: function(answer){
                return (Number.isNaN(answer)) ? 'Please enter a valid number' : true;
            }        
        }

    ]).then(function(answers) {

        if (answers.chooseAction === 'View Product Sales by Department'){

            // Select departments with (product_sales - over_head_costs) AS total_profit
            const queryURL = `SELECT
            d.department_id,
            d.department_name,
            d.over_head_costs,
            SUM(p.product_sales) - d.over_head_costs AS total_profit
            FROM departments AS d
            JOIN products AS p
            ON d.department_name = p.department_name
            GROUP BY d.department_name`;
            mysqlDB.query(queryURL).then(res => {console.table(res[0]); startOver()});
        }
        
        else {
            
            // Insert New Department based on new inquirer chain
            const queryURL = `INSERT INTO departments (
                department_name,
                over_head_costs) VALUES (?, ?)`
            mysqlDB.query(queryURL, [answers.newDeptName, answers.newDeptOverhead]).then(res => {console.log(res[0]);startOver()});

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
                    supervisorInput();
                }
                else {
                    mysqlDB.end();
                }; 
            });
        };
    });
};