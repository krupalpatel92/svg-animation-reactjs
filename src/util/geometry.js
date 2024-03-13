import {normalize} from './vec';

export const intersectionLines = (line0, line1) => {
    const
        [x1, y1] = line0[0],
        [x2, y2] = line0[1],
        [x3, y3] = line1[0],
        [x4, y4] = line1[1],
        denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denominator === 0) {
        return false;
    }

    const
        numeratorX = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
        numeratorY = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);

    let x = numeratorX / denominator,
        y = numeratorY / denominator;


    return [x, y];
}

export const intersectionBounds = (a, b) => {
    const [a_min, a_max] = a;
    const [b_min, b_max] = b;

    const ax = a_min[0];
    const ay = a_min[1];
    const aw = a_max[0];
    const ah = a_max[1];

    const bx = b_min[0];
    const by = b_min[1];
    const bw = b_max[0];
    const bh = b_max[1];

    return !(bw < ax || bx > aw || bh < ay || by > ah);
}


// https://gist.github.com/gordonwoodhull/50eb65d2f048789f9558
var eps = 0.0000001;
function between(a, b, c) {
    return a-eps <= b && b <= c+eps;
}
export const intersectionSegments = (segment0, segment1) => {

    const
    [x1, y1] = segment0[0],
    [x2, y2] = segment0[1],
    [x3, y3] = segment1[0],
    [x4, y4] = segment1[1];

    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4)) /
            ((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!between(x2, x, x1)) {return false;}
        } else {
            if (!between(x1, x, x2)) {return false;}
        }
        if (y1>=y2) {
            if (!between(y2, y, y1)) {return false;}
        } else {
            if (!between(y1, y, y2)) {return false;}
        }
        if (x3>=x4) {
            if (!between(x4, x, x3)) {return false;}
        } else {
            if (!between(x3, x, x4)) {return false;}
        }
        if (y3>=y4) {
            if (!between(y4, y, y3)) {return false;}
        } else {
            if (!between(y3, y, y4)) {return false;}
        }
    }
    return [x, y];
}

export const getBounds = (points) => {
    var n = points.length;
    if (n === 0) {
        throw new Error('Expected points to be a non-empty array');
    }

    var lo = points[0].slice();
    var hi = points[0].slice();

    for (var i = 1; i < n; ++i) {
        var p = points[i];
        for (var j = 0; j < 2; ++j) {
            var x = p[j];
            lo[j] = Math.min(lo[j], x);
            hi[j] = Math.max(hi[j], x);
        }
    }
    return [ lo, hi ];
};

export const getCenter = (points) => {
    var c = [0,0,0];
    
    points.forEach((v)=> {
        c[0] += v[0];
        c[1] += v[1];
        c[2] += v[2];
    });

    const len = points.length;
    
    c[0] /= len;
    c[1] /= len;
    c[2] /= len;

    return c;
}

export const getPerimeter = (points) => {
    var count = points.length;
    var totalDist = 0;
    for(var i = 0; i < count; i++ ) {
		var a = points[i];
		var b = points[( i + 1 ) % count];
		var dx = a[0] - b[0];
		var dy = a[1] - b[1];
		totalDist += Math.sqrt( dx * dx + dy * dy );
	}
	return totalDist;
}


export const getNormals = (pts) => {
    let normals = [];
    for (var i = 0; i < pts.length; i++) {
        if(i < pts.length-1) {
            var dx = pts[i+1][0] - pts[i][0];
            var dy = pts[i+1][1] - pts[i][1];
        } else {
            var dx = pts[i-1][0] - pts[i][0];
            var dy = pts[i-1][1] - pts[i][1];
        }
        var n = [0,0,0];
        normalize(n, [-dy,dx, 0]);
        normals.push([n[0], n[1]]);
    }
    return normals;
}