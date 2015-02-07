/**
 * Socket wrapper for sails.sockets
 *
 * Several types of ping events:
 *   - pingUnit: ping data based on each unit
 *   - pingInt: ping data based on each interval
 */
module.exports = function() {
    var _this = this;
    var socketIds = {};
    var on = {};
    sails.io.on('connection', function(socket) {
        socketIds[socket.id] = true;
        socket.on('getUrl', function() {
            _this.emit('getUrl', on.getUrl());
        });
        socket.on('getInt', function() {
            _this.emit('getInt', on.getInt());
        });
        socket.on('getEach', function() {
            on.getEach(function(pings) {
                _this.emit('getEach', pings);
            });
        });
        socket.on('getHourly', function() {
            _this.emit('getHourly', on.getHourly());
        });
        socket.on('getVersion', function() {
            _this.emit('getVersion', on.getVersion());
        });
        socket.on('disconnect', function() {
            delete socketIds[socket.id];
        });
    });

    /**
     * List all connected socket ids.
     * @return {array}
     */
    this.listIds = function() {
        var tempList = [];
        for (var id in socketIds) {
            tempList.push(id);
        }
        return tempList;
    };

    this.emit = function(event, data) {
        sails.sockets.emit(_this.listIds(), event, data);
    };

    this.on = function(event, fn) {
        on[event] = fn;
    }
}