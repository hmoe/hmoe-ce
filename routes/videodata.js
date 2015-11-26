var express = require('express');
var router = express.Router();
var mysql      = require('mysql');

/* GET users listing. */
router.get(/\d+/, function(req, res, next) {
	var id = parseInt(req.url.substring(1));
  var connection = mysql.createConnection(global.db);
  connection.connect();
  connection.query("SELECT * FROM video_history WHERE aid = ?",[id],function(err,rows,fields){
    if(err)throw err;
    
    res.send(JSON.stringify(rows));
    connection.end();
  });
  
});

module.exports = router;
