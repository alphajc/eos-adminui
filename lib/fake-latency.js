/**
 * Created by gavin on 17-3-25.
 */
module.exports = {
    simulateLatency: function simulateLatency() {
        var fn = function (req, res, next) {
            if (req.url.indexOf('/_/') !== -1) {
                return setTimeout(function () {
                    return next();
                }, Math.floor((Math.random() * 100) + 100));
            } else {
                return next();
            }
        };
        return fn;
    }
};