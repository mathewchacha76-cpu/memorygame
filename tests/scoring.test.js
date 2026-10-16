import assert from 'node:assert/strict';
import test from 'node:test';
import { scoreRouteRecall } from '../src/scoring.js';

test('route recall awards the full memory bonus for an exact path', () => {
  assert.deepEqual(scoreRouteRecall(['a', 'b', 'c'], ['a', 'b', 'c']), {
    accuracy: 1,
    bonus: 500
  });
});

test('route recall rewards only nodes remembered in the correct position', () => {
  assert.deepEqual(scoreRouteRecall(['a', 'b', 'c', 'd'], ['a', 'c', 'd']), {
    accuracy: 0.25,
    bonus: 125
  });
});

test('empty route recall earns no points', () => {
  assert.deepEqual(scoreRouteRecall(['a'], []), { accuracy: 0, bonus: 0 });
});
