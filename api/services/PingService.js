/**
 * Ping module implemented by zxqdx.
 *
 * Available options:
 *   - website: {string} url of the website
 *   - interval: {number} interval of main graph
 *   - folder: {string} path to the folder that stores the history result
 *                      if folder is not given or invalid, data won't be stored
 *   - ver: {number} 4(ipv4) or 6(ipv6)
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
    var os = require('os');
    // Parse options
    var options = options;
    var optOrDefault = function(option, def) {
        if (!options[option]) {
            options[option] = def;
        }
    };
    optOrDefault('website', 'www.google.com');
    optOrDefault('interval', 5);
    optOrDefault('folder', '');
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
    } else { // Raise error.
        throw new Error('Unsupported platform ' + platform);
    }
    // Generate ping command
    var pingCmd = 'ping -' + options.ver + ' ';
    if (platformId == 0) { // Windows
        pingCmd += 'www.google.com -t';
    }
    // Set up pings
    var dataBuff = '';
    var dataLock = false;
    var child = exec(pingCmd, function(err, stdout, stderr) {
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
                if (temp === '') {continue;}
                if (platformId == 0) { // Windows
                    if (temp.toLowerCase() === 'request timed out.') {
                        ping = 0;
                    } else {
                        var match = /time=(\d+)ms/i.exec(temp);
                        if (match == null) {continue};
                        ping = parseInt(match[1], 10);
                    }
                }
                // Push to 'data' event
                options.on.data(options.website, ping, options.ver);
            }
            dataLock = false;
        };
    });

    // Methods
    /**
     * Saves data that 'save' event returns.
     */
    this.save = function() {
        if (!options.folder) {return;};
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