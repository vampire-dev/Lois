module app.controllers {
    enum FilterType { delivery = 0, cancelDelivery = 1 };

    class deliveryCtrl extends baseCtrl {
        filterType: FilterType;
        vehicleNumber: string;
        driver: any;
        deliveryCode: string;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.functions.load = api.delivery.getAll;
            this.functions.autocomplete = api.autocomplete.getAll;
            this.filterType = FilterType.delivery;
            this.filter();
        }

        load(): void {
            var ctrl = this;

            ctrl.checkedAll = false;
            ctrl.createQuery();
            ctrl.loadingData = true;
            ctrl.functions.load = ctrl.filterType === FilterType.delivery ? app.api.delivery.getAll : app.api.delivery.getAllCancel;

            ctrl.functions.load(ctrl.query).then(result => {
                ctrl.entities = result.data;
                ctrl.entities.map(e => {
                    e['viewModel'] = {};
                    e['viewModel']['limasColor'] = null;
                    e['viewModel']['relationColor'] = null;
                    e['viewModel']['notes'] = null;
                    e['viewModel']['quantity'] = ctrl.filterType === FilterType.delivery ? e.items.recapitulations.available : e.items.deliveries.available;
                });
            }).catch(error => {
                ctrl.notify('error', error.data);
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }

        process(): void {
            if (this.filterType === FilterType.delivery)
                this.delivery();
            else if (this.filterType === FilterType.cancelDelivery)
                this.cancelDelivery();
        }

        delivery(): void {
            if (!this.driver) {
                this.notify('warning', 'Supir harus diisi');
                return;
            }

            if (!this.vehicleNumber || this.vehicleNumber == '') {
                this.notify('warning', 'No mobil harus diisi')
                return;
            }

            var checkedEntities = this.entities.filter(e => e.checked);

            if (checkedEntities.length === 0) {
                this.notify('warning', 'Tidak ada item yang dipilih');
                return;
            }

            var viewModels = [];

            checkedEntities.forEach(entity => {
                var viewModel = {
                    shipping: entity._id,
                    item: entity.items._id,
                    recapitulation: entity.items.recapitulations._id,
                    quantity: entity.viewModel.quantity,
                    limasColor: entity.viewModel.limasColor,
                    relationColor: entity.viewModel.relationColor,
                    deliveryCode: this.deliveryCode,
                    driver: this.driver._id,
                    vehicleNumber: this.vehicleNumber
                };

                viewModels.push(viewModel);
            });

            var ctrl = this;

            app.api.delivery.delivery(viewModels).then(result => {
                ctrl.notify('success', 'Proses delivery berhasil');
                ctrl.load();
            }).catch(error => {
                ctrl.notify('error', 'Delivery gagal ' + error.data);
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }

        cancelDelivery(): void {
            var checkedEntities = this.entities.filter(e => e.checked);

            if (checkedEntities.length === 0) {
                this.notify('warning', 'Tidak ada item yang dipilih');
                return;
            }

            var viewModels = [];

            checkedEntities.forEach(entity => {
                var viewModel = {
                    shipping: entity._id,
                    item: entity.items._id,
                    recapitulation: entity.items.recapitulations._id,
                    quantity: entity.viewModel.quantity,
                    delivery: entity.items.deliveries._id
                };

                viewModels.push(viewModel);
            });

            var ctrl = this;

            app.api.delivery.cancelDelivery(viewModels).then(result => {
                ctrl.notify('success', 'Proses cancel delivery berhasil');
                ctrl.load();
            }).catch(error => {
                ctrl.notify('error', 'Cancel delivery gagal ' + error.data);
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }
    }

    app.lois.controller('deliveryCtrl', deliveryCtrl);
}