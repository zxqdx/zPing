var __ = new function() {
	var localDict = {};
	this._ = function(k, v) {
		localDict[k] = v;
	}
	this.t = function(k) {
		return localDict[k];
	}
};