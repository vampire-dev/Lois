module app.controllers {
    class indexCtrl {
        user: any;
        menus: any[];

        static $inject = ['$scope', 'Notification'];

        constructor($scope, public Notification) {
            this.init();
        }

        init(): void {
            var ctrl = this;

            api.user.getSession().then(result => {
                ctrl.user = result.data['name'];
                ctrl.menus = result.data['menus'].map(e => e.menu);
            }).catch(error => {
                ctrl.Notification.error(error.message);
            });
        }

        logout(): void {
            var ctrl = this;

            api.user.logout().then(result => {
                window.location.href = '/lois';
            }).catch(error => {
                ctrl.Notification.error(error.message);
            });
        }
    }

    app.lois.controller('indexCtrl', indexCtrl);
}