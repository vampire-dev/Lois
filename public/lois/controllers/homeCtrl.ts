module app.controllers {
    enum ViewType { summary = 1, detail = 2 };

    class homeCtrl extends baseCtrl {
        overall: any;
        type: string;
        viewType: ViewType;

        static $inject = ['$scope', 'Notification'];

        constructor($scope, Notification) {
            super(Notification);
            this.viewType = ViewType.summary;
            this.loadOverall();
            this.onSummaryChanges('destination');
        }

        loadOverall(): void {
            var ctrl = this;
            app.api.home.getOverall(ctrl.query).then(result => {
                ctrl.overall = result.data;
            }).catch(error => {
                ctrl.notify('error', error.data);
            });
        }

        onSummaryChanges(summary: string): void {
            switch (summary) {
                case 'destination':
                    this.functions.load = app.api.home.getDestinations;
                    this.type = 'destination';
                    break;
                case 'sender':
                    this.functions.load = app.api.home.getSenders;
                    this.type = 'sender';
                    break;
                case 'paymentType':
                    this.functions.load = app.api.home.getPaymentTypes;
                    this.type = 'payment.type';
                    break;
                case 'paymentStatus':
                    this.functions.load = app.api.home.getPaymentStatuses;
                    this.type = 'payment.status';
                    break;
                case 'region':
                    this.functions.load = app.api.home.getRegions;
                    this.type = 'regions.destination';
                    break;
            }

            this.viewType = ViewType.summary;
            this.loadOverall();
            this.filter();
        }

        getDetails(id): void {
            this.filters[this.type] = id;
            this.functions.load = api.home.getAll;
            this.viewType = ViewType.detail;
            this.filter();
        }
    }

    app.lois.controller('homeCtrl', homeCtrl);
}