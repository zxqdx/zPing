/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {
    SocketManager._ = new SocketManager();

    var WEBSITE = 'www.acfun.tv';
    var IPVX = 4;
    var LAG_MS = 200; // Pings above are treated as lag
    var OVERALL_RANGE = 1000; // Newest OVERALL_RANGE pings are in overall stats.
    var OVERALL_INTERVAL = 20; // Calculate overall stats in given interval (ms).
    var MAX_EACH_HISTORY = 5; // maximum number of storing eachPing history events
    var MAX_INT_HISTORY = 5; // maximum number of storing intPing history events

    var overallStat = {};
    var intStat = {};
    var intStatHistory = {};
    var intStatReset = function(hash) {
        ['l', 'h', 'total', 'count'].map(function(x) {
            intStat[hash][x] = 0;
        });
    };
    SocketManager._.on('getInt', function() {
        return intStatHistory[WEBSITE + IPVX];
    });
    SocketManager._.on('getEach', function(callback) {
        Ping.find({limit: MAX_EACH_HISTORY, sort: 'id DESC'}, function(err, pings) {
            callback(pings);
        })
    });
    var createPing = function(w, p, t) {
        Ping.create({
            w: w,
            p: p,
            t: t
        }, function(err, created) {
            if (err) {
                return sails.log.error(err)
            };

            var hash = w + t; // Hash to w+t
            if (!intStat.hasOwnProperty(hash)) {
                intStat[hash] = {
                    w: w,
                    t: t,
                    id: 0
                };
                intStatReset(hash);
                intStatHistory[hash] = [];
            };
            intStat[hash].total += p;
            intStat[hash].count++;
            if (intStat[hash].l == 0 || (p < intStat[hash].l && p > 0)) {
                intStat[hash].l = p;
            };
            if (p > intStat[hash].h) {
                intStat[hash].h = p;
            };

            if (created.id % OVERALL_INTERVAL == 0) {
                // TODO: in newest 1000 pings, lagPerc & lossRate per 20 pings
                Ping.find({
                    id: {
                        '>': created.id - OVERALL_RANGE
                    },
                    sort: 'id'
                }, function(err, pings) {
                    var lossCount = 0;
                    var lagSec = 0;
                    var totalSec = (pings[pings.length - 1].d.getTime() -
                        pings[0].d.getTime()) / 1000;
                    var totalPing = 0;
                    for (var i = 0; i < pings.length; i++) {
                        if (pings[i].p == 0) {
                            lossCount++;
                        } else {
                            totalPing += pings[i].p;
                        }
                        if ((pings[i].p > LAG_MS || pings[i].p == 0) && i > 0) {
                            lagSec += (pings[i].d.getTime() - pings[i - 1].d.getTime()) / 1000;
                        };
                    };

                    SocketManager._.emit('rate', {
                        lagRate: parseInt(lagSec / totalSec * 100),
                        lossRate: parseInt(lossCount / pings.length * 100),
                        avgPing: pings.length == lossCount ? 0 : parseInt(totalPing / (pings.length - lossCount))
                    });
                })
            };

            SocketManager._.emit('pingEach', {
                w: w,
                p: p,
                t: t,
                id: created.id
            });
        });
    };
    setInterval(function() { // interval update
        for (var hash in intStat) {
            var id = intStat[hash].id;
            var w = intStat[hash].w;
            var t = intStat[hash].t;
            var l = intStat[hash].l;
            var h = intStat[hash].h;
            var total = intStat[hash].total;
            var count = intStat[hash].count;
            intStatReset(hash);

            var intStatInfo = {
                id: id,
                l: l,
                h: h,
                w: w,
                t: t,
                avg: count == 0 ? 0 : total / count
            };
            intStatHistory[hash].push(intStatInfo);
            if (intStatHistory[hash].length > MAX_INT_HISTORY) {
                intStatHistory[hash].shift();
            }
            SocketManager._.emit('pingInt', intStatInfo);

            intStat[hash].id++;
        }
    }, 5000);

    var testPs = new PingService({
        website: WEBSITE,
        on: {
            data: createPing,
            error: function(err) {
                sails.log.error(err);
            },
            save: function(params) {
                return;
            }
        }
    });

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};