$(document).ready(function() {
    Chart.defaults.global.responsive = true; // DEBUG
    var eachPingIni = 2;
    var eachPingCtx = $('#eachPing').get(0).getContext("2d");
    var eachPingDat = {
        labels: ["", ""],
        datasets: [{
            label: "Current Ping",
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
        legendTemplate: '<ul class=\"legend\">' + '<% for (var i=0; i<datasets.length; i++) { %>' + '<li>' + '<span style=\"background-color:<%=datasets[i].strokeColor%>\"></span>' + '<% if (datasets[i].label) { %><%= datasets[i].label %><% } %>' + '</li>' + '<% } %>' + '</ul>'
    };
    var eachPingCht = new Chart(eachPingCtx).Line(eachPingDat, eachPingOpt);
    var eachPingleg = eachPingCht.generateLegend();
    $('#eachPingChart').prepend(eachPingleg);

    io.socket.on('ping', function (msg) {
        console.log(msg);
        eachPingCht.addData([msg.p], msg.id);
        if (eachPingIni >= 0) {
            if (eachPingIni == 0) { 
                eachPingCht.removeData();
                eachPingCht.removeData();
            };
            eachPingIni--;
        };
    });

});