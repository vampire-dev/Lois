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

    export class configuration {
        static get(config: string, id: any) {
            return app.http.get('/lois/api/' + config + '/get?id=' + id);
        }

        static getAll(config: string, query: any) {
            return app.http.get('/lois/api/' + config + '/getAll?query=' + JSON.stringify(query));
        }

        static save(config: string, data: any) {
            return app.http.post('/lois/api/' + config + '/save', JSON.stringify(data));
        }

        static delete(config: string, id: any) {
            return app.http.delete('/lois/api/' + config + '/delete?id=' + id);
        }
    }

    export class autocomplete {
        static getAll(name: string, keyword: string) {
            return app.http.get('/lois/api/' + name + '/getAll?query=' + JSON.stringify({ "name": keyword }));
        }
    }
}