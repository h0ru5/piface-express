var pfio = require('piface-node');
var Primus = require("primus");
var app = require("./express-setup");

var server = require('http').createServer(app);
var primus = new Primus(server);

var observers = [];
var prev_state=0;

primus.on('connection', function(spark) {
  observers.push(spark);
});

primus.on('disconnection', function(spark) {
  var idx = observers.indexOf(spark);
  if (idx != -1) {
    observers.splice(idx, 1);
  }
});

//watch for changes and notify observers
var hin = setInterval(function() {
  var state = pfio.read_input();
  if (state !== prev_state) {
		prev_state = state;
    var state_obj = app.register2Obj(state,true);
    observers.forEach( function(obs) {
       obs.write(state_obj);
     });
    console.log("new state  %s",JSON.stringify(state_obj) );
	}
},50);

server.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  pfio.init();
  console.log('Piface app listening at http://%s:%s', host, port);
  process.on('SIGINT', function() {
    clearInterval(hin);
    pfio.deinit();  
  });
});
