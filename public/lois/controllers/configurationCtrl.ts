/// <reference path="../lois" />
/// <reference path="../api" />

module app.controllers {
    class configurationCtrl extends baseCtrl {
        config: string;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.functions.load = api.configuration.getAll;
            this.functions.get = api.configuration.get;
            this.functions.save = api.configuration.save;
            this.functions.delete = api.configuration.delete;
            this.functions.autocomplete = api.autocomplete.getAll;

            this.onConfigChange('region');
        }

        onConfigChange(config: string): void {
            this.config = config;
            this.paging.page = 1;
            this.filters = {};
            this.filter();
        }

        filter(): void {
            var ctrl = this;

            ctrl.createQuery();
            ctrl.loadingData = true;

            ctrl.functions.load(ctrl.config, ctrl.query).then(result => {
                ctrl.entities = result.data;
            }).catch(error => {
                ctrl.notify('error', error.message);
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }

        edit(id: any): void {
            var ctrl = this;
            ctrl.processing = true;
            ctrl.showForm = true;

            ctrl.functions.get(ctrl.config, id).then(result => {
                ctrl.entity = result.data;
            }).catch(error => {
                ctrl.notify('error', error.data);
            }).finally(() => {
                ctrl.processing = false;
            });
        }

        save(): void {
            var ctrl = this;
            ctrl.processing = true;

            ctrl.functions.save(ctrl.config, ctrl.entity).then(result => {
                ctrl.notify('success', 'Data berhasil disimpan');
                ctrl.showForm = false;
                ctrl.filter();
            }).catch(exception => {
                ctrl.notify('error', exception.data);
            }).finally(() => {
                ctrl.processing = false;
            });
        }

        delete(id): void {
            var confirmed = confirm('Data akan dihapus, anda yakin?');

            if (!confirmed)
                return;

            var ctrl = this;
            ctrl.functions.delete(ctrl.config, id).then(result => {
                ctrl.notify('success', 'Data berhasil dihapus');
                ctrl.filter();
            }).catch(exception => {
                ctrl.notify('error', exception.data);
            });
        }
    }

    app.lois.controller('configurationCtrl', configurationCtrl);
}