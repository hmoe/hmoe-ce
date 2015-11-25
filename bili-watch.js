var async = require('async');
var crypto = require('crypto');
var request = require('request');
var fs = require('fs');

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'hmoe_ce'
});
connection.connect();

"use strict"

var APPKEY = 'ba3a4e554e9a6e15dc4d1d70c2b154e3';

var req = [
	{'name' : 'appkey','val':'422fd9d7289a1dd9'},
	{'name' : 'batch','val':'1'},
	// {'name' : 'check_area','val':'1'},
	// {'name' : 'fav','val':'1'},
	{'name' : 'id','val':'7'},
	{'name' : 'rnd','val':'5115'},
	{'name' : 'type','val':'json'},
]

function createUrl(theReq,aid) {
	var md5 = crypto.createHash('md5');
	var url = '';
	
	theReq.sort(function(x,y){
		return x['name'] > y['name']
	});
	
	for (var key in theReq) {
		if (theReq.hasOwnProperty(key)) {
			var element = theReq[key];
			
			if(element['name']=='id' && aid!= undefined)
				element['val'] = aid;
			
			url += '&' + element['name'] + '=' + element['val'];
		}
	}
	
	url = url.substr(1,url.length-1);
	
	md5.update(url);
	md5.update(APPKEY);
	return '?' + url + '&sign=' + md5.digest('hex');
}

var midList = [];//用户ID的列表
var aidList = [];
var downloadNum = 0;

function saveVideoToDB(o,aid,callback,l){
	var needRefresh = true;
	
	async.series([
		function(cb){
			if(o.coins == 0 && o.credit == 0 ){
				connection.query("SELECT * FROM video_history WHERE aid=? and coins=0 and credit=0 ORDER BY ts DESC LIMIT 1",[aid],
				function(err, rows, fields){
					if(err){
						console.error(err);
						throw err;
					}
					
					if(rows.length == 1){
						if(rows[0].play == o.play &&
						rows[0].review == o.review &&
						rows[0].video_review == o.video_review &&
						rows[0].favorites == o.favorites){
							needRefresh = false;
						}
					}
					cb();
				});
			}else{
				connection.query("SELECT * FROM video_history WHERE aid=? and coins!=0 and credit!=0 ORDER BY ts DESC LIMIT 1",[aid],
				function(err, rows, fields){
					if(err){
						console.error(err);
						throw err;
					}
					
					if(rows.length == 1){
						if(rows[0].play == o.play &&
						rows[0].review == o.review &&
						rows[0].video_review == o.video_review &&
						rows[0].favorites == o.favorites &&
						rows[0].coins == o.coins &&
						rows[0].credit == o.credit){
							needRefresh = false;
						}
					}
					cb();
				});
			}
			
		},
		function(cb){
			connection.query("REPLACE INTO video (`aid`,`mid`,`title`,`description`,`created`,`pic`) VALUES (?,?,?,?,?,?);",
			[aid,o.mid,o.title,o.description,o.created_at,o.pic]
			,function(err,rows){
				cb();
				if(err){
					console.log(err);
					console.log(o)
					console.log('写入视频数据出错：'+aid);
				}
			});
		},
		function(cb){
			if(!needRefresh)return cb();
			
			connection.query("REPLACE INTO video_history (`aid`,`ts`,`play`,`review`,`video_review`,`favorites`,`coins`,`credit`) VALUES (?,NOW(),?,?,?,?,?,?)",
			[aid,o.play,o.review,o.video_review,o.favorites,o.coins,o.credit],
			function(err,rows){
				cb();
				if(err){
					console.log(err);
					console.log(o)
					console.log('写入视频数据出错：'+aid);
				}
			})	
		}
	],function(err,results){
		callback();
		return;
	});
	
}	

function updateVideos(callback){
	if(aidList.length<=0){
		//connection.end();
		//console.log('已经关闭到数据库的连接');
		callback();
		return;
	}
	
	var refreshed = false;
	
	async.series([
		function(cb){
			var a = aidList.pop();
			var aid = a.aid;
			var dd = new Date().getTime() - Date.parse(a.created);
			
			//如果投稿日期超过一个星期，有98%的概率不更新
			if(( dd > 1000*3600*24*7)&&Math.floor(Math.random()*50)!=0){
				var o = new Object();
				o.mid = a.mid;
				o.title = a.title;
				o.description = a.description;
				o.created_at = a.created;
				o.pic = a.pic;
				o.play = a.play;
				o.review = a.review;
				o.video_review = a.video_review;
				o.favorites = a.favorites;
				o.coins = 0;
				o.credit = 0;
				if(o.coins=='--'){
					o.coins=0;
				}
				
				if(o.credit=='--'){
					o.credit=0;
				}
				
				saveVideoToDB(o,aid,cb,aidList.length);
			}else{
				refreshed=true;
				request({
				'url':'http://api.bilibili.com/view'+createUrl(req,aid),
				},function (err, response, body) {
					try{
						var o = JSON.parse(body);
						if(o.code && (o.code=='-403' || o.code=='-503' )){
							o.mid = a.mid;
							o.title = a.title;
							o.description = a.description;
							o.created_at = a.created;
							o.pic = a.pic;
							o.play = a.play;
							o.review = a.review;
							o.video_review = a.video_review;
							o.favorites = a.favorites;
							o.coins = 0;
							o.credit = 0;
						}
						
						if(o.coins=='--'){
							o.coins=0;
						}
						
						if(o.credit=='--'){
							o.credit=0;
						}
						
						saveVideoToDB(o,aid,cb,aidList.length);
						
					}catch(e){
						console.log('视频数据出错:'+aid);
					}
				});
			}
			
			
		}
	],function(err){
		if(!refreshed){
				setTimeout(updateVideos,0,callback);
		}else{
			if(downloadNum++%8==0){
				setTimeout(updateVideos,3500,callback);
			}else{
				setTimeout(updateVideos,100,callback);
			}
		}
		
	});
	
	
	
	
}

