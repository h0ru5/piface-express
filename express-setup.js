var express = require('express');
var app = express();
var pfio = require('pfio');
var bodyParser = require('body-parser');

var byte2bit = app.byte2bit = function(byte, flip) {
  var res = [];
  for (var i = 0; i < 8; i++) {
    res[i] = (byte & (1 << i)) === (1 << i);
    if (flip) res[i] = !res[i];
  }
  return res;
};

var register2Obj= app.register2Obj = function(byte,flip) {
  var states = byte2bit(byte, !!flip);
  return {
    'register': byte,
    'state': states
  };
};

app.use('/static', express.static('static'));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  //should use HATEOAS here
  res.send('basic piface service, use /inputs or /outputs');
});

app.get('/inputs', function(req, res) {
  var regbyte = pfio.read_input();
  res.json(register2Obj(regbyte,true));
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
    res.json(register2Obj(regbyte));
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

module.exports = app;
