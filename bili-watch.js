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

function updateVideos(callback){
	if(aidList.length<=0){
		callback();
		return;
	}
	
	if(downloadNum++%8==0){
		setTimeout(updateVideos,3500,callback);
	}else{
		setTimeout(updateVideos,100,callback);
	}
	
	
	var a = aidList.pop();
	var aid = a.aid;
	
	request({
		'url':'http://api.bilibili.com/view'+createUrl(req,aid),
	},function (err, response, body) {
		try{
			var o = JSON.parse(body);
			if(o.code && o.code=='-403'){
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
			}
			
			connection.query("REPLACE INTO video (`aid`,`mid`,`title`,`description`,`created`,`pic`) VALUES (?,?,?,?,?,?);",
			[aid,o.mid,o.title,o.description,o.created_at,o.pic]
			,function(err,rows){
				if(err){
					console.log(err);
					console.log(o)
					console.log('写入视频数据出错：'+aid);
				}
			});
			
			connection.query("REPLACE INTO video_history (`aid`,`ts`,`play`,`review`,`video_review`,`favorites`,`coins`) VALUES (?,NOW(),?,?,?,?,?)",
			[aid,o.play,o.review,o.video_review,o.favorites,o.coins],
			function(err,rows){
				if(err){
					console.log(err);
					console.log(o)
					console.log('写入视频数据出错：'+aid);
				}
			})
		}catch(e){
			console.log('视频数据出错:'+aid);
		}
	});
}

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
					var o = JSON.parse(body);
					connection.query("REPLACE INTO up (`mid`,`name`,`face`,`birthday`,`regtime`,`description`,`sign`) \
					VALUES ("+mid+",'"+o.name+"','"+o.face+"','"+o.birthday+"',"+o.regtime+",'"+o.description+"','"+o.sign+"');"
					,function(err,rows){
						if(err){
							console.error('写入'+mid+'的用户数据时出错');
						}
						connection.query("REPLACE INTO up_history (`mid`,`ts`,`coins`,`rank`,`fans`,`friends`) \
						VALUES ("+mid+",NOW(),'"+o.coins+"','"+o.level_info.current_exp+"',"+o.fans+",'"+o.friend+"');"
						,function(err,rows){
							if(err){
								console.log(err)
								console.error('写入'+mid+'的用户历史数据时出错');
							}
							cb();
						});
					})
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
		async.each(midList,function(mid,cb){
			request({
				url:'http://space.bilibili.com/ajax/member/getSubmitVideos?mid='+mid+'&keyword=&page=1'
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
								url:'http://space.bilibili.com/ajax/member/getSubmitVideos?mid='+mid+'&keyword=&page='+page
							},function(err,res,body){
								try{
									var o = JSON.parse(body);
									for(var i=0;i<o.data.vlist.length;i++){
										aidList.push(o.data.vlist[i]);						
									}
									cb2();
								}catch(e){
									console.log('视频列表失败：'+mid);
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
	},
	function (callback) {
		connection.end();
		console.log('已经关闭到数据库的连接');
	}
],function(err,results) {
	console.log('完成');
});

 
