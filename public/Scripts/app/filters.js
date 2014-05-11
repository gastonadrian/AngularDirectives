define('app/filters',
    ['angular'],
    function(angular) {
        'use strict';

        return angular.module('filters', []).
            filter('booleanTranslate', function() {
                return function(input) {
                    var out = input === true ? 'Si' : 'No';
                    return out;
                };
            });
    });