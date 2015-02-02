/**
 * Stat.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    connection: 'memory',
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
        d: { // datetime
            type: 'datetime',
            defaultsTo: function() {
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1;
                var yyyy = today.getFullYear();
                dd = (dd < 10) ? ('0' + dd) : dd;
                mm = (mm < 10) ? ('0' + mm) : mm;
                return mm + '-' + dd + '-' + yyyy;
            },
            unique: true
        },
        a: { // average ping in ms
            type: 'integer',
            defaultsTo: 0
        },
        l: { // loss pings
            type: 'integer',
            defaultsTo: 0
        },
        t: { // total pings
            type: 'integer',
            defaultsTo: 0
        },
        max: { // maximum ping
            type: 'integer',
            defaultsTo: 0
        },
        min: { // minimum ping
            type: 'integer',
            defaultsTo: 0
        }
    }
};