$(function(){
  var up;
  var up_dom = [];
  
  //up主列表项
  var UpInfoBox = React.createClass({
    click: function(){
      window.location.hash = '!user/'+this.props.mid;
    },
    render: function() {
      return (
        <div className="up-info" onClick={this.click}>
          <img className="up-face" src={this.props.face}/>
          <h3 className="up-name">{this.props.name}</h3>
          <div className="up-sign" title={this.props.sign}>{this.props.sign}</div>
        </div>
      );
    }
  });
  
  //up主列表屏幕
  var UpListScreen =  React.createClass({
    render: function() {
      return (
         <div id="up-list">{up_dom}</div>
      );
    }
  });
  
  //up主信息屏幕
  var UpInfoScreen =  React.createClass({
    getInitialState: function() {
      var _this = this;
      this.videoListDom = [];
      
      for(var i=0;i<up.length;i++){
        if(up[i].mid==this.props.mid){
          this.upinfo = up[i];
          break;
        }
      }
      
      $.getJSON('./video/'+this.upinfo.mid,function(res){
        res=res.reverse();
        for(var i=0;i<res.length;i++){
          _this.videoListDom.push(React.createElement(VideoListBox,{
            aid:res[i].aid,
            title:res[i].title,
            description:res[i].description,
            created:res[i].created.substring(0,10),
            pic:res[i].pic
          }));
        }
        _this.setState({init:true});
      });
        
      return {init: false}; 
    },
    click: function(){
      window.location.hash = '!userdata/'+this.upinfo.mid;
    },
    render: function() {
      return (
        <div id="up-screen">
          <div id="up-screen-info" onClick={this.click}>
            <img className="up-face" src={this.upinfo.face}/>
            <h3>{this.upinfo.name}</h3>
            <p>用户ID：{this.upinfo.mid}</p>
            <p>注册时间：{this.upinfo.regtime}</p>
            <p>出生日期：{this.upinfo.birthday}</p>
            <p>{this.upinfo.sign}</p>
          </div>
          <h3>用户投稿:</h3>
          <div id="video-list">{this.videoListDom}</div>
        </div>
      );
    }
  });
  
  //视频列表项
  var VideoListBox = React.createClass({
    click: function(){
      window.location.hash = '!video/'+this.props.aid
    },
    render: function() {
      return (
          <div className="video-list-container" onClick={this.click}>
            <img src={this.props.pic}/>
            <h4>{this.props.title}</h4>
            <h6>{this.props.created}</h6>
            <p>{this.props.description}</p>
          </div>
      );
    }
  });
  
  //up主图表屏幕
  var UpDataScreen =  React.createClass({
    render: function() {
      $.getJSON('./userdata/'+this.props.mid,function(res){
        var coin_data = [];
        var rank_data = [];
        var fans_data = [];
        var friends_data = [];
        
        for(var i=0;i<res.length;i++){
          var d = new Date(res[i].ts);
          coin_data.push([d,res[i].coins]);
          rank_data.push([d,res[i].rank]);
          fans_data.push([d,res[i].fans]);
          friends_data.push([d,res[i].friends]);
        }
        
        
        var coin_option = {
          title : {text : '硬币',subtext : 'coins'},
          tooltip : {
              trigger: 'item',
              formatter : function (params) {
                  var date = new Date(params.value[0]);
                  var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes();
                  return data + '<br/>'
                        + params.value[1] ;
              }
          },
          dataZoom: { show: true,start : 0 },
          legend : { data : ['coins']},grid: { y2: 80},
          xAxis : [{type : 'time', splitNumber:10 }],
          yAxis : [{type : 'value'}],
          series : [{name: 'coins',type: 'line',showAllSymbol: true,symbolSize: function (value){ return 4; },
                  data: (function () {
                      return coin_data;
                  })()
              }
          ]
        };
        var coinChart = echarts.init(document.getElementById('up-coins')); 
        coinChart.setOption(coin_option); 
        
        
        var rank_option = {
          title : {text : '等级',subtext : 'rank'},
          tooltip : {
              trigger: 'item',
              formatter : function (params) {
                  var date = new Date(params.value[0]);
                  var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes();
                  return data + '<br/>'
                        + params.value[1] ;
              }
          },
          dataZoom: { show: true,start : 0 },
          legend : { data : ['rank']},grid: { y2: 80},
          xAxis : [{type : 'time', splitNumber:10 }],
          yAxis : [{type : 'value'}],
          series : [{name: 'rank',type: 'line',showAllSymbol: true,symbolSize: function (value){ return 4; },
                  data: (function () {
                      return rank_data;
                  })()
              }
          ]
        };
        var rankChart = echarts.init(document.getElementById('up-rank')); 
        rankChart.setOption(rank_option); 
        
        
        var fans_option = {
          title : {text : '粉丝',subtext : 'fans'},
          tooltip : {
              trigger: 'item',
              formatter : function (params) {
                  var date = new Date(params.value[0]);
                  var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes();
                  return data + '<br/>'
                        + params.value[1] ;
              }
          },
          dataZoom: { show: true,start : 0 },
          legend : { data : ['fans']},grid: { y2: 80},
          xAxis : [{type : 'time', splitNumber:10 }],
          yAxis : [{type : 'value'}],
          series : [{name: 'fans',type: 'line',showAllSymbol: true,symbolSize: function (value){ return 4; },
                  data: (function () {
                      return fans_data;
                  })()
              }
          ]
        };
        var fansChart = echarts.init(document.getElementById('up-fans')); 
        fansChart.setOption(fans_option); 
        
        
        var friends_option = {
          title : {text : '好友',subtext : 'friends'},
          tooltip : {
              trigger: 'item',
              formatter : function (params) {
                  var date = new Date(params.value[0]);
                  var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes();
                  return data + '<br/>'
                        + params.value[1] ;
              }
          },
          dataZoom: { show: true,start : 0 },
          legend : { data : ['friends']},grid: { y2: 80},
          xAxis : [{type : 'time', splitNumber:10 }],
          yAxis : [{type : 'value'}],
          series : [{name: 'friends',type: 'line',showAllSymbol: true,symbolSize: function (value){ return 4; },
                  data: (function () {
                      return friends_data;
                  })()
              }
          ]
        };
        var friendsChart = echarts.init(document.getElementById('up-friends')); 
        friendsChart.setOption(friends_option); 
      });
      return (
        <div id="up-data-container">
          <div id="up-coins" className="echarts-container"></div>
          <div id="up-fans" className="echarts-container"></div>
          <div id="up-friends" className="echarts-container"></div>
          <div id="up-rank" className="echarts-container"></div>
        </div>
      );
    }
  });
  
  
  //视频图表屏幕
  var VideoDataScreen =  React.createClass({
    render: function() {
      $.getJSON('./videodata/'+this.props.aid,function(res){
        var play_data = [];
        var review_data = [];
        var video_review_data = [];
        var favorites_data = [];
        var coins_data = [];
        var credit_data = [];
        
        for(var i=0;i<res.length;i++){
          var d = new Date(res[i].ts);
          play_data.push([d,res[i].play]);
          review_data.push([d,res[i].review]);
          video_review_data.push([d,res[i].video_review]);
          favorites_data.push([d,res[i].favorites]);
          if(res[i].coins!=0)
            coins_data.push([d,res[i].coins]);
          if(res[i].credit!=0)
            credit_data.push([d,res[i].credit]);
        }
        
        var play_option = {
          title : {text : '播放数',subtext : 'play'},
          tooltip : {
              trigger: 'item',
              formatter : function (params) {
                  var date = new Date(params.value[0]);
                  var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes();
                  return data + '<br/>'
                        + params.value[1] ;
              }
          },
          dataZoom: { show: true,start : 0 },
          legend : { data : ['play']},grid: { y2: 80},
          xAxis : [{type : 'time', splitNumber:10 }],
          yAxis : [{type : 'value'}],
          series : [{name: 'play',type: 'line',showAllSymbol: true,symbolSize: function (value){ return 4; },
                  data: (function () {
                      return play_data;
                  })()
              }
          ]
        };
        var playsChart = echarts.init(document.getElementById('video-play')); 
        playsChart.setOption(play_option); 
        
        
        var review_option = {
          title : {text : 'review',subtext : 'review'},
          tooltip : {
              trigger: 'item',
              formatter : function (params) {
                  var date = new Date(params.value[0]);
                  var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes();
                  return data + '<br/>'
                        + params.value[1] ;
              }
          },
          dataZoom: { show: true,start : 0 },
          legend : { data : ['review']},grid: { y2: 80},
          xAxis : [{type : 'time', splitNumber:10 }],
          yAxis : [{type : 'value'}],
          series : [{name: 'review',type: 'line',showAllSymbol: true,symbolSize: function (value){ return 4; },
                  data: (function () {
                      return review_data;
                  })()
              }
          ]
        };
        var reviewChart = echarts.init(document.getElementById('video-review')); 
        reviewChart.setOption(review_option); 
        
        
        var video_review_option = {
          title : {text : 'video_review',subtext : 'video_review'},
          tooltip : {
              trigger: 'item',
              formatter : function (params) {
                  var date = new Date(params.value[0]);
                  var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes();
                  return data + '<br/>'
                        + params.value[1] ;
              }
          },
          dataZoom: { show: true,start : 0 },
          legend : { data : ['video_review']},grid: { y2: 80},
          xAxis : [{type : 'time', splitNumber:10 }],
          yAxis : [{type : 'value'}],
          series : [{name: 'video_review',type: 'line',showAllSymbol: true,symbolSize: function (value){ return 4; },
                  data: (function () {
                      return video_review_data;
                  })()
              }
          ]
        };
        var video_reviewChart = echarts.init(document.getElementById('video-vreview')); 
        video_reviewChart.setOption(video_review_option); 
        
        
        var favorites_option = {
          title : {text : '收藏数',subtext : 'favorites'},
          tooltip : {
              trigger: 'item',
              formatter : function (params) {
                  var date = new Date(params.value[0]);
                  var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes();
                  return data + '<br/>'
                        + params.value[1] ;
              }
          },
          dataZoom: { show: true,start : 0 },
          legend : { data : ['favorites']},grid: { y2: 80},
          xAxis : [{type : 'time', splitNumber:10 }],
          yAxis : [{type : 'value'}],
          series : [{name: 'favorites',type: 'line',showAllSymbol: true,symbolSize: function (value){ return 4; },
                  data: (function () {
                      return favorites_data;
                  })()
              }
          ]
        };
        var favoritesChart = echarts.init(document.getElementById('video-favorites')); 
        favoritesChart.setOption(favorites_option); 
        
        
        var coins_option = {
          title : {text : '硬币',subtext : 'coins'},
          tooltip : {
              trigger: 'item',
              formatter : function (params) {
                  var date = new Date(params.value[0]);
                  var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes();
                  return data + '<br/>'
                        + params.value[1] ;
              }
          },
          dataZoom: { show: true,start : 0 },
          legend : { data : ['coins']},grid: { y2: 80},
          xAxis : [{type : 'time', splitNumber:10 }],
          yAxis : [{type : 'value'}],
          series : [{name: 'coins',type: 'line',showAllSymbol: true,symbolSize: function (value){ return 4; },
                  data: (function () {
                      return coins_data;
                  })()
              }
          ]
        };
        var coinsChart = echarts.init(document.getElementById('video-coins')); 
        coinsChart.setOption(coins_option); 
        
        
        var credit_option = {
          title : {text : 'credit',subtext : 'credit'},
          tooltip : {
              trigger: 'item',
              formatter : function (params) {
                  var date = new Date(params.value[0]);
                  var data = date.getFullYear() + '-'
                        + (date.getMonth() + 1) + '-'
                        + date.getDate() + ' '
                        + date.getHours() + ':'
                        + date.getMinutes();
                  return data + '<br/>'
                        + params.value[1] ;
              }
          },
          dataZoom: { show: true,start : 0 },
          legend : { data : ['credit']},grid: { y2: 80},
          xAxis : [{type : 'time', splitNumber:10 }],
          yAxis : [{type : 'value'}],
          series : [{name: 'credit',type: 'line',showAllSymbol: true,symbolSize: function (value){ return 4; },
                  data: (function () {
                      return credit_data;
                  })()
              }
          ]
        };
        var creditChart = echarts.init(document.getElementById('video-credit')); 
        creditChart.setOption(credit_option); 
      })
      return (
        <div id="video-data-container">
          <div id="video-play" className="echarts-container"></div>
          <div id="video-coins" className="echarts-container"></div>
          <div id="video-review" className="echarts-container"></div>
          <div id="video-vreview" className="echarts-container"></div>
          <div id="video-favorites" className="echarts-container"></div>
          <div id="video-credit" className="echarts-container"></div>
        </div>
      );
    }
  });
  
  
  
  var Router = function(){
    var hash = window.location.hash;
    
    if(hash.length!=0){
      hash = hash.substring(2);
      var hashs = hash.split('/');
      if(hashs.length==2){
        $('#content').hide();
        switch(hashs[0]){
          case 'user':
            $('#content').fadeIn(1000);
            ReactDOM.render(
              <UpInfoScreen mid={hashs[1]}/>,
              document.getElementById('content')
            );
            return;
          break;
          case 'userdata':
            $('#content').fadeIn(1000);
            ReactDOM.render(
              <UpDataScreen mid={hashs[1]}/>,
              document.getElementById('content')
            );
            return;
          break;
          case 'video':
            $('#content').fadeIn(1000);
            ReactDOM.render(
              <VideoDataScreen aid={hashs[1]}/>,
              document.getElementById('content')
            );
            return;
          break;
        }
      }
      
    }
    
    //默认输出up信息列表屏幕
    $('#content').fadeIn(1000);
    ReactDOM.render(
      <UpListScreen/>,
      document.getElementById('content')
    );
    window.location.hash = '';
  }
  
  
  
  $.getJSON('./users',function(data){
    up = data;
    for(var i=0;i<up.length;i++){
      up[i].birthday = up[i].birthday.substring(0,10);
      var d = new Date(parseInt(up[i].regtime) *1000);
      up[i].regtime = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
      up_dom.push(React.createElement(UpInfoBox,{
        face:up[i].face,
        name:up[i].name,
        sign:up[i].sign,
        mid:up[i].mid,
      }));
    }
    
    Router();
    jQuery(window).bind( 'hashchange', Router);
  })
});