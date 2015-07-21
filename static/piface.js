var PiFaceCtrl = function($scope, piface) {
  $scope.data = {};
  piface.watchInputs(function(inputs) {
    $scope.data = inputs;
  });

  $scope.clearOutputs = function() {
      piface.setOutputs(0x00);
  };

  $scope.randomHigh = function() {
    var rnd_0to7 = Math.floor((Math.random() * 7) +1);
    piface.setSingleOutput(rnd_0to7,true);
  };
};

var PiFaceSvc = function(primus, $log, $http) {
  this.primus = primus;
  this.inputs = {};
  var inputCbs = [];

  this.watchInputs = function(cb) {
    inputCbs.push(cb);
  };

  this.setOutputs = function(byte) {
    return $http.put('/outputs', {
      "register": byte
    });
  };

 this.setSingleOutput = function(num, val) {
   return $http.put('/outputs/' + num, {
     "value" : !!val
   });
 };

  var inputsChanged = function(data) {
    this.inputs = data;
    angular.forEach(inputCbs, function(cb) {
      cb(data);
    });
  };

  $http.get('/inputs').success(function(inputs) {
    inputsChanged(inputs);
  });

  primus.$on('data', function(data) {
    $log.log('got data: ' + JSON.stringify(data));
    inputsChanged(data);
  });

  return this;
};

angular.module('piface', ['primus'])
  .config(function(primusProvider) {
    primusProvider.setEndpoint('/primus');
  })
  .factory('piface', ['primus', '$log', '$http', PiFaceSvc])
  .controller('PiFaceCtrl', ["$scope", 'piface', PiFaceCtrl]);
