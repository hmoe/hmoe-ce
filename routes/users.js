var express = require('express');
var router = express.Router();
var mysql      = require('mysql');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var connection = mysql.createConnection(global.db);
  connection.connect();
  connection.query("SELECT * FROM up",function(err,rows,fields){
    if(err)throw err;
    
    res.send(JSON.stringify(rows));
    connection.end();
  });
  
});

module.exports = router;
