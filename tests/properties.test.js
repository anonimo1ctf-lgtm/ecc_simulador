import test from 'node:test';
import assert from 'node:assert/strict';
import { isPrime, validateCurve, findPoints, addPoints, multiplyPoint, modInverse } from '../js/crypto.js';

const encode = point => point === null ? 'O' : `${point[0]},${point[1]}`;

test('cierre, neutro e inversos sobre varias curvas pequeñas', () => {
  for (const p of [5, 7, 11, 17, 19]) {
    assert.equal(isPrime(p), true);
    for (const [a, b] of [[-1, 1], [0, 1], [2, 3]]) {
      try { validateCurve(a, b, p); } catch { continue; }
      const points = findPoints(a, b, p);
      const valid = new Set(['O', ...points.map(encode)]);
      for (const P of points) {
        assert.deepEqual(addPoints(P, null, a, p), P);
        assert.deepEqual(addPoints(null, P, a, p), P);
        assert.equal(addPoints(P, [P[0], (p - P[1]) % p], a, p), null);
        for (const Q of points) {
          const R = addPoints(P, Q, a, p);
          assert.ok(valid.has(encode(R)), `Suma fuera de E(F${p})`);
          assert.deepEqual(R, addPoints(Q, P, a, p));
        }
      }
    }
  }
});

test('asociatividad en E(F17)', () => {
  const a = -1, b = 1, p = 17;
  const points = [null, ...findPoints(a, b, p)];
  for (const P of points) for (const Q of points) for (const R of points) {
    assert.deepEqual(
      addPoints(addPoints(P, Q, a, p), R, a, p),
      addPoints(P, addPoints(Q, R, a, p), a, p)
    );
  }
});

test('consistencia de double-and-add', () => {
  const a = -1, b = 1, p = 17;
  const points = findPoints(a, b, p);
  for (const P of points) for (let k = 0; k < 16; k++) {
    assert.deepEqual(
      multiplyPoint(P, k + 1, a, p),
      addPoints(multiplyPoint(P, k, a, p), P, a, p)
    );
  }
});

test('inversos para todos los elementos no cero de campos primos', () => {
  for (const p of [5, 7, 11, 17, 19, 211]) {
    for (let n = 1; n < p; n++) {
      assert.equal((n * modInverse(n, p)) % p, 1);
    }
  }
});
