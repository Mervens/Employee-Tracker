const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

var connect = mysql.createConnection({
    host: "localhost",
    port: 3301,
    user: "root",
    password: "",
    database: "employeeDB"
});

function runApp() {
    inquirer.prompt({
        name: "mainMenu",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "Edit Employee Info",
            "View Roles",
            "Edit Roles",
            "View Departments",
            "Edit Departments"
        ]
    }).then(responses => {
        switch (responses.mainMenu) {
            case "View All Employees":
                showEmployeeList();
                break;
            case "Edit Employee Info":
                editEmployeeOptions();
                break;
            case "View Roles":
                showRoleList();
                break;
            case "Edit Roles":
                editRoleOptions();
                break;
            case "View Departments":
                showDepartmentList();
                break;
            case "Edit Departments":
                editDepartmentOptions();
                break;
        }
    });
}

// Builds complete employee table
function showEmployeeList() {
  var query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department,role.salary, CONCAT (manager.first_name, " ", manager.last_name) AS managerFROM employeeLEFT JOIN role ON employee.role_id = role.idLEFT JOIN department ON role.department_id = department.idLEFT JOIN employee manager ON employee.manager_id = manager.id`;
  connection.query(query, function (err, res) {
    console.table(res);
    mainMenu();
  });
}
// Builds a table which shows existing roles and their departments
function showRoleList() {
    console.log(' ');
    var query = "SELECT * FROM role"
    connection.query(query, function (err, res) {
      console.table(res);
      mainMenu();
    });
  }

// Builds a table which shows existing departments
function showDepartmentList() {
    console.log(' ');
     connect.query('SELECT id, name AS department FROM department', (err, res) => {
        if (err) throw err;
        console.table(res);
        runApp();
    })
};

// Adds a new employee after asking for name, role, and manager
function addEmployee() {
    inquirer.prompt([
        {
            name: "firstName",
            type: "input",
            message: "Enter employee's first name:",
        },
        {
            name: "lastName",
            type: "input",
            message: "Enter employee's last name:",
        },
        {
            name: "role",
            type: "list",
            message: "What is the employee role:",
            choices: role
        },
        {
            name: "manager",
            type: "list",
            message: "What is the employee's manager:",
            choices: manager
        }
    ]).then(answers => {
        let positionDetails = positions.find(obj => obj.title === answers.role);
        let manager = managers.find(obj => obj.Manager === answers.manager);
        connect.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)", [[answers.firstName.trim(), answers.lastName.trim(), positionDetails.id, manager.id]]);
        console.log("\x1b[32m", `${answers.firstName} was added to the employee listing!`);
        runApp();
    });
};

// Removes an employee from the database
function removeEmployee() {
    let employees =  connect.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
    employees.push({ id: null, name: "Cancel" });

    inquirer.prompt([
        {
            name: "employeeName",
            type: "list",
            message: "Remove which employee?",
            choices: employees.map(obj => obj.name)
        }
    ]).then(response => {
        if (response.employeeName != "Cancel") {
            let sadEmployee = employees.find(obj => obj.name === response.employeeName);
            connect.query("DELETE FROM employee WHERE id=?", sadEmployee.id);
            console.log("\x1b[32m", `${response.employeeName} has been removed.`);
        }
        runApp();
    })
};

// Change the employee's manager. Also prevents employee from being their own manager
function updateManager() {
    let employees = connect.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
    employees.push({ id: null, name: "Cancel" });

    inquirer.prompt([
        {
            name: "empName",
            type: "list",
            message: "For which employee?",
            choices: employees.map(obj => obj.name)
        }
    ]).then(employeeInfo => {
        if (employeeInfo.empName == "Cancel") {
            runApp();
            return;
        }
        let managers = employees.filter(currEmployee => currEmployee.name != employeeInfo.empName);
        for (i in managers) {
            if (managers[i].name === "Cancel") {
                managers[i].name = "None";
            }
        };

        inquirer.prompt([
            {
                name: "mgName",
                type: "list",
                message: "Change their manager to:",
                choices: managers.map(obj => obj.name)
            }
        ]).then(managerInfo => {
            let empID = employees.find(obj => obj.name === employeeInfo.empName).id
            let mgID = managers.find(obj => obj.name === managerInfo.mgName).id
            connect.query("UPDATE employee SET manager_id=? WHERE id=?", [mgID, empID]);
            console.log("\x1b[32m", `${employeeInfo.empName} now works under ${managerInfo.mgName}`);
            runApp();
        })
    })
};

// Updates the selected employee's role
function updateEmployeeRole() {
    let employees =  connect.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
    employees.push({ id: null, name: "Cancel" });
    let roles =  connect.query('SELECT id, title FROM role');

    inquirer.prompt([
        {
            name: "empName",
            type: "list",
            message: "For which employee?",
            choices: employees.map(obj => obj.name)
        },
        {
            name: "newRole",
            type: "list",
            message: "Change their role to:",
            choices: roles.map(obj => obj.title)
        }
    ]).then(answers => {
        if (answers.empName != "Cancel") {
            let empID = employees.find(obj => obj.name === answers.empName).id
            let roleID = roles.find(obj => obj.title === answers.newRole).id
            connect.query("UPDATE employee SET role_id=? WHERE id=?", [roleID, empID]);
            console.log("\x1b[32m", `${answers.empName} new role is ${answers.newRole}`);
        }
        runApp();
    })
};

// Add a new role to the database
function addRole() {
    let departments =  connect.query('SELECT id, name FROM department');

    inquirer.prompt([
        {
            name: "roleName",
            type: "input",
            message: "Enter new role title:",
            validate: confirmStringInput
        },
        {
            name: "salaryNum",
            type: "input",
            message: "Enter role's salary:",
            validate: input => {
                if (!isNaN(input)) {
                    return true;
                }
                return "Please enter a valid number."
            }
        },
        {
            name: "roleDepartment",
            type: "list",
            message: "Choose the role's department:",
            choices: departments.map(obj => obj.name)
        }
    ]).then(answers => {
        let depID = departments.find(obj => obj.name === answers.roleDepartment).id
        connect.query("INSERT INTO role (title, salary, department_id) VALUES (?)", [[answers.roleName, answers.salaryNum, depID]]);
        console.log("\x1b[32m", `${answers.roleName} was added. Department: ${answers.roleDepartment}`);
        runApp();
    })
};

// Updates a role on the database
function updateRole() {
    let roles =  connect.query('SELECT id, title FROM role');
    roles.push({ id: null, title: "Cancel" });
    let departments =  connect.query('SELECT id, name FROM department');

    inquirer.prompt([
        {
            name: "roleName",
            type: "list",
            message: "Update which role?",
            choices: roles.map(obj => obj.title)
        }
    ]).then(response => {
        if (response.roleName == "Cancel") {
            runApp();
            return;
        }
        inquirer.prompt([
            {
                name: "salaryNum",
                type: "input",
                message: "Enter role's salary:",
                validate: input => {
                    if (!isNaN(input)) {
                        return true;
                    }
                    return "Please enter a valid number."
                }
            },
            {
                name: "roleDepartment",
                type: "list",
                message: "Choose the role's department:",
                choices: departments.map(obj => obj.name)
            }
        ]).then(answers => {
            let depID = departments.find(obj => obj.name === answers.roleDepartment).id
            let roleID = roles.find(obj => obj.title === response.roleName).id
            connect.query("UPDATE role SET title=?, salary=?, department_id=? WHERE id=?", [response.roleName, answers.salaryNum, depID, roleID]);
            console.log("\x1b[32m", `${response.roleName} was updated.`);
            runApp();
        })
    })
};

// Remove a role from the database
function removeRole() {
    let roles =  connect.query('SELECT id, title FROM role');
    roles.push({ id: null, title: "Cancel" });

    inquirer.prompt([
        {
            name: "roleName",
            type: "list",
            message: "Remove which role?",
            choices: roles.map(obj => obj.title)
        }
    ]).then(response => {
        if (response.roleName != "Cancel") {
            let noMoreRole = roles.find(obj => obj.title === response.roleName);
            connect.query("DELETE FROM role WHERE id=?", noMoreRole.id);
            console.log("\x1b[32m", `${response.roleName} was removed. Please reassign associated employees.`);
        }
        runApp();
    })
};

// Add a new department to the database
function addDepartment() {
    inquirer.prompt([
        {
            name: "depName",
            type: "input",
            message: "Enter new department:",
            validate: confirmStringInput
        }
    ]).then(answers => {
        connect.query("INSERT INTO department (name) VALUES (?)", [answers.depName]);
        console.log("\x1b[32m", `${answers.depName} was added to department list.`);
        runApp();
    })
};

// Remove a department from the database
function removeDepartment() {
    let departments =  connect.query('SELECT id, name FROM department');
    departments.push({ id: null, name: "Cancel" });

    inquirer.prompt([
        {
            name: "depName",
            type: "list",
            message: "Remove which department?",
            choices: departments.map(obj => obj.name)
        }
    ]).then(response => {
        if (response.depName != "Cancel") {
            let uselessDepartment = departments.find(obj => obj.name === response.depName);
            connect.query("DELETE FROM department WHERE id=?", uselessDepartment.id);
            console.log("\x1b[32m", `${response.depName} was removed. Please reassign associated roles.`);
        }
        runApp();
    })
};

// Options to make changes to employees specifically
function editEmployeeOptions() {
    inquirer.prompt({
        name: "editChoice",
        type: "list",
        message: "What would you like to update?",
        choices: [
            "Add A New Employee",
            "Change Employee Role",
            "Change Employee Manager",
            "Remove An Employee",
            "Return To Main Menu"
        ]
    }).then(response => {
        switch (response.editChoice) {
            case "Add A New Employee":
                addEmployee();
                break;
            case "Change Employee Role":
                updateEmployeeRole();
                break;
            case "Change Employee Manager":
                updateManager();
                break;
            case "Remove An Employee":
                removeEmployee();
                break;
            case "Return To Main Menu":
                runApp();
                break;
        }
    })
};

// Options to make changes to roles
function editRoleOptions() {
    inquirer.prompt({
        name: "editRoles",
        type: "list",
        message: "What would you like to update?",
        choices: [
            "Add A New Role",
            "Update A Role",
            "Remove A Role",
            "Return To Main Menu"
        ]
    }).then(responses => {
        switch (responses.editRoles) {
            case "Add A New Role":
                addRole();
                break;
            case "Update A Role":
                updateRole();
                break;
            case "Remove A Role":
                removeRole();
                break;
            case "Return To Main Menu":
                runApp();
                break;
        }
    })
};

// Options to make changes to departments
function editDepartmentOptions() {
    inquirer.prompt({
        name: "editDeps",
        type: "list",
        message: "What would you like to update?",
        choices: [
            "Add A New Department",
            "Remove A Department",
            "Return To Main Menu"
        ]
    }).then(responses => {
        switch (responses.editDeps) {
            case "Add A New Department":
                addDepartment();
                break;
            case "Remove A Department":
                removeDepartment();
                break;
            case "Return To Main Menu":
                runApp();
                break;
        }
    })
};



console.log("Welcome to the Employee Tracker Application!\n\nVersion 1.01\n");

runApp();