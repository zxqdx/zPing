function Nav(container) {
    /**
     * Choose one random element in a list
     * @param  {Array} list
     * @return {any} Element the element in the list
     */
    var randChoose = function(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    var _this = this;
    var container = container;
    var navBlocks = {};
    // Constants
    var COLORS = [1];
    var ANIMATE_BEFORE = 1200;
    var ANIMATE_IN_SPEED = 500;
    var ANIMATE_IN_DELAY = 150;
    // Bind general actions.
    $(document).on('mouseenter', container + ' .nav', function() {
        $(this).addClass('active');
    }).on('mouseleave', '.nav', function() {
        $(this).removeClass('active')
    });
    // Public methods
    /**
     * Add a nav block.
     * @param {string} id nav's element id
     * @param {options} options {
     *     isLong: {boolean} whether the nav is long or short
     *     color: {int} the color type
     *     isSupp: {int} whether the nav is supplementary
     *                   so that it will appear only if
     *                   gap blocks exist
     *                       0 = not supp
     *                       1 = yes, appear once
     *                       2 = yes, appear any times
     *     html: {string / function(navId)} the html of the nav
     *     clickable: {boolean} whether the nav can be clicked
     *     after: {function(navId)} triggers after rendering
     * }
     */
    this.add = function(id, options) {
        var navId = '#nav-' + id;
        if (navBlocks.hasOwnProperty(navId)) {
            return console.error(navId + ' already exists!');
        };
        if (!options) {
            options = {}
        };
        var isLong = options.hasOwnProperty('isLong') ? options.isLong : false;
        var color = options.hasOwnProperty('color') ? options.color : randChoose(COLORS);
        var isSupp = options.hasOwnProperty('isSupp') ? options.isSupp : 0;
        var html = options.hasOwnProperty('html') ? options.html : '';
        var clickable = options.hasOwnProperty('clickable') ? options.clickable : false;
        var after = options.hasOwnProperty('after') ? options.after : false;
        navBlocks[navId] = {
            navId: navId,
            isLong: isLong,
            color: color,
            isSupp: isSupp,
            html: html,
            clickable: clickable,
            after: after,
            disabled: false,
            suppNo: 0
        };
    };
    /**
     * Enable a nav block.
     * @param  {string} id nav's element id
     */
    this.enable = function(id) {
        var navId = '#nav-' + id;
        if (!navBlocks.hasOwnProperty(navId)) {
            return console.error(navId + ' does not exist!');
        };
        navBlocks[navId].disabled = false;
    };
    /**
     * Disable a nav block.
     * @param  {string} id nav's element id
     */
    this.disable = function(id) {
        var navId = '#nav-' + id;
        if (!navBlocks.hasOwnProperty(navId)) {
            return console.error(navId + ' does not exist!');
        };
        navBlocks[navId].disabled = true;
    };
    /**
     * Render the html.
     */
    this.render = function() {
        /*
          To demonstrate how navs are stored:
          =========================
          || 1 | 2 || 5 | 6 || ...
          -------------------------
          || 3 | 4 || 7 | 8 || ...
          =========================
          For contents: (F = false; N = null)
          =========================
          || a | b || d | N || ...
          -------------------------
          || c   F || e   F || ...
          =========================

          So in this case, the list is:
          [a, b, c, false, d, null, e, false, ...]
           1  2  3    4    5   6    7    8
         */
        var navHtmls = [];
        var generateInfo = function(eachNav, navId) {
            var html = '';
            html += '<div id="' + navId.substring(1) + '" class="nav active' + (eachNav.isLong ? ' long' : '') + (eachNav.clickable ? ' clickable' : '') + ' c' + eachNav.color + '">';
            if (typeof eachNav.html === 'function') {
                html += eachNav.html(navId);
            } else {
                html += eachNav.html;
            };
            html += '</div>';
            return [html, navId, eachNav.after];
        };
        // Fill in primary nav blocks.
        var currIndex = 0;
        for (var navId in navBlocks) {
            navBlocks[navId].suppNo = 0;
            var eachNav = navBlocks[navId];
            if ((!eachNav.disabled) && (!eachNav.isSupp)) {
                var eachNavInfo = generateInfo(eachNav, navId);
                if (!eachNav.isLong) {
                    navHtmls.push(eachNavInfo);
                    currIndex += 1;
                } else if (currIndex % 2 == 0) {
                    navHtmls.push(eachNavInfo);
                    navHtmls.push(false);
                    currIndex += 2;
                } else {
                    navHtmls.push(null);
                    navHtmls.push(eachNavInfo);
                    navHtmls.push(false);
                    currIndex += 3;
                };
            };
        };
        // Fill nulls in the last if necessary.
        while (navHtmls.length % 4 != 0) {
            navHtmls.push(null);
        }
        // "Shuffle" and fill in supplementary nav blocks.
        // - Fill in one-time supp nav
        var oneTimeSupps = (function() {
            var tempList = [];
            for (var navId in navBlocks) {
                if ((!navBlocks[navId].disabled) && (navBlocks[navId].isSupp > 0)) {
                    tempList.push(navBlocks[navId]);
                };
            };
            return tempList;
        })();
        var suppCounter = 0;
        currIndex = 0;
        for (var i = 0; i < navHtmls.length; i++) {
            if (currIndex == oneTimeSupps.length) {
                break;
            };
            if (navHtmls[i] === null) {
                var eachNav = oneTimeSupps[currIndex];
                var eachNavInfo = generateInfo(eachNav, eachNav.navId + suppCounter);
                navHtmls[i] = eachNavInfo;
                suppCounter++;
                currIndex++;
            };
        };
        console.log(navHtmls);
        // - Fill in any-times supp nav

        // Apply html.
        $(container).html((function() {
            var html = '';
            var navAreaClosed = true;
            for (var i = 0; i < navHtmls.length; i++) {
                if (i % 4 == 0) {
                    html += '<div class="navArea">';
                    navAreaClosed = false;
                };
                if (navHtmls[i]) {
                    html += navHtmls[i][0];
                };
                if (i % 4 == 3) {
                    html += '</div>';
                    navAreaClosed = true;
                };
            };
            if (!navAreaClosed) {
                html += '</div>';
            }
            html += '<div class="clearfix"></div>';
            return html;
        })());
        setTimeout(function() {
            // Animate in.
            var currCount = 0;
            for (var i = 0; i < navHtmls.length; i++) {
                if (navHtmls[i]) {
                    setTimeout(function(i) {
                        return function() {
                            $(navHtmls[i][1]).fadeIn(ANIMATE_IN_SPEED, function() {
                                $(navHtmls[i][1]).removeClass('active');
                            });
                        }
                    }(i), currCount * ANIMATE_IN_DELAY);
                    currCount++;
                };
            };
            // Callback after rendering.
            for (var i = 0; i < navHtmls.length; i++) {
                if (navHtmls[i]) {
                    if (navHtmls[i][2]) {
                        navHtmls[i][2](navHtmls[i][1]);
                    };
                };
            };
        }, ANIMATE_BEFORE);
    };
    // Pre-defined nav blocks
    this.add('desc', {
        color: 0,
        isSupp: 1,
        html: function() {
            return '----';
        },
        after: function(navId) {
            var intId = setInterval(function(navId) {
                return function() {
                    if (!(typeof VERSION === 'undefined')) {
                        if (VERSION) {
                            // TODO: update version info
                            $(navId).html(VERSION);
                            clearInterval(intId);
                        };
                    };
                };
            }(navId), 2000);
        }
    });
}
var nav = new Nav('#utility');
$(document).ready(function() {
    nav.add('n1');
    nav.add('n2', {
        clickable: true
    });
    nav.add('n3', {
        isLong: true
    });
    nav.add('n4');
    nav.add('n5', {
        isLong: true
    });
    nav.add('n6');
    nav.add('n7');
    nav.add('n8');
    nav.add('n9');
    nav.add('n10');
    nav.add('n11');
    nav.render();
});