module app.controllers {
    enum FilterType { recap = 0, cancelRecap = 1 };

    class recapitulationCtrl extends baseCtrl {
        filterType: FilterType;
        vehicleNumber: string;
        driver: any;
        trainType: any;
        departureDate: any;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.functions.load = api.recapitulation.getAll;
            this.functions.autocomplete = api.autocomplete.getAll;
            this.filterType = FilterType.recap;
            this.filter();
        }

        load(): void {
            var ctrl = this;

            ctrl.checkedAll = false;
            ctrl.createQuery();
            ctrl.loadingData = true;
            ctrl.functions.load = ctrl.filterType === FilterType.recap ? app.api.recapitulation.getAll : app.api.recapitulation.getAllCancel;

            ctrl.functions.load(ctrl.query).then(result => {
                ctrl.entities = result.data;
                ctrl.entities.map(e => {
                    e['viewModel'] = {};
                    e['viewModel']['limasColor'] = null;
                    e['viewModel']['relationColor'] = null;
                    e['viewModel']['notes'] = null;
                    e['viewModel']['quantity'] = ctrl.filterType === FilterType.recap ? e.items.colli.available : e.items.recapitulations.available;
                });
            }).catch(error => {
                ctrl.notify('error', error.data);
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }

        process(): void {
            if (this.filterType === FilterType.recap)
                this.recap();
            else if (this.filterType === FilterType.cancelRecap)
                this.cancelRecap();
        }

        recap(): void {
            if (!this.driver) {
                this.notify('warning', 'Supir harus diisi');
                return;
            }

            if (!this.trainType) {
                this.notify('warning', 'Jenis kereta harus diisi');
                return;
            }

            if (!this.departureDate || this.departureDate == '') {
                this.notify('warning', 'Tanggal berangkat harus diisi')
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
                var departureDate = new Date(this.departureDate);
                var viewModel = {
                    shipping: entity._id,
                    item: entity.items._id,
                    quantity: entity.viewModel.quantity,
                    limasColor: entity.viewModel.limasColor,
                    relationColor: entity.viewModel.relationColor,
                    notes: entity.viewModel.notes,
                    driver: this.driver._id,
                    trainType: this.trainType._id,
                    vehicleNumber: this.vehicleNumber,
                    departureDate: Date.UTC(departureDate.getFullYear(), departureDate.getMonth(), departureDate.getDate())
                };

                viewModels.push(viewModel);
            });

            var ctrl = this;

            app.api.recapitulation.recap(viewModels).then(result => {
                ctrl.notify('success', 'Proses rekapitulasi berhasil');
                ctrl.load();
            }).catch(error => {
                ctrl.notify('error', 'Rekapitulasi gagal ' + error.data);
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }

        cancelRecap(): void {
            var checkedEntities = this.entities.filter(e => e.checked);

            if (checkedEntities.length === 0) {
                this.notify('warning', 'Tidak ada item yang dipilih');
                return;
            }

            var viewModels = [];
            checkedEntities.forEach(entity => {
                var departureDate = new Date(this.departureDate);
                var viewModel = {
                    shipping: entity._id,
                    item: entity.items._id,
                    recapitulation: entity.items.recapitulations._id,
                    quantity: entity.viewModel.quantity
                };

                viewModels.push(viewModel);
            });

            var ctrl = this;

            app.api.recapitulation.cancelRecap(viewModels).then(result => {
                ctrl.notify('success', 'Proses cancel rekapitulasi berhasil');
                ctrl.load();
            }).catch(error => {
                ctrl.notify('error', 'Cancel rekapitulasi gagal ' + error.data);
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }
    }

    app.lois.controller('recapitulationCtrl', recapitulationCtrl);
}