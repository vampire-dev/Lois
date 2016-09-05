module app.controllers {
    class loginCtrl {
        user: any;
    
        static $inject = ['$scope', 'Notification'];

        constructor($scope, public Notification) {

        }

        login(): void {
            var ctrl = this;
            api.user.login(ctrl.user).then(result => {
                window.location.href = '/lois';
            }).catch(error => {
                ctrl.Notification.error(error.data);
            });
        }
    }

    app.lois.controller('loginCtrl', loginCtrl);
}