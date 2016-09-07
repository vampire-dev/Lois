module app.controllers {
    class reportCtrl extends baseCtrl {
        reports: any[];
        activeReport: string;
        renderFunc: Function;
        dataFunc: Function;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.showToolbar = true;
            this.functions.autocomplete = api.autocomplete.getAll;
            this.init();
        }

        init(): void {
            var ctrl = this;
            app.api.user.getSession().then(result => {
                var roleReports = <Array<any>>result.data['reports'];
                ctrl.reports = roleReports.map(e => e.report);
            });
        }

        onReportChange(report: string): void {
            this.activeReport = report;

            switch (report) {
                case 'Belum Terbayar':
                    this.functions.load = api.report.getUnpaid;
                    this.dataFunc = api.report.getUnpaidReport;
                    this.renderFunc = api.reportPrint.printUnpaid;
                    break;
                case 'Terbayar':
                    this.functions.load = api.report.getPaid;
                    this.dataFunc = api.report.getPaidReport;
                    this.renderFunc = api.reportPrint.printPaid;
                    break;
                case 'Rekapitulasi':
                    this.functions.load = api.report.getRecapitulations;
                    this.dataFunc = api.report.getRecapitulationsReport;
                    this.renderFunc = api.reportPrint.printRecapitulation;
                    break;
                case 'Pengiriman':
                    this.functions.load = api.report.getDeliveries;
                    this.dataFunc = api.report.getDeliveriesReport;
                    this.renderFunc = api.reportPrint.printDelivery;
                    break;
                case 'Retur':
                    this.functions.load = api.report.getReturns;
                    this.dataFunc = api.report.getReturnsReport;
                    this.renderFunc = api.reportPrint.printReturn;
                    break;
                case 'SJ Belum Kembali':
                    this.functions.load = api.report.getUnconfirmed;
                    this.dataFunc = api.report.getUnconfirmedReport;
                    this.renderFunc = api.reportPrint.printUnconfirmed;
                    break;
                case 'Daftar Kiriman':
                    this.functions.load = api.report.getDeliveryList;
                    this.dataFunc = api.report.getDeliveryListReport;
                    this.renderFunc = api.reportPrint.printDeliveryList;
                    break;
                case 'Komisi':
                    this.functions.load = api.report.getCommisions;
                    this.dataFunc = api.report.getCommisionsReport;
                    this.renderFunc = api.reportPrint.printCommision;
                    break;
            }

            this.filters = {};
            this.paging.page = 1;
            this.filter();
        }

        print(): void {
            var checkedEntities = this.entities.filter(e => e.checked);

            if (checkedEntities.length === 0) {
                this.notify('warning', 'Tidak ada data yang pilih');
                return;
            }

            var ctrl = this;
            ctrl.loadingData = true;

            var dataFunction = ctrl.dataFunc(checkedEntities, ctrl.query); 

            dataFunction.then(result => {
                ctrl.renderFunc(result.data).then(buffer => {
                    var blob = new Blob([buffer.data], { type: 'application/pdf' });
                    var url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                });
            }).finally(() => {
                ctrl.loadingData = false;
            });
        }
    }
    
    app.lois.controller('reportCtrl', reportCtrl);
}