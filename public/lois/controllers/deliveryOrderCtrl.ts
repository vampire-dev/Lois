module app.controllers {
    class deliveryOrderCtrl extends baseCtrl {
        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.functions.load = api.deliveryOrder.getAll;
            this.functions.autocomplete = api.autocomplete.getAll;
            this.filter();
        }

        print(entity: any): void {
            var ctrl = this;

            ctrl.loadingData = true;
            api.deliveryOrder.getDataReport(entity).then(result => {
                api.reportPrint.printDeliveryOrder(result.data).then(buffer => {
                    var blob = new Blob([buffer.data], { type: 'application/pdf' });
                    var url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                });
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }
    }

    app.lois.controller('deliveryOrderCtrl', deliveryOrderCtrl);
}