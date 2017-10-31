var mysql = require('mysql'); //Mysql object used to preform actions with mysql database
const express = require('express'); //node.js express object 
const app = express(); //express application object, handles connection requests
const bodyParser = require('body-parser');
var path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));

//Create the mysql database connection
var pool = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "root",
    password: "gcsu",
    database: "trailtraxmodel",
    debug: false
});


function handle_database(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        console.log('connected as id ' + connection.threadId);
        connection.query('SELECT * FROM entry', function (err, rows, fields) {
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

        var item = req.body.title;
        console.log('connected as id ' + connection.threadId);
        var sql = "INSERT INTO entry (song) VALUES ('"+ item +"')";
        connection.query(sql, function (err, result) {
            connection.release();
            if (err) throw err;
            console.log("1 record inserted");
            res.send("Inserted!");
        });
        connection.on('error', function (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        });

    });
}

//handle GET request for path "/" 
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/testing.html'));
    res.sendFile(path.join(__dirname + '/w3.css'));
});

app.post('/insert', function (req, res) {
    Insert(req, res);
});

app.post('/select', function (req, res) {

});

//Listen for a connection from browser
app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

