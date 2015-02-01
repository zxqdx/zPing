/**
 * Ping.js
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
            defaultsTo: function() {return new Date();}
        },
        w: { // website
            type: 'string',
            required: true
        },
        p: { // ping
            type: 'number',
            required: true
        },
        t: { // type
            type: 'number',
            enum: [4, 6] // ipv4 or ipv6
            required: true
        }
    }
};