function start(){
	midList = [];
	aidList = [];
	downloadNum = 0;
	
	async.series([
		function (callback) {
			//更新用户列表
			connection.query('SELECT * FROM watch', function(err, rows, fields) {
				if (err) throw err;
				for(var i=0;i<rows.length;i++){
					midList.push(rows[i].mid);
				}
				console.log('已经从数据库获得监控用户列表');
				callback();
			})
		},
		function (callback) {
			//更新用户信息
			async.each(midList,function(mid,cb){
				request({
					url:'http://api.bilibili.cn/userinfo?mid='+mid
				},function(err,res,body){
					if(!err && res.statusCode == 200){
						try{
							var o = JSON.parse(body);
							var needRefresh = true;
							async.series([
								function(cb2){
									connection.query("SELECT * FROM up_history WHERE mid=? ORDER BY ts DESC LIMIT 1",[mid],
									function(err, rows, fields){
										if(err){
											console.error(err);
											throw err;
										}
										
										if(rows.length == 1){
											if(rows[0].coins == o.coins &&
											rows[0].rank == o.level_info.current_exp &&
											rows[0].fans == o.fans &&
											rows[0].friends == o.friend){
												needRefresh = false;
											}
										}
										cb2();
									});
									
								},
								function(cb2){
									connection.query("REPLACE INTO up (`mid`,`name`,`face`,`birthday`,`regtime`,`description`,`sign`) VALUES (?,?,?,?,?,?,?);",
									[mid,o.name,o.face,o.birthday,o.regtime,o.description,o.sign],
									function(err,rows){
										if(err){
											console.error(err);
											console.error('写入'+mid+'的用户数据时出错');
										}
										cb2();
									})
								},
								function(cb2){
									if(!needRefresh)return cb2();
									
									connection.query("REPLACE INTO up_history (`mid`,`ts`,`coins`,`rank`,`fans`,`friends`) VALUES (?,NOW(),?,?,?,?);",
									[mid,o.coins,o.level_info.current_exp,o.fans,o.friend],
									function(err,rows){
										if(err){
											console.log(err)
											console.error('写入'+mid+'的用户历史数据时出错');
										}
										cb2();
									});
								}
							],function(err){
								cb();
							});
						}catch(e){
							console.error('错误，不能获取'+'http://api.bilibili.cn/userinfo?mid='+mid);
							cb();
						}		
					}else{
						console.error('错误，不能获取'+'http://api.bilibili.cn/userinfo?mid='+mid);
						cb();
					}
				});
			},function(err){
				if(err){
					console.error('某些用户信息更新失败');
				}else{
					console.log('用户信息更新完成');				
				}
				callback();
			});
		},
		function (callback) {
			//获得用户视频列表	
			// 这里已知一个B站的BUG：如果简介之类的地方有双引号，会导致JSON坏掉……
			async.each(midList,function(mid,cb){
				request({
					url:'http://space.bilibili.com/ajax/member/getSubmitVideos?mid='+mid+'&keyword=&page=1&pagesize=100'
				},function(err,res,body){
					try{
						var o = JSON.parse(body);
						for(var i=0;i<o.data.vlist.length;i++){
							aidList.push(o.data.vlist[i]);						
						}
						
						if(o.data.pages>1){
							var pages = [];
							for(var i=2;i<=o.data.pages;i++){
								pages.push(i);
							}
							
							async.each(pages,function(page,cb2){
								request({
									url:'http://space.bilibili.com/ajax/member/getSubmitVideos?mid='+mid+'&keyword=&page='+page+'&pagesize=100'
								},function(err,res,body){							
									try{
										var o = JSON.parse(body);
										for(var i=0;i<o.data.vlist.length;i++){
											aidList.push(o.data.vlist[i]);						
										}
										cb2();
									}catch(e){
										console.error(e.stack);
										console.log('视频列表失败：'+mid+','+page);
										cb2();
										return;
									}
								});
							},function(err){
								cb();
							})
						}else{
							cb();
						}
						
					}catch(e){
						console.log('视频列表失败：'+mid);
						cb();
						return;
					}
				});
			},function(err){
				if(err){
					console.error('某些用户视频列表更新失败');
				}else{
					console.log('用户视频列表更新完成');				
				}
				callback();
			});
		},
		function (callback) {
			//获得视频详细信息并且更新数据库
			updateVideos(callback);
		}
	],function(err,results) {
		console.log('完成');
		connection.end();
	});

 	
}


start();
