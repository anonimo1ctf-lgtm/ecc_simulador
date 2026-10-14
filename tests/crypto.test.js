import test from 'node:test';
import assert from 'node:assert/strict';
import {mod,isPrime,validateCurve,findPoints,modInverse,addPoints,multiplyPoint} from '../js/crypto.js';
const a=-1,b=1,p=17,G=[0,1];
test('módulo con negativos',()=>{assert.equal(mod(-1,17),16);assert.equal(mod(-18,17),16);});
test('primalidad y discriminante',()=>{
  assert.equal(isPrime(17),true);assert.equal(isPrime(15),false);
  assert.equal(validateCurve(a,b,p),true);
  assert.throws(()=>validateCurve(a,b,15),/primo/);
  assert.throws(()=>validateCurve(0,0,p),/singular/);
});
test('enumeración de los 13 puntos de E(F17)',()=>{
  assert.equal(findPoints(a,b,p).length,13);
  assert.ok(findPoints(a,b,p).some(([x,y])=>x===13&&y===14));
});
test('Euclides extendido e inversos no existentes',()=>{
  assert.equal(modInverse(3,17),6);assert.equal(modInverse(3,14),5);
  assert.throws(()=>modInverse(2,14),/inverso/);
});
test('identidad, suma, opuesto y duplicación',()=>{
  assert.deepEqual(addPoints(null,G,a,p),G);
  assert.deepEqual(addPoints(G,[1,1],a,p),[16,16]);
  assert.deepEqual(addPoints(G,G,a,p),[13,14]);
  assert.equal(addPoints(G,[0,16],a,p),null);
  assert.equal(addPoints([12,0],[12,0],a,p),null);
});
test('multiplicación escalar y orden del punto',()=>{
  assert.deepEqual(multiplyPoint(G,2,a,p),[13,14]);
  assert.equal(multiplyPoint(G,0,a,p),null);
  assert.equal(multiplyPoint(G,14,a,p),null);
  assert.deepEqual(multiplyPoint(G,15,a,p),G);
  assert.throws(()=>multiplyPoint(G,-1,a,p),/escalar/);
});
test('ECDH: el secreto compartido coincide',()=>{
  const QA=multiplyPoint(G,3,a,p),QB=multiplyPoint(G,5,a,p);
  assert.deepEqual(multiplyPoint(QB,3,a,p),multiplyPoint(QA,5,a,p));
});