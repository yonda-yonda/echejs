import seedrandom from 'seedrandom';

export function random(seed?: string): () => number {
  const rng = seedrandom(seed);

  return ():number => {
    return rng();
  };
}

function loggam(x: number) {
  /*
    References
    ----------
    Computation of Special Functions
    Publisher: Wiley-Interscience
    Auhtors: Shanjie Zhang, Jianming Jin
  */
  const a = [
    8.333333333333333e-02, -2.777777777777778e-03,
    7.936507936507937e-04, -5.952380952380952e-04,
    8.417508417508418e-04, -1.917526917526918e-03,
    6.410256410256410e-03, -2.955065359477124e-02,
    1.796443723688307e-01, -1.39243221690590
  ];
  
  let x0 = x, n = 0;
  if (x <= 2.0) {
        return 0.0;
  }
  if (x <= 7.0) {
    n = Math.floor(7 - x);
    x0 = x + n;
  }

  let gl0 = a[9];
  for (let k = 8; k >= 0; k--) {
      gl0 *= 1.0 / x0 ** 2;
      gl0 += a[k];
  }
  let gl = gl0 / x0 + 0.5 * Math.log(2 * Math.PI) + (x0 - 0.5) * Math.log(x0) - x0;
  if (x <= 7.0) {
    for (let k = 0; k < n; k++) {
      gl -= Math.log(x0 - 1.0);
      x0 -= 1.0;
    }
  }
  return gl;
}


export function poisson(lambda: number, options?: {
  prng?: () => number;
  maxIter?: number;
}): number {
  /*
    References
    ----------
    The transformed rejection method for generating Poisson random variables
    "Insurance: Mathematics and Economics" Volume 12, Issue 1, February 1993, Pages 39-45
    Auhtors: W.Hörmann
  */
  const pr = options?.prng ? options.prng : random();
  const maxIter = options?.maxIter ? options.maxIter : 10000;

  if (lambda <= 0) {
    return 0;
  }
  if (lambda < 10) {
    const b = Math.exp(-lambda);
    let a = pr();
    let ret = 0;
    while (a >= b) {
      a *= pr();
      ret += 1;
    }
    return ret;
  }
  // Algorithm PTRS
  const b = 0.931 + 2.53 * Math.sqrt(lambda);
  const a = -0.059 + 0.02483 * b;
  const vr = 0.9277 - 3.6224 / (b - 2);
  const inva = 1.1239 + 1.1328 / (b - 3.4);

  let k = -1, cnt = 0;
  while (cnt++ < maxIter) {
    const V = pr();
    const U = pr() - 0.5;
    const us = 0.5 - Math.abs(U);
    k = Math.floor((2 * a / us + b) * U + lambda + 0.43);
    
    if ((us >= 0.07) && (V <= vr)) {
      break;
    }
    if (k < 0 || ((us < 0.013) && (V > us))) {
      continue;
    }
    
    if (
        Math.log(V) + Math.log(inva) - Math.log(a / us **2 + b) <=
        -lambda + k *  Math.log(lambda) - loggam(k + 1)
      )
      break;
  }

  return k;
}

export function normal(mu: number, sigma: number, options?: {
  prng?: () => number;
}): number {
  const pr = options?.prng ? options.prng : random();
  const a1 = pr(), b1 = pr();
  const a2 = Math.sqrt(-2 * Math.log(a1));
  const b2 = 2 * Math.PI * b1;
  return mu + sigma * a2 * Math.sin(b2);
}