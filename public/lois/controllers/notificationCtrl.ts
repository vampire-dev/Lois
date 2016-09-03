module app.controllers {
    class notificationCtrl extends baseCtrl {
        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.functions.load = api.notification.getAll;
            this.functions.delete = api.notification.delete;
            this.filter();
        }

        viewFile(file: string): void {
            window.open('berita_acara/' + file, '_blank');
        }
    }

    app.lois.controller('notificationCtrl', notificationCtrl);
}