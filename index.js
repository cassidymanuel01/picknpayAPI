
// Importing modules
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/dbconn');
const {compare, hash} = require('bcrypt');

// Express app
const app = express();

// Express router
const router = express.Router();

// Configuration
const port = parseInt(process.env.Port) || 4000;

// We need both express.json() or bodyParser.json() and express.urlencoded({}) when using the POST or PUT method because data is sent to the server from the user via req.body.
// express.json() recognizes the incoming request object as a JSON object.
// express.urlencoded({}) to recognize the incoming request object as a string or object.
app.use(router, cors(), express.json(), express.urlencoded({
    extended: true
}));

// We must also specify which port our API will use.
app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`);
});

// CORS 
// Stand for cross-origin resource sharing. 
// By setting up Access-Control-Allow-Origin headers, it means that which origin can access it or * for all. In other words, which domain can access your resources.
// HOW TO SET IT UP 

app.use(cors({
    origin: '*'
}))
 // OR 

 app.use(cors({
    origin: ['http://lifechoices.co.za'],
    methods: ['GET', 'POST', 'PUT']
}))
// The above example shows that we only allow the lifechoices domain to access our resources by using the following HTTP methods: GET, POST, and PUT only.

// User registration
router.post('/register', bodyParser.json(), async (req, res)=> {
    const bd = req.body; 
    // Encrypting a password
    // Default genSalt() is 10
    bd.userpassword = await hash(bd.userpassword, 10);
    // Query
    const strQry = 
    `
    INSERT INTO users(firstname, lastname, gender, address, email, userpassword)
    VALUES(?, ?, ?, ?, ?, ?);
    `;
    //
    db.query(strQry, 
        [bd.firstname, bd.lastname, bd.gender, bd.address, bd.email, bd.userpassword],
        (err, results)=> {
            if(err) throw err;
            res.send(`number of affected row/s: ${results.affectedRows}`);
        })
});

// Login
router.post('/login', bodyParser.json(), (req, res)=> {
    const strQry = 
    `
    SELECT firstname, gender, email, userpassword
    FROM users;
    `;
    db.query(strQry, (err, results)=> {
        if(err) throw err;
        res.json({
            status: 200,
            results: results
        })
    })


// Have to compare: 
compare(req.body.userpassword, results.userpassword)
// ======
require('crypto').randomBytes(64).toString('hex')
})

// Create new products
router.post('/products', bodyParser.json(), (req, res)=> {
    const bd = req.body; 
    bd.totalamount = bd.quantity * bd.price;
    // Query
    const strQry = 
    `
    INSERT INTO products(prodName, prodUrl, quantity, price, totalamount, dateCreated)
    VALUES(?, ?, ?, ?, ?, ?);
    `;
    //
    db.query(strQry, 
        [bd.prodName, bd.prodUrl, bd.quantity, bd.price, bd.totalamount, bd.dateCreated],
        (err, results)=> {
            if(err) throw err;
            res.send(`number of affected row/s: ${results.affectedRows}`);
        })
});

// Get all products
router.get('/products', (req, res)=> {
    // Query
    const strQry = 
    `
    SELECT id, prodName,prodUrl, quantity, price, totalamount, dateCreated, userid
    FROM products;
    `;
    db.query(strQry, (err, results)=> {
        if(err) throw err;
        res.json({
            status: 200,
            results: results
        })
    })
});

// Get one product
router.get('/products/:id', (req, res)=> {
    // Query
    const strQry = 
    `
    SELECT id, prodName, prodUrl, quantity, price, totalamount, dateCreated, userid
    FROM products
    WHERE id = ?;
    `;
    db.query(strQry, [req.params.id], (err, results)=> {
        if(err) throw err;
        res.json({
            status: 200,
            results: (results.length <= 0) ? "Sorry, no product was found." : results
        })
    })
});

// Update product
router.put('/products', bodyParser.json(), (req, res)=> {
    const bd = req.body;
    // Query
    const strQry = 
    `UPDATE products
     SET ?
     WHERE id = ?`;

    db.query(strQry,[bd.id], (err, data)=> {
        if(err) throw err;
        res.send(`number of affected record/s: ${data.affectedRows}`);
    })
});

// Delete product
router.delete('/clinic/:id', (req, res)=> {
    // Query
    const strQry = 
    `
    DELETE FROM products 
    WHERE id = ?;
    `;
    db.query(strQry,[req.params.id], (err, data, fields)=> {
        if(err) throw err;
        res.send(`${data.affectedRows} row was affected`);
    })
});

/*
res.status(200).json({
    status: 200,
    results: results
})
*/
