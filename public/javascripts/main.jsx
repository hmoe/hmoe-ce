$(function(){
  var up;
  var up_dom = [];
  
  var UpInfoBox = React.createClass({
    render: function() {
      return (
        <div className="up-info" >
          <img className="up-face" src={this.props.face}/>
          <h3 className="up-name">{this.props.name}</h3>
          <div className="up-sign" title={this.props.sign}>{this.props.sign}</div>
        </div>
      );
    }
  });
  
  var UpInfoScreen =  React.createClass({
    render: function() {
      return (
         <div id="up-list">{up_dom}</div>
      );
    }
  });
  
  $.getJSON('./users',function(data){
    $('#content').fadeIn(3000);
    up = data;
    for(var i=0;i<up.length;i++){
      up[i].birthday = up[i].birthday.substring(0,10);
      var d = new Date(parseInt(up[i].regtime) *1000);
      up[i].regtime = d.getFullYear()+'-'+(d.getMonth+1)+'-'+d.getDate();
      up_dom.push(React.createElement(UpInfoBox,{
        face:up[i].face,
        name:up[i].name,
        sign:up[i].sign
      }));
    }
    ReactDOM.render(
      <UpInfoScreen/>,
      document.getElementById('content')
    );
  })
});