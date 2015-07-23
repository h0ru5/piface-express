angular.module('piface', ['primus'])
  .factory('piface', ['primus', '$log', '$http',
    function(primus, $log, $http) {
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
          "value": !!val
        });
      };

      var inputsChanged = function(data) {
        this.inputs = data;
        angular.forEach(inputCbs, function(cb) {
          cb(data);
        });
      };

      $http.get('/inputs')
        .success(function(inputs) {
          inputsChanged(inputs);
        });

      primus.$on('data', function(data) {
        $log.log('got data: ' + JSON.stringify(data));
        inputsChanged(data);
      });

      return this;
    }
  ]);
