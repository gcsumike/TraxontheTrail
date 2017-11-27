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
    database: "trailtraxtest",
    debug: false,
    mutipleStatements: true
});

function select(req, res) {
    pool.getConnection(function (err, connection) {
        if (err) {
            res.json({ "code": 100, "status": "Error in connection database" });
            return;
        }
        console.log('connected as id ' + connection.threadId);

        var sql = squel.select().from('trailtraxtest.data_table').toString();

        connection.query(sql, function (err, rows, fields) {
            connection.release();
            if (!err) {
                connection.removeAllListeners(['error']);
                res.json(rows);
            }
        });
        connection.once('error', function (err) {
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

        var songSql;
        var eventSql;
        var candidateSql;

        songSql = squel.insert().into("song")
            .setFields({
                song_title: data.song_title,
                artist: data.artist,
                spotify_link: data.spotify_link,
                soundcloud_link: data.soundcloud_link,
                youtube_link: data.youtube_link,
                genre: data.genre,
                lyrics: data.lyrics,
                music_type: data.music_type
            })
            .toString();
        eventSql = squel.insert().into("event")
            .setFields({
                event_title: data.event_title,
                state: data.state,
                city: data.city,
                zip: data.zip,
                event_type: data.event_type,
                date: data.date
            })
            .toString();

        var songId;
        var eventId;
        connection.query(songSql, function (err, result) {
            songId = result.insertId;
            console.log(songId);
            eventId;
            console.log("Song Result: " + result);
            //do a subquery
            connection.query(eventSql, function (err, result) {
                eventId = result.insertId;
                console.log(eventId);
                console.log("Event Result: " + result);
                var off;

                if (data.official == null) {
                    off = 0;
                }
                else
                    off = 1;

                var entrySql = squel.insert().into("entry")
                    .setFields({
                        song: songId,
                        candidate: data.candidate,
                        event: eventId,
                        review_info: data.review,
                        official: off
                    })
                    .toString();
                console.log(entrySql);

                connection.query(entrySql, function (err, result) {
                    console.log("Testing import into entry");
                    console.log("Entry Result: " + result);
                });
            });
            

            connection.release();
            if (err) throw err;
            console.log("Record inserted");
        });
        connection.once('error', function (err) {
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
        var s_date = "'" + data.start_date + "'";
        var e_date = "'" + data.end_date + "'";
        var sqlString = "squel.select().from('trailtraxtest.data_table')";

        if (data.song_title != "") {
            sqlString += ".where(\"song_title LIKE '%\" + data.song_title + \"%'\" )";
        }
        if (data.event_title != "") {
            sqlString += ".where(\"event_title LIKE '%\" + data.event_title + \"%'\" )";
        }
        if (data.genre != "*") {
            sqlString += ".where(\"genre = '\" + data.genre + \"'\" )";
        }
        if (data.candidate_name != "") {
            sqlString += ".where(\"candidate_name = '\" + data.candidate_name + \"'\" )";
        }
        if (data.party != "*") {
            sqlString += ".where(\"party = '\" + data.party + \"'\" )";
        }
        if (data.state != "*") {
            sqlString += ".where(\"state = '\" + data.state + \"'\" )";
        }
        if (data.music_type != "*") {
            sqlString += ".where(\"music_type = '\" + data.music_type + \"'\" )";
        }
        if (data.start_date != "" && data.end_date != "") {
            
            sqlString += ".where(\"date >= \" + s_date)";
            sqlString += ".where(\"date <= \" + e_date)";
        }

        sqlString += ".toString()";

        sql = eval(sqlString);

        connection.query(sql, function (err, rows, fields) {
            connection.release();
            if (!err) {
                res.json(rows); 
            }
        });
        connection.once('error', function (err) {
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
});

//Listen for a connection from browser
app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

