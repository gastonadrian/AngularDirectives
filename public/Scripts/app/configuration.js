define('app/configuration',
    [], function () {
        'use strict';
        var entity = window.entity;
        var cookieToken = window.cookietoken;
        var formToken = window.formtoken;

        
        var routes = [
            { url: '/',  templateUrl: '/views/' + entity + '/all.html', controller: 'AllCtrl' },
            { url: '/edit/:id', templateUrl: '/views/' + entity + '/edit.html', controller: 'EditCtrl' },
            { url: '/create', templateUrl: '/views/' + entity + '/edit.html', controller: 'CreateCtrl' }
        ];
        
        return {
            routes: routes,
            entityController: entity,
            cookieToken: cookieToken,
            formToken: formToken
        };    
    });