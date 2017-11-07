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

function test(req, res) {
    var obj = req.body;
    var result = [];

    result.push(obj);
    var sql = squel.insert()
        .into('entry')
        .setFieldsRows(result).toString();
    res.send(sql);
}

function Insert(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        //get each element from req by name
        var data = req.body;
        var arr = [];
        arr.push(data);

        //var table = 'entry';
        ////generate insert statement using elements
        //var sql = "INSERT INTO " + table + " ('" + "')" + ' VALUES ' + "('" + "')";

        console.log('connected as id ' + connection.threadId);
        // INSERT INTO entry (song, genre) VALUES ('item', 'item2')
//Change table name when time to
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

app.get('/select', function (req, res) {
    select(req, res);
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

