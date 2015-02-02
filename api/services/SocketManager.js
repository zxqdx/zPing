/**
 * Socket wrapper for sails.sockets
 *
 * Several types of ping events:
 *   - pingUnit: ping data based on each unit
 *   - pingInt: ping data based on each interval
 */
module.exports = function() {
    var socketIds = {};
    sails.io.on('connection', function(socket) {
        socketIds[socket.id] = true;
        socket.on('disconnect', function() {
            delete socketIds[socket.id];
        })
    });
    var _this = this;

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
    }
}