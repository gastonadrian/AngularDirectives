define('app/controllers', ['app/services']
    , function (services) {
        'use strict';

        angular.module('controllers', ['services'])
            .controller('AllCtrl', [
                '$scope',
                function (scope) {
                                        
                    scope.all = {
                        removeData: null,
                        showRemoveModal: false,
                    };

                    scope.all.openRemoveModal = function (data) {
                        scope.all.removeData = data;
                        scope.all.showRemoveModal = true;
                    };
                }
            ])
            .controller('EditCtrl', [
                '$scope',
                'dataContext',
                '$routeParams',
                '$location',
                function (scope, dc, routeParams, location) {

                    dc.get({ id: routeParams.id }, function (data) {
                        scope.Data = data;
                    });

                    scope.Save = function () {
                        if (!scope.dataForm || scope.dataForm.$valid) {
                            dc.update(scope.Data, function() {
                                location.path('/');
                            });
                        }
                    };

                    scope.ResetLegend = 'Cancelar';

                    scope.Reset = function () {
                        location.path('/');
                    };

                }
            ])
            .controller('CreateCtrl', [
                '$scope',
                'dataContext',
                '$location',
                function (scope, dc, location) {

                    scope.create = true;

                    scope.Save = function () {
                        if (!scope.dataForm || scope.dataForm.$valid) {

                            var success = function() {
                                location.path('/');
                            };
                            dc.add(scope.Data, success);
                        }
                    };
                    scope.ResetLegend = 'Limpiar';

                    scope.Reset = function () {
                        scope.Data = {};
                    };
                }
            ]);
    }
);