angular.module('piface-demo', ['piface','ngMaterial'])
    .controller('PiFaceCtrl', ["$scope", 'piface',
        function($scope, piface) {
            $scope.inputs = {};
            $scope.outputs = [];

            for (var i=0;i<8;i++) {
                $scope.outputs.push(
                    {
                        "number": i,
                        "value" : false,
                        "setTo" : function(nV) {
                            this.value=nV;
                            console.log("setting output " + this.number + " to " + this.value);
                            piface.setSingleOutput(this.number,this.value);
                        }
                    }
                );
            }

            piface.watchInputs(function(inputs) {
                $scope.inputs = inputs;
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
