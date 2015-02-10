/**
 * Stat.js - UNUSED
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
        w: { // website
            type: 'string',
            required: true
        },
        t: { // type
            type: 'integer',
            enum: [4, 6], // ipv4 or ipv6
            required: true
        },
        avg: { // average ping in ms
            type: 'integer',
            defaultsTo: 0
        },
        loss: { // loss pings
            type: 'integer',
            defaultsTo: 0
        },
        c: { // count (total) pings
            type: 'integer',
            defaultsTo: 0
        },
        h: { // maximum ping
            type: 'integer',
            defaultsTo: 0
        },
        l: { // minimum ping
            type: 'integer',
            defaultsTo: 0
        },
        lag: { // lag time length in secs
            type: 'integer',
            defaultsTo: 0
        },
        total: { // total time length in secs
            type: 'integer',
            defaultsTo: 0
        }
    }
};