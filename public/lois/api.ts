module app.api {
    export class user {
        static login(data: any) {
            return http.post('/lois/api/user/authenticate', JSON.stringify(data));
        }

        static logout() {
            return http.get('/lois/api/user/logout');
        }

        static getSession() {
            return http.get('/lois/api/user/getSession');
        }
    }

    export class shipping {
        static get(id: any) {
            return http.get('/lois/api/shipping/get?id=' + id);
        }

        static getAll(query: any) {
            return http.get('/lois/api/shipping/getAll?query=' + JSON.stringify(query));
        }

        static save(data: any) {
            return http.post('/lois/api/shipping/save', JSON.stringify(data));
        }

        static add() {
            return http.post('/lois/api/shipping/add', null);
        }
    }

    export class recapitulation {
        static getAll(query: any) {
            return http.get('/lois/api/recapitulation/getAll?query=' + JSON.stringify(query));
        }

        static getAllCancel(query: any) {
            return http.get('/lois/api/recapitulation/getAllCancel?query=' + JSON.stringify(query));
        }

        static recap(data: any) {
            return http.post('/lois/api/recapitulation/recap', JSON.stringify(data));
        }

        static cancelRecap(data: any) {
            return http.post('/lois/api/recapitulation/cancelRecap', JSON.stringify(data));
        }
    }

    export class delivery {
        static getAll(query: any) {
            return http.get('/lois/api/delivery/getAll?query=' + JSON.stringify(query));
        }

        static getAllCancel(query: any) {
            return http.get('/lois/api/delivery/getAllCancel?query=' + JSON.stringify(query));
        }

        static delivery(data: any) {
            return http.post('/lois/api/delivery/delivery', JSON.stringify(data));
        }

        static cancelDelivery(data: any) {
            return http.post('/lois/api/delivery/cancelDelivery', JSON.stringify(data));
        }
    }

    export class _return {
        static getAll(query: any) {
            return http.get('/lois/api/return/getAll?query=' + JSON.stringify(query));
        }

        static getAllConfirm(query: any) {
            return http.get('/lois/api/return/getAllConfirm?query=' + JSON.stringify(query));
        }

        static return(data: any) {
            return http.post('/lois/api/return/return', JSON.stringify(data));
        }

        static confirm(data: any) {
            return http.post('/lois/api/return/confirm', JSON.stringify(data));
        }

        static upload(data: any) {
            return http.post('/lois/api/return/uploads', data, { headers: { 'Content-Type': undefined } });
        }
    }

    export class payment {
        static getAll(query: any) {
            return http.get('/lois/api/payment/getAll?query=' + JSON.stringify(query));
        }

        static pay(data: any) {
            return http.post('/lois/api/payment/pay', JSON.stringify(data));
        }
    }

    export class configuration {
        static get(config: string, id: any) {
            return http.get('/lois/api/' + config + '/get?id=' + id);
        }

        static getAll(config: string, query: any) {
            return http.get('/lois/api/' + config + '/getAll?query=' + JSON.stringify(query));
        }

        static save(config: string, data: any) {
            return http.post('/lois/api/' + config + '/save', JSON.stringify(data));
        }

        static delete(config: string, id: any) {
            return http.delete('/lois/api/' + config + '/delete?id=' + id);
        }
    }

    export class autocomplete {
        static getAll(name: string, keyword: string) {
            return http.get('/lois/api/' + name + '/getAll?query=' + JSON.stringify({ "name": keyword }));
        }
    }
}