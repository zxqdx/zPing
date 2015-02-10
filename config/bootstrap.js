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
    var RATE_RANGE = 100; // Newest RATE_RANGE pings are in rate stats
    var RATE_INTERVAL = 20; // Calculate overall stats in given interval (ms)
    var MAX_EACH_HISTORY = 5; // maximum number of storing eachPing history events
    var MAX_INT_HISTORY = 5; // maximum number of storing intPing history events
    var INT_INTERVAL = 5000; // Calculate interval stats in given interval (ms)
    var HOURLY_INTERVAL = 3600 * 1000; // Calculate hourly stats in given interval (ms)
    var VERSION = '0.3.0'; // The version of zPing

    var intStat = {
        id: 0
    };
    var intStatHistory = [];
    var intStatReset = function() {
        ['l', 'h', 'total', 'count'].map(function(x) {
            intStat[x] = 0;
        });
    };
    intStatReset();
    var hourlyStatHistory = {
        avg: 0,
        l: 0,
        h: 0,
        loss: 0,
        c: 0,
        inc: 0
    };
    var totalStat = false;
    // TODO: fetch total stat, if DNE, create one.
    
    
    SocketManager._.on('getUrl', function() {
        return {
            url: WEBSITE,
            ipvx: IPVX
        };
    });
    SocketManager._.on('getInt', function() {
        return intStatHistory;
    });
    SocketManager._.on('getHourly', function() {
        return hourlyStatHistory;
    });
    SocketManager._.on('getEach', function(callback) {
        Ping.find({
            where: {
                w: WEBSITE,
                t: IPVX
            },
            limit: MAX_EACH_HISTORY,
            sort: 'id DESC'
        }, function(err, pings) {
            callback(pings);
        })
    });
    SocketManager._.on('getVersion', function(callback) {
        return VERSION;
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

            // Interval statistics.
            intStat.total += p;
            if (intStat.l == 0 || (p < intStat.l && p > 0)) {
                intStat.l = p;
            };
            if (p > 0) {
                intStat.count++;
            };
            if (p > intStat.h) {
                intStat.h = p;
            };

            // Total statistics.
            if (totalStat) {

            };

            if (created.id % RATE_INTERVAL == 0) {
                Ping.find({
                    where: {
                        w: WEBSITE,
                        t: IPVX
                    },
                    id: {
                        '>': created.id - RATE_RANGE
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
        var id = intStat.id;
        var w = intStat.w;
        var t = intStat.t;
        var l = intStat.l;
        var h = intStat.h;
        var total = intStat.total;
        var count = intStat.count;
        intStatReset();

        var intStatInfo = {
            id: id,
            l: l,
            h: h,
            w: w,
            t: t,
            avg: count == 0 ? 0 : total / count
        };
        intStatHistory.push(intStatInfo);
        if (intStatHistory.length > MAX_INT_HISTORY) {
            intStatHistory.shift();
        }
        SocketManager._.emit('pingInt', intStatInfo);

        intStat.id++;
    }, INT_INTERVAL);

    setInterval(function() { // hourly update
        var now = new Date();
        var currHourlyStart = new Date(now.getTime() - HOURLY_INTERVAL);
        Ping.find({
            where: {
                w: WEBSITE,
                t: IPVX
            },
            d: {
                '>': currHourlyStart
            }
        }, function(err, pings) {
            var prevAvg = hourlyStatHistory.avg;
            var currCount = 0,
                currTotal = 0,
                currLoss = 0,
                currLow = 0,
                currHigh = 0;
            for (var i = 0; i < pings.length; i++) {
                currCount++;
                if (pings[i].p > 0) {
                    currTotal += pings[i].p;
                } else {
                    currLoss++;
                }
                if (currLow == 0) {
                    currLow = pings[i].p;
                } else if (pings[i].p < currLow) {
                    currLow = pings[i].p;
                };
                if (pings[i].p > currHigh) {
                    currHigh = pings[i].p;
                };

            };
            var currAvg = (currCount == 0) ? 0 : parseInt(currTotal / currCount);
            var currInc = 0;
            if (prevAvg == 0 && currAvg > 0) {
                currInc = 100;
            } else if (prevAvg > 0) {
                currInc = parseInt((currAvg - prevAvg) / prevAvg * 100);
            }
            hourlyStatHistory = {
                avg: currAvg,
                l: currLow,
                h: currHigh,
                loss: currLoss,
                c: currCount,
                inc: currInc
            };
            SocketManager._.emit('pingHourly', hourlyStatHistory);
        });
    }, HOURLY_INTERVAL);

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