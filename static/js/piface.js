angular.module('piface', ['primus'])
  .provider('piface',pifaceProvider)

function pifaceProvider(primusProvider) {
  var provider = this;
  this.$get = ['primus', '$log', '$http', pifaceFactory];

  provider.endpoint = "";

  provider.setEndpoint = function setEndpoint(endpoint) {
    this.endpoint = endpoint;
    primusProvider.setEndpoint(endpoint);
    return this;
  }

  function pifaceFactory(primus, $log, $http) {
      var piface = this;
      piface.primus = primus;
      piface.inputs = {};
      var inputCbs = [];

      piface.watchInputs = function(cb) {
        inputCbs.push(cb);
      };

      piface.setOutputs = function(byte) {
        return $http.put(provider.endpoint + '/outputs', {
          "register": byte
        });
      };

      piface.setSingleOutput = function(num, val) {
        return $http.put(provider.endpoint + '/outputs/' + num, {
          "value": !!val
        });
      };

      var inputsChanged = function(data) {
        piface.inputs = data;
        angular.forEach(inputCbs, function(cb) {
          cb(data);
        });
      };

      $http.get(provider.endpoint + '/inputs')
        .success(function(inputs) {
          inputsChanged(inputs);
        });

      primus.$on('data', function(data) {
        $log.log('got data: ' + JSON.stringify(data));
        inputsChanged(data);
      });

      return piface;
    }
  }
