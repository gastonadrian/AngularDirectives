(function () {
    var root = this;

    defineBundledLibraries();
    loadPluginsAndBoot();

    function defineBundledLibraries() {
        // These are already loaded via bundles. 
        // We define them and put them in the root object.
        define('jquery', [], function () { return root.jQuery; });
        define('jqueryui', ['jquery'], function ($) { return root.jQuery.ui; });
        define('angular', [], function () { return root.angular; });
        define('ui-bootstrap', ['angular'], function ($) { return root.angular; });
        define('ngResource', ['jquery'], function ($) { return root.angular; });
        define('ngGrid', ['angular', 'jquery'], function ($) { return root.ngGrid; });
    }

    function loadPluginsAndBoot() {

        require.config({
            baseUrl: '/scripts',
            paths: {
                app: './app',
                lib: './lib'
            }
        });

        require(['angular', 'app/app'],
            function(angular, app) {
                angular.element(document).ready(function() {
                    angular.bootstrap(angular.element('[data-ng-itcapp]'), ['itcApplication']);
                });
            }
        );
    }
})();