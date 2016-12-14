module app.controllers {
    enum ViewType { shipping = 1, item = 2 };

    class deliveryOrderCtrl extends baseCtrl {
        viewType: ViewType;
        selectedEntity: any;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.viewType = ViewType.shipping;
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

        viewDetail(entity: any): void {
            this.viewType = ViewType.item;
            this.selectedEntity = entity;
        }

        viewShipping(): void {
            this.viewType = ViewType.shipping;
            this.selectedEntity = null;
        }
    }

    app.lois.controller('deliveryOrderCtrl', deliveryOrderCtrl);
}