angular.module('piface-demo', ['piface'])
  .controller('PiFaceCtrl', ["$scope", 'piface',
    function($scope, piface) {
      $scope.data = {};
      piface.watchInputs(function(inputs) {
        $scope.data = inputs;
      });

      $scope.clearOutputs = function() {
        piface.setOutputs(0x00);
      };

      $scope.randomHigh = function() {
        var rnd_0to7 = Math.floor((Math.random() * 7) + 1);
        piface.setSingleOutput(rnd_0to7, true);
      };
    }
  ]);
