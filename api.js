var express = require("express"),
    app = express(),
    mysql      = require('mysql'),
    session = require('express-session'),
    formidable = require('formidable');

// MySQL connection on mamp pro
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'squiks',
    port : '8889'
});



// make it exportable
module.exports = router;

