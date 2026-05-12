import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { didPass, progressFromResults, withAutoMain } from './runnerUtils.js';

describe('withAutoMain', () => {
  it('wraps body code in fun main', () => {
    assert.equal(withAutoMain('println("hi")'), 'fun main() {\n    println("hi")\n}');
  });

  it('keeps imports above generated main', () => {
    assert.equal(
      withAutoMain('import java.util.Locale\n\nprintln(Locale.US)'),
      'import java.util.Locale\n\nfun main() {\n    println(Locale.US)\n}',
    );
  });

  it('does not wrap code that already has main', () => {
    const code = 'fun main() { println("ok") }';
    assert.equal(withAutoMain(code), code);
  });
});

describe('result helpers', () => {
  it('matches stdout ignoring trailing whitespace', () => {
    const test = { expected: '42' };
    const result = { compile: { code: 0 }, run: { code: 0, stdout: '42\n' } };
    assert.equal(didPass(test, result), true);
  });

  it('summarizes partial progress', () => {
    const tests = [{ id: 'a', expected: 'ok' }, { id: 'b', expected: 'ok' }];
    const results = {
      a: { compile: { code: 0 }, run: { code: 0, stdout: 'ok' } },
      b: { compile: { code: 0 }, run: { code: 1, stdout: '' } },
    };
    assert.deepEqual(
      { ...progressFromResults(tests, results), updatedAt: 0 },
      { passed: 1, total: 2, status: 'partial', updatedAt: 0 },
    );
  });
});
