export const cross = (out, a, b) => {
    var ax = a[0],
      ay = a[1],
      bx = b[0],
      by = b[1];
    out[0] = ax * by - ay * bx;
    return out;
  };
  
export const length = (a) => Math.hypot(a[0], a[1]);

export const copy = (out, a) => set(out, a[0], a[1]);

export const set = (out, x, y, z) => {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
};

export const sub = (out, a, b) => set(out, a[0] - b[0], a[1] - b[1]);

export const scale = (out, a, b) => set(out, a[0] * b, a[1] * b);

export const add = (out, a, b) =>
  set(out, a[0] + b[0], a[1] + b[1]);

export const scaleAndAdd = (out, a, b, scale) =>
  set(out, a[0] + b[0] * scale, a[1] + b[1] * scale);

export const normalize = (out, a) => {
  let len = dot(a, a);
  if (len > 0) len = 1 / Math.sqrt(len);
  return scale(out, a, len);
};

export const dot = (a, b) => a[0] * b[0] + a[1] * b[1];

export const mul = (a, b) => [a[0] * b[0], a[1] * b[1]];

export const sqLength = (v) => { return v[0]*v[0] + v[1]*v[1]; }

export const sqDist = (v0, v1) => {
  let tmp = [0,0,0];
  sub(tmp, v0, v1)
  return sqLength(tmp);
}