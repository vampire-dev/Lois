module app.controllers {
    enum InvoiceType { Semua = 1, Klien = 2, Partner = 3 };

    class invoiceCtrl extends baseCtrl {
        tab: string;
        invoiceType: InvoiceType;
        to: string;
        location: string;
        toInvoice: string;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.tab = 'create';
            this.functions.load = api.invoice.getAll;
            this.functions.autocomplete = api.autocomplete.getAll;
            this.invoiceType = InvoiceType.Semua;
            this.filter();
        }

        onTabChange(tab: string): void {
            this.tab = tab;

            if (this.tab === 'create' || this.tab === 'change')
                this.functions.load = api.invoice.getAll;

            else if (this.tab === 'list')
                this.functions.load = api.invoice.getList;

            this.paging.page = 1;
            this.filters = {};
            this.filter();
        }

        create(): void {
            if (!this.to || this.to === '') {
                this.notify('warning', 'Tertagih harus diisi');
                return;
            }

            if (!this.location || this.location === '') {
                this.notify('warning', 'Lokasi tertagih harus diisi');
                return;
            }

            var checkedEntities = this.entities.filter(e => e.checked);

            if (checkedEntities.length === 0) {
                this.notify('warning', 'Tidak ada pengiriman yang dipilih');
                return;
            }

            var viewModels = [];
            checkedEntities.forEach(e => {
                viewModels.push({shippingId: e._id, to: this.to, location: this.location, type: InvoiceType[this.invoiceType]});
            });

            var ctrl = this;
            api.invoice.create(viewModels).then(result => {
                ctrl.notify('success', 'Tagihan berhasil dibuat');
                ctrl.filter();
            }).catch(error => {
                ctrl.notify('error', 'Tagihan gagal dibuat ' + error.data);
            });
        }

        change(): void {
            if (!this.toInvoice || this.toInvoice === '') {
                this.notify('warning', 'Tujuan invoice harus diisi');
                return;
            }

            var checkedEntities = this.entities.filter(e => e.checked);

            if (checkedEntities.length === 0) {
                this.notify('warning', 'Tidak ada pengiriman yang dipilih');
                return;
            }

            var viewModels = [];
            checkedEntities.forEach(e => {
                viewModels.push({ shippingId: e._id, fromInvoice: e.invoice.all, toInvoice: this.toInvoice });
            });

            var ctrl = this;
            api.invoice.change(viewModels).then(result => {
                ctrl.notify('success', 'Tagihan berhasil dipindahkan');
                ctrl.filter();
            }).catch(error => {
                ctrl.notify('error', 'Tagihan gagal dipindahkan ' + error.data);
            });
        }

        print(entity): void {
            var ctrl = this;
            api.invoice.getInvoiceReport(entity).then(result => {
                api.reportPrint.printInvoice(result.data).then(buffer => {
                    var blob = new Blob([buffer.data], { type: 'application/pdf' });
                    var url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                });
            });
        }
    }

    app.lois.controller('invoiceCtrl', invoiceCtrl);
}