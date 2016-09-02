/// <reference path="../app" />
/// <reference path="../api" />

module app.controllers {
    import api = app.api;

    class indexCtrl {
        static $inject = ['$scope', 'Notification'];

        constructor($scope, public Notification) {
            this.init();
        }

        init(): void {

        }
    }

    app.controller('indexCtrl', indexCtrl);
}