$(document).ready(function() {
    var URL = 'www.acfun.tv#ipv4';
    $('#url').html(URL);

    Chart.defaults.global.responsive = true // DEBUG
    Chart.defaults.global.scaleBeginAtZero = true;
    //=============================================================
    var eachPingCnt = -3;
    var eachPingCtx = $('#eachPing').get(0).getContext("2d");
    var eachPingDat = {
        labels: ["", ""],
        datasets: [{
            label: "Current",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [0, 0]
        }]
    }
    var eachPingOpt = {
        legendTemplate: '<ul class=\"legend\">' + '<% for (var i=0; i<datasets.length; i++) { %>' + '<li>' + '<span style=\"background-color:<%=datasets[i].strokeColor%>\"></span>' + '<% if (datasets[i].label) { %><%= datasets[i].label %><% } %>' + '</li>' + '<% } %>' + '</ul>',
        pointHitDetectionRadius: 5
    };
    var eachPingCht = new Chart(eachPingCtx).Line(eachPingDat, eachPingOpt);
    var eachPingleg = eachPingCht.generateLegend();
    $('#eachPingChart').prepend(eachPingleg);
    //-------------------------------------------------------------
    var intPingCnt = -3;
    var intPingCtx = $('#intPing').get(0).getContext("2d");
    var intPingDat = {
        labels: ["", ""],
        datasets: [{
            label: "Average",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [0, 0]
        }, {
            label: "Highest",
            fillColor: "rgba(199,221,232,0.2)",
            strokeColor: "rgba(199,221,232,1)",
            pointColor: "rgba(199,221,232,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [0, 0]
        }, {
            label: "Lowest",
            fillColor: "rgba(65,116,140,0.2)",
            strokeColor: "rgba(65,116,140,1)",
            pointColor: "rgba(65,116,140,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [0, 0]
        }]
    }
    var intPingOpt = {
        legendTemplate: '<ul class=\"legend\">' + '<% for (var i=0; i<datasets.length; i++) { %>' + '<li>' + '<span style=\"background-color:<%=datasets[i].strokeColor%>\"></span>' + '<% if (datasets[i].label) { %><%= datasets[i].label %><% } %>' + '</li>' + '<% } %>' + '</ul>',
        pointHitDetectionRadius: 5
    };
    var intPingCht = new Chart(intPingCtx).Line(intPingDat, intPingOpt);
    var intPingleg = intPingCht.generateLegend();
    $('#intPingChart').prepend(intPingleg);
    //-------------------------------------------------------------
    var lagRateCtx = $('#lagRate canvas').get(0).getContext("2d");
    var lagRateDat = [{
        value: 20,
        color: "#FFAB95", //DE7A60
        highlight: "#FFAB95",
        label: "Red"
    }, {
        value: 80,
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
        value: 40,
        color: "#FFAB95", //DE7A60
        highlight: "#FFAB95",
        label: "Red"
    }, {
        value: 60,
        color: "#6EBC90", //449E6B
        highlight: "#6EBC90",
        label: "Green"
    }];
    var lossRateOpt = {
        percentageInnerCutout: 72
    }
    var lossRateCht = new Chart(lossRateCtx).Doughnut(lossRateDat, lossRateOpt);
    //=============================================================
    io.socket.on('pingUnit', function(msg) {
        eachPingCht.addData([msg.p], msg.id);
        eachPingCnt++;
        if (eachPingCnt <= 0) {
            if (eachPingCnt == 0) {
                eachPingCht.removeData();
                eachPingCht.removeData();
            };
        } else if (eachPingCnt > 20) {
            eachPingCht.removeData();
        };
    });
    io.socket.on('pingInt', function(msg) {
        intPingCht.addData([msg.avg, msg.h, msg.l], msg.id);
        intPingCnt++;
        if (intPingCnt <= 0) {
            if (intPingCnt == 0) {
                intPingCht.removeData();
                intPingCht.removeData();
            };
        } else if (intPingCnt > 25) {
            intPingCht.removeData();
        };
    });

});