define('app/services',
    ['angular', 'app/configuration', 'ngResource'],
    function(angular, configuration, ngResource) {
        'use strict';

        angular.module('services', ['ngResource']) //module service name
            .factory('dataContext', //factory of one of the services
            [
                '$resource',
                function(resource) {
                    var rs = resource('/api/:controller/:action', { controller: configuration.entityController }, {
                        getPage: { method: 'GET', params: {action: 'getPage'}, headers: { formToken: configuration.formToken, cookieToken: configuration.cookieToken }, isArray: false, showAlert: true },
                        get: { method: 'GET', params: { action: 'get' }, headers: { formToken: configuration.formToken, cookieToken: configuration.cookieToken }, isArray: false, showAlert: true },
                        add: { method: 'POST', params: {}, headers: { formToken: configuration.formToken, cookieToken: configuration.cookieToken }, isArray: false, showAlert: true, loadingMessage: 'Guardando...' },
                        update: { method: 'POST', params: { id: '@Id' }, headers: { 'X-HTTP-METHOD-OVERRIDE': 'PUT', formToken: configuration.formToken, cookieToken: configuration.cookieToken }, isArray: false, showAlert: true, loadingMessage: 'Guardando...' },
                        remove: { method: 'POST', params: { id: '@Id' }, headers: { 'X-HTTP-METHOD-OVERRIDE': 'DELETE', formToken: configuration.formToken, cookieToken: configuration.cookieToken }, isArray: false, showAlert: true, loadingMessage: 'Guardando...' }
                    });

                    return {
                        getPage: rs.getPage,
                        get: rs.get,
                        add: rs.add,
                        update: rs.update,
                        remove: rs.remove
                    };
                }
            ]);
    }
);