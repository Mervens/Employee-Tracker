USE employeeDB;

INSERT INTO department (name)
VALUES ('Financial'), ('Sales'), ('Engineer'), ('Legal');

INSERT INTO role (title, salary, department_id)
VALUES ('Sales Lead', 100000, 1), ('Salesperson', 80000, 1), ('Lead Engineer', 150000, 2), ('Software Engineer', 120000, 2), ('Accountant', 125000, 3), ('Legal Team Lead', 250000, 4), ('Lawyer', 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES ('Kyle', 'Korver', 1, null), ('Uno', 'Nigel', 3, null), ('Paul', 'Chris', 4, 2), ('Morgan', 'Richard', 6, null), ('Johnny', 'Bravo', 2, 1), ('Leonard', 'Kawhi', 2, 1);