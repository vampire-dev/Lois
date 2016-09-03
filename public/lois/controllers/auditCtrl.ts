module app.controllers {
    class auditCtrl extends baseCtrl {

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.functions.load = api.audit.getAll;
            this.filter();
        }

        process(status: string, entity: any): void {
            var ctrl = this;
            ctrl.loadingData = true;

            entity['status'] = status;

            api.audit.process(entity).then(result => {
                ctrl.notify('success', 'Audit selesai');
                ctrl.filter();
            }).catch(error => {
                ctrl.notify('error', error.data);
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }
    }

    app.lois.controller('auditCtrl', auditCtrl);
}
