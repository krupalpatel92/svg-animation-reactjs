var defined = require('defined');

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
export const clamp01 = (num) => clamp(num, 0.0, 1.0);
export const lerp = (min, max, t) => clamp(min + (max - min) * t, min, max);
export const inverseLerp = (min, max, t) => (t - min) / (max - min);
export const smoothstep = (min, max, value) => {
    var x = Math.max(0, Math.min(1, (value-min)/(max-min)));
    return x*x*(3 - 2*x);
};

export const map = (value, low1, high1, low2, high2) => {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export const newArray = (n, initialValue) => {
    n = defined(n, 0);
    if (typeof n !== 'number') throw new TypeError('Expected n argument to be a number');
    var out = [];
    for (var i = 0; i < n; i++) out.push(initialValue);
    return out;
  }

export const linspace = (n, opts) => {
    n = defined(n, 0);
    if (typeof n !== 'number') throw new TypeError('Expected n argument to be a number');
    opts = opts || {};
    if (typeof opts === 'boolean') {
      opts = { endpoint: true };
    }
    var offset = defined(opts.offset, 0);
    if (opts.endpoint) {
      return newArray(n).map(function (_, i) {
        return n <= 1 ? 0 : ((i + offset) / (n - 1));
      });
    } else {
      return newArray(n).map(function (_, i) {
        return (i + offset) / n;
      });
    }
  }

  export const scale = (x, inLow, inHigh, outLow, outHigh) => {
    var nx = +x;
    var nInLow = +inLow;
    var nInHigh = +inHigh;
    var nOutLow = +outLow;
    var nOutHigh = +outHigh;
    // eslint-disable-next-line no-self-compare -- NaN check
    if (nx != nx || nInLow != nInLow || nInHigh != nInHigh || nOutLow != nOutLow || nOutHigh != nOutHigh) return NaN;
    if (nx === Infinity || nx === -Infinity) return nx;
    return (nx - nInLow) * (nOutHigh - nOutLow) / (nInHigh - nInLow) + nOutLow;
  };