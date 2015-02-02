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

    var intStat = {};
    var intStatReset = function(hash) {
        ['l', 'h', 'total', 'count'].map(function(x) {
            intStat[hash][x] = 0;
        });
    };
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
            };
            intStat[hash].total += p;
            intStat[hash].count++;
            if (intStat[hash].l == 0 || (p < intStat[hash].l && p > 0)) {
                intStat[hash].l = p;
            };
            if (p > intStat[hash].h) {
                intStat[hash].h = p;
            };

            SocketManager._.emit('pingUnit', {
                w: w,
                p: p,
                t: t,
                id: created.id
            });
        });
    };
    setInterval(function() {
        for (var hash in intStat) {
            var id = intStat[hash].id;
            var w = intStat[hash].w;
            var t = intStat[hash].t;
            var l = intStat[hash].l;
            var h = intStat[hash].h;
            var total = intStat[hash].total;
            var count = intStat[hash].count;
            intStatReset(hash);

            SocketManager._.emit('pingInt', {
                id: id,
                l: l,
                h: h,
                w: w,
                t: t,
                avg: count == 0 ? 0 : total / count
            });

            intStat[hash].id++
        }
    }, 5000);

    var testPs = new PingService({
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