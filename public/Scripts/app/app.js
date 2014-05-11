define('app/app',
    ['angular', 'app/services', 'app/controllers', 'app/configuration', 'app/directives', 'app/filters', 'ui-bootstrap'],
    function(angular, services, controllers, configuration, directives, bootstrap) {
        'use strict';

        return angular
            .module('itcApplication', ['ui.bootstrap', 'services', 'controllers', 'directives', 'filters'])
            .factory('requestInterceptor', [
                '$q',
                '$rootScope',
                function($q, scope) {
                    return {
                        // On request success
                        request: function(config) {

                            if (config.showAlert || config.url.indexOf('htm')) {
                                Pace.trackPost();
                                scope.showAlert = true;
                                scope.alertMessage = config.loadingMessage || 'Cargando...';
                            } else if (!scope.showAlert) {
                                Pace.restart();
                            }

                            // Return the config or wrap it in a promise if blank.
                            return config || $q.when(config);
                        },

                        // On request failure
                        requestError: function(rejection) {

                            // Return the promise rejection.
                            return $q.reject(rejection);
                        },

                        // On response success
                        response: function(response) {

                            if (scope.showAlert && response.config.showAlert || !scope.showAlert || response.config.url.indexOf('htm')) {
                                Pace.stop();
                                scope.showAlert = false;
                            }

                            // Return the response or promise.
                            return response || $q.when(response);
                        },

                        // On response failture
                        responseError: function(rejection) {

                            var promiseResponse = {};

                            // this cover the following case
                            // 1) start an alert loading
                            // 2) start another loading
                            // 3) end ajax loading -- does not fire stop, because the showAlert is true
                            // 4) end alert loading
                            if (scope.showAlert && rejection.config.showAlert || !scope.showAlert || rejection.config.url.indexOf('htm')) {
                                Pace.stop();
                                scope.showAlert = false;
                            }

                            switch (rejection.status) {
                            case 0:
                            case 401:
                            case 403:
                                window.location.href = '/accounts/login';
                                promiseResponse = {
                                    status: 401,
                                    text: 'Unauthorized'
                                };
                                break;
                            case 404:
                                promiseResponse = {
                                    status: 404,
                                    text: 'No encontrado'
                                };
                                scope.errorsModalTitle = 'No encontrado';
                                scope.errorsModalText = 'El registro que ud estaba buscando no se ha encontrado.';
                                scope.errorsModalState = 'info';
                                scope.showErrorsModal = true;
                                return $q.reject(promiseResponse);
                                break;
                            case 500:
                                //global.location.href = errorPage;
                                promiseResponse = {
                                    status: 500,
                                    text: 'Internal Server Error'
                                };

                                scope.errorsModalTitle = 'Error';
                                scope.errorsModalText = 'Se ha producido un error';
                                scope.errorsModalState = 'danger';
                                scope.showErrorsModal = true;

                                return $q.reject(promiseResponse);
                                break;
                            default:
                                var tmpErrors = rejection.data.ModelState;
                                var errors = '';
                                for (var key in tmpErrors) {
                                    errors += tmpErrors[key] + '\n';
                                }

                                scope.errorsModalTitle = 'Atención';
                                errors = errors || 'Revise los datos ingresados.';
                                scope.errorsModalState = 'warning';
                                scope.errorsModalText = errors;
                                scope.showErrorsModal = true;

                                promiseResponse = {
                                    status: rejection.status,
                                    text: errors
                                };
                                return $q.reject(promiseResponse);
                            }

                            // Return the promise rejection.
                            return $q.reject(rejection);
                        }
                    };
                }
            ])
            .config([
                '$routeProvider',
                '$httpProvider',
                function($routeProvider, $httpProvider) {
                    angular.forEach(configuration.routes, function(element) {
                        $routeProvider.when(element.url, { templateUrl: element.templateUrl, controller: element.controller });
                    });
                    $routeProvider.otherwise({ redirectTo: configuration.routes[0].url });

                    $httpProvider.interceptors.push('requestInterceptor');

                    // Override only if native toISOString is not defined
                    if (!Date.prototype.toISOString) {
                        // Here we rely on JSON serialization for dates because it matches 
                        // the ISO standard. However, we check if JSON serializer is present 
                        // on a page and define our own .toJSON method only if necessary
                        if (!Date.prototype.toJSON) {
                            Date.prototype.toJSON = function (key) {
                                function f(n) {
                                    // Format integers to have at least two digits.
                                    return n < 10 ? '0' + n : n;
                                }

                                return this.getUTCFullYear() + '-' +
                                    f(this.getUTCMonth() + 1) + '-' +
                                    f(this.getUTCDate()) + 'T' +
                                    f(this.getUTCHours()) + ':' +
                                    f(this.getUTCMinutes()) + ':' +
                                    f(this.getUTCSeconds()) + 'Z';
                            };
                        }

                        Date.prototype.toISOString = Date.prototype.toJSON;
                    }
                }
            ]);
    }
);