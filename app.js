var pfio = require('pfio');
var Primus = require("primus");
var app = require("./express-setup");

var server = require('http').createServer(app);
var primus = new Primus(server);

var observers = [];

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

server.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  pfio.init();
  console.log('Piface app listening at http://%s:%s', host, port);
  process.on('SIGINT', pfio.deinit);
});
