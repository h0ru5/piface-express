var pfio = require('pfio');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var byte2bit = function(byte, flip) {
  var res = [];
  for (var i = 0; i < 8; i++) {
    res[i] = (byte & (1 << i)) === (1 << i);
    if (flip) res[i] = !res[i];
  }
  return res;
};

app.use('/static', express.static('static'));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('hello you knuckleheads!');
});

app.get('/inputs', function(req, res) {
  var regbyte = pfio.read_input();
  var states = byte2bit(regbyte, true);
  res.json({
    'register': regbyte,
    'state': states
  });
});

app.get('/inputs/:id', function(req, res) {
  var states = byte2bit(pfio.read_input(), true);
  var pin = req.params.id;
  res.json({
    'pin': pin,
    'value': states[pin]
  });
});

app.route('/outputs')
  .get(function(req, res) {
    var regbyte = pfio.read_output();
    res.json({
      'register': regbyte,
      'state': byte2bit(regbyte)
    });
  })
  .put(function(req, res) {
    if (req.body.hasOwnProperty('register')) {
      pfio.write_output(req.body.register);
      res.end();
    } else {
      res.status(400).send("Missing key 'register' in " + JSON.stringify(req.body));
    }
  });

app.route('/outputs/:id')
  .get(function(req, res) {
    var states = byte2bit(pfio.read_output());
    var pin = req.params.id;
    res.json({
      'pin': pin,
      'value': states[pin]
    });
  })
  .put(function(req, res) {
    var pin = req.params.id;
    if (req.body.hasOwnProperty('value')) {
      pfio.digital_write(pin, req.body.value);
      res.end();
    } else {
      res.status(400).send("Missing key 'value' in " + JSON.stringify(req.body));
    }
  });


var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  pfio.init();
  console.log('Piface app listening at http://%s:%s', host, port);

  process.on('SIGINT', pfio.deinit);

});
