import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_BODY_CODE, normalizeExercise, normalizeExercises } from './exercises.js';

describe('normalizeExercises', () => {
  it('drops invalid entries', () => {
    assert.equal(normalizeExercises([null, 1, 'x', { title: 'ok' }]).length, 1);
  });

  it('fills missing exercise fields', () => {
    const exercise = normalizeExercise({ title: 7, tests: [null, { stdin: 3, expected: 'ok' }] });
    assert.equal(typeof exercise.id, 'string');
    assert.equal(exercise.title, '');
    assert.equal(exercise.code, DEFAULT_BODY_CODE);
    assert.equal(exercise.tests.length, 1);
    assert.equal(exercise.tests[0].stdin, '');
    assert.equal(exercise.tests[0].expected, 'ok');
  });
});
