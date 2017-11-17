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
    user: "louis",
    password: "dbpass",
    database: "trailtraxtest",
    debug: false,
    multipleStatements: true
});

function select(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        console.log('connected as id ' + connection.threadId);

        var sql = squel.select()
            .from('data_table')
            .toString();
    
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
 
        var songsql = squel.insert()
            .into('song')
            .set('song_title', data.song_title)
            .set('artist', data.artist)
            .set('spotify_link', data.spotify_link)
            .set('soundcloud_link', data.soundcloud_link)
            .set('youtube_link', data.youtube_link)
            .set('genre', data.genre)
            .set('lyrics', data.lyrics)
            .set('music_type', data.music_type).toString();
        var eventsql = squel.insert()
            .into('event')
            .set('event_title', data.event_title)
            .set('state', data.state)
            .set('city', data.city)
            .set('zip', data.zip)
            //.set('date', data.date)
            .set('event_type', data.event_type)
            .toString();
        var candidatesql = squel.insert()
            .into('candidate')
            .set()
            .toString();
        
        var sql = songsql + ';' + eventsql;
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

        if (data.lName == "") {
            sql = squel.select().from('entry').toString();
        }
        else
        {
            sql = squel.select()
                .from('entry')
                .where("Candidate = '" + data.lName + "'")
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