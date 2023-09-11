const {Client} = require('pg');
const express = require('express');
const port = 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: '1234',
    database: 'CRUD',
});

client.connect();

client.query(`select * from employees`, (err, res) => {
    if(!err){
        console.log(res.rows);
    } else{
        console.log(err.message);
    }
})

//view all employees
app.get('/api', (req, res) => {
    client.query('SELECT * FROM employees', (err, result) => {
        if (err) {
          throw err;
        }
        res.status(200).json(result.rows)
      });
});

//view a particular employee
app.get('/api/:id', (req, res) => {
    const id = parseInt(req.params.id)
    client.query('SELECT * FROM employees WHERE id = $1', [id], (err, results) => {
        if (err) {
            res.status(400).json({msg:`Employee with id: ${req.params.id}doesn't exist`});
            throw err;
        }
        res.status(200).json(results.rows);
    });
});

//add an employee
app.post('/api', (req, res) => {
    const { id, name, position } = req.body
    client.query('INSERT INTO employees (id, name, position) VALUES ($1, $2, $3) RETURNING *', [id, name, position], (err, results) => {
        if (err) {
            throw err;
        }
        res.status(201).send(`User added with ID: ${results.rows[0].id}`)
    })
});

//update data of particular employee
app.put('/api/:id', (req, res) => {
    const eid = parseInt(req.params.id)
    const { id, name, position } = req.body
    client.query(
        'UPDATE employees SET id = $1, name = $2, position = $3 WHERE id = $4',
        [id, name, position, eid],
        (err, results) => {
            if (err) {
                throw err;
            } else {
                res.status(200).send(`User modified with ID: ${id}`);
            }
        }
    );
});

//delete a particular employee
app.delete('/api/:id', (req, res) => {
    const id = parseInt(req.params.id)
    client.query('DELETE FROM employees WHERE id = $1', [id], (err, results) => {
        if (err) {
            throw err;
        } else {
            res.status(200).send(`User deleted with ID:${id}`);
        }
    });
});

app.listen(port, ()=>{
    console.log(`server has started on port: ${port}`);
});

