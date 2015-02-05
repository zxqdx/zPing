$(document).ready(function() {
    var URL = 'www.acfun.tv#ipv4';
    $('#url').html(URL);
    //=============================================================
    // Chart.defaults.global.responsive = true // DEBUG
    Chart.defaults.global.scaleBeginAtZero = true;
    //=============================================================
    var pingCht = {
        'each': null,
        'int': null
    };
    var drawCht = function(canvasType) {
        var canvasId = '#' + canvasType + 'Ping';
        var getStat = function() {
            var resultLabel = [];
            var resultValue = [];
            var datasets = pingCht[canvasType].datasets;
            for (var i = 0; i < datasets.length; i++) {
                var points = datasets[i].points;
                resultLabel.push([]);
                resultValue.push([]);
                for (var j = 0; j < points.length; j++) {
                    resultLabel[i].push(points[j].label);
                    resultValue[i].push(points[j].value);
                };
            };
            return [resultLabel, resultValue];
        };
        $(canvasId).replaceWith('<canvas id="' + canvasType + 'Ping' + '"></canvas>');
        var tmpCtx = $(canvasId).get(0).getContext("2d");
        var tmpStat, tmpDat;
        if (pingCht[canvasType]) {
            tmpStat = getStat();
        };
        if (canvasType === 'each') {
            tmpDat = {
                labels: tmpStat ? tmpStat[0][0] : ["", ""],
                datasets: [{
                    label: "当前",
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: tmpStat ? tmpStat[1][0] : [0, 0]
                }]
            }
        } else if (canvasType === 'int') {
            tmpDat = {
                labels: tmpStat ? tmpStat[0][0] : ["", ""],
                datasets: [{
                    label: "平均",
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: tmpStat ? tmpStat[1][0] : [0, 0]
                }, {
                    label: "最高",
                    fillColor: "rgba(199,221,232,0.2)",
                    strokeColor: "rgba(199,221,232,1)",
                    pointColor: "rgba(199,221,232,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: tmpStat ? tmpStat[1][1] : [0, 0]
                }, {
                    label: "最低",
                    fillColor: "rgba(65,116,140,0.2)",
                    strokeColor: "rgba(65,116,140,1)",
                    pointColor: "rgba(65,116,140,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: tmpStat ? tmpStat[1][2] : [0, 0]
                }]
            };
        };
        var tmpOpt = {
            legendTemplate: '<ul class=\"legend\">' + '<% for (var i=0; i<datasets.length; i++) { %>' + '<li>' + '<span style=\"background-color:<%=datasets[i].strokeColor%>\"></span>' + '<% if (datasets[i].label) { %><%= datasets[i].label %><% } %>' + '</li>' + '<% } %>' + '</ul>',
            pointHitDetectionRadius: 5,
            showTooltips: canvasType === 'int'
        };
        if (pingCht[canvasType]) {
            pingCht[canvasType].destroy();
        }
        pingCht[canvasType] = new Chart(tmpCtx).Line(tmpDat, tmpOpt);
    };
    //-------------------------------------------------------------
    drawCht('each');
    var eachPingleg = pingCht['each'].generateLegend();
    $('#eachPingChart').prepend(eachPingleg);
    //-------------------------------------------------------------
    drawCht('int');
    var intPingleg = pingCht['int'].generateLegend();
    $('#intPingChart').prepend(intPingleg);
    //-------------------------------------------------------------
    var lagRateCtx = $('#lagRate canvas').get(0).getContext("2d");
    var lagRateDat = [{
        value: 0,
        color: "#FFAB95", //DE7A60
        highlight: "#FFAB95",
        label: "Red"
    }, {
        value: 100,
        color: "#6EBC90", //449E6B
        highlight: "#6EBC90",
        label: "Green"
    }];
    var lagRateOpt = {
        percentageInnerCutout: 72
    }
    var lagRateCht = new Chart(lagRateCtx).Doughnut(lagRateDat, lagRateOpt);
    //-------------------------------------------------------------
    var lossRateCtx = $('#lossRate canvas').get(0).getContext("2d");
    var lossRateDat = [{
        value: 0,
        color: "#FFAB95", //DE7A60
        highlight: "#FFAB95",
        label: "Red"
    }, {
        value: 100,
        color: "#6EBC90", //449E6B
        highlight: "#6EBC90",
        label: "Green"
    }];
    var lossRateOpt = {
        percentageInnerCutout: 72
    }
    var lossRateCht = new Chart(lossRateCtx).Doughnut(lossRateDat, lossRateOpt);
    //=============================================================
    io.socket.on('connect', function() {
        io.socket.emit('getInt');
        io.socket.on('getInt', function(msg) {
            for (var i = 0; i < msg.length; i++) {
                pingCht['int'].addData([msg[i].avg, msg[i].h, msg[i].l], msg[i].id % 100);
            };
            pingCht['int'].removeData();
            pingCht['int'].removeData();
            io.socket.on('pingInt', function(msg) {
                pingCht['int'].addData([msg.avg, msg.h, msg.l], msg.id % 100);
                while (pingCht['int'].datasets[0].points.length > 25) {
                    pingCht['int'].removeData();
                };
            });
        });
        io.socket.emit('getEach');
        io.socket.on('getEach', function(msg) {
            for (var i = 0; i < msg.length; i++) {
                pingCht['each'].addData([msg[i].p], msg[i].id % 100);
            };
            pingCht['each'].removeData();
            pingCht['each'].removeData();
            io.socket.on('pingEach', function(msg) {
                pingCht['each'].addData([msg.p], msg.id % 100);
                while (pingCht['each'].datasets[0].points.length > 20) {
                    pingCht['each'].removeData();
                };
                if (msg.p == 0) {
                    $('#currPing .number').html('----');
                } else {
                    $('#currPing .number').html(msg.p);
                };
            });
        });
    });

    io.socket.on('rate', function(msg) {
        if (msg.avgPing == 0) {
            $('#currPingAvg .number').html('----');
        } else {
            $('#currPingAvg .number').html(msg.avgPing);
        };
        $('#lossRate .number').html(msg.lossRate + '<span class="percent">%</span>');
        $('#lagRate .number').html(msg.lagRate + '<span class="percent">%</span>');
        lossRateCht.segments[0].value = msg.lossRate;
        lossRateCht.segments[1].value = 100 - msg.lossRate;
        lagRateCht.segments[0].value = msg.lagRate;
        lagRateCht.segments[1].value = 100 - msg.lagRate;
        lossRateCht.update();
        lagRateCht.update();
    });
    //=============================================================
    $(window).resize(function() {
        drawCht('each');
        drawCht('int');
    })
});