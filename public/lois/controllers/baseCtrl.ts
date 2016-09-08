module app.controllers {
    export class baseCtrl {
        showToolbar: boolean;
        showForm: boolean;
        checkedAll: boolean;
        loadingData: boolean;
        processing: boolean;
        filters: any;
        query: any;
        paging: any;
        functions: any;
        entity: any;
        entities: any[];

        constructor(public notification) {
            this.showToolbar = false;
            this.showForm = false;
            this.checkedAll = false;
            this.loadingData = false;
            this.processing = false;
            this.filters = {};
            this.query = {};
            this.paging = { "page": 1, "max": 10, "total": 0 };
            this.functions = { "load": null, "get": null, "save": null, "delete": null, "autocomplete": null };
        }

        filter(): void {
            this.paging.page = 1;
            this.load();
        }

        load(): void {
            var ctrl = this;
            ctrl.createQuery();
            ctrl.loadingData = true;
            ctrl.checkedAll = false;

            ctrl.functions.load(ctrl.query).then(result => {
                ctrl.entities = result.data;
            }).catch(error => {
                ctrl.notify('error', error.data);
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }

        add(): void {
            this.showForm = true;
            this.entity = null;
        }

        edit(id: any): void {
            var ctrl = this;
            ctrl.showForm = true;
            ctrl.processing = true;

            ctrl.functions.get(id).then(result => {
                ctrl.entity = result.data;
            }).catch(error => {
                ctrl.showForm = false;
                ctrl.notify('error', error.data);
            }).finally(() => {
                ctrl.processing = false;
            });
        }

        save(): void {
            var ctrl = this;
            ctrl.processing = true;

            ctrl.functions.save(ctrl.entity).then(result => {
                ctrl.notify('success', 'Data berhasil disimpan');
                ctrl.load();
                ctrl.showForm = false;
            }).catch(error => {
                ctrl.notify('error', error.data);
            }).finally(() => {;
                ctrl.processing = false;
            });
        }

        delete(id: any): void {
            var ctrl = this;
            ctrl.loadingData = true;

            ctrl.functions.delete(id).then(result => {
                ctrl.notify('success', 'Data berhasil dihapus');
                ctrl.load();
            }).catch(error => {
                ctrl.notify('error', error.data);
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }

        createQuery(): void {
            this.query = {};
            
            this.query['limit'] = this.paging.max;
            this.query['skip'] = (this.paging.page - 1) * this.paging.max;
             
            var keys = Object.keys(this.filters);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];

                if (this.filters[key] && this.filters[key]['_id'])
                    this.query[key] = this.filters[key]['_id'];
                else
                    this.query[key] = this.filters[key];
            }
        }

        next(): void {
            if (this.entities.length === 0)
                return;

            this.paging.page += 1;
            this.load();
        }

        prev(): void {
            if ((this.paging.page - 1) <= 0)
                return;

            this.paging.page -= 1;
            this.load();
        }

        notify(type: string, message: string): void {
            this.notification[type](message);
        }

        toggleShowForm(show: boolean): void {
            this.showForm = show;
            this.entity = null;
        }

        toggleCheckAll(): void {
            this.entities.map(e => e.checked = this.checkedAll);
        }

        suggest(name: string, keyword: string) {
            return this.functions.autocomplete(name, keyword).then(result => {
                return result.data;
            });
        }
    }
}