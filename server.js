var mysql = require('mysql'); //Mysql object used to preform actions with mysql database
const express = require('express'); //node.js express object 
const app = express(); //express application object, handles connection requests
const bodyParser = require('body-parser');
var squel = require("squel");
var path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'html')));

//Create the mysql database connection
var pool = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "root",
    password: "gcsu",
    database: "trailtraxmodel",
    debug: false
});

function select(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        console.log('connected as id ' + connection.threadId);

        var sql = squel.select().from('entry').toString();

        connection.query(sql, function (err, rows, fields) {
            connection.release();
            if (!err) {
                res.json(rows);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });
}

function Insert(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        //get each element from req 
        var data = req.body;
        var arr = [];
        arr.push(data);

        console.log('connected as id ' + connection.threadId);
 
        var sql = squel.insert()
            .into('entry')
            .setFieldsRows(arr).toString();

        connection.query(sql, function (err, result) {
            connection.release();
            if (err) throw err;
            console.log("Record inserted");
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });

    });
}

function selectItems(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        console.log('connected as id ' + connection.threadId);

        var data = req.body;

        var sql;

        if (data.candidate == "") {
            sql = squel.select().from('entry').toString();
        }
        else
        {
            sql = squel.select()
                .from('entry')
                .where("Candidate = '" + data.candidate + "'")
                .toString();
        }

       
        connection.query(sql, function (err, rows, fields) {
            connection.release();
            if (!err) {
                res.json(rows);
            }
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });
    });


}

app.get('/select', function (req, res) {
    select(req, res);
});

app.get('/selectItems', function (req, res) {
    selectItems(req, res);
});

app.post('/selectItems', function (req, res) {
    selectItems(req, res);
});

app.post('/insert', function (req, res) {
    Insert(req, res);
    res.send("Inserted");
});

app.post('/test', function (req, res) {
    test(req, res);
});

//Listen for a connection from browser
app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

