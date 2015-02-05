/**
 * Ping module implemented by zxqdx.
 *
 * Available options:
 *   - website: {string} url of the website
 *   - interval: {number} interval of main graph
 *   - ver: {number} 4(ipv4) or 6(ipv6)
 *   - maxBuffer: {number} max buffer size in KB
 *   - on: { {object} subscriptions
 *     data: {function(ping)} when ping is received
 *     error: {function(err)} when error occurs
 *     save: {function(params)} returns the data needed to save
 *   }
 *
 * Supported platforms:
 *   - Windows XP / 7
 *   - TBA
 *
 * @param  {object} options
 * @return {object} zPing object
 */
module.exports = function PingService(options) {
    // Require modules
    var exec = require('child_process').exec;
    var spawn = require('child_process').spawn;
    var os = require('os');
    var path = require('path');
    // Parse options
    var options = options;
    var optOrDefault = function(option, def) {
        if (!options[option]) {
            options[option] = def;
        }
    };
    optOrDefault('website', 'www.google.com');
    optOrDefault('interval', 5);
    optOrDefault('maxBuffer', 300);
    optOrDefault('ver', 4);
    optOrDefault('on', {});
    if ((!options.on.hasOwnProperty('data')) ||
        (!options.on.hasOwnProperty('error')) ||
        (!options.on.hasOwnProperty('save'))) {
        throw new Error('Please bind data, error and save events.');
    }
    // Get platform information
    var platform = os.platform();
    var platformId;
    if (platform.indexOf('win32') === 0) { // Windows
        platformId = 0;
    } else if (platform.indexOf('linux') > -1) { // Linux
        platformId = 1;
    } else { // Raise error.
        throw new Error('Unsupported platform ' + platform);
    }
    // Generate ping command
    var pingCmd = '';
    if (platformId == 0) { // Windows
        pingCmd += 'ping -' + options.ver + ' ' + options.website + ' -t';
    } else if (platformId == 1) { // Linux
        pingCmd += path.join(__dirname, '../..') + 'ping' + options.ver + ' ' + options.website;
        sails.log('cmd: '+pingCmd);
    }
    // Set up pings
    var dataBuff = '';
    var dataLock = false;
    var forkPing = function() {
        var childKilled = false;
        var child = exec(pingCmd, {
                maxBuffer: options.maxBuffer * 1024 + 500
            },
            function(err, stdout, stderr) {
                if (stderr) {
                    options.on.error(stderr);
                    return;
                }
                if (err) {
                    options.on.error(err.name + ': ' + err.message);
                    return;
                };
                console.log('Finished.');
            });
        child.stdout.on('data', function(data) {
            if (childKilled) {return;};
            if (child.stdout.bytesRead > options.maxBuffer * 1024) {
                // Buffer will exceed
                if (platformId == 0) { // Windows
                    spawn("taskkill", ["/pid", child.pid, '/f', '/t']);
                };
                childKilled = true;
                forkPing();
            };
            dataBuff += data;
            if (!dataLock) {
                dataLock = true;
                var endIndex = dataBuff.indexOf('\r\n');
                while (endIndex >= 0) {
                    var temp = dataBuff.substring(0, endIndex);
                    var ping = 0;
                    dataBuff = dataBuff.substring(endIndex + 2);
                    endIndex = dataBuff.indexOf('\r\n');
                    // Filter temp
                    if (temp === '') {
                        continue;
                    }
                    if (platformId == 0) { // Windows
                        if (temp.toLowerCase() === 'request timed out.'
                         || temp.toLowerCase().indexOf('unreachable') > -1
                         || temp.toLowerCase().indexOf('fail') > -1) {
                            ping = 0;
                        } else {
                            var match = /time=(\d+)ms/i.exec(temp);
                            if (match == null) {
                                sails.log(temp);
                                continue
                            };
                            ping = parseInt(match[1], 10);
                        }
                    }
                    // Push to 'data' event
                    options.on.data(options.website, ping, options.ver);
                }
                dataLock = false;
            };
        });
    };
    forkPing();

    // Methods
    /**
     * Saves data that 'save' event returns.
     */
    this.save = function() {
        // TODO
    };
    /**
     * Saves and stops the current ping.
     */
    this.stop = function() {
        this.save();
        // TODO
    }
}