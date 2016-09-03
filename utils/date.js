module.exports = {
    createLower: function (dateString) {
        var date = new Date(dateString);
        return new Date(date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " 00:00:00");
    },

    createUpper: function (dateString) {
        var date = new Date(dateString);
        return new Date(date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " 23:59:59");
    }
};